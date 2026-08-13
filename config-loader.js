// HelloInsights — Unified Config & Ad Manager v3
// Supports: MGID content widgets + Google AdSense banners + GA4 tracking
// All ad positions/sizes controlled by config.json — no HTML code changes needed
var siteConfig = null;

// ==========================================
// 0. Google Analytics 4 — Global Tracking
// ==========================================
(function() {
    var GA_ID = 'G-Q4QHZKZT46';
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID);
})();

// ==========================================
// 1. Site Config (logo / nav / footer / seo)
// ==========================================
function applyConfig(config) {
    siteConfig = config;
    document.documentElement.style.setProperty('--accent-color', config.accentColor);
    
    // Logo
    var logoEl = document.querySelector('.logo');
    if (logoEl) {
        while (logoEl.firstChild) logoEl.removeChild(logoEl.firstChild);
        var src = config.logoImage || '';
        if (src) {
            var img = document.createElement('img');
            img.src = src;
            img.alt = config.siteName;
            img.className = 'logo-img';
            logoEl.appendChild(img);
        } else {
            logoEl.innerHTML = '<span class="logo-text">' + config.siteName + '</span>';
        }
    }
    
    // Navigation - Skip rendering in subdomain mode (keep HTML initial nav)
    if (!window.IS_SUBDOMAIN) {
        var navUl = document.querySelector('ul.nav');
        if (navUl) {
            var first = navUl.querySelector('li:first-child a');
            var html = '<li><a href="index.html">All</a></li>';
            for (var i = 0; i < config.categories.length; i++)
                html += '<li><a href="category.html?cat=' + config.categories[i].id + '">' + config.categories[i].name + '</a></li>';
            navUl.innerHTML = html;
        }
    }
    
    // Footer - Skip rendering in subdomain mode (keep HTML initial footer)
    if (!window.IS_SUBDOMAIN) {
        var sections = document.querySelectorAll('.footer-section');
        if (sections.length >= 2) {
            var h4 = sections[0].querySelector('h4'),
                p = sections[0].querySelector('p');
            if (h4) h4.textContent = 'About ' + config.siteName;
            if (p) p.textContent = config.footer.about;
            
            var ul = sections[1].querySelector('ul');
            if (ul) {
                var links = '<li><a href="index.html">Home</a></li>';
                for (var i = 0; i < config.categories.length; i++)
                    links += '<li><a href="category.html?cat=' + config.categories[i].id + '">' + config.categories[i].name + '</a></li>';
                ul.innerHTML = links;
            }
            
            var bottom = document.querySelector('.footer-bottom p');
            if (bottom)
                bottom.innerHTML = '© <script>document.write(new Date().getFullYear())<\/script> ' + config.siteName + '. All rights reserved.';
        }
    }
    
    // Title & Meta
    if (document.title.indexOf('HelloInsights') !== -1)
        document.title = document.title.replace(/HelloInsights/g, config.siteName);
    
    var meta = document.querySelector('meta[name="description"]');
    if (meta && config.seo && config.seo.description)
        meta.setAttribute('content', config.seo.description);
}
function loadSiteConfig(callback) {
    fetch('config.json?v=' + Date.now())
        .then(function(r) { return r.json(); })
        .then(function(c) {
            applyConfig(c);
            if (callback) callback(c);
        })
        .catch(function(e) {
            console.warn('Config load failed:', e);
            if (callback) callback(null);
        });
}

// ==========================================
// 2. MGID Manager — Content Widgets
// ==========================================
var _mgidLoaded = false;
function loadMGID(config) {
    var mgid = config.mgid;
    if (!mgid || !mgid.enabled) return;
    
    var page = location.pathname.split('/').pop() || 'index.html';
    var widgets = (mgid.widgets && mgid.widgets[page]) || [];
    if (!widgets.length) return;
    
    if (!_mgidLoaded && !document.querySelector('script[src*="jsc.mgid.com"]')) {
        var s = document.createElement('script');
        s.src = 'https://jsc.mgid.com/site/' + mgid.siteId + '.js';
        s.async = true;
        document.head.appendChild(s);
        _mgidLoaded = true;
    }
    
    var placed = [];
    for (var i = 0; i < widgets.length; i++) {
        var w = widgets[i];
        var anchor = document.querySelector('[data-ad-slot="' + w.slot + '"]');
        if (!anchor) continue;
        
        if (w.height) anchor.style.minHeight = w.height;
        if (w.marginTop !== undefined) anchor.style.marginTop = w.marginTop;
        if (w.marginBottom !== undefined) anchor.style.marginBottom = w.marginBottom;
        anchor.className = 'ad-container';
        
        var div = document.createElement('div');
        div.setAttribute('data-type', '_mgwidget');
        div.setAttribute('data-widget-id', w.widgetId);
        anchor.appendChild(div);
        placed.push(div);
    }
    
    if (placed.length > 0) {
        try {
            (window._mgq = window._mgq || []).push(["_mgc.load"]);
        } catch(e) {
            console.warn('MGID trigger error:', e);
        }
    }
}

// ==========================================
// 3. AdEngine — Unified Multi-Provider Ad Manager
// ==========================================
var AdEngine = {
    providers: {},
    slots: [],
    registerProvider: function(name, provider) {
        this.providers[name] = provider;
    },
    registerSlot: function(el, config) {
        this.slots.push({ el: el, config: config });
    },
    renderAll: function() {
        var providerKeys = Object.keys(this.providers);
        for (var i = 0; i < this.slots.length; i++) {
            var slot = this.slots[i];
            var filled = false;
            for (var p = 0; p < providerKeys.length; p++) {
                var provider = this.providers[providerKeys[p]];
                if (provider && typeof provider.render === 'function') {
                    if (provider.render(slot.el, slot.config)) {
                        slot.el.classList.add('has-ad');
                        slot.el.classList.remove('ad-hidden');
                        filled = true;
                        break;
                    }
                }
            }
            if (!filled) {
                // Will be checked later by checkAndHideUnfilled
            }
        }
    }
};

// ==========================================
// 3b. AdSense Manager — Lazy Load (Backward Compatible)
// ==========================================
var _adSenseClientId = null;
function loadAdSense(config) {
    if (!config.adsense || !config.adsense.enabled) return;
    
    var clientId = config.adsense.clientId;
    if (!clientId || clientId.indexOf('XXXX') !== -1) return;
    _adSenseClientId = clientId;
    
    var slots = config.adsense.slots || {};
    var pageAds = config.adsense.pageAds || {};
    var page = location.pathname.split('/').pop() || 'index.html';
    var adSlots = pageAds[page];
    
    // If no pageAds config for this page, check if page has data-ad-slot elements
    // and try to fill them with auto ads (supports article.html etc.)
    if (!adSlots || !adSlots.length) {
        var pageAdSlotEls = document.querySelectorAll('[data-ad-slot]');
        if (pageAdSlotEls.length > 0) {
            // Load AdSense script for auto-fill
            if (!document.querySelector('script[src*="adsbygoogle"]')) {
                var s = document.createElement('script');
                s.async = true;
                s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + clientId;
                s.crossOrigin = 'anonymous';
                document.head.appendChild(s);
            }
            // For unconfigured slots, add ad-hidden class — they'll be checked later
            for (var u = 0; u < pageAdSlotEls.length; u++) {
                var el = pageAdSlotEls[u];
                if (!el._adCreated) {
                    // Try auto-fill with a generic ins
                    var ins = document.createElement('ins');
                    ins.className = 'adsbygoogle';
                    ins.style.display = 'block';
                    ins.setAttribute('data-ad-client', clientId);
                    ins.setAttribute('data-ad-slot', '');
                    ins.setAttribute('data-ad-format', 'auto');
                    ins.setAttribute('data-full-width-responsive', 'true');
                    el.appendChild(ins);
                    el._adCreated = true;
                    try {
                        (window.adsbygoogle = window.adsbygoogle || []).push({});
                    } catch(e) {}
                }
            }
            scheduleUnfilledCheck();
        }
        return;
    }
    
    if (!document.querySelector('script[src*="adsbygoogle"]')) {
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + clientId;
        s.crossOrigin = 'anonymous';
        document.head.appendChild(s);
    }
    
    var pendingSlots = [];
    for (var i = 0; i < adSlots.length; i++) {
        var key = adSlots[i];
        var def = slots[key];
        if (!def) continue;
        
        var anchor = document.querySelector('[data-ad-slot="' + key + '"]');
        if (!anchor) continue;
        
        if (def.height) anchor.style.minHeight = def.height;
        if (def.marginTop !== undefined) anchor.style.marginTop = def.marginTop;
        if (def.marginBottom !== undefined) anchor.style.marginBottom = def.marginBottom;
        anchor.classList.add('ad-container');
        
        pendingSlots.push({ anchor: anchor, def: def });
    }
    
    if (pendingSlots.length === 0) return;
    
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function(entries) {
            var triggered = false;
            for (var j = 0; j < entries.length; j++) {
                if (entries[j].isIntersecting) {
                    var item = entries[j].target._adData;
                    createAdIns(item.anchor, item.def, clientId);
                    observer.unobserve(entries[j].target);
                    triggered = true;
                }
            }
            if (triggered) scheduleUnfilledCheck();
        }, { rootMargin: '200px 0px' });
        
        for (var k = 0; k < pendingSlots.length; k++) {
            pendingSlots[k].anchor._adData = pendingSlots[k];
            observer.observe(pendingSlots[k]);
        }
    } else {
        for (var k = 0; k < pendingSlots.length; k++)
            createAdIns(pendingSlots[k].anchor, pendingSlots[k].def, clientId);
        scheduleUnfilledCheck();
    }
}

// Register AdSense as AdEngine provider
AdEngine.registerProvider('adsense', {
    render: function(el, config) {
        if (!config || !config.clientId || config.clientId.indexOf('XXXX') !== -1) return false;
        if (el._adCreated) return true;
        el._adCreated = true;
        var ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        ins.style.display = 'block';
        ins.setAttribute('data-ad-client', config.clientId);
        ins.setAttribute('data-ad-slot', config.id || '');
        ins.setAttribute('data-ad-format', config.format || 'auto');
        ins.setAttribute('data-full-width-responsive', 'true');
        if (config.layoutKey) ins.setAttribute('data-ad-layout-key', config.layoutKey);
        el.appendChild(ins);
        try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}
        return true;
    }
});

// Register ADX provider (placeholder — user supplies ADX code)
AdEngine.registerProvider('adx', {
    render: function(el, config) {
        // TODO: Implement ADX ad rendering when config is provided
        if (!config || !config.enabled) return false;
        return false;
    }
});

// Register MGID provider for AdEngine
AdEngine.registerProvider('mgid', {
    render: function(el, config) {
        if (!config || !config.widgetId) return false;
        if (el._adCreated) return true;
        el._adCreated = true;
        var div = document.createElement('div');
        div.setAttribute('data-type', '_mgwidget');
        div.setAttribute('data-widget-id', config.widgetId);
        el.appendChild(div);
        try { (window._mgq = window._mgq || []).push(["_mgc.load"]); } catch(e) {}
        return true;
    }
});

function createAdIns(anchor, def, clientId) {
    if (anchor._adCreated) return;
    anchor._adCreated = true;
    
    var ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', clientId);
    ins.setAttribute('data-ad-slot', def.id);
    ins.setAttribute('data-ad-format', def.format || 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    if (def.layoutKey) ins.setAttribute('data-ad-layout-key', def.layoutKey);
    
    anchor.appendChild(ins);
    anchor.classList.add('has-ad');
    
    try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch(e) {}
}

// ==========================================
// 3c. Ad Slot Init & Unfilled Detection
// ==========================================
function initAdSlots() {
    var slotEls = document.querySelectorAll('[data-ad-slot]');
    for (var i = 0; i < slotEls.length; i++) {
        var el = slotEls[i];
        // Ensure ad-slot class for styling
        if (!el.classList.contains('ad-slot')) {
            el.classList.add('ad-slot');
        }
    }
}

function checkAndHideUnfilled() {
    var slotEls = document.querySelectorAll('[data-ad-slot]');
    for (var i = 0; i < slotEls.length; i++) {
        var el = slotEls[i];
        if (el._adCreated || el.classList.contains('has-ad')) continue;
        // Check if container has child elements with content
        var hasContent = false;
        var children = el.children;
        for (var c = 0; c < children.length; c++) {
            if (children[c].offsetHeight > 0 || children[c].scrollHeight > 0) {
                hasContent = true;
                break;
            }
        }
        if (!hasContent && !el._adCreated) {
            el.classList.add('ad-hidden');
        }
    }
    // Also check ins.adsbygoogle for unfilled status
    var allIns = document.querySelectorAll('ins.adsbygoogle');
    for (var i = 0; i < allIns.length; i++) {
        if (allIns[i].getAttribute('data-ad-status') === 'unfilled') {
            var container = allIns[i].closest('[data-ad-slot]') || allIns[i].closest('.ad-container');
            if (container) {
                container.classList.add('ad-hidden');
                container.classList.remove('has-ad');
            }
        } else if (allIns[i].getAttribute('data-ad-status') === 'filled') {
            var container = allIns[i].closest('[data-ad-slot]') || allIns[i].closest('.ad-container');
            if (container) {
                container.classList.add('has-ad');
                container.classList.remove('ad-hidden');
            }
        }
    }
}

var _unfilledTimer = null;
function scheduleUnfilledCheck() {
    if (_unfilledTimer) clearTimeout(_unfilledTimer);
    _unfilledTimer = setTimeout(function() {
        checkAndHideUnfilled();
        // Check again after 5 seconds for slow-loading ads
        setTimeout(function() {
            checkAndHideUnfilled();
        }, 5000);
    }, 4000);
}
function hideUnfilledAds() {
    // Legacy function — delegate to new checkAndHideUnfilled
    checkAndHideUnfilled();
}

// ==========================================
// 4. Utilities
// ==========================================
function toggleMenu() {
    var nav = document.getElementById('navContainer');
    if (nav) nav.classList.toggle('active');
}
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.addEventListener('scroll', function() {
    var btn = document.getElementById('backToTop');
    if (btn) btn.classList.toggle('visible', window.pageYOffset > 300);
});

// ==========================================
// 5. Auto Init
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    initAdSlots();
    loadSiteConfig(function(config) {
        if (config) {
            loadMGID(config);
            loadAdSense(config);
        } else {
            // Config failed to load — hide all unconfigured ad slots
            scheduleUnfilledCheck();
        }
    });
});
