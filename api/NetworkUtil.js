const puppeteer = require('puppeteer');
const axios = require('axios');
const {
    json
} = require('express');

class NetworkUtil {
    constructor() {
        this.dlsite = '';
        this.browser = null;
        this.page = null;
    }

    async initialize(code, request) {
        this.dlsite = `https://www.dlsite.com/maniax/work/=/product_id/${code}.html/?locale=en_US`;

        this.browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            devtools: true,
            args: ["--windows-size=375,887", '--windows-position=0,0']
        });

        this.page = await this.browser.newPage();

        await this.page.goto(this.dlsite);

        let data;

        switch (request) {
            case "img":
                data = await this.processImages();
                break;
            case "name":
                data = await this.processName();
                break;
            case "tags":
                data = await this.processTags();
                break;
            case "all-in-one":
                data = await this.processAllInOne();
                break;
            default:
                data = JSON.stringify({
                    code: false,
                    message: "Invalid query searched."
                })
                console.log(data);
                break;
        }

        await this.browser.close();
        return data;
    }

    async processImages() {
        const imageLinks = await this.page.evaluate(() => {
            const images = Array.from(document.querySelectorAll("li.slider_item.active picture img"));

            const imageLink = images[0].getAttribute("srcset").split(",")[0].trim();
            return imageLink;
        });

        return {
            code: true,
            response: {
                image: imageLinks
            }
        };
    }

    async processName() {
        const nameAttributes = await this.page.evaluate(() => {
            const name = Array.from(document.querySelectorAll("li.slider_item.active picture img"));

            const nameAttribute = name[0].getAttribute("alt");
            return nameAttribute;
        });

        return {
            code: true,
            response: {
                name: nameAttributes
            }
        };
    }

    async processTags() {
        const tags = await this.page.evaluate(() => {
            const tagElements = Array.from(document.querySelectorAll("div.main_genre a"));
            return tagElements.map(tag => tag.textContent);
        });

        return {
            code: true,
            response: {
                tags: tags
            }
        };
    }

    async processAllInOne() {
        const imageAttributes = await this.processImages();
        const nameAttributes = await this.processName();
        const tags = await this.processTags();

        const result = {
            code: true,
            response: {
                image: imageAttributes.response.image,
                name: nameAttributes.response.name,
                tags: tags.response.tags
            }
        };

        return result;
    }


}

module.exports = NetworkUtil;

// const networkUtil = new NetworkUtil();
// networkUtil.initialize('RJ361927', 'tags');