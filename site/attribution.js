/* Court Gems order attribution.
   The site is headless, so Shopify never sees how a shopper arrived: checkout is the first
   Shopify page they touch. This script remembers where each visitor came from and hands it
   to Shopify in two ways:
     1. Cart attributes, which show on every order in Shopify admin under "Additional details".
     2. utm_* parameters on the checkout link, for Shopify's own marketing reports.
   Nothing is sent anywhere except Shopify, and only as part of the shopper's own cart. */
(function(){
  'use strict';
  /* Same public Storefront API details as the inline script on every page. */
  var SHOPIFY = {domain:'0kec5k-xd.myshopify.com', token:'414360a9e88a9ff1fb6816fafae12ed2', version:'2026-10'};
  var KEY = 'cg-attribution', CART_KEY = 'cg-cart', SYNC_KEY = 'cg-attribution-synced';
  var KEEP_DAYS = 30;

  var SEARCH = /(^|\.)(google|bing|duckduckgo|ecosia|yahoo|brave|startpage)\./;
  var SOCIAL = {instagram:'instagram', facebook:'facebook', 'fb.':'facebook', tiktok:'tiktok', pinterest:'pinterest',
    youtube:'youtube', 'youtu.be':'youtube', reddit:'reddit', 'twitter.':'twitter', 'x.com':'twitter', 't.co':'twitter',
    threads:'threads', linkedin:'linkedin', 'lnkd.in':'linkedin', snapchat:'snapchat', whatsapp:'whatsapp'};

  function read(k){ try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function write(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function clip(s, n){ return String(s || '').slice(0, n); }

  /* Work out how this page view arrived. Returns null for an internal click or a direct visit. */
  function touch(){
    var q = new URLSearchParams(location.search), t = null, host = '';
    try { host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''; } catch (e) {}
    if (host === location.hostname.replace(/^www\./, '')) host = '';

    if (q.get('utm_source')) {
      t = {source:q.get('utm_source'), medium:q.get('utm_medium') || '', campaign:q.get('utm_campaign') || '',
        content:q.get('utm_content') || '', term:q.get('utm_term') || ''};
    } else if (q.get('gclid') || q.get('gbraid') || q.get('wbraid')) {
      t = {source:'google', medium:'cpc'};
    } else if (q.get('msclkid')) {
      t = {source:'bing', medium:'cpc'};
    } else if (q.get('ttclid')) {
      t = {source:'tiktok', medium:'paid_social'};
    } else if (q.get('fbclid')) {
      t = {source:/instagram/.test(host) ? 'instagram' : 'facebook', medium:'social'};
    } else if (host) {
      if (SEARCH.test(host)) t = {source:host.match(SEARCH)[2], medium:'organic'};
      else {
        for (var k in SOCIAL) if (host.indexOf(k) !== -1) { t = {source:SOCIAL[k], medium:'social'}; break; }
        if (!t) t = {source:host, medium:'referral'};
      }
    }
    if (!t) return null;
    t.referrer = host;
    t.landing = location.pathname;
    t.at = new Date().toISOString();
    return t;
  }

  /* first = how they originally found the site; last = the most recent non-direct visit. */
  var data = read(KEY) || {};
  var now = Date.now(), maxAge = KEEP_DAYS * 864e5;
  ['first', 'last'].forEach(function(k){ if (data[k] && now - Date.parse(data[k].at) > maxAge) delete data[k]; });
  var t = touch();
  if (t) { if (!data.first) data.first = t; data.last = t; }
  else if (!data.first) data.first = data.last = {source:'direct', medium:'none', referrer:'', landing:location.pathname, at:new Date().toISOString()};
  write(KEY, data);

  function attributes(){
    var l = data.last || data.first, f = data.first || l, out = [];
    function add(key, value){ if (value) out.push({key:key, value:clip(value, 200)}); }
    add('Source', l.source);
    add('Medium', l.medium);
    add('Campaign', l.campaign);
    add('Ad content', l.content);
    add('Search term', l.term);
    add('Came from', l.referrer);
    add('Landing page', l.landing);
    add('First source', f.source + (f.medium ? ' / ' + f.medium : ''));
    add('First visit', clip(f.at, 10));
    return out;
  }

  /* ---------- 1. Cart attributes ---------- */
  function cartId(){ try { return localStorage.getItem(CART_KEY); } catch (e) { return null; } }
  function signature(id){ return id + '|' + JSON.stringify(attributes()); }
  function synced(id){ try { return sessionStorage.getItem(SYNC_KEY) === signature(id); } catch (e) { return false; } }

  var inFlight = null;
  function sync(){
    var id = cartId();
    if (!id || synced(id)) return Promise.resolve();
    if (inFlight) return inFlight;
    var ctrl = new AbortController(), timer = setTimeout(function(){ ctrl.abort(); }, 4000);
    inFlight = fetch('https://' + SHOPIFY.domain + '/api/' + SHOPIFY.version + '/graphql.json', {
      method:'POST', signal:ctrl.signal,
      headers:{'Content-Type':'application/json', 'X-Shopify-Storefront-Access-Token':SHOPIFY.token},
      body:JSON.stringify({
        query:'mutation Attribution($cartId: ID!, $attributes: [AttributeInput!]!) { cartAttributesUpdate(cartId: $cartId, attributes: $attributes) { cart { id } userErrors { message } } }',
        variables:{cartId:id, attributes:attributes()}
      })
    }).then(function(r){ return r.json(); }).then(function(j){
      var res = j.data && j.data.cartAttributesUpdate;
      if (res && res.cart && !(res.userErrors || []).length) { try { sessionStorage.setItem(SYNC_KEY, signature(id)); } catch (e) {} }
    }).catch(function(){ /* attribution must never get in the way of a sale */ })
      .then(function(){ clearTimeout(timer); inFlight = null; });
    return inFlight;
  }

  /* The inline page script creates the cart; pick it up soon after it appears. */
  sync();
  var lastSeen = cartId();
  setInterval(function(){ var id = cartId(); if (id !== lastSeen) { lastSeen = id; sync(); } }, 1500);

  /* ---------- 2. UTM parameters on the checkout link ---------- */
  function withUtm(href){
    var l = data.last || data.first, u;
    try { u = new URL(href, location.href); } catch (e) { return href; }
    if (!l || l.source === 'direct' || u.searchParams.get('utm_source')) return u.href;
    u.searchParams.set('utm_source', clip(l.source, 100));
    if (l.medium) u.searchParams.set('utm_medium', clip(l.medium, 100));
    if (l.campaign) u.searchParams.set('utm_campaign', clip(l.campaign, 100));
    if (l.content) u.searchParams.set('utm_content', clip(l.content, 100));
    if (l.term) u.searchParams.set('utm_term', clip(l.term, 100));
    return u.href;
  }

  document.addEventListener('click', function(e){
    var a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a || !/\/cart\/c\/|\/checkouts\//.test(a.getAttribute('href'))) return;
    var url = withUtm(a.href), id = cartId();
    a.href = url;
    if (!id || synced(id) || e.defaultPrevented) return;                 /* already tagged: go straight to checkout */
    if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { sync(); return; }
    e.preventDefault();                                                    /* otherwise tag first, but wait 2s at most */
    var gone = false, go = function(){ if (!gone) { gone = true; location.href = url; } };
    setTimeout(go, 2000);
    sync().then(go);
  }, true);
})();
