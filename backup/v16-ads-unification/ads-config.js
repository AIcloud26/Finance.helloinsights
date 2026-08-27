/**
 * HelloInsights — Centralized Ad Manager (ads-config.js)
 * 
 * All ad slots are defined here. Toggle enabled/disabled per slot.
 * Supports: Google AdSense, Google AdX (via AdSense SDK), MGID
 * 
 * Usage:
 *   1. Set AD_ENABLED_MASTER = true when ads are approved
 *   2. Replace placeholder IDs with real ad network IDs
 *   3. Set individual slot.enabled = true to activate
 *   4. Pages just need <div class="ad-slot" data-ad-slot="xxx"></div>
 * 
 * API:
 *   window.AdConfig.toggle('slot-id', true/false)  — Enable/disable a slot
 *   window.AdConfig.getStatus()                     — View all slot statuses
 *   window.AdConfig.renderAll()                     — Re-render all ad slots
 */
(function() {
    'use strict';

    // ========================================
    // 📢 MASTER SWITCH — Set true after ad approval
    // ========================================
    var AD_ENABLED_MASTER = true;

    // ========================================
    // 🔑 Ad Network Credentials
    // ========================================
    var ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX';
    var MGID_SITE_ID = '1109003';

    // ========================================
    // 📍 Ad Slot Definitions
    // ========================================
    var SLOTS = {

        // ──────────────────────────────────────────
        // HOMEPAGE (index) — 4 Native Widgets
        // ──────────────────────────────────────────

        // 1. Hero 下方，Featured 上方
        'native-home-top': {
            enabled: true,
            network: 'mgid',
            type: 'native',
            pages: ['index'],
            adClient: ADSENSE_CLIENT,
            adSlot: 'XXXXXXXXXX',
            format: 'auto',
            label: 'Homepage Native — below Hero, above Featured'
        },
        // 2. Featured 与 Latest 之间
        'native-home-mid': {
            enabled: true,
            network: 'mgid',
            type: 'native',
            pages: ['index'],
            adClient: ADSENSE_CLIENT,
            adSlot: 'XXXXXXXXXX',
            format: 'auto',
            label: 'Homepage Native — between Featured & Latest'
        },
        // 3. Topic Sections 之间（第3个topic后）
        'native-home-topic': {
            enabled: true,
            network: 'mgid',
            type: 'native',
            pages: ['index'],
            adClient: ADSENSE_CLIENT,
            adSlot: 'XXXXXXXXXX',
            format: 'auto',
            label: 'Homepage Native — between Topic Sections'
        },
        // 4. Most Read 上方 / footer 前
        'native-home-bottom': {
            enabled: true,
            network: 'mgid',
            type: 'native',
            pages: ['index'],
            adClient: ADSENSE_CLIENT,
            adSlot: 'XXXXXXXXXX',
            format: 'auto',
            label: 'Homepage Native — above Most Read'
        },

        // ──────────────────────────────────────────
        // CATEGORY PAGE — shares 2 slots with index
        // ──────────────────────────────────────────
        'native-cat-top': {
            enabled: true,
            network: 'mgid',
            type: 'native',
            pages: ['category'],
            adClient: ADSENSE_CLIENT,
            adSlot: 'XXXXXXXXXX',
            format: 'auto',
            label: 'Category Native — top of article list'
        },
        'native-cat-bottom': {
            enabled: true,
            network: 'mgid',
            type: 'native',
            pages: ['category'],
            adClient: ADSENSE_CLIENT,
            adSlot: 'XXXXXXXXXX',
            format: 'auto',
            label: 'Category Native — bottom of article list'
        },

        // ──────────────────────────────────────────
        // ARTICLE PAGE — 2 Native Widgets
        // ──────────────────────────────────────────

        // 1. 文章顶部，标题上方
        'article-native-top': {
            enabled: true,
            network: 'mgid',
            type: 'native',
            pages: ['article'],
            adClient: ADSENSE_CLIENT,
            adSlot: 'XXXXXXXXXX',
            format: 'auto',
            label: 'Article Native — above article header'
        },
        // 2. 正文结束后，Related Articles 之前
        'article-native-bottom': {
            enabled: true,
            network: 'mgid',
            type: 'native',
            pages: ['article'],
            adClient: ADSENSE_CLIENT,
            adSlot: 'XXXXXXXXXX',
            format: 'auto',
            label: 'Article Native — before Related Articles'
        },

        // ──────────────────────────────────────────
        // DISABLED — future use
        // ──────────────────────────────────────────
        'anchor': {
            enabled: false,
            network: 'mgid',
            type: 'anchor',
            pages: ['index', 'category', 'article'],
            label: 'Bottom Floating Anchor'
        },
        'interstitial': {
            enabled: false,
            network: 'mgid',
            type: 'interstitial',
            pages: ['index', 'article', 'category'],
            label: 'Page Turn Interstitial'
        }
    };

    // ========================================
    // 🔧 MGID Widget Configuration
    // Each slot → independent Widget ID.
    //
    // HOW TO GET WIDGET IDs:
    //   1. Log in: https://dashboard.mgid.com
    //   2. Site (ID: 1104797) → Widgets
    //   3. Create one Native Widget per position
    //   4. Copy numeric ID → replace placeholders below
    //
    // TIP: Use separate widgets per position so
    //   MGID can optimize ad quality per placement
    //   and you can track revenue per slot.
    // ========================================
    var MGID_WIDGETS = {
        // Homepage (4 widgets)
        'native-home-top':    '2074005',
        'native-home-mid':    '2074006',
        'native-home-topic':  '',
        'native-home-bottom': '2074009',

        // Category page
        // 2074103 is managed directly in category.html
        // using MGID's official Header Widget code.
        'native-cat-top':     '',
        'native-cat-bottom':  '',

        // Article page (2 widgets)
        'article-native-top':    '2074007',
        'article-native-bottom': ''
    };

    // ========================================
    // Detect Current Page
    // ========================================
    function getCurrentPage() {
        var path = location.pathname.replace(/\/+$/, '');

        if (path.indexOf('/article') !== -1 || path.endsWith('article.html')) {
            return 'article';
        }

        var categoryIds = [
            'personal-finance',
            'investing',
            'markets',
            'banking',
            'fintech',
            'economy',
            'money-management'
        ];

        var lastSegment = path.split('/').pop();

        if (categoryIds.indexOf(lastSegment) !== -1 || lastSegment === 'category.html') {
            return 'category';
        }

        return 'index';
    }

    // ========================================
    // Load AdSense SDK
    // ========================================
    var _sdkLoaded = false;
    function loadAdSenseSDK() {
        if (_sdkLoaded) return;
        if (ADSENSE_CLIENT.indexOf('XXXX') !== -1) return;
        _sdkLoaded = true;
        var sdk = document.createElement('script');
        sdk.async = true;
        sdk.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADSENSE_CLIENT;
        sdk.crossOrigin = 'anonymous';
        document.head.appendChild(sdk);
    }

    // ========================================
    // Render All Ad Slots
    // ========================================
    function renderAll() {
        var page = getCurrentPage();
        var containers = document.querySelectorAll('[data-ad-slot]');
        for (var i = 0; i < containers.length; i++) {
            var el = containers[i];
            var slotKey = el.getAttribute('data-ad-slot');
            var slot = SLOTS[slotKey];
            if (!slot) {
                el.style.display = 'none';
                continue;
            }
            if (slot.pages.indexOf(page) === -1) {
                el.style.display = 'none';
                continue;
            }
            if (!AD_ENABLED_MASTER || !slot.enabled) {
                el.style.display = 'none';
                el.setAttribute('data-ad-disabled', 'true');
                continue;
            }
            if (slot.network === 'adsense' || slot.network === 'adx') {
                renderAdSenseSlot(el, slot);
            }
        }
        renderMGIDWidgets(page);
    }

    function renderAdSenseSlot(el, slot) {
        if (el.getAttribute('data-ad-rendered') === 'true') return;
        el.setAttribute('data-ad-rendered', 'true');
        loadAdSenseSDK();
        var ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        ins.style.cssText = 'display:block';
        ins.setAttribute('data-ad-client', slot.adClient);
        ins.setAttribute('data-ad-slot', slot.adSlot);
        ins.setAttribute('data-ad-format', slot.format || 'auto');
        ins.setAttribute('data-full-width-responsive', 'true');
        el.appendChild(ins);
        try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    }

    // ========================================
    // Render MGID Widgets
    // ========================================
    function renderMGIDWidgets(page) {
        if (!MGID_SITE_ID || MGID_SITE_ID.indexOf('XXXX') !== -1) return;

        var hasWidgets = false;
        for (var id in MGID_WIDGETS) {
            if (!MGID_WIDGETS.hasOwnProperty(id) || !MGID_WIDGETS[id]) continue;
            hasWidgets = true; break;
        }
        if (!hasWidgets) return;

        if (!document.querySelector('script[src*="jsc.mgid.com"]')) {
            var s = document.createElement('script');
            s.src = 'https://jsc.mgid.com/site/' + MGID_SITE_ID + '.js';
            s.async = true;
            document.head.appendChild(s);
        }

        for (var slotId in MGID_WIDGETS) {
            if (!MGID_WIDGETS.hasOwnProperty(slotId) || !MGID_WIDGETS[slotId]) continue;
            var slot = SLOTS[slotId];
            if (!slot || !AD_ENABLED_MASTER || !slot.enabled) continue;
            if (slot.pages.indexOf(page) === -1) continue;

            var el = document.querySelector('[data-ad-slot="' + slotId + '"]');
            if (!el) continue;
            el.style.display = '';
            if (el.querySelector('[data-type="_mgwidget"]')) continue;

            var div = document.createElement('div');
            div.setAttribute('data-type', '_mgwidget');
            div.setAttribute('data-widget-id', MGID_WIDGETS[slotId]);
            el.appendChild(div);
        }

        try { (window._mgq = window._mgq || []).push(["_mgc.load"]); } catch(e) {}
    }

    // ========================================
    // Fill Detection
    // ========================================
    function checkFill() {
        var containers = document.querySelectorAll('[data-ad-slot]');
        for (var i = 0; i < containers.length; i++) {
            var el = containers[i];
            if (el.getAttribute('data-ad-disabled') === 'true') continue;

            var iframe = el.querySelector('iframe');
            var ins = el.querySelector('ins.adsbygoogle');
            var hasSize = false;
            if (ins) { var rect = ins.getBoundingClientRect(); hasSize = rect.height > 10; }
            var hasMGID = el.querySelector('[data-type="_mgwidget"]');
            var mgidIframe = hasMGID ? hasMGID.querySelector('iframe') : null;

            if (iframe || hasSize || (hasMGID && mgidIframe)) {
                el.classList.add('ad-visible');
                el.classList.remove('ad-hidden');
                el.style.display = '';
            } else if (hasMGID && !mgidIframe) {
                el.style.display = '';
                try { (window._mgq = window._mgq || []).push(["_mgc.load"]); } catch(e) {}
            } else {
                el.style.display = 'none';
                el.classList.add('ad-hidden');
                el.classList.remove('ad-visible');
            }
        }
    }

    // ========================================
    // Public API
    // ========================================
    window.AdConfig = {
        toggle: function(slotId, enabled) {
            if (SLOTS[slotId]) {
                SLOTS[slotId].enabled = !!enabled;
                console.log('[AdConfig] ' + slotId + ' → ' + (enabled ? 'ON' : 'OFF'));
                renderAll();
                setTimeout(checkFill, 2000);
            } else {
                console.warn('[AdConfig] Slot not found: ' + slotId);
            }
        },
        getStatus: function() {
            var status = {};
            for (var key in SLOTS) {
                if (!SLOTS.hasOwnProperty(key)) continue;
                status[key] = { enabled: SLOTS[key].enabled, network: SLOTS[key].network, type: SLOTS[key].type, pages: SLOTS[key].pages, label: SLOTS[key].label };
            }
            status._master = AD_ENABLED_MASTER;
            return status;
        },
        enableAll: function() {
            for (var key in SLOTS) { if (SLOTS.hasOwnProperty(key)) SLOTS[key].enabled = true; }
            renderAll(); setTimeout(checkFill, 2000);
        },
        disableAll: function() {
            for (var key in SLOTS) { if (SLOTS.hasOwnProperty(key)) SLOTS[key].enabled = false; }
            renderAll();
        },
        renderAll: renderAll
    };

    // ========================================
    // Auto Init
    // ========================================
    function init() {
        renderAll();
        setTimeout(checkFill, 1500);
        setTimeout(checkFill, 4000);
        setTimeout(checkFill, 8000);
        setTimeout(checkFill, 15000);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('[AdConfig] Loaded. Master: ' + (AD_ENABLED_MASTER ? 'ON' : 'OFF'));
    console.log('[AdConfig] MGID Site ID: ' + MGID_SITE_ID);
    console.log('[AdConfig] Slots: ' + Object.keys(SLOTS).length + ' | MGID Widgets: ' + Object.keys(MGID_WIDGETS).length);
    console.log('[AdConfig] Use window.AdConfig.getStatus() to view slots');
})();


/* ads.js */
(function(){
    var style=document.createElement('style');
    style.textContent='div[data-ad-slot]{height:auto !important;min-height:0;overflow:visible !important;transition:none}';
    document.head.appendChild(style);
    function initAds(){
        document.querySelectorAll('div[data-ad-slot]').forEach(function(s){
            if(s.dataset.adInit)return;
            s.dataset.adInit='1';
            new MutationObserver(function(){
                if(s.querySelector('iframe')){
                    s.style.height='auto';
                    s.style.overflow='visible';
                }
            }).observe(s,{childList:true,subtree:true});
        });
        document.querySelectorAll('ins.adsbygoogle:not([data-pushed])').forEach(function(ins){
            ins.setAttribute('data-pushed','1');
            (adsbygoogle=window.adsbygoogle||[]).push({});
        });
    }
    if(document.readyState==='loading'){
        document.addEventListener('DOMContentLoaded',initAds);
    }else{
        initAds();
    }
})();
