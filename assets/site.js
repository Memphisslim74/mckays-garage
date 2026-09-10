const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

const form = document.querySelector('[data-contact-form]');
if (form) {
  const status = form.querySelector('[data-form-status]');
  const submit = form.querySelector('button[type="submit"]');

  const loadTurnstile = async () => {
    try {
      const response = await fetch('/api/turnstile-config', { headers: { Accept: 'application/json' } });
      if (!response.ok) return;
      const { siteKey } = await response.json();
      if (!siteKey) return;
      const holder = form.querySelector('[data-turnstile]');
      if (!holder) return;
      holder.innerHTML = `<div class="cf-turnstile" data-sitekey="${siteKey}"></div>`;
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } catch (_) {}
  };
  loadTurnstile();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = 'Sending your request…';
    submit.disabled = true;

    const data = Object.fromEntries(new FormData(form).entries());
    data.source_page = location.pathname;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || 'We could not send your request.');
      location.href = '/thank-you/';
    } catch (error) {
      status.textContent = `${error.message} You can also call 720-614-3940.`;
      submit.disabled = false;
    }
  });
}
