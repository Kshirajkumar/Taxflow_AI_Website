import { useCallback, useEffect, useRef, useState, type DragEvent, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import './client-portal.css';

const API_ORIGIN = String(
  __API_URL__ || (import.meta.env.DEV ? 'http://127.0.0.1:5000' : 'https://taxflow-ai.onrender.com'),
).replace(/\/+$/, '');
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const ACCEPTED_FILES = '.pdf,.png,.jpg,.jpeg,.webp,.csv,.xlsx';

type PortalDocument = {
  id: string;
  file_name: string;
  file_type: string;
  file_size_kb: number;
  status: string;
  created_at: string;
};

type PortalData = {
  client: { id: string; name: string };
  email: string;
  documents: PortalDocument[];
};

type ApiResponse<T> = { success?: boolean; code?: string; message?: string; data?: T };
const PORTAL_REGISTRATION_HANDOFF_KEY = 'taxflow-portal-registration-handoff';

class PortalRequestError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message);
    this.name = 'PortalRequestError';
  }
}

function consumeRegistrationHandoff() {
  try {
    const value = window.sessionStorage.getItem(PORTAL_REGISTRATION_HANDOFF_KEY);
    window.sessionStorage.removeItem(PORTAL_REGISTRATION_HANDOFF_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as { email?: unknown };
    return typeof parsed.email === 'string' ? parsed.email.trim().toLowerCase() : null;
  } catch {
    return null;
  }
}

function removeInviteFromUrl() {
  if (window.location.hash.includes('invite=')) {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  }
}

function portalApiUrl(path: string) {
  const url = new URL(path, `${API_ORIGIN}/`);
  if (window.location.protocol === 'https:' && url.protocol !== 'https:') {
    throw new Error('The secure portal API is not configured for HTTPS. Please contact your practice.');
  }
  return url.toString();
}

function PortalIcon({ name, size = 20 }: { name: 'arrow' | 'check' | 'file' | 'lock' | 'logout' | 'upload' | 'shield'; size?: number }) {
  const paths = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3M12 14v3" /></>,
    logout: <><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
    upload: <><path d="M12 16V4m0 0L7 9m5-5 5 5" /><path d="M4 16v4h16v-4" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

async function readResponse<T>(response: Response): Promise<T> {
  let payload: ApiResponse<T>;
  try {
    payload = await response.json() as ApiResponse<T>;
  } catch {
    throw new PortalRequestError(`The portal service returned an invalid response (HTTP ${response.status}).`, response.status);
  }
  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new PortalRequestError(
      payload.message || `The request could not be completed (HTTP ${response.status}).`,
      response.status,
      payload.code,
    );
  }
  return payload.data;
}

function getPortalAuthErrorMessage(requestError: unknown, mode: 'register' | 'signin') {
  if (requestError instanceof PortalRequestError) {
    switch (requestError.code) {
      case 'password_policy':
        return 'Choose a stronger password that meets the portal password requirements, then try again.';
      case 'invalid_email':
        return 'Check the email address and make sure it exactly matches the address your practice has on file.';
      case 'email_in_use_by_non_portal_account':
        return 'This email is already used for a TaxFlow practice account. Ask your CA for a different client email address.';
      case 'portal_auth_rate_limited':
        return 'Too many attempts were made. Please wait a few minutes before trying again.';
      case 'portal_auth_configuration':
        return 'Client portal enrollment is not configured correctly on the practice server. Please contact your practice administrator.';
      case 'portal_auth_schema':
        return 'Client portal enrollment needs a database update on the practice server. Please contact your practice administrator.';
      case 'portal_auth_unavailable':
      case 'portal_account_creation_failed':
        return 'The portal account service is temporarily unavailable. Please try again shortly. If the problem continues, contact your practice.';
      case 'invitation_already_claimed':
        return 'This invitation has already been used. Sign in with the portal email and password you created.';
      default:
        return requestError.status >= 500
          ? 'The portal service is temporarily unavailable. Please try again shortly.'
          : requestError.message;
    }
  }
  if (requestError instanceof TypeError) {
    return 'We could not reach the portal service. Check your internet connection and try again.';
  }
  if (requestError instanceof Error && mode === 'signin' && /invalid login credentials/i.test(requestError.message)) {
    return 'The email or password is incorrect. Check your details and try again.';
  }
  return requestError instanceof Error
    ? requestError.message
    : 'We could not verify your account. Check your details and try again.';
}

async function getPortalData(token: string): Promise<PortalData> {
  const [meResponse, documentsResponse] = await Promise.all([
    fetch(portalApiUrl('/api/v1/client-portal/me'), { headers: { Authorization: `Bearer ${token}` } }),
    fetch(portalApiUrl('/api/v1/client-portal/documents'), { headers: { Authorization: `Bearer ${token}` } }),
  ]);
  const [me, documents] = await Promise.all([
    readResponse<{ client: PortalData['client']; email: string }>(meResponse),
    readResponse<PortalDocument[]>(documentsResponse),
  ]);
  return { ...me, documents };
}

export function ClientPortalPage() {
  const [registrationHandoffEmail, setRegistrationHandoffEmail] = useState(consumeRegistrationHandoff);
  const [inviteToken, setInviteToken] = useState<string | null>(() => {
    const match = window.location.hash.match(/(?:^#|&)invite=([A-Za-z0-9_-]{40,64})(?:&|$)/);
    return match?.[1] || null;
  });
  const [checkingInviteStatus, setCheckingInviteStatus] = useState(Boolean(inviteToken));
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = window.localStorage.getItem('taxflow-portal-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // Use the browser preference when storage is unavailable.
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [session, setSession] = useState<Session | null>(null);
  const [portal, setPortal] = useState<PortalData | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [email, setEmail] = useState(registrationHandoffEmail || '');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'register' | 'signin'>(registrationHandoffEmail ? 'signin' : 'register');
  const [registrationSuccessEmail, setRegistrationSuccessEmail] = useState<string | null>(null);
  const [inviteAlreadyClaimed, setInviteAlreadyClaimed] = useState(false);
  const [inviteStatusNotice, setInviteStatusNotice] = useState('');
  const [authenticating, setAuthenticating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const authFlowInProgress = useRef(false);

  const continueRegistrationToSignIn = useCallback(() => {
    if (!registrationSuccessEmail) return;
    try {
      window.sessionStorage.setItem(
        PORTAL_REGISTRATION_HANDOFF_KEY,
        JSON.stringify({ email: registrationSuccessEmail }),
      );
      window.location.replace(`${window.location.pathname}${window.location.search}`);
    } catch {
      try {
        window.sessionStorage.removeItem(PORTAL_REGISTRATION_HANDOFF_KEY);
      } catch {
        // The current page can still transition to sign-in if storage is unavailable.
      }
      setEmail(registrationSuccessEmail);
      setMode('signin');
      setInviteToken(null);
      setRegistrationHandoffEmail(registrationSuccessEmail);
      setRegistrationSuccessEmail(null);
    }
  }, [registrationSuccessEmail]);

  useEffect(() => {
    if (!registrationSuccessEmail) return undefined;
    const timer = window.setTimeout(continueRegistrationToSignIn, 2600);
    return () => window.clearTimeout(timer);
  }, [continueRegistrationToSignIn, registrationSuccessEmail]);

  useEffect(() => {
    removeInviteFromUrl();
    document.documentElement.style.colorScheme = theme;
    try {
      window.localStorage.setItem('taxflow-portal-theme', theme);
    } catch {
      // Theme selection remains active for this page even if storage is unavailable.
    }
  }, [theme]);

  useEffect(() => {
    if (!inviteToken || registrationHandoffEmail) {
      setCheckingInviteStatus(false);
      return undefined;
    }
    let disposed = false;
    setCheckingInviteStatus(true);
    void (async () => {
      try {
        const { alreadyClaimed, clientEmailChanged } = await readResponse<{
          alreadyClaimed: boolean;
          clientEmailChanged: boolean;
        }>(await fetch(
          portalApiUrl('/api/v1/client-portal/invitations/status'),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: inviteToken }),
          },
        ));
        if (disposed) return;
        if (alreadyClaimed) {
          setMode('signin');
          setInviteToken(null);
          setInviteAlreadyClaimed(true);
          removeInviteFromUrl();
          return;
        }
        if (!clientEmailChanged) return;
        setInviteToken(null);
        setInviteStatusNotice('Your CA changed the email address on this client record, so this invitation is no longer valid. Ask your CA to create and send a fresh invitation to the updated email address.');
        removeInviteFromUrl();
      } catch (requestError: unknown) {
        if (disposed) return;
        setInviteStatusNotice(requestError instanceof PortalRequestError && requestError.status === 404
          ? 'We couldn’t automatically check whether this invitation has already been used. You can still continue; if you already created your account, choose “Already enrolled? Sign in.”'
          : 'We couldn’t verify the invitation status right now. You can still try creating your account, or sign in if you have already registered.');
      } finally {
        if (!disposed) setCheckingInviteStatus(false);
      }
    })();
    return () => { disposed = true; };
  }, [inviteToken, registrationHandoffEmail]);

  useEffect(() => {
    document.title = 'Secure client portal — Taxflow.AI';
    if (!isSupabaseConfigured || !supabase) {
      setError('The client portal sign-in service is not configured. Please contact your practice.');
      setAuthReady(true);
      return undefined;
    }

    let disposed = false;
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!disposed) setSession(nextSession);
    });
    supabase.auth.getSession()
      .then(({ data, error: sessionError }) => {
        if (disposed) return;
        if (sessionError) setError('Could not verify your sign-in. Please try again.');
        setSession(data.session);
        setAuthReady(true);
      })
      .catch(() => {
        if (!disposed) {
          setError('Could not connect to the sign-in service. Check your connection and try again.');
          setAuthReady(true);
        }
      });
    return () => {
      disposed = true;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.access_token) {
      setPortal(null);
      setLoadingPortal(false);
      return undefined;
    }
    if (authFlowInProgress.current) return undefined;
    let disposed = false;
    setLoadingPortal(true);
    setError('');
    getPortalData(session.access_token)
      .then((data) => {
        if (!disposed) setPortal(data);
      })
      .catch((requestError: unknown) => {
        if (!disposed) {
          setPortal(null);
          setError(requestError instanceof Error ? requestError.message : 'Could not verify your portal access.');
        }
      })
      .finally(() => {
        if (!disposed) setLoadingPortal(false);
      });
    return () => { disposed = true; };
  }, [session?.access_token]);

  const chooseFile = useCallback((file?: File) => {
    setError('');
    setNotice('');
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setSelectedFile(null);
      setError('This file is larger than 20 MB. Choose a smaller file or contact the practice.');
      return;
    }
    setSelectedFile(file);
  }, []);

  async function authenticatePortal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || authenticating) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Enter the email address your practice has on file.');
      return;
    }
    setAuthenticating(true);
    setError('');
    setInviteStatusNotice('');
    setNotice('');
    authFlowInProgress.current = true;
    let sessionEstablished = false;
    try {
      if (mode === 'register') {
        if (!inviteToken) throw new Error('A current invitation from your CA is required to create a portal account.');
        if (password.length < 12 || password.length > 128) {
          throw new Error('Choose a password between 12 and 128 characters.');
        }
        await readResponse<{ email: string }>(await fetch(portalApiUrl('/api/v1/client-portal/invitations/validate'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: inviteToken, email: normalizedEmail }),
        }));
        await readResponse<{ email: string }>(await fetch(portalApiUrl('/api/v1/client-portal/invitations/register'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: inviteToken, email: normalizedEmail, password }),
        }));
        setPassword('');
        setInviteToken(null);
        removeInviteFromUrl();
        setRegistrationSuccessEmail(normalizedEmail);
        setError('');
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (signInError || !data.session) {
        throw signInError || new Error('Sign-in did not create a valid session. Please try again.');
      }
      sessionEstablished = true;

      if (inviteToken) {
        await readResponse<{ client_id: string; invited_email: string }>(await fetch(portalApiUrl('/api/v1/client-portal/invitations/claim'), {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: inviteToken }),
        }));
      }

      const portalData = await getPortalData(data.session.access_token);
      setSession(data.session);
      setPortal(portalData);
      setInviteToken(null);
      setPassword('');
      setRegistrationHandoffEmail(null);
      setInviteAlreadyClaimed(false);
      setNotice('');
      setError('');
    } catch (requestError) {
      if (supabase && sessionEstablished) {
        try {
          const { error: signOutError } = await supabase.auth.signOut();
          if (signOutError) console.error('[Client Portal] Could not clear an unverified sign-in session:', signOutError.message);
        } catch (signOutError) {
          console.error('[Client Portal] Could not clear an unverified sign-in session:', signOutError);
        }
        setSession(null);
      }
      setPortal(null);
      if (requestError instanceof PortalRequestError && requestError.code === 'invitation_already_claimed') {
        setMode('signin');
        setInviteToken(null);
        setEmail(normalizedEmail);
        setInviteAlreadyClaimed(true);
        setRegistrationHandoffEmail(null);
        setPassword('');
        removeInviteFromUrl();
        setError('');
      } else {
        const invalidInvitation = mode === 'register'
          && requestError instanceof PortalRequestError
          && requestError.status === 400
          && /invitation is invalid or expired/i.test(requestError.message);
        const friendlyError = getPortalAuthErrorMessage(requestError, mode);
        setError(invalidInvitation
          ? 'We couldn’t use this invitation. It may have expired, already been used, or the email may not match your CA’s record. Check the exact email or ask your CA for a fresh link. If you already registered, choose “Already enrolled? Sign in.”'
          : requestError instanceof TypeError
            ? 'We couldn’t reach the portal service. Check your internet connection and try again. If the problem continues, contact your tax practice.'
            : friendlyError);
      }
    } finally {
      authFlowInProgress.current = false;
      setAuthenticating(false);
    }
  }

  async function uploadSelectedFile() {
    if (!selectedFile || !session?.access_token || uploading) return;
    setUploading(true);
    setError('');
    setNotice('');
    let uploadSaved = false;
    try {
      const response = await fetch(portalApiUrl('/api/v1/client-portal/documents'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/octet-stream',
          'X-File-Name': encodeURIComponent(selectedFile.name),
          'X-File-Mime-Type': selectedFile.type || 'application/octet-stream',
        },
        body: selectedFile,
      });
      await readResponse<PortalDocument>(response);
      uploadSaved = true;
      setSelectedFile(null);
      if (fileInput.current) fileInput.current.value = '';
      setNotice('Your file was received securely and is now available to your practice.');
      try {
        const data = await getPortalData(session.access_token);
        setPortal(data);
      } catch {
        setError('Your file was received, but the upload history could not refresh. Reload this page to check its status.');
      }
    } catch (requestError) {
      setError(requestError instanceof Error
        ? requestError.message
        : uploadSaved
          ? 'Your file was received, but the portal could not refresh.'
          : 'The file could not be uploaded. Your original file has not been changed.');
    } finally {
      setUploading(false);
    }
  }

  async function signOut() {
    if (!supabase) return;
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError('You could not be signed out. Close this browser if you are using a shared device.');
      return;
    }
    setPortal(null);
    setError('');
    setNotice('');
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragging(false);
    chooseFile(event.dataTransfer.files?.[0]);
  }

  return (
    <main className="client-portal" data-theme={theme}>
      <div className="portal-background-glow portal-background-glow-one" />
      <div className="portal-background-glow portal-background-glow-two" />
      <header className="portal-header">
        <a href="/" className="portal-wordmark" aria-label="Taxflow AI home">
          <span className="portal-brand-glyph">T<span>.</span></span>
          <span>Taxflow<span className="portal-brand-ai">.AI</span></span>
        </a>
        <div className="portal-header-right">
          <span className="portal-secure-label"><PortalIcon name="lock" size={14} /> PRIVATE CLIENT PORTAL</span>
          <button
            type="button"
            className="portal-theme-toggle"
            onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-pressed={theme === 'dark'}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          {portal && <button type="button" className="portal-signout" onClick={() => void signOut()}><PortalIcon name="logout" size={15} /> Sign out</button>}
        </div>
      </header>

      <section className="portal-main">
        {!isSupabaseConfigured ? (
          <div className="portal-state-card">
            <span className="portal-state-icon"><PortalIcon name="shield" size={24} /></span>
            <span className="portal-eyebrow">PORTAL SETUP</span>
            <h1>Secure sign-in is not available</h1>
            <p>{error || 'This portal is temporarily unavailable. Please contact your tax practice for help.'}</p>
            <p className="portal-setup-help">Site administrator: configure the public Supabase project URL and publishable key, plus the backend API URL, in the website hosting environment and redeploy. Never add a service-role key to the website.</p>
          </div>
        ) : registrationSuccessEmail ? (
          <div className="portal-registration-success" role="status" aria-live="polite">
            <div className="portal-success-art" aria-hidden="true">
              <span className="portal-success-halo" />
              <span className="portal-success-check"><PortalIcon name="check" size={34} /></span>
              <i className="portal-success-spark portal-success-spark-one" />
              <i className="portal-success-spark portal-success-spark-two" />
              <i className="portal-success-spark portal-success-spark-three" />
              <i className="portal-success-spark portal-success-spark-four" />
            </div>
            <span className="portal-eyebrow"><i /> SECURE ACCOUNT CREATED</span>
            <h1>Your portal is ready.</h1>
            <p>Your account for <strong>{registrationSuccessEmail}</strong> has been created. Sign in with your new password to securely upload documents.</p>
            <button type="button" className="portal-upload-button" onClick={continueRegistrationToSignIn}>
              Continue to sign in <PortalIcon name="arrow" size={16} />
            </button>
            <span className="portal-success-redirect">Taking you to secure sign-in…</span>
          </div>
        ) : !authReady || loadingPortal || checkingInviteStatus ? (
          <div className="portal-state-card portal-loading-card" role="status">
            <span className="portal-loader" />
            <span className="portal-eyebrow">VERIFYING ACCESS</span>
            <h1>One moment, please</h1>
            <p>We’re securely checking your portal access.</p>
          </div>
        ) : portal && session ? (
          <div className="portal-dashboard">
            <section className="portal-welcome">
              <div>
                <span className="portal-eyebrow"><i /> YOUR SECURE WORKSPACE</span>
                <h1>Welcome, <em>{portal.client.name}</em></h1>
                <p>Upload documents directly to your practice. Your files are only available to the authorized Taxflow team.</p>
              </div>
              <div className="portal-welcome-art" aria-hidden="true">
                <span className="portal-art-orbit orbit-a" />
                <span className="portal-art-orbit orbit-b" />
                <span className="portal-art-card"><PortalIcon name="shield" size={29} /><i><PortalIcon name="check" size={13} /></i></span>
                <span className="portal-art-spark spark-a" />
                <span className="portal-art-spark spark-b" />
              </div>
            </section>

            <div className="portal-content-grid">
              <section className="portal-panel portal-upload-panel">
                <div className="portal-panel-heading">
                  <span className="portal-heading-icon"><PortalIcon name="upload" size={17} /></span>
                  <div><h2>Send a document</h2><p>Private, direct, and ready for your practice.</p></div>
                </div>
                <button
                  type="button"
                  className={`portal-dropzone${dragging ? ' is-dragging' : ''}${selectedFile ? ' has-file' : ''}`}
                  onClick={() => fileInput.current?.click()}
                  onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  disabled={uploading}
                >
                  <input
                    ref={fileInput}
                    className="portal-file-input"
                    type="file"
                    accept={ACCEPTED_FILES}
                    onChange={(event) => {
                      chooseFile(event.currentTarget.files?.[0]);
                      event.currentTarget.value = '';
                    }}
                    aria-label="Choose a document to upload"
                  />
                  <span className="portal-drop-icon"><PortalIcon name={selectedFile ? 'file' : 'upload'} size={22} /></span>
                  {selectedFile ? (
                    <><strong>{selectedFile.name}</strong><span>{formatBytes(selectedFile.size)} · Click to choose another</span></>
                  ) : (
                    <><strong>Drop your file here</strong><span>or <u>browse your device</u></span></>
                  )}
                </button>
                <div className="portal-upload-meta"><span>PDF, PNG, JPG, WEBP, CSV, XLSX</span><span>Up to 20 MB</span></div>
                {selectedFile && <button type="button" className="portal-upload-button" disabled={uploading} onClick={() => void uploadSelectedFile()}>
                  {uploading ? <><span className="portal-button-spinner" /> Uploading securely…</> : <>Upload document <PortalIcon name="arrow" size={16} /></>}
                </button>}
                {notice && <div className="portal-feedback portal-feedback-success" role="status"><PortalIcon name="check" size={16} />{notice}</div>}
                {error && <div className="portal-feedback portal-feedback-error" role="alert">{error}</div>}
                <div className="portal-privacy-note"><PortalIcon name="lock" size={14} /><span>Files are uploaded over HTTPS to private storage. They are not sent through Telegram.</span></div>
              </section>

              <section className="portal-panel portal-history-panel">
                <div className="portal-panel-heading">
                  <span className="portal-heading-icon portal-heading-icon-history"><PortalIcon name="file" size={17} /></span>
                  <div><h2>Your uploads</h2><p>Documents submitted through this portal.</p></div>
                  <span className="portal-count">{portal.documents.length}</span>
                </div>
                {portal.documents.length ? (
                  <ul className="portal-document-list">
                    {portal.documents.map((document) => (
                      <li key={document.id}>
                        <span className="portal-document-icon"><PortalIcon name="file" size={17} /></span>
                        <span className="portal-document-copy"><b title={document.file_name}>{document.file_name}</b><small>{formatBytes(Number(document.file_size_kb || 0) * 1024)} · {formatDate(document.created_at)}</small></span>
                        <span className="portal-document-state"><i /> Received</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="portal-history-empty"><span className="portal-empty-file"><PortalIcon name="file" size={22} /></span><b>No uploads yet</b><span>Documents you send will appear here.</span></div>
                )}
              </section>
            </div>
            <div className="portal-help-line">Signed in as <b>{portal.email}</b> <span>·</span> Need help? Contact your tax practice directly.</div>
          </div>
        ) : (
          <div className="portal-login-layout">
            <section className="portal-login-copy">
              <span className="portal-eyebrow"><i /> A BETTER WAY TO SHARE DOCUMENTS</span>
              <h1>Your documents,<br /><em>delivered privately.</em></h1>
              <p>Open the private invitation link from your CA, then sign in here to access your authorized document upload and file-transfer service. Keep sensitive files out of Telegram and chat messages.</p>
              <div className="portal-trust-list">
                <div><span><PortalIcon name="shield" size={16} /></span><div><b>Private by design</b><small>Your files are available only to your authorized practice.</small></div></div>
                <div><span><PortalIcon name="upload" size={16} /></span><div><b>Simple, secure uploads</b><small>Send supported tax documents from your phone or computer.</small></div></div>
                <div><span><PortalIcon name="lock" size={16} /></span><div><b>Access is invitation-only</b><small>Your CA gives you a private link and your portal account is matched to their client record.</small></div></div>
              </div>
              <p className="portal-chat-note">Telegram remains available for ordinary messages. Please use this portal for files.</p>
            </section>

            <section className="portal-login-card">
              <span className="portal-login-card-mark"><PortalIcon name="lock" size={19} /></span>
              <span className="portal-eyebrow">{inviteToken ? 'PRIVATE CLIENT INVITATION' : 'CLIENT ACCESS'}</span>
              <h2>{mode === 'register' ? 'Create your portal account' : 'Sign in to your portal'}</h2>
              <p>{mode === 'register'
                ? 'Use the exact email address your tax practice has on file. Choose a strong password for future visits.'
                : 'Use the email address and password you set up for your client portal.'}</p>
              {registrationHandoffEmail && mode === 'signin' && (
                <div className="portal-feedback portal-feedback-success portal-account-created-notice" role="status">
                  <PortalIcon name="check" size={16} />
                  <span>Your portal account was created successfully. Sign in below with the password you just chose.</span>
                </div>
              )}
              {inviteAlreadyClaimed && mode === 'signin' && (
                <div className="portal-feedback portal-feedback-success portal-account-created-notice" role="status">
                  <PortalIcon name="check" size={16} />
                  <span>This invitation has already been used to create your portal account. Sign in below to access your documents.</span>
                </div>
              )}
              {inviteStatusNotice && mode === 'register' && (
                <div className="portal-feedback portal-feedback-warning" role="status">
                  <PortalIcon name="shield" size={16} />
                  <span>{inviteStatusNotice}</span>
                </div>
              )}
              {error && <div className="portal-feedback portal-feedback-error" role="alert">{error}</div>}
              {!inviteToken && mode === 'register' ? (
                <div className="portal-invitation-required" role="status">
                  <span><PortalIcon name="shield" size={19} /></span>
                  <b>A private link from your CA is required</b>
                  <p>Open the private, one-time link your CA shared to create your account. Use the same email address your CA has on file; the invitation is matched to that client record. Already enrolled? Sign in instead.</p>
                  <button type="button" onClick={() => { setMode('signin'); setError(''); }}>Already have an account? Sign in</button>
                </div>
              ) : (
                <form onSubmit={(event) => void authenticatePortal(event)}>
                  <label htmlFor="portal-email">Email address</label>
                  <input id="portal-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.currentTarget.value)} placeholder="you@example.com" />
                  <label htmlFor="portal-password">Password</label>
                  <input
                    id="portal-password"
                    type="password"
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    required
                    minLength={mode === 'register' ? 12 : 1}
                    maxLength={128}
                    value={password}
                    onChange={(event) => setPassword(event.currentTarget.value)}
                    placeholder={mode === 'register' ? 'At least 12 characters' : 'Your portal password'}
                  />
                  <button type="submit" className="portal-upload-button" disabled={authenticating || (mode === 'register' && !inviteToken)}>
                    {authenticating
                      ? <><span className="portal-button-spinner" /> {mode === 'register' ? 'Creating secure account…' : 'Signing in securely…'}</>
                      : <>{mode === 'register' ? 'Create secure account' : 'Sign in securely'} <PortalIcon name="arrow" size={16} /></>}
                  </button>
                </form>
              )}
              {inviteToken && <button type="button" className="portal-mode-switch" onClick={() => { setMode((current) => current === 'register' ? 'signin' : 'register'); setError(''); }}>
                {mode === 'register' ? 'Already enrolled? Sign in' : 'First time here? Create your account'}
              </button>}
              <div className="portal-login-foot"><PortalIcon name="shield" size={14} /><span>Access is limited to invited client accounts.</span></div>
            </section>
          </div>
        )}
      </section>

      <footer className="portal-footer">
        <span>© {new Date().getFullYear()} Taxflow.AI</span>
        <span><PortalIcon name="lock" size={12} /> Secure client document portal</span>
        <a href="/privacy">Privacy notice</a>
      </footer>
    </main>
  );
}
