/*
 * Cap Soleil Lawn Tennis Club: pre-launch page.
 *
 * CONFIG: cole aqui os dados do Supabase (Project Settings).
 * Use SOMENTE a Publishable key (começa com "sb_publishable_").
 * NUNCA coloque a secret key ou a service_role key neste arquivo: ele é público.
 */
const CONFIG = {
  SUPABASE_URL: 'https://anlniqjoaogsuptuvrtk.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_3TIndIKUPsNJuCLApjwvAQ_lx40AxjI',
};

(function () {
  'use strict';

  // supabase-js v2 pela CDN, com versão fixa e conferido por Subresource
  // Integrity. Só é baixado quando o visitante se aproxima do formulário.
  const SUPABASE_JS = {
    src: 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js',
    integrity: 'sha384-Rj26LVGvoeRVR6+mwQmFfcR3QOBEwT+ZmuCWpuiqeTzJpCs0ER4ITAWGb4Hiy3Ok',
  };

  const REQUEST_TIMEOUT_MS = 15000;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const MESSAGES = {
    emailMissing: 'Please enter your email address.',
    emailInvalid: 'Please enter a valid email address, like name@example.com.',
    consentMissing: 'Please tick the box so we can write to you.',
    network: 'We could not reach the list just now. Please check your connection and try again.',
    server: 'Something went wrong on our side. Please try again in a moment.',
    notReady: 'The list is not open just yet. Please try again a little later.',
    successTitle: 'Thank you.',
    successTitleNamed: 'Thank you, {name}.',
    successBody: 'You are on the list. We will write to you when the Pro Shop opens.',
  };

  /* ---------- Aparição suave ao rolar ---------- */

  function setupReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!items.length || reduceMotion || !('IntersectionObserver' in window)) return;

    document.documentElement.classList.add('has-reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    items.forEach((item) => observer.observe(item));
  }

  /* ---------- Supabase ---------- */

  function configProblem() {
    const url = String(CONFIG.SUPABASE_URL || '').trim();
    const key = String(CONFIG.SUPABASE_PUBLISHABLE_KEY || '').trim();
    if (key.startsWith('sb_secret_') || key.startsWith('eyJ')) {
      return 'CONFIG: use only the Publishable key (sb_publishable_…). Never put a secret or service_role key in public code.';
    }
    if (!/^https:\/\/[^\s[\]]+$/.test(url)) return 'CONFIG: paste the Supabase Project URL into SUPABASE_URL.';
    if (!key.startsWith('sb_publishable_')) return 'CONFIG: paste the Supabase Publishable key into SUPABASE_PUBLISHABLE_KEY.';
    return '';
  }

  function loadSupabaseLibrary() {
    if (window.supabase && window.supabase.createClient) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SUPABASE_JS.src;
      script.integrity = SUPABASE_JS.integrity;
      script.crossOrigin = 'anonymous';
      script.referrerPolicy = 'no-referrer';
      script.async = true;
      script.onload = () => {
        if (window.supabase && window.supabase.createClient) resolve();
        else reject(new Error('supabase-js loaded without createClient'));
      };
      script.onerror = () => {
        script.remove();
        reject(new TypeError('supabase-js failed to load'));
      };
      document.head.appendChild(script);
    });
  }

  let clientPromise = null;

  function getClient() {
    if (!clientPromise) {
      clientPromise = loadSupabaseLibrary()
        .then(() =>
          window.supabase.createClient(CONFIG.SUPABASE_URL.trim(), CONFIG.SUPABASE_PUBLISHABLE_KEY.trim(), {
            auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
          })
        )
        .catch((error) => {
          clientPromise = null; // permite tentar de novo no próximo envio
          throw error;
        });
    }
    return clientPromise;
  }

  function timeoutSignal(ms) {
    if (window.AbortSignal && typeof AbortSignal.timeout === 'function') return AbortSignal.timeout(ms);
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
  }

  /* ---------- Helpers ---------- */

  function readSource() {
    try {
      const value = new URLSearchParams(window.location.search).get('utm_source') || '';
      return value.trim().toLowerCase().slice(0, 120) || 'direct';
    } catch (error) {
      return 'direct';
    }
  }

  function isNetworkError(error) {
    if (!navigator.onLine) return true;
    const text = String((error && (error.name + ' ' + error.message)) || '');
    return /abort|timeout|fetch|network|load failed|failed to load/i.test(text);
  }

  function paragraph(text, className) {
    const p = document.createElement('p');
    if (className) p.className = className;
    p.textContent = text;
    return p;
  }

  /* ---------- The list (formulário) ---------- */

  function setupForm() {
    const form = document.getElementById('list-form');
    if (!form) return;

    const status = document.getElementById('list-status');
    const button = form.querySelector('button[type="submit"]');
    const buttonLabel = button.textContent;
    const fields = {
      firstName: form.elements.first_name,
      email: form.elements.email,
      country: form.elements.country,
      consent: form.elements.consent,
      trap: form.elements.website,
    };
    const source = readSource();
    let sending = false;

    function setFieldError(field, message) {
      const error = document.getElementById(field.id + '-error');
      field.setAttribute('aria-invalid', 'true');
      error.textContent = message;
      error.hidden = false;
    }

    function clearFieldError(field) {
      const error = document.getElementById(field.id + '-error');
      field.removeAttribute('aria-invalid');
      error.textContent = '';
      error.hidden = true;
    }

    function clearStatus() {
      status.className = 'list-status';
      status.replaceChildren();
    }

    function showError(message) {
      status.className = 'list-status is-error';
      status.replaceChildren(paragraph(message));
    }

    function showSuccess(firstName) {
      const title = firstName ? MESSAGES.successTitleNamed.replace('{name}', firstName) : MESSAGES.successTitle;
      form.hidden = true;
      status.className = 'list-status is-success';
      status.replaceChildren(paragraph(title, 'list-status__title'), paragraph(MESSAGES.successBody));
      status.focus();
    }

    function setSending(isSending) {
      sending = isSending;
      button.disabled = isSending;
      button.textContent = isSending ? 'Sending…' : buttonLabel;
      form.classList.toggle('is-sending', isSending);
      form.setAttribute('aria-busy', String(isSending));
    }

    function validate(values) {
      const invalid = [];
      if (!values.email) {
        setFieldError(fields.email, MESSAGES.emailMissing);
        invalid.push(fields.email);
      } else if (values.email.length > 254 || !EMAIL_PATTERN.test(values.email)) {
        setFieldError(fields.email, MESSAGES.emailInvalid);
        invalid.push(fields.email);
      } else {
        clearFieldError(fields.email);
      }

      if (!values.consent) {
        setFieldError(fields.consent, MESSAGES.consentMissing);
        invalid.push(fields.consent);
      } else {
        clearFieldError(fields.consent);
      }
      return invalid;
    }

    // Adianta o download do supabase-js quando o visitante chega perto do formulário.
    function warmUp() {
      if (!configProblem()) getClient().catch(() => {});
    }
    form.addEventListener('focusin', warmUp, { once: true });
    if ('IntersectionObserver' in window) {
      const nearby = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            nearby.disconnect();
            warmUp();
          }
        },
        { rootMargin: '600px 0px' }
      );
      nearby.observe(form);
    }

    fields.email.addEventListener('input', () => {
      if (fields.email.hasAttribute('aria-invalid')) clearFieldError(fields.email);
    });
    fields.consent.addEventListener('change', () => {
      if (fields.consent.checked) clearFieldError(fields.consent);
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (sending) return;
      clearStatus();

      const values = {
        firstName: fields.firstName.value.trim().slice(0, 80),
        email: fields.email.value.trim().toLowerCase(),
        country: fields.country.value.trim(),
        consent: fields.consent.checked,
      };

      const invalid = validate(values);
      if (invalid.length) {
        invalid[0].focus();
        return;
      }

      // Honeypot preenchido = robô: finge que deu certo e não envia nada.
      if (fields.trap.value) {
        showSuccess(values.firstName);
        return;
      }

      const problem = configProblem();
      if (problem) {
        console.warn(problem);
        showError(MESSAGES.notReady);
        return;
      }

      setSending(true);
      try {
        const client = await getClient();
        const { error } = await client
          .rpc('join_waitlist', {
            p_email: values.email,
            p_first_name: values.firstName || null,
            p_country: values.country || null,
            p_source: source,
            p_consent: values.consent,
          })
          .abortSignal(timeoutSignal(REQUEST_TIMEOUT_MS));

        // 23505 = e-mail já está na lista. Mesma resposta de um cadastro novo,
        // para a página nunca revelar quem está inscrito. (Hoje a própria função
        // no banco já ignora repetidos sem erro; isto é só uma segunda garantia.)
        if (error && error.code !== '23505') throw error;

        showSuccess(values.firstName);
      } catch (error) {
        console.error('[the list]', error);
        if (error && error.code === '23514') {
          setFieldError(fields.email, MESSAGES.emailInvalid);
          fields.email.focus();
        } else if (error && error.code === '22023') {
          setFieldError(fields.consent, MESSAGES.consentMissing);
          fields.consent.focus();
        } else {
          showError(isNetworkError(error) ? MESSAGES.network : MESSAGES.server);
        }
      } finally {
        setSending(false);
      }
    });

    // Pronto: o botão fica desabilitado no HTML até este script rodar.
    button.disabled = false;
  }

  setupReveal();
  setupForm();
})();
