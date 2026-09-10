const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
const clean=(value,max=2000)=>String(value??'').replace(/\0/g,'').trim().slice(0,max);
const escapeHtml=(value)=>clean(value,10000).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[c]));
const isEmail=(value)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const infoRow=(label,value)=>`<tr><td style="padding:11px 12px;border-bottom:1px solid #e8e1d8;color:#746d66;font-size:13px;font-weight:700;width:34%">${label}</td><td style="padding:11px 12px;border-bottom:1px solid #e8e1d8;color:#1a1a1a;font-size:14px">${value}</td></tr>`;

const emailShell=({eyebrow,title,intro,content,footerNote,siteUrl})=>`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#171717;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#f7f4ef;border-radius:4px;overflow:hidden"><tr><td style="background:#101010;padding:26px 32px;text-align:center;border-bottom:6px solid #e7341d"><img src="${siteUrl}/assets/mckays-logo.webp" width="120" alt="McKay's Garage" style="display:block;margin:0 auto 8px"><div style="font-size:24px;font-weight:900;color:#fff;letter-spacing:.5px">McKAY'S GARAGE</div><div style="margin-top:5px;color:#ff9c45;font-size:12px;font-weight:800;letter-spacing:1.2px">LONGMONT • GAS & DIESEL AUTOMOTIVE SERVICE</div></td></tr><tr><td style="padding:32px 34px 10px"><div style="font-size:12px;font-weight:900;color:#e7341d;letter-spacing:1.3px;text-transform:uppercase">${eyebrow}</div><h1 style="margin:9px 0 12px;font-size:29px;line-height:1.15;color:#171717">${title}</h1><p style="margin:0;color:#68615b;font-size:16px;line-height:1.65">${intro}</p></td></tr><tr><td style="padding:12px 34px 34px">${content}</td></tr><tr><td style="background:#ebe5dc;padding:20px 34px;text-align:center;color:#6c655e;font-size:13px;line-height:1.6">${footerNote}<br><a href="${siteUrl}" style="color:#c92714;font-weight:800;text-decoration:none">mckaysgarage.com</a> • <a href="tel:+17206143940" style="color:#c92714;font-weight:800;text-decoration:none">720-614-3940</a></td></tr></table></td></tr></table></body></html>`;

async function sendResend(env,payload){
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const result=await response.json().catch(()=>({}));
  if(!response.ok){console.error('Resend API error',response.status,result);throw new Error(result.message||'Resend rejected the email.');}
  return result;
}

async function verifyTurnstile(env,token,ip){
  if(!env.TURNSTILE_SECRET_KEY) return true;
  if(!token) return false;
  const body=new FormData();body.append('secret',env.TURNSTILE_SECRET_KEY);body.append('response',token);if(ip)body.append('remoteip',ip);
  const response=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body});
  const result=await response.json().catch(()=>({success:false}));
  return Boolean(result.success);
}

export async function onRequestPost({request,env}){
  if(!env.RESEND_API_KEY) return json({ok:false,message:'The appointment form is not configured yet.'},500);
  let body;try{body=await request.json();}catch{return json({ok:false,message:'Invalid form submission.'},400);}
  if(clean(body.company_website,200)) return json({ok:true,message:'Thank you.'});

  const ip=request.headers.get('CF-Connecting-IP')||'';
  const turnstileOk=await verifyTurnstile(env,clean(body['cf-turnstile-response'],2000),ip);
  if(!turnstileOk) return json({ok:false,message:'Please complete the security check and try again.'},400);

  const name=clean(body.name,100), customerEmail=clean(body.email,200), phone=clean(body.phone,50), vehicle=clean(body.vehicle,150), service=clean(body.service,150), preferredDay=clean(body.preferred_day,50), message=clean(body.message,5000), sourcePage=clean(body.source_page,500)||'/contact/';
  if(!name||!customerEmail||!vehicle||!message) return json({ok:false,message:'Please provide your name, email, vehicle, and what is going on.'},400);
  if(!isEmail(customerEmail)) return json({ok:false,message:'Please enter a valid email address.'},400);

  const fromEmail=env.CONTACT_FROM_EMAIL||"McKay's Garage <forms@mckaysgarage.com>";
  const toEmail=env.CONTACT_TO_EMAIL||'bmckay1@mckaysgarage.com';
  const siteUrl=(env.SITE_URL||new URL(request.url).origin).replace(/\/$/,'');
  const submittedAt=new Date().toLocaleString('en-US',{timeZone:'America/Denver',dateStyle:'medium',timeStyle:'short'});

  const rows=`<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #ded6cc;background:#fff">${infoRow('Name',escapeHtml(name))}${infoRow('Email',`<a href="mailto:${escapeHtml(customerEmail)}" style="color:#c92714">${escapeHtml(customerEmail)}</a>`)}${infoRow('Phone',phone?`<a href="tel:${escapeHtml(phone)}" style="color:#c92714">${escapeHtml(phone)}</a>`:'Not provided')}${infoRow('Vehicle',escapeHtml(vehicle))}${infoRow('Service',escapeHtml(service||'General / not sure'))}${infoRow('Preferred day',escapeHtml(preferredDay||'No preference'))}${infoRow('Received',escapeHtml(submittedAt))}</table><div style="margin-top:20px;background:#fff;border-left:5px solid #e7341d;padding:18px"><div style="font-size:12px;font-weight:900;color:#e7341d;text-transform:uppercase;letter-spacing:1px;margin-bottom:7px">Vehicle / service details</div><div style="white-space:pre-wrap;color:#302c29;font-size:15px;line-height:1.65">${escapeHtml(message)}</div></div>`;

  const adminHtml=emailShell({eyebrow:'New Appointment Request',title:`New request from ${escapeHtml(name)}`,intro:'A customer submitted an appointment request through mckaysgarage.com.',content:`${rows}<div style="margin-top:22px;text-align:center"><a href="mailto:${escapeHtml(customerEmail)}?subject=${encodeURIComponent(`Re: ${vehicle} - McKay's Garage`)}" style="display:inline-block;background:#e7341d;color:white;text-decoration:none;font-weight:800;padding:13px 18px;border-radius:3px;margin:4px">Reply to Customer</a>${phone?`<a href="tel:${escapeHtml(phone)}" style="display:inline-block;background:#171717;color:white;text-decoration:none;font-weight:800;padding:13px 18px;border-radius:3px;margin:4px">Call Customer</a>`:''}</div><p style="margin-top:18px;color:#777;font-size:12px">Source page: ${escapeHtml(sourcePage)}</p>`,footerNote:'This lead was submitted through the McKay\'s Garage website.',siteUrl});
  const customerHtml=emailShell({eyebrow:'Request Received',title:`Thanks, ${escapeHtml(name)}.`,intro:'We received your appointment request. This is a copy of what you submitted; the shop will follow up to confirm availability.',content:`${rows}<div style="margin-top:22px;border:1px solid #ded6cc;background:#fff;padding:18px"><div style="font-size:12px;font-weight:900;color:#e7341d;text-transform:uppercase;letter-spacing:1px;margin-bottom:7px">What happens next</div><ol style="margin:0;padding-left:20px;color:#302c29;line-height:1.7"><li>Bobby reviews the vehicle and symptom details.</li><li>McKay's Garage follows up to confirm timing or ask any needed questions.</li><li>Your appointment is confirmed before you make the trip to the shop.</li></ol></div>`,footerNote:"McKay's Garage • Straight answers. Reliable automotive service.",siteUrl});

  const adminText=["NEW MCKAY'S GARAGE APPOINTMENT REQUEST",`Name: ${name}`,`Email: ${customerEmail}`,`Phone: ${phone||'Not provided'}`,`Vehicle: ${vehicle}`,`Service: ${service||'General / not sure'}`,`Preferred day: ${preferredDay||'No preference'}`,`Received: ${submittedAt}`,'','Details:',message].join('\n');
  const customerText=[`Thanks, ${name}.`,`McKay's Garage received your appointment request and will follow up to confirm availability.`,'',`Vehicle: ${vehicle}`,`Service: ${service||'General / not sure'}`,`Preferred day: ${preferredDay||'No preference'}`,'','What you sent:',message,'','McKay\'s Garage','3600 Stagecoach Rd Unit B, Longmont, CO 80504','720-614-3940'].join('\n');

  try{
    await sendResend(env,{from:fromEmail,to:[toEmail],subject:`Appointment request: ${vehicle} — ${name}`,html:adminHtml,text:adminText,reply_to:customerEmail});
    await sendResend(env,{from:fromEmail,to:[customerEmail],subject:`We received your McKay's Garage request — ${vehicle}`,html:customerHtml,text:customerText,reply_to:toEmail});
    return json({ok:true,message:'Your request was sent.'});
  }catch(error){console.error(error);return json({ok:false,message:'We could not send your request right now. Please call 720-614-3940.'},502);}
}
