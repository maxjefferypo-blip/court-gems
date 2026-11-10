/* Court Gems email signup: a "10% off your first order" pop-up.
   Signing up creates a marketing-subscribed customer in Shopify (Customers → Subscribed),
   so the list can be emailed from Shopify Email or any app that syncs Shopify customers.
   The discount code itself must exist in Shopify admin (Discounts) with the same name as CODE.
   To preview the pop-up at any time, add ?signup=1 to any page address. */
(function(){
  'use strict';
  var SHOPIFY = {domain:'0kec5k-xd.myshopify.com', token:'414360a9e88a9ff1fb6816fafae12ed2', version:'2026-10'};
  var CODE = 'WELCOME10', PERCENT = 10;
  var DELAY_MS = 8000;          /* wait before showing */
  var SNOOZE_DAYS = 14;         /* after closing without signing up */
  var IMAGE = '/img/studio-smiley-days.jpg';
  var KEY = 'cg-signup';

  function read(){ try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function write(v){ try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
  var state = read();
  var forced = /[?&]signup=1\b/.test(location.search);

  /* ---------- Apply the code automatically at checkout once signed up ---------- */
  document.addEventListener('click', function(e){
    var a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a || !/\/cart\/c\/|\/checkouts\//.test(a.getAttribute('href')) || read().joined !== true) return;
    try {
      var u = new URL(a.href, location.href);
      if (!u.searchParams.get('discount')) { u.searchParams.set('discount', CODE); a.href = u.href; }
    } catch (err) {}
  }, true);

  if (!forced) {
    if (state.joined) return;
    if (state.snoozed && Date.now() - state.snoozed < SNOOZE_DAYS * 864e5) return;
  }

  /* ---------- Markup and styles ---------- */
  var css =
    '.cg-signup{width:min(92vw,720px);max-height:92vh;padding:0;border:0;border-radius:24px;background:var(--cg-white);color:var(--text-body);font-family:var(--font-body);box-shadow:0 24px 80px rgba(22,10,61,.35);overflow:hidden}' +
    '.cg-signup:focus{outline:0}' +
    '.cg-signup::backdrop{background:rgba(22,10,61,.55)}' +
    '.cg-signup[open]{display:grid;grid-template-columns:1fr;animation:cg-signup-in .28s cubic-bezier(.2,.9,.3,1.2)}' +
    '@keyframes cg-signup-in{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}' +
    '@media (prefers-reduced-motion:reduce){.cg-signup[open]{animation:none}}' +
    '.cg-signup__media{display:none;background:var(--cg-holo)}' +
    '.cg-signup__media img{width:100%;height:100%;object-fit:cover;display:block}' +
    '.cg-signup__body{position:relative;padding:36px 24px 24px;display:flex;flex-direction:column;gap:12px;overflow:auto}' +
    '.cg-signup__close{position:absolute;top:8px;right:8px;width:44px;height:44px;border:0;border-radius:999px;background:transparent;color:var(--cg-indigo-700);font-size:26px;line-height:1;cursor:pointer}' +
    '.cg-signup__close:hover{background:var(--cg-lilac-50)}' +
    '.cg-signup__eyebrow{margin:0;font-weight:700;font-size:12px;letter-spacing:1.6px;text-transform:uppercase;color:var(--cg-iris-500)}' +
    '.cg-signup__title{margin:0;font-family:var(--font-heading);font-weight:800;font-size:clamp(30px,6vw,40px);line-height:1.02;letter-spacing:-.01em;color:var(--cg-indigo-700);text-wrap:balance}' +
    '.cg-signup__text{margin:0;font-size:15px;line-height:1.5;letter-spacing:.2px}' +
    '.cg-signup__form{display:flex;flex-direction:column;gap:10px;margin-top:4px}' +
    '.cg-signup__label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}' +
    '.cg-signup__input{box-sizing:border-box;width:100%;min-height:52px;padding:0 20px;border:2px solid var(--cg-lilac-200);border-radius:999px;background:var(--cg-white);color:var(--text-body);font:inherit;font-size:16px;letter-spacing:.2px}' +
    '.cg-signup__input:focus{outline:0;border-color:var(--cg-indigo-700);box-shadow:0 0 0 3px var(--cg-lavender-300)}' +
    '.cg-signup__btn{min-height:52px;border:0;border-radius:999px;background:var(--cg-indigo-700);color:#fff;font:inherit;font-weight:700;font-size:16px;letter-spacing:.4px;cursor:pointer}' +
    '.cg-signup__btn:hover{background:var(--cg-indigo-600)}' +
    '.cg-signup__btn[disabled]{opacity:.6;cursor:default}' +
    '.cg-signup__btn:focus-visible,.cg-signup__close:focus-visible,.cg-signup__skip:focus-visible,.cg-signup__copy:focus-visible{outline:3px solid var(--cg-lavender-400);outline-offset:2px}' +
    '.cg-signup__error{margin:0;min-height:1.2em;font-size:13px;line-height:1.4;color:#C8282E}' +
    '.cg-signup__small{margin:0;font-size:12px;line-height:1.5;letter-spacing:.2px;color:var(--cg-slate-500)}' +
    '.cg-signup__skip{align-self:center;padding:8px 12px;border:0;background:none;color:var(--cg-slate-500);font:inherit;font-size:13px;text-decoration:underline;cursor:pointer}' +
    '.cg-signup__code{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 10px 10px 20px;border:2px dashed var(--cg-lavender-400);border-radius:999px;background:var(--cg-lilac-50)}' +
    '.cg-signup__code b{font-family:var(--font-heading);font-size:22px;letter-spacing:2px;color:var(--cg-indigo-700)}' +
    '.cg-signup__copy{min-height:40px;padding:0 18px;border:0;border-radius:999px;background:var(--cg-indigo-700);color:#fff;font:inherit;font-weight:700;font-size:14px;cursor:pointer}' +
    '@media (min-width:640px){.cg-signup[open]{grid-template-columns:5fr 6fr}.cg-signup__media{display:block}.cg-signup__body{padding:44px 36px 28px;justify-content:center;min-height:420px}}';

  var dialog, shown = false;
  function build(){
    var style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
    dialog = document.createElement('dialog');
    dialog.className = 'cg-signup';
    dialog.setAttribute('aria-labelledby', 'cgSignupTitle');
    dialog.innerHTML =
      '<div class="cg-signup__media"><img src="' + IMAGE + '" alt="" loading="lazy"></div>' +
      '<div class="cg-signup__body">' +
        '<button class="cg-signup__close" type="button" data-signup-close aria-label="Close">&times;</button>' +
        '<div data-signup-step="form" style="display:contents">' +
          '<p class="cg-signup__eyebrow">Join the club</p>' +
          '<h2 class="cg-signup__title" id="cgSignupTitle">' + PERCENT + '% off your first order</h2>' +
          '<p class="cg-signup__text">Pop your email in and we’ll give you a code straight away. You’ll also hear about new designs and limited editions first.</p>' +
          '<form class="cg-signup__form" novalidate>' +
            '<label class="cg-signup__label" for="cgSignupEmail">Email address</label>' +
            '<input class="cg-signup__input" id="cgSignupEmail" type="email" name="email" autocomplete="email" inputmode="email" placeholder="Email address" required>' +
            '<button class="cg-signup__btn" type="submit">Get my ' + PERCENT + '% off</button>' +
            '<p class="cg-signup__error" role="alert"></p>' +
          '</form>' +
          '<p class="cg-signup__small">By signing up you agree to receive marketing emails from Court Gems. Unsubscribe any time.</p>' +
          '<button class="cg-signup__skip" type="button" data-signup-close>No thanks</button>' +
        '</div>' +
        '<div data-signup-step="done" style="display:none" hidden>' +
          '<p class="cg-signup__eyebrow">You’re in</p>' +
          '<h2 class="cg-signup__title">Here’s your ' + PERCENT + '% off</h2>' +
          '<p class="cg-signup__text">We’ll add it for you at checkout. Here’s the code in case you need it:</p>' +
          '<div class="cg-signup__code"><b>' + CODE + '</b><button class="cg-signup__copy" type="button">Copy</button></div>' +
          '<button class="cg-signup__btn" type="button" data-signup-close style="margin-top:8px">Keep shopping</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(dialog);

    dialog.addEventListener('click', function(e){
      if (e.target === dialog || e.target.closest('[data-signup-close]')) dialog.close();
    });
    dialog.addEventListener('close', function(){
      var s = read(); if (!s.joined) { s.snoozed = Date.now(); write(s); }
    });
    dialog.querySelector('form').addEventListener('submit', submit);
    dialog.querySelector('.cg-signup__copy').addEventListener('click', function(e){
      var b = e.currentTarget;
      (navigator.clipboard ? navigator.clipboard.writeText(CODE) : Promise.reject()).then(function(){ b.textContent = 'Copied'; }, function(){ b.textContent = CODE; });
    });
  }

  function show(){
    if (shown) return;
    /* Don't interrupt someone who is in the bag or the menu: try again shortly. */
    if (document.querySelector('.cg-drawer--open')) { setTimeout(show, 5000); return; }
    shown = true;
    build();
    if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', '');
    /* Desktop: start in the email box. Touch: focus the pop-up itself so the keyboard doesn't jump up. */
    if (window.matchMedia && matchMedia('(hover:hover)').matches) dialog.querySelector('input').focus();
    else { dialog.tabIndex = -1; dialog.focus(); }
  }

  /* ---------- Submit: create a subscribed customer in Shopify ---------- */
  function randomPassword(){
    var a = new Uint8Array(24); (window.crypto || window.msCrypto).getRandomValues(a);
    return Array.prototype.map.call(a, function(n){ return ('0' + n.toString(16)).slice(-2); }).join('');
  }
  function submit(e){
    e.preventDefault();
    var form = e.currentTarget, input = form.querySelector('input'), btn = form.querySelector('button'), err = form.querySelector('.cg-signup__error');
    var email = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'Please enter a valid email address.'; input.focus(); return; }
    err.textContent = ''; btn.disabled = true; btn.textContent = 'One moment…';
    fetch('https://' + SHOPIFY.domain + '/api/' + SHOPIFY.version + '/graphql.json', {
      method:'POST',
      headers:{'Content-Type':'application/json', 'X-Shopify-Storefront-Access-Token':SHOPIFY.token},
      body:JSON.stringify({
        query:'mutation Signup($input: CustomerCreateInput!) { customerCreate(input: $input) { customer { id } customerUserErrors { code message } } }',
        variables:{input:{email:email, password:randomPassword(), acceptsMarketing:true}}
      })
    }).then(function(r){ return r.json(); }).then(function(j){
      if (j.errors) throw new Error(j.errors[0].message);
      var res = j.data.customerCreate, errs = res.customerUserErrors || [];
      /* TAKEN / CUSTOMER_DISABLED mean Shopify already knows this email: still hand over the code. */
      var known = errs.some(function(x){ return x.code === 'TAKEN' || x.code === 'CUSTOMER_DISABLED'; });
      if (!res.customer && !known) throw new Error(errs.length ? errs[0].message : 'Signup failed');
      done();
    }).catch(function(){
      btn.disabled = false; btn.textContent = 'Get my ' + PERCENT + '% off';
      err.textContent = 'Sorry, that didn’t work. Please try again in a moment.';
    });
  }
  function done(){
    write({joined:true, at:Date.now()});
    var f = dialog.querySelector('[data-signup-step="form"]'), d = dialog.querySelector('[data-signup-step="done"]');
    f.style.display = 'none'; f.hidden = true;
    d.hidden = false; d.style.display = 'contents';
    dialog.setAttribute('aria-labelledby', '');
    d.querySelector('.cg-signup__copy').focus();
  }

  if (forced) show(); else setTimeout(show, DELAY_MS);
})();
