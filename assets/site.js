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

// Real McKay's Garage imagery from the existing Squarespace site. Keeping these
// during the rebuild preserves the shop's visual identity; they can be moved to
// local assets/R2 before Squarespace is retired.
const shopPhotos = [
  'https://images.squarespace-cdn.com/content/v1/6602305f9fedb720394e6251/29a5ec8e-0484-4975-b5a7-9a11e9a5e185/image2.jpeg',
  'https://images.squarespace-cdn.com/content/v1/6602305f9fedb720394e6251/3ebc8eda-1813-48ae-84be-6cbc2b742af2/image0.png',
  'https://images.squarespace-cdn.com/content/v1/6602305f9fedb720394e6251/bc224444-f6bc-434a-acdc-bbdbca334bc0/image9.png',
  'https://images.squarespace-cdn.com/content/v1/6602305f9fedb720394e6251/b2dbd59c-0910-41c1-a273-241c47c14a32/image2.jpeg',
  'https://images.squarespace-cdn.com/content/v1/6602305f9fedb720394e6251/d3179917-be62-440e-813e-2f396474d241/image3.jpeg',
  'https://images.squarespace-cdn.com/content/v1/6602305f9fedb720394e6251/0bc46324-55b7-43ec-a6aa-eb27be59d270/image8.png',
  'https://images.squarespace-cdn.com/content/v1/6602305f9fedb720394e6251/5ae890b2-ea4c-49d9-9a57-06a179295962/image10.jpeg'
];

function addShopGallery() {
  const main = document.querySelector('#main');
  if (!main || document.querySelector('.shop-gallery')) return;

  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = '/assets/gallery.css?v=20260910-6';
  document.head.appendChild(css);

  const isHome = location.pathname === '/' || location.pathname === '/index.html';
  const section = document.createElement('section');
  section.className = `shop-gallery${isHome ? ' shop-gallery-home' : ''}`;
  section.setAttribute('aria-labelledby', 'shop-gallery-title');
  section.innerHTML = `
    <div class="container">
      <div class="shop-gallery-head">
        <div>
          <div class="eyebrow">Inside McKay's Garage</div>
          <h2 id="shop-gallery-title">Real work. Real repairs.</h2>
          <p>Take a look inside the Longmont shop — diagnostics, diesel work, drivetrain, suspension and hands-on repairs on the vehicles our customers actually drive.</p>
        </div>
        <div class="shop-gallery-actions" aria-label="Gallery controls">
          <button class="gallery-arrow gallery-prev" type="button" aria-label="Previous shop photos">←</button>
          <button class="gallery-arrow gallery-next" type="button" aria-label="Next shop photos">→</button>
        </div>
      </div>
      <div class="shop-gallery-track" tabindex="0" aria-label="Photos from McKay's Garage">
        ${shopPhotos.map((src, index) => `<figure class="shop-gallery-item"><img src="${src}?format=1000w" alt="Automotive repair work inside McKay's Garage in Longmont, Colorado${index ? ` — shop photo ${index + 1}` : ''}" loading="lazy" decoding="async"></figure>`).join('')}
      </div>
      <div class="shop-gallery-cta">
        <p><strong>Have something that needs attention?</strong> Tell us what the vehicle is doing and we'll start with the right questions.</p>
        <a class="btn btn-primary" href="/contact/#appointment">Schedule an Appointment</a>
      </div>
    </div>`;

  if (isHome && main.lastElementChild) main.insertBefore(section, main.lastElementChild);
  else main.appendChild(section);

  const track = section.querySelector('.shop-gallery-track');
  section.querySelector('.gallery-prev')?.addEventListener('click', () => track.scrollBy({ left: -Math.max(280, track.clientWidth * 0.72), behavior: 'smooth' }));
  section.querySelector('.gallery-next')?.addEventListener('click', () => track.scrollBy({ left: Math.max(280, track.clientWidth * 0.72), behavior: 'smooth' }));
}

addShopGallery();
