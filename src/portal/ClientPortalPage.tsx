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

type ApiResponse<T> = { success?: boolean; message?: string; data?: T };

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
    throw new Error(`The portal service returned an invalid response (HTTP ${response.status}).`);
  }
  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(payload.message || `The request could not be completed (HTTP ${response.status}).`);
  }
  return payload.data;
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
  const [session, setSession] = useState<Session | null>(null);
  const [portal, setPortal] = useState<PortalData | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [email, setEmail] = useState('');
  const [sendingLink, setSendingLink] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

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

  async function sendSignInLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || sendingLink) return;
    setSendingLink(true);
    setError('');
    setLinkSent(false);
    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/portal`,
        },
      });
      if (signInError) throw signInError;
      setLinkSent(true);
    } catch (requestError) {
      setError(requestError instanceof Error
        ? requestError.message
        : 'A sign-in link could not be sent. Check the email address and try again.');
    } finally {
      setSendingLink(false);
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
    <main className="client-portal">
      <div className="portal-background-glow portal-background-glow-one" />
      <div className="portal-background-glow portal-background-glow-two" />
      <header className="portal-header">
        <a href="/" className="portal-wordmark" aria-label="Taxflow AI home">
          <span className="portal-brand-glyph">T<span>.</span></span>
          <span>Taxflow<span className="portal-brand-ai">.AI</span></span>
        </a>
        <div className="portal-header-right">
          <span className="portal-secure-label"><PortalIcon name="lock" size={14} /> PRIVATE CLIENT PORTAL</span>
          {portal && <button type="button" className="portal-signout" onClick={() => void signOut()}><PortalIcon name="logout" size={15} /> Sign out</button>}
        </div>
      </header>

      <section className="portal-main">
        {!isSupabaseConfigured ? (
          <div className="portal-state-card">
            <span className="portal-state-icon"><PortalIcon name="shield" size={24} /></span>
            <span className="portal-eyebrow">PORTAL SETUP</span>
            <h1>Secure sign-in is not available</h1>
            <p>{error || 'Please contact your practice for help.'}</p>
          </div>
        ) : !authReady || loadingPortal ? (
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
              <p>Sign in to your Taxflow client portal to send files directly to your practice—without attaching them to a chat.</p>
              <div className="portal-trust-list">
                <div><span><PortalIcon name="shield" size={16} /></span><div><b>Private by design</b><small>Your files are available only to your authorized practice.</small></div></div>
                <div><span><PortalIcon name="upload" size={16} /></span><div><b>Simple, secure uploads</b><small>Send supported tax documents from your phone or computer.</small></div></div>
                <div><span><PortalIcon name="lock" size={16} /></span><div><b>Sign in with a secure link</b><small>No password to remember. We’ll email a one-time sign-in link.</small></div></div>
              </div>
              <p className="portal-chat-note">Telegram remains available for ordinary messages. Please use this portal for files.</p>
            </section>

            <section className="portal-login-card">
              <span className="portal-login-card-mark"><PortalIcon name="lock" size={19} /></span>
              <span className="portal-eyebrow">CLIENT ACCESS</span>
              <h2>Sign in to your portal</h2>
              <p>Use the email address your tax practice has on file. We’ll send you a secure sign-in link.</p>
              {error && <div className="portal-feedback portal-feedback-error" role="alert">{error}</div>}
              {linkSent ? (
                <div className="portal-link-sent" role="status">
                  <span><PortalIcon name="check" size={19} /></span>
                  <b>Check your inbox</b>
                  <p>If this email has portal access, a secure sign-in link is on its way. The link expires for your protection.</p>
                  <button type="button" onClick={() => setLinkSent(false)}>Use a different email</button>
                </div>
              ) : (
                <form onSubmit={(event) => void sendSignInLink(event)}>
                  <label htmlFor="portal-email">Email address</label>
                  <input id="portal-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.currentTarget.value)} placeholder="you@example.com" />
                  <button type="submit" className="portal-upload-button" disabled={sendingLink}>
                    {sendingLink ? <><span className="portal-button-spinner" /> Sending secure link…</> : <>Email me a sign-in link <PortalIcon name="arrow" size={16} /></>}
                  </button>
                </form>
              )}
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
