'use strict';

const fs = require('fs');

module.exports = {
    scrape
};

const sleep = seconds => new Promise(resolve => setTimeout(resolve, (seconds || 1) * 1000));

async function scrape(browser, searches) {
    const page = await browser.newPage();

    for (let searchPage of searches) {
        await page.goto(searchPage);

        const objects = [];

        let linkCollection = await page.evaluate(() => {
            let data = [];
            let containers = document.querySelectorAll('#page-results .result-item a');
            containers.forEach(container => {
                let objData = {
                    link: '',
                    image: '',
                    place: '',
                    price: '',
                    size: '',
                    expandedInfo: []
                };

                objData.link = container.href;
                objData.image = container.querySelector('img').src;
                objData.place = container.querySelector('div.licorice.valign-middle').innerText;
                objData.description = container.querySelector('h3.result-item-heading').innerText;
                if (container.querySelector('p').innerText.includes('m²')) {
                    objData.size = container.querySelector('p').innerText.split(' m²')[0];
                    objData.price = container.querySelector('p').innerText.split(' m² ')[1];
                }

                data.push(objData);
            });
            return data;
        });
        objects.push(...linkCollection);

        for (let object of objects) {
            await page.goto(object.link);
            await sleep(1);
            let html = await page.evaluate(() => {
                let data = {
                    price: [],
                    place: {}
                };
                let spans = document.querySelectorAll('span');
                spans.forEach(({ innerText, nextElementSibling }) => {
                    if (innerText === 'Prisantydning') {
                        data.price.push({ Estimated: nextElementSibling.innerText });
                    }
                    if (innerText === 'Pris') {
                        data.price.push({ Price: nextElementSibling.innerText });
                    }
                });
                let p = document.querySelectorAll('p');
                p.forEach(({ className, innerText }) => {
                    if (className === 'u-caption') {
                        data.place = innerText;
                    }
                });
                let dt = document.querySelectorAll('dt');
                dt.forEach(({ innerText, nextElementSibling }) => {
                    if (innerText === 'Fellesgjeld') {
                        data.price.push({ Debt: nextElementSibling.innerText });
                    }
                    if (innerText === 'Pris med fellesgjeld') {
                        data.price.push({ PriceWithDebt: nextElementSibling.innerText });
                    }
                    if (innerText === 'Felleskost/mnd.') {
                        data.price.push({ DebtMonthly: nextElementSibling.innerText });
                    }
                    if (innerText === 'Kommunale avg.') {
                        data.price.push({ MunicipalTax: nextElementSibling.innerText });
                    }
                    if (innerText === 'Boligtype.') {
                        data.propertyType = nextElementSibling.innerText;
                    }
                    if (innerText === 'Eieform') {
                        data.ownership = nextElementSibling.innerText;
                    }
                    if (innerText === 'Energimerking') {
                        data.energyType = nextElementSibling.innerText;
                    }
                    if (innerText === 'Etasje') {
                        data.floor = nextElementSibling.innerText;
                    }
                    if (innerText === 'Rom') {
                        data.rooms = nextElementSibling.innerText;
                    }
                    if (innerText === 'Soverom') {
                        data.bedrooms = nextElementSibling.innerText;
                    }
                    if (innerText === 'Byggeår') {
                        data.year = nextElementSibling.innerText;
                    }
                    if (innerText === 'Renovert år') {
                        data.yearRenovated = nextElementSibling.innerText;
                    }
                    if (innerText === 'Formuesverdi') {
                        data.assetValue = nextElementSibling.innerText;
                    }
                    if (innerText === 'Primærrom') {
                        data.primaryRoomsSpace = nextElementSibling.innerText;
                    }
                    if (innerText === 'Bruksareal') {
                        data.livableSpace = nextElementSibling.innerText;
                    }
                    if (innerText === 'Tomteareal') {
                        data.plotSpace = nextElementSibling.innerText;
                    }
                    if (innerText === 'Bruttoareal') {
                        data.plotSpace = nextElementSibling.innerText;
                    }
                    if (innerText === 'Verditakst') {
                        data.valuePriceTag = nextElementSibling.innerText;
                    }
                });

                return data;
            });
            object.expandedInfo.push(html);
        }

        fs.writeFile('./file.json', JSON.stringify(objects, 0, 4), err => {
            if (err) {
                return console.log(err);
            }

            console.log('The file was saved!');
        });
    }
}
