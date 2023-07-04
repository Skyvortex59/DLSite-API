const puppeteer = require('puppeteer');
const { exec } = require('child_process');
const axios = require('axios')

class NetworkUtil {
    constructor() {
        this.dlsite = '';
        this.browser = null;
        this.page = null;
    }

    async initialize(code, treatment) {
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

        switch (treatment) {
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
                console.log("Invalid treatment");
                break;
        }

        await this.sendDataToServer(data);

        await this.browser.close();
    }

    async processImages() {
        const searchResultSelector = 'li.btn_yes';
        await this.page.waitForSelector(searchResultSelector);
        await this.page.click(searchResultSelector);

        const imageAttributes = await this.page.evaluate(() => {
            const images = Array.from(document.querySelectorAll("li.slider_item.active picture img"));

            return images.map(img => {
                return {
                    srcset: img.getAttribute("srcset"),
                };
            });
        });

        return imageAttributes;
    }

    async processName() {
        const searchResultSelector = 'li.btn_yes';
        await this.page.waitForSelector(searchResultSelector);
        await this.page.click(searchResultSelector);

        const nameAttributes = await this.page.evaluate(() => {
            const name = Array.from(document.querySelectorAll("li.slider_item.active picture img"));

            return name.map(name => {
                return {
                    alt: name.getAttribute("alt")
                };
            });
        });

        return nameAttributes;
    }

    async processTags() {
        const tags = await this.page.evaluate(() => {
            const tagElements = Array.from(document.querySelectorAll("div.main_genre a"));
            return tagElements.map(tag => tag.textContent);
        });

        return tags;
    }

    async processAllInOne() {
        const searchResultSelector = 'li.btn_yes';
        await this.page.waitForSelector(searchResultSelector);
        await this.page.click(searchResultSelector);

        const imageAttributes = await this.processImages();
        const nameAttributes = await this.processName();
        const tags = await this.processTags();

        const result = {
            name: nameAttributes[0].alt,
            image: imageAttributes[0].srcset,
            tags: tags
        };

        return result;
    }

    #convertToJson(data) {
        try {
            return JSON.stringify(data);
        } catch (error) {
            console.error('Erreur lors de la conversion en JSON :', error);
            return null;
        }
    }

    async sendDataToServer(data) {
        const jsonData = this.#convertToJson(data);

        if (!jsonData) {
            console.log("Error converting data to JSON");
            return;
        }

        try {
            const response = await axios.post('http://localhost:80/API_php/api/dlsite/', jsonData); //localhost/API_php/api/data/
            console.log("Data sent to server:", response.data);
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
    }
}

module.exports = NetworkUtil;

// const networkUtil = new NetworkUtil();
// networkUtil.initialize('RJ361927', 'tags');