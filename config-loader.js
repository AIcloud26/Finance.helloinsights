// HelloInsights — Unified Config & Ad Manager v4
// Supports: AdSense / MGID / ADX multi-provider ad system
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
// 2. Ad Manager — Unified Multi-Provider Ad System
// ==========================================
var AdManager = {
    providers: {},
    config: null,
    
    // Register a provider (adsense / mgid / adx)
    registerProvider: function(name, provider) {
        this.providers[name] = provider;
    },
    
    // Initialize from config.json
    init: function(config) {
        this.config = config;
        var providerSwitches = config.adProviders || {};
        var page = this._getPage();
        var assignments = (config.slotAssignment || {})[page] || {};
        
        // Collect all ad slot elements on this page
        var slotEls = document.querySelectorAll('[data-ad-slot]');
        for (var i = 0; i < slotEls.length; i++) {
            var el = slotEls[i];
            if (!el.classList.contains('ad-slot')) el.classList.add('ad-slot');
            
            var slotName = el.getAttribute('data-ad-slot');
            var providerName = assignments[slotName];
            
            if (!providerName) {
                // No assignment → hide this slot
                el.classList.add('ad-hidden');
                continue;
            }
            
            // Check if provider is enabled
            var providerSwitch = providerSwitches[providerName];
            if (!providerSwitch || !providerSwitch.enabled) {
                el.classList.add('ad-hidden');
                continue;
            }
            
            // Get provider config
            var providerConfig = config[providerName] || {};
            var slotConfig = (providerConfig.slots || {})[slotName] || {};
            slotConfig._slotName = slotName;
            
            // Try to render with the assigned provider
            var provider = this.providers[providerName];
            if (provider && typeof provider.render === 'function') {
                if (provider.render(el, slotConfig)) {
                    el.classList.add('has-ad');
                    el.classList.remove('ad-hidden');
                } else {
                    el.classList.add('ad-hidden');
                }
            } else {
                el.classList.add('ad-hidden');
            }
        }
        
        // Schedule unfilled check
        this._scheduleCheck();
    },
    
    _getPage: function() {
        var path = location.pathname.split('/').pop();
        return path || 'index.html';
    },
    
    _scheduleCheck: function() {
        setTimeout(function() { AdManager._checkUnfilled(); }, 3000);
        setTimeout(function() { AdManager._checkUnfilled(); }, 8000);
    },
    
    _checkUnfilled: function() {
        var allIns = document.querySelectorAll('ins.adsbygoogle');
        for (var i = 0; i < allIns.length; i++) {
            var status = allIns[i].getAttribute('data-ad-status');
            if (status === 'unfilled') {
                var container = allIns[i].closest('[data-ad-slot]');
                if (container) {
                    container.classList.add('ad-hidden');
                    container.classList.remove('has-ad');
                }
            } else if (status === 'filled') {
                var container = allIns[i].closest('[data-ad-slot]');
                if (container) {
                    container.classList.add('has-ad');
                    container.classList.remove('ad-hidden');
                }
            }
        }
    }
};

// ==========================================
// 3. Provider: AdSense
// ==========================================
AdManager.registerProvider('adsense', {
    render: function(el, config) {
        var clientId = config.clientId || (AdManager.config && AdManager.config.adsense && AdManager.config.adsense.clientId);
        if (!clientId || clientId.indexOf('XXXX') !== -1) return false;
        
        // Load AdSense script if not yet loaded
        if (!document.querySelector('script[src*="adsbygoogle"]')) {
            var s = document.createElement('script');
            s.async = true;
            s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + clientId;
            s.crossOrigin = 'anonymous';
            document.head.appendChild(s);
        }
        
        if (el._adCreated) return true;
        el._adCreated = true;
        
        var ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        ins.style.display = 'block';
        ins.setAttribute('data-ad-client', clientId);
        ins.setAttribute('data-ad-slot', config.id || '');
        ins.setAttribute('data-ad-format', config.format || 'auto');
        ins.setAttribute('data-full-width-responsive', 'true');
        if (config.layoutKey) ins.setAttribute('data-ad-layout-key', config.layoutKey);
        
        el.appendChild(ins);
        el.classList.add('ad-container');
        
        try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}
        return true;
    }
});

// ==========================================
// 4. Provider: MGID
// ==========================================
AdManager.registerProvider('mgid', {
    render: function(el, config) {
        if (!config || !config.widgetId) return false;
        var siteId = config.siteId || (AdManager.config && AdManager.config.mgid && AdManager.config.mgid.siteId);
        if (!siteId) return false;
        
        // Load MGID script if not yet loaded
        if (!document.querySelector('script[src*="jsc.mgid.com"]')) {
            var s = document.createElement('script');
            s.src = 'https://jsc.mgid.com/site/' + siteId + '.js';
            s.async = true;
            document.head.appendChild(s);
        }
        
        if (el._adCreated) return true;
        el._adCreated = true;
        
        var div = document.createElement('div');
        div.setAttribute('data-type', '_mgwidget');
        div.setAttribute('data-widget-id', config.widgetId);
        el.appendChild(div);
        el.classList.add('ad-container');
        
        try { (window._mgq = window._mgq || []).push(["_mgc.load"]); } catch(e) {}
        return true;
    }
});

// ==========================================
// 5. Provider: ADX (placeholder — user supplies ad code)
// ==========================================
AdManager.registerProvider('adx', {
    render: function(el, config) {
        if (!config || !config.enabled) return false;
        // TODO: When ADX is ready, implement ad tag rendering here
        // Example: load ad tag script, create iframe, etc.
        return false;
    }
});

// ==========================================
// 6. Utilities
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
// 7. Auto Init
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    loadSiteConfig(function(config) {
        if (config) {
            AdManager.init(config);
        }
    });
});
