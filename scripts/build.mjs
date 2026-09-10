import { rm, mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const siteUrl = 'https://www.mckaysgarage.com';
const phoneDisplay = '720-614-3940';
const phoneHref = '+17206143940';
const email = 'bmckay1@mckaysgarage.com';
const infoEmail = 'Info@mckaysgarage.com';
const addressLine = '3600 Stagecoach Rd Unit B, Longmont, CO 80504';
const areas = ['Longmont','Mead','Berthoud','Loveland','Fort Collins','Firestone','Frederick','Fort Lupton'];
const heroImage = 'https://images.squarespace-cdn.com/content/v1/6602305f9fedb720394e6251/9457f078-587a-4553-a514-bccf22bc36ed/mckays-automotive-mechanic-longmont-hero.jpg';
const aboutImage = 'https://images.squarespace-cdn.com/content/v1/6602305f9fedb720394e6251/9430d7aa-d247-4e3a-8486-eac9ffdbb14c/image0.jpeg';
const instagram = 'https://www.instagram.com/MCKAYSGARAGELLC';
const facebook = 'https://www.facebook.com/profile.php?id=61555650898373';

const services = JSON.parse(await readFile(path.join(root, 'content/services.json'), 'utf8'));
const posts = JSON.parse(await readFile(path.join(root, 'content/posts.json'), 'utf8'));
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Denver', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date());
const publishedPosts = posts.filter((p) => p.publishDate <= today).sort((a,b) => b.publishDate.localeCompare(a.publishDate));

await rm(dist, { recursive:true, force:true });
await mkdir(dist, { recursive:true });
await cp(path.join(root, 'assets'), path.join(dist, 'assets'), { recursive:true });
await cp(path.join(root, '_headers'), path.join(dist, '_headers'));
await cp(path.join(root, '_redirects'), path.join(dist, '_redirects'));

const esc = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const jsonLd = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g,'\\u003c')}</script>`;
const fmtDate = (date) => new Intl.DateTimeFormat('en-US',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}).format(new Date(`${date}T12:00:00Z`));
const absolute = (url) => url.startsWith('http') ? url : `${siteUrl}${url}`;

const businessSchema = {
  '@context':'https://schema.org',
  '@type':'AutoRepair',
  '@id':`${siteUrl}/#business`,
  name:"McKay's Garage",
  url:`${siteUrl}/`,
  logo:`${siteUrl}/assets/mckays-logo.webp`,
  image:heroImage,
  telephone:phoneHref,
  email:email,
  address:{'@type':'PostalAddress',streetAddress:'3600 Stagecoach Rd Unit B',addressLocality:'Longmont',addressRegion:'CO',postalCode:'80504',addressCountry:'US'},
  areaServed: areas.map(name => ({'@type':'City',name})),
  openingHoursSpecification:[
    {'@type':'OpeningHoursSpecification',dayOfWeek:['Monday','Tuesday','Wednesday','Thursday','Friday'],opens:'08:00',closes:'17:00'}
  ],
  sameAs:[instagram,facebook]
};

function shell({ title, description, canonical='/', body, schema=[], noindex=false, socialImage=heroImage }) {
  const canonicalUrl = absolute(canonical);
  const schemas = [businessSchema, ...schema].map(jsonLd).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex,nofollow">' : '<meta name="robots" content="index,follow,max-image-preview:large">'}
<link rel="canonical" href="${esc(canonicalUrl)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="McKay's Garage">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonicalUrl)}">
<meta property="og:image" content="${esc(socialImage)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#171717">
<link rel="icon" href="/assets/mckays-logo.webp" type="image/webp">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="stylesheet" href="/assets/styles.css">
${schemas}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
${header()}
<main id="main">${body}</main>
${footer()}
<script src="/assets/site.js" defer></script>
</body>
</html>`;
}

function header(){return `<div class="topbar"><div class="container"><span class="topbar-hours">Monday–Friday <strong>8am–5pm</strong></span><a href="tel:${phoneHref}"><strong>${phoneDisplay}</strong></a><span>3600 Stagecoach Rd Unit B · Longmont</span></div></div>
<header class="site-header"><div class="container nav-wrap"><a class="brand" href="/" aria-label="McKay's Garage home"><img src="/assets/mckays-logo.webp" alt="McKay's Garage"></a><button class="nav-toggle" aria-controls="site-nav" aria-expanded="false" aria-label="Open menu">☰</button><nav class="nav" id="site-nav" aria-label="Primary"><a href="/">Home</a><a href="/services/">Services</a><a href="/about/">About</a><a href="/mckays-news/">Garage News</a><a href="/contact/">Contact</a><a class="nav-cta" href="/contact/#appointment">Schedule an Appointment</a></nav></div></header>`}

function footer(){return `<footer class="footer"><div class="container"><div class="footer-grid"><div><img class="footer-logo" src="/assets/mckays-logo.webp" alt="McKay's Garage"><p class="muted">Straightforward automotive service for gas and diesel vehicles. Diagnostics first, honest communication, and repairs that make sense for the vehicle.</p></div><div><h3>McKay's Garage</h3><ul><li><a href="/services/">Services</a></li><li><a href="/about/">About</a></li><li><a href="/mckays-news/">Garage News</a></li><li><a href="/contact/">Schedule an Appointment</a></li><li><a href="${instagram}" rel="noopener">Instagram</a></li><li><a href="${facebook}" rel="noopener">Facebook</a></li></ul></div><div><h3>Visit the Garage</h3><p>${addressLine}</p><p>Monday–Friday<br>8am–5pm<br>Saturday–Sunday: Closed</p><p><a href="tel:${phoneHref}">${phoneDisplay}</a><br><a href="mailto:${email}">${email}</a></p></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} McKay's Garage LLC. All rights reserved.</span><span>Automotive service in Longmont, Colorado and surrounding areas.</span></div></div></footer>`}

function ctaBand(title="Not sure what the vehicle needs?", text="Tell us what you're hearing, feeling or seeing. We'll start with the symptom and work toward the cause."){
  return `<section class="cta-band"><div class="container"><div><h2>${esc(title)}</h2><p>${esc(text)}</p></div><a class="btn btn-secondary" href="/contact/#appointment">Request an Appointment</a></div></section>`;
}

function appointmentForm(){
  return `<div class="form-card" id="appointment"><div class="eyebrow">Appointment request</div><h2>Tell us about the vehicle.</h2><p class="muted">This requests a time with the shop. We'll follow up to confirm availability and any details we need before the visit.</p><form data-contact-form novalidate><div class="hp" aria-hidden="true"><label>Company website<input name="company_website" tabindex="-1" autocomplete="off"></label></div><div class="form-grid">
  <div class="field"><label for="name">Name *</label><input id="name" name="name" autocomplete="name" required></div>
  <div class="field"><label for="email">Email *</label><input id="email" name="email" type="email" autocomplete="email" required></div>
  <div class="field"><label for="phone">Phone</label><input id="phone" name="phone" type="tel" autocomplete="tel"></div>
  <div class="field"><label for="vehicle">Year / Make / Model *</label><input id="vehicle" name="vehicle" placeholder="2018 Ram 2500" required></div>
  <div class="field"><label for="service">What can we help with?</label><select id="service" name="service"><option value="General / not sure">General / Not sure</option>${services.map(s=>`<option>${esc(s.name)}</option>`).join('')}<option>Pre-purchase inspection</option><option>Other</option></select></div>
  <div class="field"><label for="preferred_day">Preferred day</label><input id="preferred_day" name="preferred_day" type="date"></div>
  <div class="field full"><label for="message">What's going on? *</label><textarea id="message" name="message" required placeholder="Describe the symptom, warning lights, noises, recent work, or the service you're looking for."></textarea></div>
  <div class="field full" data-turnstile></div>
  <div class="field full"><button class="btn btn-primary btn-full" type="submit">Send Appointment Request</button><div class="form-status" data-form-status aria-live="polite"></div><div class="form-note">Prefer to call? <a href="tel:${phoneHref}">${phoneDisplay}</a></div></div>
  </div></form></div>`;
}

const serviceCards = services.map(s=>`<article class="card"><div class="eyebrow">Service</div><h3>${esc(s.name)}</h3><p>${esc(s.short)}</p><a class="card-link" href="/services/${s.slug}/">Learn about ${esc(s.name)} →</a></article>`).join('');

const home = shell({
  title:"Auto Repair & Diesel Mechanic in Longmont, CO | McKay's Garage",
  description:"McKay's Garage provides honest gas and diesel automotive repair in Longmont, Colorado, including diagnostics, maintenance, transmissions, suspension, engine repair and diesel service.",
  canonical:'/',
  schema:[{'@context':'https://schema.org','@type':'WebSite','@id':`${siteUrl}/#website`,url:`${siteUrl}/`,name:"McKay's Garage",publisher:{'@id':`${siteUrl}/#business`}}],
  body:`<section class="hero"><div class="container"><div class="hero-copy"><div class="eyebrow">Longmont & surrounding areas automotive service</div><h1 class="display">Expertise meets passion. Honesty comes standard.</h1><p>Gas and diesel automotive service built around careful diagnosis, straight answers and work that makes sense for you and your vehicle.</p><div class="hero-actions"><a class="btn btn-primary" href="/contact/#appointment">Schedule an Appointment</a><a class="btn btn-secondary" href="tel:${phoneHref}">Call ${phoneDisplay}</a></div></div></div></section>
<section class="trust-strip"><div class="container trust-grid"><div class="trust-item"><strong>Diagnostic-first approach</strong><span>Modern scan tools plus hands-on testing.</span></div><div class="trust-item"><strong>Gas & diesel service</strong><span>Maintenance through advanced mechanical work.</span></div><div class="trust-item"><strong>Straightforward recommendations</strong><span>Focused on what the vehicle actually needs.</span></div></div></section>
<section class="section"><div class="container"><div class="section-header"><div><div class="eyebrow">Full-service repair</div><h2>From everyday maintenance to the hard problems.</h2><p class="lead">McKay's Garage works on the systems that keep your vehicle running, stopping, steering and shifting the way it should. For the complicated issues, advanced diagnostics help narrow the cause before money gets spent on the wrong repair.</p></div><a class="btn btn-dark" href="/services/">See All Services</a></div><div class="card-grid">${serviceCards}</div></div></section>
${ctaBand('A warning light should start a diagnosis, not a parts cannon.','Modern scan data is useful, but codes are clues. McKay’s Garage combines scan-tool information with real testing to find the cause before recommending the repair.')}
<section class="section section-white"><div class="container split"><div><div class="eyebrow">Why McKay's Garage</div><h2>A mechanic who would rather earn your trust than sell you something.</h2><p class="lead">The driving force behind the shop is a genuine love for problem-solving and a desire to change the way people think about dealing with mechanics.</p><p>Transparency and honesty are at the core of the approach. The focus isn't on selling repairs. It's on explaining what was found, what matters now, what can wait, and giving Longmont-area drivers reliable service they can feel good about.</p><ul class="check-list"><li>Automotive experience dating back to 2002</li><li>Experience in dealerships, family-run shops and a high-performance engine shop</li><li>Associate Degree in Diesel Technology</li><li>Continued training across vehicle systems</li></ul><div class="button-row"><a class="btn btn-primary" href="/about/">Meet McKay's Garage</a><a class="btn btn-outline" href="/contact/">Ask a Question</a></div></div><div class="photo-frame"><img src="${aboutImage}" alt="Automotive service at McKay's Garage in Longmont" loading="lazy"></div></div></section>
<section class="section"><div class="container"><div class="section-header"><div><div class="eyebrow">Local shop, wide service area</div><h2>Based in Longmont. Worth the drive from around Northern Colorado.</h2><p class="lead">Customers visit McKay's Garage from Longmont and surrounding communities for gas and diesel service, advanced troubleshooting and repair.</p></div></div><div class="service-area">${areas.map(a=>`<span class="pill">${a}</span>`).join('')}</div><div class="hero-discount"><strong>We honor those who serve.</strong> First responders, emergency medicine professionals and military customers receive an exclusive discount as a thank-you for their service.</div></div></section>
<section class="section section-dark"><div class="container"><div class="section-header"><div><div class="eyebrow">From the garage</div><h2>Useful automotive advice without the sales pitch.</h2><p class="lead">Maintenance tips, diagnostic explanations and practical information for Colorado drivers.</p></div><a class="btn btn-secondary" href="/mckays-news/">Read Garage News</a></div><div class="blog-grid">${publishedPosts.slice(0,3).map(postCard).join('')}</div></div></section>
<section class="section"><div class="container form-shell"><div class="contact-card"><div class="eyebrow">Ready when you are</div><h2>Request an appointment.</h2><p class="muted">Send the vehicle and symptom details. Bobby will review the request and follow up to confirm the appointment.</p><div class="contact-details"><div><strong>Phone</strong><a href="tel:${phoneHref}">${phoneDisplay}</a></div><div><strong>Email</strong><a href="mailto:${email}">${email}</a></div><div><strong>Location</strong>${addressLine}</div><div><strong>Hours</strong>Monday–Friday, 8am–5pm</div></div></div>${appointmentForm()}</div></section>`
});
await page('index.html', home);

const servicesPage = shell({title:"Auto Repair Services in Longmont, CO | McKay's Garage",description:"Explore McKay's Garage services in Longmont: diagnostics, diesel repair, oil changes, transmissions, suspension, steering, engine rebuilds, differentials, electrical work and lift kits.",canonical:'/services/',body:`<section class="hero-mini"><div class="container"><div class="eyebrow">Gas & diesel automotive repair</div><h1 class="display">Services built around fixing the right problem.</h1><p>Routine maintenance, hard-to-find electrical faults, diesel drivability, transmission work, suspension, engine repair and more — with clear communication from diagnosis through repair.</p><div class="button-row"><a class="btn btn-primary" href="/contact/#appointment">Schedule an Appointment</a><a class="btn btn-secondary" href="tel:${phoneHref}">Call the Garage</a></div></div></section><section class="section"><div class="container"><div class="service-list">${serviceCards}</div></div></section>${ctaBand('Have a complex issue other shops have not solved?','McKay’s Garage offers advanced diagnostic service for the problems that need more than a quick code scan.')}`});
await page('services/index.html', servicesPage);

for (const s of services) {
  const faqSchema={'@context':'https://schema.org','@type':'FAQPage',mainEntity:s.faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))};
  const serviceSchema={'@context':'https://schema.org','@type':'Service',name:s.name,description:s.short,provider:{'@id':`${siteUrl}/#business`},areaServed:areas.map(name=>({'@type':'City',name})),url:`${siteUrl}/services/${s.slug}/`};
  const crumbs={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:`${siteUrl}/`},{'@type':'ListItem',position:2,name:'Services',item:`${siteUrl}/services/`},{'@type':'ListItem',position:3,name:s.name,item:`${siteUrl}/services/${s.slug}/`} ]};
  const html=shell({title:`${s.name} in Longmont, CO | McKay's Garage`,description:`${s.short} Local service from McKay's Garage in Longmont, Colorado.`,canonical:`/services/${s.slug}/`,schema:[serviceSchema,faqSchema,crumbs],body:`<div class="container breadcrumb"><a href="/">Home</a> / <a href="/services/">Services</a> / ${esc(s.name)}</div><section class="hero-mini"><div class="container"><div class="eyebrow">McKay's Garage · Longmont, Colorado</div><h1 class="display">${esc(s.name)}</h1><p>${esc(s.intro)}</p><div class="button-row"><a class="btn btn-primary" href="/contact/#appointment">Request an Appointment</a><a class="btn btn-secondary" href="tel:${phoneHref}">${phoneDisplay}</a></div></div></section><section class="section"><div class="container service-detail"><article><div class="eyebrow">What we handle</div><h2>Practical service with a diagnostic-first mindset.</h2><p class="lead">${esc(s.intro)}</p><ul class="detail-list">${s.details.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="faq"><div class="eyebrow">Common questions</div>${s.faq.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></article><aside class="sticky-card"><div class="eyebrow">Need this service?</div><h3>Tell us about your vehicle.</h3><p class="muted">Include the year, make, model, symptoms and anything that recently changed. That helps us start in the right direction.</p><a class="btn btn-primary btn-full" href="/contact/#appointment">Schedule an Appointment</a><a class="btn btn-outline btn-full" href="tel:${phoneHref}">Call ${phoneDisplay}</a></aside></div></section>${ctaBand()}`});
  await page(`services/${s.slug}/index.html`, html);
}

const about = shell({title:"About McKay's Garage | Longmont Automotive & Diesel Mechanic",description:"Learn the story behind McKay's Garage in Longmont, Colorado: hands-on automotive experience since 2002, formal diesel education and a commitment to transparent service.",canonical:'/about/',body:`<section class="hero-mini"><div class="container"><div class="eyebrow">About the garage</div><h1 class="display">Built on experience. Growing on trust.</h1><p>McKay's Garage started the way a lot of good shops do: helping friends and neighbors, solving problems, and letting the work build the reputation.</p></div></section><section class="section section-white"><div class="container split"><div class="photo-frame"><img src="${aboutImage}" alt="McKay's Garage automotive shop" loading="eager"></div><div><div class="eyebrow">The story</div><h2>Working on vehicles since 2002.</h2><p>Having started as a mechanic right out of high school in 2002, Bobby McKay built experience across dealerships, family-run shops and a high-performance engine shop. Along the way he continued training through seminars covering a wide range of vehicle systems and earned an Associate Degree in Diesel Technology.</p><p>McKay's Garage began as a side gig in the driveway, helping friends and neighbors. It grew into a Longmont shop serving drivers from Mead, Berthoud, Loveland, Fort Collins, Firestone, Frederick, Fort Lupton and surrounding communities.</p><p>The mission is simple: provide high-quality automotive service at a fair value while building trustworthy relationships through open communication, careful work and personalized attention.</p></div></div></section><section class="section"><div class="container"><div class="section-header"><div><div class="eyebrow">What matters here</div><h2>Fix the vehicle. Respect the customer.</h2></div></div><div class="card-grid"><div class="card"><h3>Transparency</h3><p>Explain what was found and why a repair is — or is not — necessary.</p></div><div class="card"><h3>Problem solving</h3><p>Use scan data, testing and mechanical experience instead of guessing with parts.</p></div><div class="card"><h3>Long-term trust</h3><p>Help customers prioritize reliability, safety and vehicle longevity without turning every visit into a sales pitch.</p></div></div><div class="hero-discount"><strong>First responder, emergency medicine & military discount.</strong> McKay's Garage offers an exclusive discount as a small thank-you to the people who serve our communities and country.</div></div></section>${ctaBand('Need a mechanic you can talk to?','Tell Bobby what the vehicle is doing and what you are trying to accomplish. The conversation starts there.')}`});
await page('about/index.html', about);

const contact = shell({title:"Schedule Auto Repair in Longmont, CO | McKay's Garage",description:"Request an automotive service appointment with McKay's Garage at 3600 Stagecoach Rd Unit B in Longmont, Colorado. Gas, diesel, diagnostics, maintenance and repair.",canonical:'/contact/',schema:[{'@context':'https://schema.org','@type':'ContactPage',url:`${siteUrl}/contact/`,mainEntity:{'@id':`${siteUrl}/#business`}}],body:`<section class="hero-mini"><div class="container"><div class="eyebrow">Contact McKay's Garage</div><h1 class="display">Let's figure out what your vehicle needs.</h1><p>Request an appointment online or call the shop. If you can describe the symptom, when it happens and anything that changed recently, that helps.</p></div></section><section class="section"><div class="container form-shell"><div class="contact-card"><div class="eyebrow">Shop information</div><h2>McKay's Garage</h2><div class="contact-details"><div><strong>Call</strong><a href="tel:${phoneHref}">${phoneDisplay}</a></div><div><strong>Email</strong><a href="mailto:${email}">${email}</a></div><div><strong>Location</strong>${addressLine}</div><div><strong>Hours</strong>Monday–Friday: 8am–5pm<br>Saturday–Sunday: Closed</div></div><div class="hero-discount"><strong>Serving Longmont and surrounding areas</strong><br>${areas.join(' · ')}</div></div>${appointmentForm()}</div></section>`});
await page('contact/index.html', contact);

const blogIndex = shell({title:"Garage News | McKay's Garage Longmont Automotive Blog",description:"Practical automotive maintenance, diesel, diagnostics, transmission and suspension advice from McKay's Garage in Longmont, Colorado.",canonical:'/mckays-news/',body:`<section class="hero-mini"><div class="container"><div class="eyebrow">Garage News</div><h1 class="display">Useful automotive information. No sales pitch required.</h1><p>Clear explanations about maintenance, diagnosis and repair for gas and diesel vehicle owners in Colorado.</p></div></section><section class="section"><div class="container"><div class="blog-grid">${publishedPosts.map(postCard).join('')}</div></div></section>${ctaBand('Have a question our articles did not answer?','Send the symptom and vehicle details. We would rather start with the right question than guess at the repair.')}`});
await page('mckays-news/index.html', blogIndex);

for (const p of publishedPosts) {
  const articleSchema={'@context':'https://schema.org','@type':'BlogPosting',headline:p.title,description:p.description,datePublished:p.publishDate,dateModified:p.publishDate,author:{'@type':'Person',name:p.author},publisher:{'@id':`${siteUrl}/#business`},mainEntityOfPage:`${siteUrl}/mckays-news/${p.slug}/`,image:heroImage};
  const crumbs={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:`${siteUrl}/`},{'@type':'ListItem',position:2,name:'Garage News',item:`${siteUrl}/mckays-news/`},{'@type':'ListItem',position:3,name:p.title,item:`${siteUrl}/mckays-news/${p.slug}/`} ]};
  const articleBody=p.body.map(([type,text])=> type==='h2'?`<h2>${esc(text)}</h2>`:`<p>${esc(text)}</p>`).join('');
  const html=shell({title:`${p.title} | McKay's Garage`,description:p.description,canonical:`/mckays-news/${p.slug}/`,schema:[articleSchema,crumbs],body:`<div class="container breadcrumb"><a href="/">Home</a> / <a href="/mckays-news/">Garage News</a> / ${esc(p.title)}</div><section class="section"><div class="container"><article class="article"><header class="article-header"><div class="meta">${esc(p.category)} · ${fmtDate(p.publishDate)}</div><h1>${esc(p.title)}</h1><p class="lead">${esc(p.description)}</p><p class="muted">Written by ${esc(p.author)}</p></header>${articleBody}<div class="article-cta"><div class="eyebrow">Need hands-on help?</div><h2>Schedule with McKay's Garage in Longmont.</h2><p>Describe the vehicle and symptom, and we'll follow up to confirm an appointment.</p><a class="btn btn-primary" href="/contact/#appointment">Request an Appointment</a></div></article></div></section>`});
  await page(`mckays-news/${p.slug}/index.html`, html);
}

const thankYou=shell({title:"Request Received | McKay's Garage",description:"Your appointment request was sent to McKay's Garage.",canonical:'/thank-you/',noindex:true,body:`<section class="section"><div class="container article"><div class="eyebrow">Request received</div><h1 class="display">Thanks. Bobby has your message.</h1><p class="lead">You'll also receive a branded email confirmation with a copy of what you submitted. The shop will follow up to confirm availability and any details needed before the visit.</p><div class="button-row"><a class="btn btn-primary" href="/">Back to Home</a><a class="btn btn-outline" href="tel:${phoneHref}">Call ${phoneDisplay}</a></div></div></section>`});
await page('thank-you/index.html',thankYou);

const notFound=shell({title:"Page Not Found | McKay's Garage",description:"The requested McKay's Garage page could not be found.",canonical:'/404.html',noindex:true,body:`<section class="not-found"><div class="container"><div class="eyebrow">404</div><h1>Wrong turn.</h1><p class="lead" style="margin-inline:auto">That page is not in the garage anymore. Head back home or request an appointment.</p><div class="button-row" style="justify-content:center"><a class="btn btn-primary" href="/">Home</a><a class="btn btn-outline" href="/contact/">Contact</a></div></div></section>`});
await page('404.html',notFound);

const sitemapEntries=['/','/services/',...services.map(s=>`/services/${s.slug}/`),'/about/','/contact/','/mckays-news/',...publishedPosts.map(p=>`/mckays-news/${p.slug}/`)];
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.map(u=>`  <url><loc>${siteUrl}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`;
await writeFile(path.join(dist,'sitemap.xml'),sitemap);
await writeFile(path.join(dist,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
await writeFile(path.join(dist,'llms.txt'),`# McKay's Garage\n\nMcKay's Garage is an automotive repair shop at ${addressLine}. The shop provides gas and diesel automotive diagnostics, maintenance, transmission and drivetrain service, suspension and steering repair, engine repair and rebuilds, electrical diagnostics, lift-kit work and related services.\n\nPhone: ${phoneDisplay}\nEmail: ${email}\nHours: Monday-Friday 8am-5pm\nService area: ${areas.join(', ')} and surrounding Northern Colorado communities.\n\nPrimary pages:\n- ${siteUrl}/services/\n- ${siteUrl}/about/\n- ${siteUrl}/contact/\n- ${siteUrl}/mckays-news/\n`);
await writeFile(path.join(dist,'manifest.webmanifest'),JSON.stringify({name:"McKay's Garage",short_name:"McKay's Garage",start_url:'/',display:'standalone',background_color:'#f7f4ef',theme_color:'#171717',icons:[{src:'/assets/mckays-logo.webp',sizes:'180x180',type:'image/webp'}]},null,2));

function postCard(p){return `<article class="post-card"><div class="meta">${esc(p.category)} · ${fmtDate(p.publishDate)}</div><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><a href="/mckays-news/${p.slug}/">Read article →</a></article>`}
async function page(rel, html){const file=path.join(dist,rel);await mkdir(path.dirname(file),{recursive:true});await writeFile(file,html)}

console.log(`Built ${sitemapEntries.length} indexable pages. Published posts through ${today}: ${publishedPosts.length}.`);
