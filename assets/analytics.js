(function () {
    'use strict';

    const GA_ID = 'G-R644YGK0Q5';

    if (!/^G-[A-Z0-9]+$/i.test(GA_ID)) {
        console.warn('[GA4] Invalid Measurement ID.');
        return;
    }

    if (window.__FINANCE_GA4_LOADED__) {
        return;
    }

    window.__FINANCE_GA4_LOADED__ = true;

    window.dataLayer = window.dataLayer || [];

    window.gtag = window.gtag || function () {
        window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());

    window.gtag('config', GA_ID, {
        send_page_view: true
    });

    const script = document.createElement('script');

    script.async = true;

    script.src =
        'https://www.googletagmanager.com/gtag/js?id=' +
        encodeURIComponent(GA_ID);

    script.onload = function () {
        console.log('[GA4] Finance loaded:', GA_ID);
    };

    script.onerror = function () {
        console.error('[GA4] Failed to load Google Analytics.');
    };

    document.head.appendChild(script);

})();
