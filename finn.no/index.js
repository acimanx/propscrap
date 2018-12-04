'use strict';

const puppeteer = require('puppeteer');
const scraper = require('./scraper');

try {
    (async () => {
        let searches = [
            'https://www.finn.no/realestate/homes/search.html'
            // 'https://www.finn.no/realestate/newbuildings/search.html',
            // 'https://www.finn.no/realestate/lettings/search.html',
        ];

        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1280x800'
            ]
        });

        let results = await scraper.scrape(browser, searches);
        console.dir(results, { depth: null, colors: true });

        await browser.close();
    })();
} catch (err) {
    console.error(err);
}
