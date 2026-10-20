import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { ClientPortalPage } from './portal/ClientPortalPage';
import './styles.css';

type IconName =
  | 'arrow'
  | 'calendar'
  | 'calculator'
  | 'check'
  | 'clock'
  | 'document'
  | 'download'
  | 'eye'
  | 'file'
  | 'folder'
  | 'info'
  | 'lock'
  | 'mail'
  | 'menu'
  | 'message'
  | 'moon'
  | 'spark'
  | 'shield'
  | 'stack'
  | 'sun'
  | 'telegram'
  | 'users'
  | 'x';

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const
  };

  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /><path d="m9 15 2 2 4-4" /></>,
    calculator: <><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M8 6h8v4H8zM8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    document: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></>,
    download: <><path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M5 17v3h14v-3" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="m9 15 2 2 4-4" /></>,
    folder: <><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M3 10h18" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3M12 14v3" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    message: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" /></>,
    moon: <><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" /></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 1 2.5 2 1-2 1L19 21l-1-2.5-2-1 2-1 1-2.5Z" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    stack: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>,
    telegram: <><path d="m21 3-7.2 18-4.1-7.1L3 10.2 21 3Z" /><path d="m9.7 13.9 4.8-4.8" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    x: <><path d="m18 6-12 12M6 6l12 12" /></>
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function BrandGlyph({ size = 31 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 30 30" fill="none">
      <rect width="30" height="30" rx="8" fill="var(--accent)" />
      <path d="M8 11h14M8 15.5h8M8 20h5" stroke="var(--accent-ink)" strokeWidth="2" strokeLinecap="round" opacity=".55" />
      <path d="m15.5 19.5 3.2 3.2 6-7.4" stroke="var(--accent-ink)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function useReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.14, rootMargin: '0px 0px -36px 0px' }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

function CursorDotField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const spacing = 32;
    const reach = 138;
    const trail: { x: number; y: number; time: number }[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let targetX = -1000;
    let targetY = -1000;
    let cursorX = targetX;
    let cursorY = targetY;
    let lastMoveAt = 0;
    let reducedMotion = motionPreference.matches;

    const draw = (time: number) => {
      frame = 0;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      const opacity = reducedMotion ? 0 : Math.max(0, 1 - (time - lastMoveAt) / 850);
      cursorX += (targetX - cursorX) * 0.22;
      cursorY += (targetY - cursorY) * 0.22;

      context!.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context!.clearRect(0, 0, width, height);
      context!.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--cursor-dot-color').trim() || '#34435b';

      for (let y = spacing / 2; y < height; y += spacing) {
        for (let x = spacing / 2; x < width; x += spacing) {
          const dx = cursorX - x;
          const dy = cursorY - y;
          const distance = Math.hypot(dx, dy);
          const influence = Math.pow(Math.max(0, 1 - distance / reach), 2) * opacity;
          const offset = influence * 7;
          context!.globalAlpha = 0.075 + influence * 0.3;
          context!.beginPath();
          context!.arc(x + (distance ? dx / distance * offset : 0), y + (distance ? dy / distance * offset : 0), 0.9 + influence * 1.1, 0, Math.PI * 2);
          context!.fill();
        }
      }

      while (trail.length && time - trail[0].time > 360) trail.shift();
      trail.forEach((point) => {
        const age = (time - point.time) / 360;
        context!.globalAlpha = (1 - age) * 0.3;
        context!.beginPath();
        context!.arc(point.x, point.y, 1.4 * (1 - age * 0.45), 0, Math.PI * 2);
        context!.fill();
      });

      if (opacity > 0 || trail.length) frame = requestAnimationFrame(draw);
    };

    const scheduleDraw = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = Math.round(width * pixelRatio);
      canvas!.height = Math.round(height * pixelRatio);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      scheduleDraw();
    };
    const onPointerMove = (event: PointerEvent) => {
      if (reducedMotion || event.pointerType !== 'mouse') return;

      const x = event.clientX;
      const y = event.clientY;
      const previous = trail[trail.length - 1];
      if (!previous || Math.hypot(x - previous.x, y - previous.y) >= 12) {
        trail.push({ x, y, time: performance.now() });
      }
      targetX = x;
      targetY = y;
      lastMoveAt = performance.now();
      scheduleDraw();
    };
    const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      trail.length = 0;
      scheduleDraw();
    };
    const themeObserver = new MutationObserver(scheduleDraw);

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    motionPreference.addEventListener('change', onMotionPreferenceChange);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    resize();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      motionPreference.removeEventListener('change', onMotionPreferenceChange);
      themeObserver.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} className="cursor-dot-field" aria-hidden="true" />;
}

function HeaderScrollProgress() {
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const progress = progressRef.current;
    if (!progress) return;

    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const fraction = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
      progress.style.transform = `scaleX(${Math.max(0, Math.min(1, fraction))})`;
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress);
    };
    const resizeObserver = new ResizeObserver(scheduleUpdate);

    resizeObserver.observe(document.body);
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    updateProgress();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="header-scroll-progress" aria-hidden="true">
      <span ref={progressRef} />
    </div>
  );
}

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('taxflow_website_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // Fall back to the system preference when browser storage is unavailable.
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('taxflow_website_theme', theme);
    } catch {
      // The current theme still applies for this page view.
    }
  }, [theme]);

  return { theme, toggleTheme: () => setTheme((current) => current === 'light' ? 'dark' : 'light') };
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-pressed={theme === 'dark'}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className="theme-icon theme-icon-sun"><Icon name="sun" size={15} /></span>
      <span className="theme-icon theme-icon-moon"><Icon name="moon" size={14} /></span>
      <span className="theme-toggle-thumb" />
    </button>
  );
}

function Header({ productPage = false }: { productPage?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const prefix = productPage ? '/#' : '#';

  useEffect(() => {
    const buttons = [...document.querySelectorAll<HTMLElement>(
      'a[href="/waitlist"].button, a[href="/waitlist"].btn, a[href="/waitlist"].nav-cta, button.form-submit'
    )];
    if (!buttons.length) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    buttons.forEach((button) => button.classList.add('waitlist-magnetic'));

    const resetButtons = () => buttons.forEach((button) => {
      button.style.translate = '0 0';
    });
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || reducedMotion.matches) return;

      buttons.forEach((button) => {
        const bounds = button.getBoundingClientRect();
        const offsetX = event.clientX - (bounds.left + bounds.width / 2);
        const offsetY = event.clientY - (bounds.top + bounds.height / 2);
        const distance = Math.hypot(offsetX, offsetY);
        const radius = 132;

        if (distance >= radius) {
          button.style.translate = '0 0';
          return;
        }

        const strength = (1 - distance / radius) * 0.12;
        button.style.translate = `${Math.max(-9, Math.min(9, offsetX * strength))}px ${Math.max(-7, Math.min(7, offsetY * strength))}px`;
      });
    };
    const onMotionPreferenceChange = () => {
      if (reducedMotion.matches) resetButtons();
    };
    const onWindowPointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) resetButtons();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerout', onWindowPointerOut);
    reducedMotion.addEventListener('change', onMotionPreferenceChange);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerout', onWindowPointerOut);
      reducedMotion.removeEventListener('change', onMotionPreferenceChange);
      buttons.forEach((button) => {
        button.classList.remove('waitlist-magnetic');
        button.style.removeProperty('translate');
      });
    };
  }, []);

  return (
    <header className="site-header">
      <a href="/" className="wordmark" aria-label="Taxflow home">
        <BrandGlyph />
        <span>TaxFlow</span><em className="brand-ai">AI</em>
      </a>
      <button
        className="mobile-menu-button"
        type="button"
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <Icon name={menuOpen ? 'x' : 'menu'} />
      </button>
      <nav className={`main-nav${menuOpen ? ' nav-open' : ''}`} aria-label="Main navigation">
        <a href={`${prefix}how-it-works`} onClick={() => setMenuOpen(false)}>How it works</a>
        <a href={`${prefix}features`} onClick={() => setMenuOpen(false)}>Features</a>
        <a href={`${prefix}security`} onClick={() => setMenuOpen(false)}>Security</a>
        <a href={`${prefix}status`} onClick={() => setMenuOpen(false)}>Status</a>
        <a href={`${prefix}faq`} onClick={() => setMenuOpen(false)}>FAQ</a>
        <a className="nav-product" href="/product" onClick={() => setMenuOpen(false)}>Product details</a>
        <a className="nav-comparison" href="/workflow-comparison" onClick={() => setMenuOpen(false)}>Compare workflows</a>
        <a className="nav-get-app" href="/get-app" onClick={() => setMenuOpen(false)}>Get the app</a>
        <a className="nav-portal" href="/portal" onClick={() => setMenuOpen(false)}>Client portal</a>
        <ThemeToggle />
        <a className="nav-cta" href="/waitlist" onClick={() => setMenuOpen(false)}>
          Join the waitlist <span className="arrow" aria-hidden="true">→</span>
        </a>
      </nav>
      <HeaderScrollProgress />
    </header>
  );
}

function DashboardPreview() {
  return (
    <div className="preview-shell" aria-label="Illustration of the Taxflow review workspace">
      <div className="preview-topbar">
        <div className="preview-brand"><span className="mini-mark">t.</span><span>Practice workspace</span></div>
        <span className="preview-period">AUG 2026 <span className="period-dot" /></span>
      </div>
      <div className="preview-body">
        <div className="preview-greeting">
          <div><span className="eyebrow">MONDAY, 24 AUGUST</span><h3>Good morning, Ananya.</h3><p>Here’s the work that needs your attention.</p></div>
          <div className="avatar-stack"><span>AK</span><span>RS</span><span>+3</span></div>
        </div>
        <div className="preview-stats">
          <div className="stat-card"><span>CLIENTS</span><strong>128</strong><small><i className="stat-dot green" /> All clients</small></div>
          <div className="stat-card"><span>TO REVIEW</span><strong>06</strong><small><i className="stat-dot amber" /> 2 need a closer look</small></div>
          <div className="stat-card"><span>UP NEXT</span><strong>12</strong><small><i className="stat-dot blue" /> This month</small></div>
        </div>
        <div className="preview-work-card">
          <div className="work-card-head"><div><span className="eyebrow">REVIEW QUEUE</span><h4>Ready for your eyes</h4></div><span className="queue-count">02 ITEMS</span></div>
          <div className="review-row">
            <span className="file-icon gst-icon">G</span>
            <div className="review-row-copy"><strong>Iyer &amp; Sons · GSTR-3B</strong><span>12 invoices checked · 1 field flagged</span></div>
            <span className="review-status">Needs review</span>
            <span className="row-arrow"><Icon name="arrow" size={15} /></span>
          </div>
          <div className="review-row">
            <span className="file-icon invoice-icon">↗</span>
            <div className="review-row-copy"><strong>Mehta Studio · Purchase invoice</strong><span>Source linked · Awaiting approval</span></div>
            <span className="review-status review-status-soft">Review ready</span>
            <span className="row-arrow"><Icon name="arrow" size={15} /></span>
          </div>
        </div>
        <div className="preview-agent-card">
          <span className="agent-icon"><Icon name="spark" size={17} /></span>
          <div><strong>A useful detail, surfaced.</strong><p>One invoice total doesn’t match its line items. Review it before it enters your filing draft.</p></div>
          <span className="agent-live"><i /> LIVE</span>
        </div>
      </div>
      <div className="preview-note"><span className="preview-note-icon"><Icon name="shield" size={14} /></span>Illustrative product preview · interface shown for concept only</div>
      <div className="float-note note-review"><span className="note-check"><Icon name="check" size={14} /></span><span><strong>Human approval</strong><small>Always in control</small></span></div>
      <div className="float-note note-source"><span className="note-spark"><Icon name="spark" size={15} /></span><span><strong>Source-linked</strong><small>Originals stay in view</small></span></div>
    </div>
  );
}

function WaitlistForm({ initialEmail = '' }: { initialEmail?: string }) {
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const endpoint = import.meta.env.VITE_WAITLIST_ENDPOINT?.trim();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    setState('submitting');
    setMessage('');

    const data = Object.fromEntries(new FormData(form).entries());
    if (data.website) {
      setState('success');
      setMessage('Thanks. If you are a real visitor, your request can be submitted using the form.');
      form.reset();
      return;
    }
    const email = String(data.email).trim().toLowerCase();
    try {
      if (endpoint) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, email })
        });
        if (!response.ok) throw new Error('The waitlist service could not accept your request. Please try again.');
        setMessage('Your details have been sent securely. We’ll be in touch when there’s news to share.');
      } else if (supabase) {
        const { error } = await supabase.rpc('join_website_waitlist', {
          p_email: email,
          p_consent: data.consent === 'true',
          p_name: String(data.name ?? '').trim() || null,
          p_firm: String(data.firm ?? '').trim() || null,
          p_role: String(data.role ?? '').trim() || null,
          p_country: String(data.country ?? '').trim() || null,
          p_team_size: String(data.size ?? '').trim() || null
        });
        if (error) throw new Error('We couldn’t save your request. Please try again in a moment.');
        setMessage('You’re on the waitlist. We’ll share a thoughtful update when there’s meaningful news.');
      } else {
        const saved = JSON.parse(localStorage.getItem('taxflow_waitlist_demo') || '[]') as Array<Record<string, FormDataEntryValue>>;
        if (!saved.some((entry) => String(entry.email).toLowerCase() === email)) {
          saved.push({ ...data, email, savedAt: new Date().toISOString() });
          localStorage.setItem('taxflow_waitlist_demo', JSON.stringify(saved));
        }
        setMessage('Thanks for your interest. This preview saved your request in this browser only; it has not been sent to Taxflow.');
      }
      setState('success');
      form.reset();
    } catch (error) {
      setState('error');
      console.error('Waitlist submission failed:', error);
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    }
  }

  if (state === 'success') {
    return (
      <div className="waitlist-success-panel" role="status" aria-live="polite">
        <div className="celebration-confetti" aria-hidden="true">
          {Array.from({ length: 16 }, (_, index) => <i key={index} style={{ '--particle-index': index } as React.CSSProperties} />)}
        </div>
        <div className="success-emblem" aria-hidden="true">
          <span className="success-emblem-ring" />
          <span className="success-emblem-core"><Icon name="check" size={28} /></span>
        </div>
        <span className="eyebrow"><span className="status-dot-live" /> EARLY ACCESS REQUEST RECEIVED</span>
        <h3>You’re on the list.</h3>
        <p>{message}</p>
        <div className="success-next-step"><span><Icon name="mail" size={17} /></span><p><strong>What happens next</strong><br />We’ll email you when there’s a meaningful early-access update.</p></div>
        <a className="success-home-link" href="/">Back to TaxFlow <Icon name="arrow" size={16} /></a>
      </div>
    );
  }

  return (
    <form className="waitlist-form" onSubmit={handleSubmit}>
      <div className="form-fields">
        <label className="form-field">
          <span>Your name <span className="optional-label">Optional</span></span>
          <input autoComplete="name" maxLength={120} name="name" placeholder="e.g. Ananya Mehta" />
        </label>
        <label className="form-field">
          <span>Email address</span>
          <input autoComplete="email" defaultValue={initialEmail} maxLength={200} name="email" type="email" placeholder="you@yourfirm.com" required />
        </label>
      </div>
      <label className="form-field">
        <span>Firm name <span className="optional-label">Optional</span></span>
        <input autoComplete="organization" maxLength={160} name="firm" placeholder="Your practice or firm" />
      </label>
      <div className="form-fields">
      <label className="form-field">
        <span>Your role <span className="optional-label">Optional</span></span>
        <select name="role" defaultValue="">
          <option value="">Select your role</option>
          <option value="Chartered accountant">Chartered accountant</option>
          <option value="Accountant or bookkeeper">Accountant or bookkeeper</option>
          <option value="Firm owner or partner">Firm owner or partner</option>
          <option value="Tax consultant">Tax consultant</option>
          <option value="Other">Other</option>
        </select>
      </label>
      <label className="form-field">
        <span>Country <span className="optional-label">Optional</span></span>
        <select name="country" defaultValue="">
          <option value="">Select a country</option>
          <option value="India">India</option>
          <option value="United States">United States</option>
          <option value="United Arab Emirates">United Arab Emirates</option>
          <option value="Singapore">Singapore</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="Other">Other</option>
        </select>
      </label>
      </div>
      <label className="form-field">
        <span>People in your firm <span className="optional-label">Optional</span></span>
        <select name="size" defaultValue="">
          <option value="">Select firm size</option>
          <option value="Just me">Just me</option>
          <option value="2 to 5">2 to 5</option>
          <option value="6 to 20">6 to 20</option>
          <option value="21 or more">21 or more</option>
        </select>
      </label>
      <label className="consent-check">
        <input type="checkbox" name="consent" value="true" required />
        <span>I agree that Taxflow AI may email me about early access. See the <a href="/privacy">privacy notice</a>.</span>
      </label>
      <label className="honeypot" aria-hidden="true">Leave this field empty<input autoComplete="off" name="website" tabIndex={-1} type="text" /></label>
      <button className="button button-dark form-submit" type="submit" disabled={state === 'submitting'}>
        {state === 'submitting' ? 'Sending…' : 'Join the waitlist'}
        <span className="arrow" aria-hidden="true">→</span>
      </button>
      <p className="form-disclaimer">
        {endpoint
          ? 'Your information is used only to respond to this request.'
          : isSupabaseConfigured
            ? 'Your details are stored securely in our Supabase waitlist. We use them only for the updates you consented to.'
            : 'Preview mode: requests stay in this browser only and are not transmitted.'}
      </p>
      {message && state === 'error' && (
        <p className="form-message form-error" aria-live="polite" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}

function Footer({ productPage = false }: { productPage?: boolean }) {
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const [typingProgress, setTypingProgress] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;

    const updateProgress = () => {
      frame = 0;
      const element = wordmarkRef.current;
      if (!element) return;
      if (reducedMotion.matches) {
        setTypingProgress(1);
        return;
      }

      const rect = element.getBoundingClientRect();
      const end = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
      const start = window.scrollY + rect.top - window.innerHeight;
      setTypingProgress(end <= start ? 1 : Math.max(0, Math.min(1, (window.scrollY - start) / (end - start))));
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress);
    };
    const onMotionPreferenceChange = () => scheduleUpdate();

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    reducedMotion.addEventListener('change', onMotionPreferenceChange);
    updateProgress();

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      reducedMotion.removeEventListener('change', onMotionPreferenceChange);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const wordmark = 'TaxFlow';

  return (
    <footer className="site-footer">
      <div className="footer-brand-block">
        <a href="/" className="wordmark footer-brand" aria-label="TaxFlow AI home">
          <BrandGlyph size={28} /><span>TaxFlow</span><em className="brand-ai">AI</em>
        </a>
        <p>Document collection, reading, and review for accounting practices.</p>
      </div>
      <div className="footer-group"><h3>Product</h3><a href={productPage ? '/#how-it-works' : '#how-it-works'}>How it works</a><a href={productPage ? '/#features' : '#features'}>Features</a><a href="/workflow-comparison">Compare workflows</a><a href="/product">Product details</a></div>
      <div className="footer-group"><h3>Access</h3><a href="/get-app">Get the app</a><a href="/waitlist">Join the waitlist</a></div>
      <div className="footer-group"><h3>Trust</h3><a href={productPage ? '/#security' : '#security'}>Security</a><a href={productPage ? '/#faq' : '#faq'}>FAQ</a><a href={productPage ? '/#status' : '#status'}>Product status</a></div>
      <div className="footer-group"><h3>Legal</h3><a href="/privacy">Privacy notice</a><a href="/terms">Terms of use</a></div>
      <div className="footer-wordmark-section" ref={wordmarkRef}>
        <div className="footer-wordmark" role="img" aria-label="TaxFlow AI">
          <span className="footer-wordmark-brand" aria-hidden="true" style={{ opacity: Math.min(1, typingProgress * 9), transform: `translateY(${(1 - Math.min(1, typingProgress * 9)) * 0.08}em)` }}><BrandGlyph size={80} /></span>
          <span className="footer-wordmark-name" aria-hidden="true">{[...wordmark].map((letter, index) => {
            const letterProgress = Math.max(0, Math.min(1, typingProgress * 9 - index - 1));
            return <span className="footer-wordmark-letter" key={`${letter}-${index}`} style={{ opacity: letterProgress, transform: `translateY(${(1 - letterProgress) * 0.08}em)` }}>{letter}</span>;
          })}</span>
          <span className="footer-wordmark-ai" aria-hidden="true" style={{ opacity: Math.max(0, Math.min(1, typingProgress * 9 - wordmark.length - 1)) }}>AI</span>
        </div>
      </div>
      <div className="footer-bottom"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><span>© {new Date().getFullYear()} TaxFlow AI</span><span>Names, files, and figures shown here are illustrative.</span></div>
    </footer>
  );
}

function WaitlistPage() {
  useReveal();
  const email = new URLSearchParams(window.location.search).get('email')?.slice(0, 200) ?? '';

  return (
    <>
      <Header productPage />
      <main className="waitlist-page">
        <section className="waitlist-standalone ledger-wrap">
          <div className="waitlist-page-copy" data-reveal>
            <a href="/" className="waitlist-back"><Icon name="arrow" size={15} /> Back to the website</a>
            <span className="eyebrow"><span className="status-dot-live" /> PRIVATE BETA · EARLY ACCESS</span>
            <h1>Make room for<br /><span>the work that matters.</span></h1>
            <p>We’re building a clearer, more considered way for accounting practices to collect documents and review the work. Join the waitlist to hear about early access.</p>
            <ul className="waitlist-benefits">
              <li><span><Icon name="mail" size={16} /></span><span><strong>A thoughtful update when it matters</strong><small>We’ll only write when there is real news to share.</small></span></li>
              <li><span><Icon name="eye" size={16} /></span><span><strong>A chance to shape the product</strong><small>Early feedback helps us build around real practice workflows.</small></span></li>
              <li><span><Icon name="lock" size={16} /></span><span><strong>Your choice, your inbox</strong><small>Joining is free. No payment details or client documents.</small></span></li>
            </ul>
          </div>
          <div className="waitlist-card waitlist-standalone-card" data-reveal>
            <div className="waitlist-form-heading"><span className="waitlist-card-icon"><Icon name="spark" size={18} /></span><div><span className="eyebrow">TAXFLOW AI · EARLY ACCESS</span><h2>Join the waitlist</h2></div></div>
            <p className="waitlist-form-intro">Start with your email. Share any extra details only if you’d like.</p>
            <WaitlistForm initialEmail={email} />
            <p className="waitlist-privacy-note"><Icon name="shield" size={14} /> Your details are used only for early-access updates. <a href="/privacy">Read our privacy notice.</a></p>
          </div>
        </section>
      </main>
      <Footer productPage />
    </>
  );
}

function NotFoundPage() {
  useReveal();
  return (
    <>
      <Header />
      <main className="not-found-page">
        <section className="not-found-card" data-reveal>
          <span className="not-found-code">404 <i /></span>
          <span className="eyebrow">PAGE NOT FOUND</span>
          <h1>This page took<br /><em>a wrong turn.</em></h1>
          <p>The link may be outdated, or the page may have moved. Let’s get you back to something useful.</p>
          <div className="not-found-actions">
            <a className="button button-dark" href="/">Back to home <Icon name="arrow" size={16} /></a>
            <a className="btn btn-ghost" href="/waitlist">Join the waitlist <Icon name="arrow" size={16} /></a>
          </div>
          <div className="not-found-foot"><BrandGlyph size={23} /><span>TaxFlow AI · Practice, with less busywork.</span></div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function GetAppPage() {
  const [showComingSoonMessage, setShowComingSoonMessage] = useState(false);
  useReveal();

  return (
    <>
      <Header productPage />
      <main className="get-app-page">
        <section className="get-app-hero ledger-wrap">
          <div className="get-app-copy" data-reveal>
            <a href="/" className="back-link"><Icon name="arrow" size={15} /> Back to overview</a>
            <span className="eyebrow"><span className="status-dot-live" /> BUILT FOR ACCOUNTING PRACTICES</span>
            <h1>One workspace for<br /><em>the work behind the numbers.</em></h1>
            <p>TaxFlow is being designed to bring document collection, AI-assisted preparation and review into a more connected practice workflow. The app is not yet available to install.</p>
            <div className="get-app-action">
              <button className="get-app-button" type="button" onClick={() => setShowComingSoonMessage(true)}>
                <span className="get-app-button-icon"><Icon name="download" size={18} /></span>
                <span>Get the TaxFlow app</span>
                <Icon name="arrow" size={17} />
              </button>
              <span className="coming-soon-badge"><i /> COMING SOON</span>
            </div>
            {showComingSoonMessage && (
              <div className="get-app-message" role="status" aria-live="polite">
                <span><Icon name="spark" size={17} /></span>
                <p><strong>The app isn’t ready to install yet.</strong><br />Join the waitlist and we’ll share an update when early access is available.</p>
                <a href="/waitlist">Join the waitlist <Icon name="arrow" size={14} /></a>
              </div>
            )}
            <p className="get-app-note"><Icon name="info" size={15} /> No download is available yet. We’ll announce availability when the app is ready.</p>
          </div>
          <div className="get-app-visual" data-reveal>
            <div className="get-app-window">
              <div className="get-app-window-bar"><span><i /><i /><i /></span><strong>TaxFlow · Practice workspace</strong><span className="concept-label">CONCEPT</span></div>
              <div className="get-app-window-body">
                <div className="get-app-side">
                  <span className="get-app-mark"><BrandGlyph size={22} /></span>
                  <span className="get-app-side-item is-active"><Icon name="stack" size={16} /></span>
                  <span className="get-app-side-item"><Icon name="users" size={16} /></span>
                  <span className="get-app-side-item"><Icon name="calendar" size={16} /></span>
                  <span className="get-app-side-item"><Icon name="folder" size={16} /></span>
                </div>
                <div className="get-app-workspace">
                  <span className="eyebrow">A CLEARER VIEW OF THE WORK</span>
                  <h2>From incoming files<br />to informed review.</h2>
                  <p>A concept illustration of the intended workflow—not a released app screen.</p>
                  <div className="get-app-workflow">
                    <div><span className="get-app-workflow-icon"><Icon name="folder" size={16} /></span><span><strong>Collect &amp; organise</strong><small>Keep documents with their client work</small></span><Icon name="check" size={16} /></div>
                    <div><span className="get-app-workflow-icon"><Icon name="spark" size={16} /></span><span><strong>Prepare for review</strong><small>AI-assisted reading, where enabled</small></span><Icon name="arrow" size={16} /></div>
                    <div><span className="get-app-workflow-icon"><Icon name="eye" size={16} /></span><span><strong>Keep the accountant in control</strong><small>Originals and review stay together</small></span><span className="review-chip">HUMAN REVIEW</span></div>
                  </div>
                </div>
              </div>
            </div>
            <p className="get-app-visual-caption"><Icon name="shield" size={14} /> Product concept only · no live client data</p>
          </div>
        </section>
        <section className="get-app-next ledger-section ledger-section-tint">
          <div className="ledger-wrap get-app-next-inner">
            <div><span className="eyebrow">UNTIL THEN</span><h2>See how the workflow<br /><em>is designed to fit together.</em></h2><p>Explore the current process comparison, or follow the product as it develops.</p></div>
            <div className="get-app-next-actions">
              <a className="button button-dark" href="/workflow-comparison">Compare workflows <Icon name="arrow" size={16} /></a>
              <a className="btn btn-ghost" href="/waitlist">Join the waitlist <Icon name="arrow" size={16} /></a>
            </div>
          </div>
        </section>
      </main>
      <Footer productPage />
    </>
  );
}

const workflowComparisonRows = [
  {
    number: '01',
    title: 'Requesting and receiving documents',
    current: 'Requests may go out through separate messages, email threads or calls; incoming files can land in different places.',
    taxflow: 'The product is designed to bring configured requests and incoming client files into a connected client workflow.',
    status: 'WORKFLOW DIRECTION',
    icon: 'message' as const
  },
  {
    number: '02',
    title: 'Sorting and finding the source',
    current: 'A person may need to rename, move and match each file to the right client or period.',
    taxflow: 'Client and document organisation is part of the intended workspace, with the source document kept close to the review.',
    status: 'IN INTERNAL TESTING',
    icon: 'folder' as const
  },
  {
    number: '03',
    title: 'Capturing document details',
    current: 'Names, dates and amounts can require manual reading and re-entry from each supported document.',
    taxflow: 'AI-assisted extraction is intended to prepare supported document details for checking—not to make the accountant’s decision.',
    status: 'AI-ASSISTED · VERIFY',
    icon: 'spark' as const
  },
  {
    number: '04',
    title: 'Checking and correcting work',
    current: 'The original and re-keyed values may need to be compared by switching between a file and a separate working sheet.',
    taxflow: 'The review direction keeps extracted details with their original so a person can inspect, correct and approve the work.',
    status: 'HUMAN APPROVAL',
    icon: 'eye' as const
  },
  {
    number: '05',
    title: 'Preparing the next step',
    current: 'A professional gathers reviewed information and prepares the next work product using the practice’s existing process.',
    taxflow: 'The product roadmap aims to connect review-ready work to supported preparation steps; validated filing capabilities remain phased.',
    status: 'PHASED ROADMAP',
    icon: 'file' as const
  }
];

function WorkflowComparisonPage() {
  useReveal();

  return (
    <>
      <Header productPage />
      <main className="workflow-comparison-page">
        <section className="comparison-page-hero">
          <div className="ledger-wrap comparison-page-hero-inner" data-reveal>
            <a href="/" className="back-link"><Icon name="arrow" size={15} /> Back to overview</a>
            <span className="eyebrow">A PRACTICAL, STEP-BY-STEP COMPARISON</span>
            <h1>Same professional judgement.<br /><em>Less disconnected work.</em></h1>
            <p>See how a typical document-heavy practice workflow can differ from the connected process TaxFlow is being designed to support.</p>
            <div className="comparison-page-legend">
              <span><i className="legend-dot manual" /> Common manual workflow</span>
              <span><i className="legend-dot assisted" /> TaxFlow product direction</span>
            </div>
          </div>
        </section>
        <section className="comparison-journey ledger-wrap" aria-label="Workflow comparison">
          {workflowComparisonRows.map((row, index) => (
            <article className="comparison-journey-row" data-reveal key={row.number} style={{ '--delay': `${index * 75}ms` } as React.CSSProperties}>
              <div className="comparison-journey-index"><span>{row.number}</span>{index < workflowComparisonRows.length - 1 && <i />}</div>
              <div className="comparison-journey-content">
                <h2>{row.title}</h2>
                <div className="comparison-journey-columns">
                  <div className="comparison-journey-card manual">
                    <span className="comparison-card-label"><Icon name="clock" size={15} /> COMMON MANUAL PROCESS</span>
                    <p>{row.current}</p>
                  </div>
                  <div className="comparison-journey-arrow" aria-hidden="true"><Icon name="arrow" size={18} /></div>
                  <div className="comparison-journey-card assisted">
                    <span className="comparison-card-label"><Icon name={row.icon} size={15} /> TAXFLOW DIRECTION</span>
                    <p>{row.taxflow}</p>
                    <span className="comparison-row-status">{row.status}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
          <div className="comparison-page-note" data-reveal>
            <Icon name="info" size={17} />
            <p><strong>A fair comparison, not a performance claim.</strong><br />Practices work in different ways. This describes common manual steps and TaxFlow’s product direction; it is not a measured time-saving study or a claim that every listed capability is available today.</p>
          </div>
        </section>
        <section className="comparison-human-section">
          <div className="ledger-wrap comparison-human-inner">
            <span className="eyebrow">WHAT DOES NOT CHANGE</span>
            <h2>Automation can prepare the work.<br /><em>The professional owns the decision.</em></h2>
            <div className="comparison-human-points">
              <div><Icon name="eye" size={19} /><strong>Review the source</strong><p>Original documents stay part of the review context.</p></div>
              <div><Icon name="check" size={19} /><strong>Correct the details</strong><p>Extracted information is something to inspect, not assume.</p></div>
              <div><Icon name="shield" size={19} /><strong>Approve consequential work</strong><p>Taxflow is not designed to file without explicit human approval.</p></div>
            </div>
            <div className="comparison-human-actions">
              <a className="button button-dark" href="/get-app">Get the app <Icon name="arrow" size={16} /></a>
              <a className="btn btn-ghost" href="/waitlist">Join the waitlist <Icon name="arrow" size={16} /></a>
            </div>
          </div>
        </section>
      </main>
      <Footer productPage />
    </>
  );
}

const invoiceFacts = [
  ['Supplier', 'Sample Supplies Pvt Ltd'],
  ['Invoice no.', 'INV-0417'],
  ['Date', '14 Oct 2026'],
  ['Taxable value', '₹42,000.00'],
  ['Tax @ 18%', '₹7,560.00'],
  ['Total', '₹49,560.00']
];

const sceneCaptions = [
  'A client sends an invoice in chat.',
  'The invoice is read, with its original kept.',
  'The document details are organised for review.',
  'You compare the source with the extracted data.',
  'You correct anything that needs attention.',
  'The reviewed sample is approved by a person.'
];

function InvoiceScene() {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') setStep((current) => (current + 1) % sceneCaptions.length);
    }, 2300);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion]);

  const sceneStatus = step === 0
    ? 'Received'
    : step === 1
      ? 'Reading'
      : step === 2
        ? 'Extracted'
        : step < 5
          ? 'Needs your review'
          : 'Approved by reviewer';

  return (
    <figure className="ledger-scene" data-step={step} aria-label="Illustrative invoice review using fictional sample data">
      <div className="scene-bar">
        <span className="scene-lights" aria-hidden="true"><i /><i /><i /></span>
        <span className="scene-title">Invoices <span>/</span> Review</span>
        <span className="sample-tag">SAMPLE DATA</span>
      </div>
      <div className="scene-body">
        <section className="scene-pane" aria-label="Fictional original invoice">
          <div className="pane-heading"><span>01 / Original</span><span>INV-0417.jpg</span></div>
          <div className="paper-invoice">
            <div className="invoice-scan" />
            <div className="invoice-top"><strong>Sample Supplies Pvt Ltd</strong><span>TAX INVOICE</span></div>
            <div className="invoice-line"><span>Invoice no.</span><span>INV-0417</span></div>
            <div className="invoice-line"><span>Date</span><span>14 Oct 2026</span></div>
            <div className="invoice-line"><span>Taxable value</span><span>₹42,000.00</span></div>
            <div className="invoice-line"><span>Tax @ 18%</span><span>₹7,560.00</span></div>
            <div className="invoice-line invoice-total"><span>Total</span><span>₹49,560.00</span></div>
            {step === 5 && <span className="invoice-stamp">REVIEWED</span>}
          </div>
        </section>
        <section className="scene-pane extracted-pane" aria-label="Illustrative extracted invoice data">
          <div className="pane-heading"><span>02 / Extracted</span><span>For review</span></div>
          <dl className="invoice-fields">
            {invoiceFacts.map(([label, value], index) => (
              <div
                className={`invoice-field${step === 4 && label === 'Date' ? ' field-corrected' : ''}`}
                key={label}
                style={{ '--field-index': index } as React.CSSProperties}
              >
                <dt>{label}</dt><dd>{value}</dd>
              </div>
            ))}
          </dl>
          <div className="scene-state">
            <span className={`scene-chip ${step >= 3 && step < 5 ? 'chip-review' : step === 5 ? 'chip-approved' : 'chip-progress'}`}>
              <i />{sceneStatus}
            </span>
            <span className="scene-approve" aria-hidden="true"><Icon name={step === 5 ? 'check' : 'eye'} size={14} />{step === 5 ? 'Approved' : 'Review'}</span>
          </div>
          <p className="scene-save">{step === 5 ? 'Illustrative approval — no real client data.' : 'Not final until a person reviews it.'}</p>
        </section>
      </div>
      <figcaption className="scene-caption">
        <p key={step}>{sceneCaptions[step]}</p>
        <div className="scene-controls">
          <span className="scene-progress" aria-label={`Step ${step + 1} of ${sceneCaptions.length}`}>
            {sceneCaptions.map((caption, index) => <i className={index <= step ? 'progress-on' : ''} key={caption} />)}
          </span>
          <button
            type="button"
            onClick={() => setPaused((current) => !current)}
            aria-label={paused ? 'Play invoice animation' : 'Pause invoice animation'}
            title={paused ? 'Play animation' : 'Pause animation'}
          >{paused ? '▶' : 'Ⅱ'}</button>
        </div>
      </figcaption>
    </figure>
  );
}

const workflowTabs = [
  { title: 'A client sends documents', description: 'A reminder goes out. The client replies with a photo or a file in a chat they already know.', icon: 'telegram' as const, caption: 'The document arrives in the practice workflow.' },
  { title: 'The invoice is read', description: 'With extraction enabled, AI can pull names, dates, and amounts out of supported invoices.', icon: 'spark' as const, caption: 'AI assists with reading. It does not decide tax treatment.' },
  { title: 'You review and correct', description: 'The source and extracted details are shown together. Check a field, correct it, and approve the work.', icon: 'eye' as const, caption: 'The reviewer decides whether the details are right.' },
  { title: 'The file is organised', description: 'The original and reviewed result stay connected in the client’s year-and-month workflow.', icon: 'folder' as const, caption: 'Keep the original; organise the reviewed output.' }
];

function WorkflowTabs() {
  const [active, setActive] = useState(0);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (manual || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % workflowTabs.length), 6500);
    return () => window.clearInterval(timer);
  }, [manual]);

  function selectStep(index: number) {
    setManual(true);
    setActive(index);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    setManual(true);
    const index = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? workflowTabs.length - 1
        : (active + (event.key === 'ArrowRight' ? 1 : workflowTabs.length - 1)) % workflowTabs.length;
    setActive(index);
    document.getElementById(`workflow-tab-${index}`)?.focus();
  }

  return (
    <div className="workflow-demo">
      <div className="workflow-tabs" role="tablist" aria-label="How TaxFlow AI works" onKeyDown={handleKeyDown}>
        {workflowTabs.map((tab, index) => (
          <button
            aria-controls="workflow-tab-panel"
            aria-selected={active === index}
            className={`workflow-tab${active === index ? ' tab-active' : ''}`}
            id={`workflow-tab-${index}`}
            key={tab.title}
            onClick={() => selectStep(index)}
            role="tab"
            tabIndex={active === index ? 0 : -1}
            type="button"
          >
            <span className="workflow-tab-number">0{index + 1}</span>
            <span className="workflow-tab-content"><strong>{tab.title}</strong><span>{tab.description}</span></span>
            <span className="workflow-tab-indicator" />
          </button>
        ))}
      </div>
      <div
        aria-labelledby={`workflow-tab-${active}`}
        className="workflow-preview"
        id="workflow-tab-panel"
        key={active}
        role="tabpanel"
        tabIndex={0}
      >
        <div className="workflow-preview-top"><span>EXAMPLE <i /> SAMPLE CLIENT</span><span>ILLUSTRATIVE</span></div>
        <div className="workflow-preview-body">
          {active === 0 && (
            <div className="chat-demo">
              <div className="chat-message"><span className="chat-sender">TAXFLOW REMINDER</span>Hi! When you’re ready, please share this month’s purchase invoices. A photo is fine.</div>
              <div className="chat-message chat-message-client"><span className="chat-sender">SAMPLE TRADERS</span><span className="chat-file"><Icon name="file" size={15} />INV-0417.jpg</span></div>
              <div className="chat-system"><Icon name="folder" size={14} /> Document linked to Sample Traders</div>
            </div>
          )}
          {active === 1 && (
            <div className="mini-extraction">
              <div className="mini-document-icon"><Icon name="spark" size={20} /></div>
              <div className="mini-fields">
                {invoiceFacts.slice(1, 5).map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
              </div>
            </div>
          )}
          {active === 2 && (
            <div className="mini-review">
              <div className="mini-review-source"><span className="mini-label">ORIGINAL</span><strong>Sample Supplies</strong><span>Invoice date</span><b>14 Oct 2026</b><span>Total</span><b>₹49,560.00</b></div>
              <div className="mini-review-arrow"><Icon name="arrow" size={18} /></div>
              <div className="mini-review-result"><span className="mini-label">EXTRACTED</span><strong><Icon name="check" size={14} /> Source linked</strong><span>Invoice date</span><b>14 Oct 2026</b><span>Total</span><b>₹49,560.00</b></div>
            </div>
          )}
          {active === 3 && (
            <div className="folder-tree">
              <div><Icon name="users" size={15} /><strong>Sample Traders</strong></div>
              <div className="tree-level"><Icon name="calendar" size={15} /><strong>2026</strong></div>
              <div className="tree-level tree-level-two"><Icon name="calendar" size={15} /><strong>October</strong></div>
              <div className="tree-level tree-level-three"><Icon name="folder" size={15} /><strong>Raw</strong><span>INV-0417.jpg · original</span></div>
              <div className="tree-level tree-level-three tree-reviewed"><Icon name="folder" size={15} /><strong>Reviewed</strong><span>Human-approved details</span></div>
            </div>
          )}
        </div>
        <div className="workflow-preview-caption"><span><Icon name="info" size={15} />{workflowTabs[active].caption}</span><span className="workflow-progress">{active + 1} / {workflowTabs.length}</span></div>
      </div>
    </div>
  );
}

const demoFeatures = [
  { icon: 'message' as const, title: 'Client chat connection', status: 'In testing', description: 'Telegram supports ordinary chat; file sharing is directed to the secure client portal. WhatsApp availability depends on setup and rollout.' },
  { icon: 'calendar' as const, title: 'Scheduled document reminders', status: 'In testing', description: 'Set a schedule for document requests so teams can reduce repetitive follow-ups.' },
  { icon: 'folder' as const, title: 'Client document organisation', status: 'In testing', description: 'Organise incoming client files around a client, year, and month, keeping the source document.' },
  { icon: 'spark' as const, title: 'Invoice extraction', status: 'In testing', description: 'When enabled, AI can read supported invoices and structure dates, parties, and amounts.' },
  { icon: 'eye' as const, title: 'Side-by-side human review', status: 'In testing', description: 'Review extracted details against the original document, correct them, and approve the result.' },
  { icon: 'file' as const, title: 'Reviewed document output', status: 'In testing', description: 'Keep reviewed output associated with the original client document and its folder.' }
];

const plannedFeatures = [
  ['Deadline tracking', 'A per-client view of what is due, received, and still missing.'],
  ['Tax-form generation', 'Filing outputs from approved data, validated against the correct official format.'],
  ['Guided and authorised filing', 'Filing pathways only where a government-authorised channel exists, with explicit human approval.'],
  ['WhatsApp integration', 'An additional messaging channel when supported integration and consent flows are ready.'],
  ['Books and accounting', 'Longer-term accounting, inventory, banking, payroll, and platform capabilities.']
];

const featureCards = [
  { number: '01', icon: 'message' as const, title: 'Make document chasing lighter.', description: 'Keep client documents and requests moving through one clear workflow.', tag: 'CLIENT INTAKE' },
  { number: '02', icon: 'spark' as const, title: 'Turn paperwork into reviewable data.', description: 'AI-assisted reading can structure details for an accountant to inspect.', tag: 'AI + RULES' },
  { number: '03', icon: 'eye' as const, title: 'Keep a human in the loop.', description: 'See original documents alongside extracted values before approval.', tag: 'HUMAN APPROVAL' },
  { number: '04', icon: 'file' as const, title: 'Prepare work with its context intact.', description: 'Connect documents, clients, and review workflows.', tag: 'PRACTICE WORKSPACE' }
];

const workflow = [
  { step: '01', title: 'A request comes in', body: 'Start with a task, a document, or a deadline.' },
  { step: '02', title: 'A plan comes first', body: 'The intended steps and review points are visible.' },
  { step: '03', title: 'Work happens in view', body: 'Documents are read and checked against supported rules.' },
  { step: '04', title: 'You review and approve', body: 'A person checks important work before it becomes final.' },
  { step: '05', title: 'You choose what happens next', body: 'Use only supported and authorised filing pathways.' }
];

const scopeItems = [
  ['Client and document workspace', 'Clients, files, and practice-wide visibility'],
  ['AI-assisted extraction', 'Invoices, statements, tax forms, and notices'],
  ['Review and approvals', 'Source-linked checks, flags, and human sign-off'],
  ['Deadlines and communication', 'Compliance tracking and consent-aware reminders'],
  ['Filing file preparation', 'India-first formats, with phased country support'],
  ['Accounting and books', 'A longer-term roadmap—not a claim about today']
];

function MarketingHome() {
  useReveal();

  return (
    <>
      <Header />
      <main id="top">
        <section className="ledger-hero" aria-labelledby="home-title">
          <div className="ledger-wrap hero-layout">
            <div className="hero-copy hero-copy-ledger">
              <p className="eyebrow"><span className="status-dot-live" /> EARLY ACCESS <i /> WAITLIST OPEN</p>
              <h1 id="home-title">Less busywork.<br /><span className="hero-highlight">More time to advise.</span></h1>
              <p className="hero-lede">TaxFlow AI is designed to automate repetitive document work—from client file collection and AI-assisted data capture to review preparation—so accountants can spend less time on manual steps and keep the final say.</p>
              <div className="hero-actions-ledger">
                <a className="btn btn-primary btn-lg" href="/waitlist">Join the waitlist <span className="arrow">→</span></a>
                <a className="btn btn-ghost btn-lg" href="#how-it-works">See how it works</a>
              </div>
              <p className="hero-fine">Free to join. No payment details. We only email you about TaxFlow AI.</p>
              <ul className="hero-facts">
                <li>Built for accounting practices</li><li>You approve important work</li><li>India-first product direction</li>
              </ul>
            </div>
            <div className="hero-scene-column"><InvoiceScene /></div>
          </div>
          <div className="ledger-wrap hero-footnote"><Icon name="info" size={14} /><span>The animated invoice uses fictional sample data to illustrate a review workflow. It is not a live product screen.</span></div>
        </section>

        <section className="ledger-section" aria-labelledby="repeated-work-title">
          <div className="ledger-wrap">
            <div className="section-intro" data-reveal><span className="eyebrow">THE WORK AROUND THE WORK</span><h2 id="repeated-work-title">Three chores that repeat<br />for every client, every month.</h2><p className="lede">None of them is accounting. All of them take time before the accounting can start.</p></div>
            <div className="pain-grid">
              <article className="pain-card" data-reveal><span className="pain-number">01 / CHASING</span><h3>Asking for the same documents again.</h3><p className="pain-quote">“It’s the 20th, and the purchase bills still haven’t arrived.”</p><div className="pain-answer"><span>WITH TAXFLOW</span>Scheduled document requests and incoming client files can live in one workflow.</div></article>
              <article className="pain-card" data-reveal style={{ '--delay': '80ms' } as React.CSSProperties}><span className="pain-number">02 / RETYPING</span><h3>Copying numbers off every invoice.</h3><p className="pain-quote">“Read each photo, then type names, dates, and totals into a sheet.”</p><div className="pain-answer"><span>WITH TAXFLOW</span>AI-assisted extraction can prepare fields for the accountant to check.</div></article>
              <article className="pain-card" data-reveal style={{ '--delay': '160ms' } as React.CSSProperties}><span className="pain-number">03 / LOSING TRACK</span><h3>Documents scattered across places.</h3><p className="pain-quote">“One bill in a chat, one in an email, another in someone’s downloads.”</p><div className="pain-answer"><span>WITH TAXFLOW</span>Organise documents by client and period, while keeping the source close.</div></article>
            </div>
          </div>
        </section>

        <section className="ledger-section ledger-section-tint" id="how-it-works">
          <div className="ledger-wrap">
            <div className="section-intro" data-reveal><span className="eyebrow">HOW IT WORKS</span><h2>From a client’s chat message<br />to an accountant-reviewed file.</h2><p className="lede">Four visible steps. A person stays responsible for review and approval.</p></div>
            <WorkflowTabs />
            <p className="workflow-disclaimer"><Icon name="shield" size={16} /> The workflow illustration uses fictional sample information; actual integrations and availability depend on configuration.</p>
          </div>
        </section>

        <section className="ledger-section">
          <div className="ledger-wrap">
            <div className="section-intro" data-reveal><span className="eyebrow">THE PRINCIPLE BEHIND IT</span><h2>AI reads. Rules calculate.<br />You approve.</h2><p className="lede">Keep each job with the right party, so a professional can see where the work came from.</p></div>
            <div className="principle-grid">
              <article data-reveal><span className="principle-label">01 / READING</span><h3>AI <em>reads.</em></h3><p>When enabled, AI can help extract information from a document. Extraction is not the same as deciding how a tax rule applies.</p></article>
              <article data-reveal style={{ '--delay': '80ms' } as React.CSSProperties}><span className="principle-label">02 / CALCULATION</span><h3>Rules <em>calculate.</em></h3><p>For future filing calculations, the product direction is fixed, reviewable rules rather than AI-generated guesses.</p></article>
              <article data-reveal style={{ '--delay': '160ms' } as React.CSSProperties}><span className="principle-label">03 / APPROVAL</span><h3>You <em>approve.</em></h3><p>A qualified person reviews the original alongside extracted details. Consequential filing actions must not happen without explicit approval.</p></article>
            </div>
          </div>
        </section>

        <section className="ledger-section ledger-section-tint" id="example">
          <div className="ledger-wrap">
            <div className="section-intro" data-reveal><span className="eyebrow">A WORKED EXAMPLE</span><h2>A month with one client,<br />from first request to review.</h2><p className="lede">Follow Sample Traders, an illustrative client. Every name and figure below is fictional.</p></div>
            <div className="worked-example">
              {[
                ['01', 'Connect a client', 'Link a client to the firm’s configured messaging flow once.'],
                ['02', 'Request documents', 'Set when the next request should go out; clients share a photo or file.'],
                ['03', 'Organise the original', 'Received documents are sorted into a client-and-period workflow.'],
                ['04', 'Read, if extraction is enabled', 'AI-assisted extraction turns an invoice into fields that are easier to check.'],
                ['05', 'Review and approve', 'Compare original and extracted values, correct discrepancies, and approve the work.']
              ].map(([number, title, body], index) => (
                <article className="worked-row" data-reveal key={number} style={{ '--delay': `${index * 60}ms` } as React.CSSProperties}>
                  <span className="worked-number">{number}</span><div><h3>{title}</h3><p>{body}</p></div><span className="worked-icon"><Icon name={['users', 'message', 'folder', 'spark', 'eye'][index] as IconName} size={18} /></span>
                </article>
              ))}
            </div>
            <div className="example-tree-card" data-reveal>
              <span className="example-tree-label">AN ILLUSTRATIVE CLIENT FOLDER</span>
              <div className="example-folder-tree"><p><Icon name="users" size={16} /> Sample Traders</p><p><Icon name="calendar" size={16} /> <span>2026 / October</span></p><p className="tree-indent"><Icon name="folder" size={16} /> <span>Raw <i>INV-0417.jpg · original</i></span></p><p className="tree-indent"><Icon name="folder" size={16} /> <span>Reviewed <i>Details checked by a person</i></span></p></div>
            </div>
            <div className="example-table-wrap" data-reveal>
              <table className="example-table"><thead><tr><th>Task</th><th>Owner</th><th>Product direction</th></tr></thead><tbody>
                <tr><td>Collect and organise incoming documents</td><td>Configured workflow</td><td><span className="status-pill status-current">In internal testing</span></td></tr>
                <tr><td>Extract invoice details when enabled</td><td>AI-assisted reading</td><td><span className="status-pill status-current">In internal testing</span></td></tr>
                <tr><td>Check and approve extracted details</td><td>Accountant / reviewer</td><td><span className="status-pill status-principle">Human approval</span></td></tr>
                <tr><td>Generate validated tax forms</td><td>Rules and filing engines</td><td><span className="status-pill status-planned">Planned</span></td></tr>
              </tbody></table>
            </div>
          </div>
        </section>

        <section className="ledger-section" id="features">
          <div className="ledger-wrap">
            <div className="section-intro" data-reveal><span className="eyebrow">FEATURES</span><h2>What’s in testing.<br />What’s still on the roadmap.</h2><p className="lede">Taxflow is a working demo, not a fully released product. We label current testing and planned capabilities separately.</p></div>
            <div className="feature-group-heading"><h3>Working in internal testing</h3><span className="status-pill status-current">Current testing</span></div>
            <div className="tested-feature-grid">
              {demoFeatures.map((feature, index) => (
                <article className="tested-feature" data-reveal key={feature.title} style={{ '--delay': `${index * 50}ms` } as React.CSSProperties}>
                  <span className="tested-feature-icon"><Icon name={feature.icon} size={18} /></span>
                  <span className="status-pill status-current">{feature.status}</span>
                  <h3>{feature.title}</h3><p>{feature.description}</p>
                </article>
              ))}
            </div>
            <div className="feature-group-heading feature-group-planned"><h3>Planned capabilities</h3><span className="status-pill status-planned">Not built yet</span></div>
            <div className="planned-feature-list">
              {plannedFeatures.map(([title, description], index) => <article className="planned-feature" data-reveal key={title} style={{ '--delay': `${index * 45}ms` } as React.CSSProperties}><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{description}</p><span className="status-pill status-planned">Planned</span></article>)}
            </div>
            <p className="status-caveat"><Icon name="info" size={16} /> “In internal testing” is not the same as public availability or a production-readiness claim. Confirm exact integrations, security controls, and supported tax outputs before relying on them.</p>
          </div>
        </section>

        <section className="trust-band ledger-trust" id="security">
          <div className="ledger-wrap">
            <div className="section-intro" data-reveal><span className="eyebrow">SECURITY &amp; TRUST</span><h2>Why you can check the work,<br />not just trust a black box.</h2><p className="lede">These are intended product guardrails—not claims of an independent security audit or certification.</p></div>
            <div className="trust-grid">
              <article data-reveal><Icon name="eye" size={21} /><h3>The source stays visible</h3><p>Review extracted details alongside the original document and check what a value came from.</p></article>
              <article data-reveal style={{ '--delay': '60ms' } as React.CSSProperties}><Icon name="shield" size={21} /><h3>A person approves</h3><p>AI preparation does not replace a human approval step for consequential work.</p></article>
              <article data-reveal style={{ '--delay': '120ms' } as React.CSSProperties}><Icon name="calculator" size={21} /><h3>Reading is not calculation</h3><p>Tax calculations and filing rules require dedicated validation—not AI guesses.</p></article>
              <article data-reveal style={{ '--delay': '180ms' } as React.CSSProperties}><Icon name="lock" size={21} /><h3>Be clear about the limits</h3><p>TaxFlow AI is in development; independent certification and live government filing are not claimed.</p></article>
            </div>
            <div className="honest-panel" data-reveal><h3>What is not live today</h3><p>Government filing is not live. The broader roadmap, production security hardening, and public availability are phased product goals—not features to assume are available.</p></div>
          </div>
        </section>

        <section className="ledger-section ledger-section-tint" id="status">
          <div className="ledger-wrap">
            <div className="section-intro" data-reveal><span className="eyebrow">PRODUCT STATUS · 19 OCTOBER 2026</span><h2>Where TaxFlow AI is today.</h2><p className="lede">A working demo in internal testing, moving toward security and quality checks before a private beta.</p></div>
            <div className="status-columns">
              <article className="status-column status-column-live" data-reveal><span className="status-pill status-current">IN INTERNAL TESTING</span><h3>Available in the current demo</h3><ul><li>Telegram client connection for ordinary chat</li><li>Secure client portal for file uploads</li><li>Scheduled client document reminders</li><li>Client-folder document organisation</li><li>Optional AI invoice extraction</li><li>Side-by-side review and approval flow</li></ul></article>
              <article className="status-column" data-reveal style={{ '--delay': '100ms' } as React.CSSProperties}><span className="status-pill status-principle">NEXT STEPS</span><h3>Before wider access</h3><ul><li>Security and quality checks</li><li>Private beta with accounting professionals</li><li>Fixes informed by real reviewer feedback</li><li>More complete tests and production hardening</li></ul></article>
              <article className="status-column" data-reveal style={{ '--delay': '200ms' } as React.CSSProperties}><span className="status-pill status-planned">PLANNED</span><h3>Later product direction</h3><ul><li>Deadline tracking and richer filing workflows</li><li>Form generation and validated exports</li><li>WhatsApp and additional integrations</li><li>More countries and books capabilities</li></ul></article>
            </div>
            <p className="status-caveat"><Icon name="info" size={16} /> Product status can change. The roadmap is directional and does not promise availability dates.</p>
          </div>
        </section>

        <section className="ledger-section" id="faq">
          <div className="ledger-wrap">
            <div className="section-intro" data-reveal><span className="eyebrow">STRAIGHT ANSWERS</span><h2>Frequently asked questions.</h2></div>
            <div className="faq-list">
              <details><summary>Is TaxFlow AI available now?</summary><p>Not for public use. The desktop product is a working demo in internal testing; we plan to complete security and quality work before any wider beta.</p></details>
              <details><summary>Does it file returns directly with a government portal?</summary><p>No. Government filing is not live. Filing support is a future, jurisdiction-by-jurisdiction plan and depends on authorised channels and explicit human approval.</p></details>
              <details><summary>Does AI make tax decisions or calculate the return?</summary><p>The product direction separates AI-assisted document reading from tax calculations. Calculations require validated rules and review; no autonomous filing is supported.</p></details>
              <details><summary>Can I turn AI document reading off?</summary><p>AI extraction is designed to be optional in the current workflow. Check the deployed product’s settings and <a href="/privacy">privacy notice</a> before submitting real client documents.</p></details>
              <details><summary>Which chat integrations work today?</summary><p>Telegram supports ordinary chat in internal testing. Document files should be uploaded through the invited client portal and are not downloaded or sent by the Telegram integration. WhatsApp is not represented as generally available and requires a configured integration.</p></details>
              <details><summary>Which countries are supported?</summary><p>India is the initial product direction. Additional jurisdictions are on the roadmap and are not a claim of current filing coverage.</p></details>
              <details><summary>What does joining the waitlist do?</summary><p>It records the details you choose to provide and your consent so TaxFlow can contact you about early access. Joining is free and does not guarantee beta access.</p></details>
              <details><summary>Is TaxFlow AI independently security certified?</summary><p>No independent security certification is claimed here. Do not upload client documents to marketing or waitlist pages; use the separate client portal only when invited, and verify its data-handling arrangements with your practice.</p></details>
            </div>
            <div className="mobile-sticky-cta"><a className="btn btn-primary" href="/waitlist">Join the waitlist <span className="arrow">→</span></a></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export function LandingPage() {
  useReveal();

  return (
    <>
      <Header />
      <main>
        <section className="hero section-wrap">
          <div className="hero-copy">
            <div className="availability"><span className="availability-pulse" /> A more thoughtful way to run tax work</div>
            <h1>Less time in the paperwork.<br /><em>More time for people.</em></h1>
            <p className="hero-description">Taxflow helps accounting practices collect documents, review AI-assisted work, and prepare filing outputs—while keeping a person in control at every important step.</p>
            <div className="hero-actions">
              <a className="button button-dark" href="/waitlist">Request early access <Icon name="arrow" size={17} /></a>
              <a className="text-link" href="/product">Explore the product <span><Icon name="arrow" size={16} /></span></a>
            </div>
            <div className="hero-proof">
              <span><Icon name="shield" size={16} /> People approve important work</span>
              <span><Icon name="eye" size={16} /> Sources stay in view</span>
            </div>
          </div>
          <div className="hero-visual" data-reveal>
            <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
            <DashboardPreview />
            <span className="visual-caption">A clearer view of the work in progress.</span>
          </div>
        </section>

        <section className="principles-strip" id="principles">
          <div className="section-wrap principles-inner">
            <span className="strip-label">BUILT AROUND A SIMPLE PRINCIPLE</span>
            <p>AI can prepare the work.<br /><strong>A person decides when it’s ready.</strong></p>
            <a href="/product#guardrails">See how approval works <Icon name="arrow" size={15} /></a>
          </div>
        </section>

        <section className="section section-wrap" id="features">
          <div className="section-heading" data-reveal>
            <span className="eyebrow">A PRACTICE, LESS FRAGMENTED</span>
            <h2>The busywork is connected.<br /><em>So is the work around it.</em></h2>
            <p>Bring the everyday steps of a tax practice into one considered flow—from the first client request to a reviewer-approved draft.</p>
          </div>
          <div className="feature-grid">
            {featureCards.map((feature, index) => (
              <article className="feature-card" data-reveal key={feature.number} style={{ '--delay': `${index * 90}ms` } as React.CSSProperties}>
                <div className="feature-card-top"><span className="feature-icon"><Icon name={feature.icon} size={21} /></span><span className="feature-number">{feature.number}</span></div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className="feature-tag">{feature.tag}</span>
              </article>
            ))}
          </div>
          <a className="inline-link" href="/product">Explore every product area <Icon name="arrow" size={16} /></a>
        </section>

        <section className="section workflow-section" id="workflow">
          <div className="section-wrap workflow-layout">
            <div className="workflow-intro" data-reveal>
              <span className="eyebrow">A VISIBLE, REVIEWABLE FLOW</span>
              <h2>From “please handle this”<br /><em>to ready for review.</em></h2>
              <p>No mystery hand-offs. Taxflow is designed to show the plan, make progress visible, and pause where your judgement matters.</p>
              <a className="inline-link" href="/product#agent-run">See the full workflow <Icon name="arrow" size={16} /></a>
            </div>
            <ol className="workflow-list">
              {workflow.map((item, index) => (
                <li className="workflow-step" data-reveal key={item.step} style={{ '--delay': `${index * 75}ms` } as React.CSSProperties}>
                  <span className="step-number">{item.step}</span>
                  <span className="step-connector" />
                  <div><h3>{item.title}</h3><p>{item.body}</p></div>
                  {index === 3 && <span className="human-gate"><Icon name="shield" size={13} /> HUMAN CHECKPOINT</span>}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section section-wrap comparison-section" data-reveal>
          <div className="comparison-head">
            <div><span className="eyebrow">A DIFFERENT SHAPE OF WORK</span><h2>Less re-keying.<br /><em>More considered review.</em></h2></div>
            <p>It’s not about replacing professional judgement. It’s about giving that judgement a better view of the work.</p>
          </div>
          <div className="comparison-board">
            <div className="comparison-column manual-column">
              <div className="comparison-title"><span className="comparison-icon"><Icon name="clock" size={18} /></span><div><span className="eyebrow">A MANUAL WORKFLOW</span><h3>Work scattered across steps</h3></div></div>
              <div className="comparison-flow">
                <span>Chase for documents</span><i /><span>Open files one by one</span><i /><span>Type details into sheets</span><i /><span>Recheck numbers</span><i /><span>Prepare a filing draft</span>
              </div>
              <div className="comparison-caption">Repeated context switching. Source and result can drift apart.</div>
            </div>
            <div className="comparison-divider"><span>OR</span></div>
            <div className="comparison-column taxflow-column">
              <div className="comparison-title"><span className="comparison-icon"><Icon name="spark" size={18} /></span><div><span className="eyebrow">A TAXFLOW-ASSISTED WORKFLOW</span><h3>Connected steps. Human sign-off.</h3></div></div>
              <div className="assisted-flow">
                <div className="assisted-node"><span className="node-icon"><Icon name="message" size={15} /></span><span>Collect and organise</span><Icon name="check" size={15} /></div>
                <div className="assisted-node"><span className="node-icon"><Icon name="spark" size={15} /></span><span>Read and validate</span><Icon name="check" size={15} /></div>
                <div className="assisted-node approval-node"><span className="node-icon"><Icon name="eye" size={15} /></span><span>Review side by side</span><span className="approval-pill">YOU APPROVE</span></div>
                <div className="assisted-node"><span className="node-icon"><Icon name="file" size={15} /></span><span>Prepare a draft</span><Icon name="arrow" size={15} /></div>
              </div>
              <div className="comparison-caption">A connected process, with the professional still in charge.</div>
            </div>
          </div>
          <p className="comparison-footnote"><Icon name="info" size={14} /> Workflow illustration, not a time-saving benchmark. We’ll measure time and accuracy with design partners before making performance claims.</p>
        </section>

        <section className="section section-wrap scope-section" data-reveal>
          <div className="scope-copy"><span className="eyebrow">DESIGNED TO GROW IN PHASES</span><h2>A useful first step.<br /><em>A clear direction.</em></h2><p>The product brief maps an India-first practice workflow, then expands in stages. Planned capabilities are labelled as plans—not presented as shipping features.</p><a className="inline-link" href="/product#roadmap">Explore the product roadmap <Icon name="arrow" size={16} /></a></div>
          <div className="scope-card">
            {scopeItems.map(([title, detail], index) => (
              <div className="scope-row" key={title}><span className={`scope-index${index === 5 ? ' scope-index-future' : ''}`}>{String(index + 1).padStart(2, '0')}</span><div><strong>{title}</strong><span>{detail}</span></div><span className={index === 5 ? 'scope-planned' : 'scope-in-design'}>{index === 5 ? 'PLANNED' : 'IN SCOPE'}</span></div>
            ))}
          </div>
        </section>

        <section className="trust-band" data-reveal>
          <div className="section-wrap trust-content">
            <span className="eyebrow">TRUST IS A PRODUCT DECISION</span>
            <h2>Useful automation.<br /><em>With its limits in view.</em></h2>
            <div className="trust-grid">
              <div><Icon name="shield" size={20} /><strong>No silent sign-off</strong><p>Important work pauses for a person to review and approve.</p></div>
              <div><Icon name="eye" size={20} /><strong>Originals beside results</strong><p>Review extracted values with their source document in view.</p></div>
              <div><Icon name="lock" size={20} /><strong>No password shortcuts</strong><p>Government portal credentials and one-time codes remain with you.</p></div>
            </div>
            <p className="trust-note">These are product principles from the brief. Independent security certifications and production-readiness are not being claimed.</p>
          </div>
        </section>

        <section className="section section-wrap waitlist-section" data-reveal>
          <div className="waitlist-copy">
            <span className="eyebrow">EARLY ACCESS</span>
            <h2>Let’s make tax work<br /><em>feel more human.</em></h2>
            <p>Join the waitlist to follow the product as it takes shape. We’ll share thoughtful updates—not a noisy inbox.</p>
            <a className="button button-dark" href="/waitlist">Join the waitlist <Icon name="arrow" size={16} /></a>
          </div>
        </section>

        <section className="closing-line"><span>MAKE ROOM FOR THE WORK THAT MATTERS.</span><span className="closing-mark">t.</span></section>
      </main>
      <Footer />
    </>
  );
}

const detailCards = [
  {
    id: 'intake',
    number: '01',
    title: 'Bring client documents into the work.',
    phase: 'CORE PRACTICE WORKFLOW',
    body: 'Collect the files that arrive by client message or upload, keep them tied to a client, and surface what is still missing. Communication is designed around approved templates, recorded consent, and opt-out handling.',
    bullets: ['WhatsApp document intake and reminders', 'Manual upload and client file organisation', 'Client-level work and document visibility'],
    icon: 'message' as const
  },
  {
    id: 'extraction',
    number: '02',
    title: 'Turn documents into a first draft—not a final answer.',
    phase: 'AI-ASSISTED READING',
    body: 'AI-assisted extraction structures information from supported invoices, statements, tax forms, and notices. Separate rule-based checks can flag suspicious totals, duplicates, tax-ID formats, or other issues for review.',
    bullets: ['Structured fields with confidence and source', 'Arithmetic, format, and duplicate checks', 'Clear failure states instead of fabricated fields'],
    icon: 'spark' as const
  },
  {
    id: 'agent-run',
    number: '03',
    title: 'Know what the agent plans to do.',
    phase: 'STEP-BY-STEP AGENT RUN',
    body: 'A run follows one visible lifecycle: request, plan, execution, review, approval, and output. The plan shows the intended steps and important review points before the work proceeds.',
    bullets: ['A step-by-step plan before execution', 'Live progress and a record of actions', 'Stop controls and review checkpoints'],
    icon: 'stack' as const
  },
  {
    id: 'review',
    number: '04',
    title: 'Keep original evidence close to every decision.',
    phase: 'HUMAN REVIEW',
    body: 'Review extracted information and generated drafts with the original document nearby. Inspect flagged items individually, correct values, and approve a specific version. The work is not complete until a person signs off.',
    bullets: ['Side-by-side original and extracted work', 'Flags with a reason and confidence context', 'Recorded edits, reviewer, and approval'],
    icon: 'eye' as const
  },
  {
    id: 'filings',
    number: '05',
    title: 'Prepare filing work—with clear boundaries.',
    phase: 'PHASED FILING SUPPORT',
    body: 'The launch direction is India-first and focused on filing-ready files. Filing formats, jurisdictions, and authorised submission channels vary; Taxflow should prepare or submit only where the relevant validation and official channel exist.',
    bullets: ['India filing preparation is the initial focus', 'Official-format validation is a release requirement', 'Portal submission is never autonomous'],
    icon: 'file' as const
  },
  {
    id: 'books',
    number: '06',
    title: 'More of the practice, over time.',
    phase: 'FUTURE ROADMAP',
    body: 'Accounting, inventory, banking, e-invoicing, payroll, roles, and reporting appear in the long-term PRD. They are planned capabilities and must not be confused with the present demo or an available release.',
    bullets: ['Books and accounting: Phase 6', 'Inventory and banking: Phase 7', 'E-invoicing, payroll, and platform: Phases 8–9'],
    icon: 'document' as const
  }
];

function ProductPage() {
  useReveal();
  return (
    <>
      <Header productPage />
      <main>
        <section className="product-hero">
          <div className="section-wrap product-hero-inner">
            <a href="/" className="back-link"><Icon name="arrow" size={15} /> Back to overview</a>
            <span className="eyebrow">THE PRODUCT, IN PLAIN LANGUAGE</span>
            <h1>Good automation makes<br /><em>good work easier to see.</em></h1>
            <p>Here’s what Taxflow is designed to do, how a run works, where the human stays in control, and what is planned for later.</p>
            <div className="product-status-note"><span className="status-dot" /><span><strong>Important context</strong> — The PRD describes a product vision. The current application is a working demo; not every feature on this page is available today.</span></div>
          </div>
        </section>

        <section className="detail-section section-wrap">
          <div className="detail-intro" data-reveal><span className="eyebrow">THE PRACTICE WORKFLOW, STEP BY STEP</span><h2>From incoming document<br /><em>to work you can stand behind.</em></h2></div>
          {detailCards.map((feature) => (
            <article className="detail-card" id={feature.id} data-reveal key={feature.id}>
              <div className="detail-card-aside"><span className="detail-number">{feature.number}</span><span className="detail-icon"><Icon name={feature.icon} size={22} /></span></div>
              <div className="detail-card-main">
                <span className="feature-tag">{feature.phase}</span>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
                <ul>{feature.bullets.map((bullet) => <li key={bullet}><Icon name="check" size={15} />{bullet}</li>)}</ul>
              </div>
            </article>
          ))}
        </section>

        <section className="section guardrails-section" id="guardrails">
          <div className="section-wrap guardrails-inner">
            <div data-reveal><span className="eyebrow">BUILT FOR PROFESSIONAL OVERSIGHT</span><h2>Automation should make<br /><em>accountability clearer.</em></h2><p>The product principle is straightforward: the agent may prepare and explain work, but consequential steps remain reviewable and approval-gated.</p></div>
            <div className="guardrail-list">
              <div><span>01</span><div><strong>No autonomous filing</strong><p>Submission requires an explicit human approval and an authorised route, where one exists.</p></div></div>
              <div><span>02</span><div><strong>No credential workarounds</strong><p>Taxpayer and CA credentials and one-time passwords stay with the person who owns them.</p></div></div>
              <div><span>03</span><div><strong>No invented source data</strong><p>When a document cannot be read, the intended behaviour is to explain the failure—not guess.</p></div></div>
              <div><span>04</span><div><strong>No “complete” before approval</strong><p>A run remains open work until the responsible reviewer approves its final version.</p></div></div>
            </div>
          </div>
        </section>

        <section className="section section-wrap comparison-detail" data-reveal>
          <div className="comparison-head"><div><span className="eyebrow">WHERE THE TIME GOES</span><h2>Shift effort from entry<br /><em>toward informed review.</em></h2></div><p>Many practice workflows involve repeating the same hand-offs. Taxflow’s design aims to connect those steps—not to remove the professional from the decision.</p></div>
          <div className="effort-compare">
            <div><span className="effort-label">A DISCONNECTED PROCESS</span><div className="effort-stages"><span className="effort-long">Request</span><span className="effort-long">Find</span><span className="effort-long">Read</span><span className="effort-long">Re-key</span><span className="effort-long">Recheck</span><span className="effort-short">Review</span></div><p>Effort is spread across searching, transcribing, checking, and following up.</p></div>
            <div><span className="effort-label">A CONNECTED, REVIEWABLE FLOW</span><div className="effort-stages assisted-stages"><span>Collect</span><span>Structure</span><span>Validate</span><span className="effort-human">Human review</span></div><p>Automation can handle repetitive preparation; professional attention stays focused on flagged work and approval.</p></div>
          </div>
          <p className="comparison-footnote"><Icon name="info" size={14} />This is a qualitative workflow comparison, not a timed study. The PRD calls for measuring review time and error rates with design partners before publishing quantified benefits.</p>
        </section>

        <section className="section roadmap-section" id="roadmap">
          <div className="section-wrap">
            <div className="section-heading" data-reveal><span className="eyebrow">A PHASED PRODUCT PLAN</span><h2>Clear about what’s now.<br /><em>Honest about what’s next.</em></h2><p>These are phases from the product requirements document—not a promise that every phase has shipped.</p></div>
            <div className="roadmap-list">
              {[
                ['0', 'Production hardening', 'Reliability, security, and tests before a paid release.', 'FOUNDATION'],
                ['1', 'India practice workflow', 'Agent runs, review gates, filing files, and communication.', 'FIRST RELEASE GOAL'],
                ['2–3', 'Guided and authorised filing', 'Guided portal steps, then authorised channels where available.', 'PHASED'],
                ['4–5', 'Personal edition & second country', 'Simplified individual tax work and a professionally verified jurisdiction.', 'PLANNED'],
                ['6–9', 'Books, operations & platform', 'Accounting, inventory, banking, payroll, reporting, and integrations.', 'LONG-TERM']
              ].map(([number, title, body, badge]) => (
                <div className="roadmap-row" key={number}><span className="roadmap-number">{number}</span><div><h3>{title}</h3><p>{body}</p></div><span className="roadmap-badge">{badge}</span></div>
              ))}
            </div>
          </div>
        </section>

        <section className="product-cta section-wrap">
          <div><span className="eyebrow">FOLLOW THE PRODUCT</span><h2>Want to see where<br /><em>Taxflow goes next?</em></h2><p>Join the early-access list and follow the work as it moves from demo toward a product.</p></div>
          <a className="button button-dark" href="/waitlist">Join the waitlist <Icon name="arrow" size={16} /></a>
        </section>
      </main>
      <Footer productPage />
    </>
  );
}

function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  useReveal();
  const isPrivacy = kind === 'privacy';
  const sections: { title: string; paragraphs: string[]; bullets?: string[] }[] = isPrivacy
    ? [
      {
        title: 'Information you provide',
        paragraphs: ['The waitlist asks for your email address and consent to receive early-access updates. You may also choose to share your name, firm, role, country, and firm size. Do not submit client records or tax documents through the marketing pages or waitlist. Invited clients may submit supported documents only through the separate /portal workflow.']
      },
      {
        title: 'How we use it',
        paragraphs: ['We use waitlist details to administer early access, understand interest in TaxFlow AI, and send the updates you agreed to receive. For the client portal, the backend associates uploaded documents with the invited client and makes them available to that client’s authorized practice account and desktop sync. We do not sell waitlist or portal information or use it for advertising.']
      },
      {
        title: 'Where a submission goes',
        paragraphs: ['When configured, the form sends your information to the existing TaxFlow Supabase project or to the waitlist endpoint configured for this website. If neither is configured, the form clearly identifies preview mode and keeps its demo submission in this browser only. This site also stores your theme preference in your browser.']
      },
      {
        title: 'Service providers and storage',
        paragraphs: ['The website host and any configured waitlist provider process information needed to deliver the site and store submissions. Client-portal files are transmitted to the Taxflow backend and stored in a private Supabase Storage bucket; they are then available to the authorized practice and may be copied to its configured desktop vault. Hosting, API, authentication, and storage providers process information to operate these services under their own terms. The browser does not receive the backend service-role key or direct access to private file storage.']
      },
      {
        title: 'Your choices and deletion',
        paragraphs: ['You can choose not to join, and you can stop receiving updates by following the instructions in an email from TaxFlow AI. To ask for a waitlist record to be removed, reply to an early-access email you received from us. For portal access or document-retention requests, contact the practice that invited you; revoking portal access prevents future portal requests but does not itself delete files already received or copies saved by the practice. A fixed deletion schedule has not yet been published.']
      },
      {
        title: 'Changes and questions',
        paragraphs: ['We may update this notice as the website, waitlist, and portal change. The date above identifies the latest revision. Use the portal only when invited by your practice and only for information you are authorized to provide.']
      }
    ]
    : [
      {
        title: 'About this website',
        paragraphs: ['These terms cover your use of the TaxFlow AI marketing website, early-access waitlist, and client portal. Portal access is available only to clients invited by a practice. TaxFlow AI is in development; website descriptions, previews, and product plans are informational and may change.']
      },
      {
        title: 'The waitlist is not product access',
        paragraphs: ['Joining the waitlist is free. It does not guarantee an invitation, create a purchase or service contract, or make the product available to you. We may change, pause, or close the waitlist and may decide whether and when to invite participants.']
      },
      {
        title: 'Use the site responsibly',
        paragraphs: ['Use the website lawfully and do not attempt to disrupt it, access systems without permission, submit malicious content, or use the waitlist to provide information you are not authorised to share. Portal users may upload only supported files they are authorized to provide to the inviting practice; portal access may be revoked by that practice.']
      },
      {
        title: 'Not professional advice',
        paragraphs: ['Website content and illustrative product examples are not tax, accounting, legal, or other professional advice. A qualified professional must independently review work before relying on it. Do not upload client tax records or credentials to marketing or waitlist forms; use the separate client portal only when invited by your practice.']
      },
      {
        title: 'Product descriptions and third-party services',
        paragraphs: ['Names, records, figures, and interface screens shown on the site may be illustrative. Current testing, planned features, integrations, security arrangements, and availability are described as accurately as possible but can change. The website may rely on third-party hosting and waitlist services, which are subject to their own terms.']
      },
      {
        title: 'Updates to these terms',
        paragraphs: ['We may revise these terms when the site or waitlist changes. Continued use after an update means you are viewing the current website terms. Nothing in this notice limits rights that cannot be excluded under applicable law. These plain-language terms should be reviewed by qualified counsel before production use.']
      }
    ];

  return (
    <>
      <Header productPage />
      <main className="legal-page">
        <section className="legal-hero">
          <div className="ledger-wrap">
            <a href="/" className="back-link"><Icon name="arrow" size={15} /> Back to the website</a>
            <span className="eyebrow">{isPrivacy ? 'YOUR INFORMATION, EXPLAINED' : 'THE RULES OF THE ROAD'}</span>
            <h1>{isPrivacy ? <>A clear note on<br /><em>your privacy.</em></> : <>Straightforward<br /><em>website terms.</em></>}</h1>
            <p>{isPrivacy
              ? 'Here is what the TaxFlow AI website collects when you join the waitlist, how it is used, and the choices you have.'
              : 'A plain-language guide to using this website and joining the early-access list while TaxFlow AI is in development.'}</p>
            <span className="legal-updated">LAST UPDATED · 19 OCTOBER 2026</span>
          </div>
        </section>
        <section className="legal-sections ledger-wrap" aria-label={isPrivacy ? 'Privacy notice details' : 'Terms of use details'}>
          {sections.map((section, index) => (
            <article className="legal-section" data-reveal key={section.title}>
              <span className="legal-section-number">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
              </div>
            </article>
          ))}
          <p className="legal-disclaimer"><Icon name="info" size={15} /> Client portal files are sent to the Taxflow backend and stored in private Supabase Storage for access by the authorized practice. Hosting, API, and storage providers process information to operate the service. This summary is not a substitute for the applicable product terms or legal advice.</p>
        </section>
      </main>
      <Footer productPage />
    </>
  );
}

function App() {
  useEffect(() => {
    const path = window.location.pathname;
    const titles: Record<string, string> = {
      '/portal': 'Secure client portal — Taxflow.AI',
      '/product': 'Product details — Taxflow.AI',
      '/waitlist': 'Join the waitlist — Taxflow.AI',
      '/get-app': 'Get the TaxFlow app — Coming soon',
      '/workflow-comparison': 'Workflow comparison — Taxflow.AI',
      '/privacy': 'Privacy notice — Taxflow.AI',
      '/terms': 'Terms of use — Taxflow.AI',
    };
    document.title = titles[path] ?? (path === '/' ? 'Taxflow.AI — More time for the work that matters' : 'Page not found — Taxflow.AI');
  }, []);

  const path = window.location.pathname;
  if (path === '/portal') return <ClientPortalPage />;
  if (path === '/waitlist') return <WaitlistPage />;
  if (path === '/get-app') return <GetAppPage />;
  if (path === '/workflow-comparison') return <WorkflowComparisonPage />;
  if (path === '/privacy') return <LegalPage kind="privacy" />;
  if (path === '/terms') return <LegalPage kind="terms" />;
  if (path === '/product') return <ProductPage />;
  if (path === '/') return <MarketingHome />;
  return <NotFoundPage />;
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode><>{window.location.pathname === '/portal' ? null : <CursorDotField />}<App /></></React.StrictMode>
);
