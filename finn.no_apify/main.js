'use strict'

const Apify = require('apify');
const { PseudoUrl } = Apify;
const { sleep } = Apify.utils;
const { enqueueLinks } = Apify.utils.puppeteer;

Apify.main(async () => {
    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest(new Apify.Request({ url: 'https://www.finn.no/realestate/homes/search.html' }));
    const pseudoUrls = [new Apify.PseudoUrl('https://www.finn.no/realestate/homes/ad.html?finnkode=[.*]')];

    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,
        launchPuppeteerOptions: {
            headless: true, ApifyProxy: false
        },

        handlePageFunction: async ({ page, request }) => {
            console.log(`Start processing ${request.url}!`);

            await sleep(Math.floor((Math.random() * 5000) + 100))

            const description = await page.$$eval('#collapsableTextContent > div > p', els => els.map(el => el.innerText.replace(/(\\n)/g, '')));

            const adress = await page.$$eval('p.u-caption', els => els.map(el => el.innerText));

            const city = adress ? adress[0].split(/\s+/).pop() : null

            const coordinates = await page.$$eval('a[data-controller] img', els => els.map(el => el.src.match(/([-+]?(([1-8]?\d(\.\d+))+|90))/g)));

            const lat = coordinates ? coordinates[0] : null

            const lng = coordinates ? coordinates[1] : null

            const value = await page.$$eval('span.u-strong.u-display-block', els => els.map(el => el.nextElementSibling.innerText.replace(/[^\w \xC0-\xFF]/g, '')));
            const images = await page.$$eval('div[data-carousel-container] img', els => els.map(el => {
                if (el.src == '') {
                    return el.dataset.src
                } else {
                    return el.src
                }

            }));

            // Save data.
            await Apify.pushData({
                link: request.url,
                title: await page.title(),
                description,
                location: {
                    country: "Norway",
                    city,
                    adress
                },
                coordinates: {
                    lat, lng
                },
                price: {
                    value,
                    currency: 'NOK'
                },
                images,

            });

            // Enqueue next page.
            const selector = 'a'
            const enqueueResults = await enqueueLinks({ page, selector, requestQueue, pseudoUrls })
            const newRequests = enqueueResults.filter((result) => (!result.wasAlreadyPresent));
            if (newRequests.length) console.log(`${request.url}: Added ${newRequests.length} urls to queue.`);


        },

        // If request failed 4 times then this function is executed.
        handleFailedRequestFunction: async ({ request, error }) => {
            console.log(`Request ${request.url} failed too many times`);
            await Apify.pushData({
                url: request.url,
                isLoaded: false,
                errorMessage: error.message,
            });
        },
        maxRequestsPerCrawl: 1,
        maxConcurrency: 10,
    });

    await crawler.run();


});
