const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const puppeteer = require("puppeteer");

// Read from an XML file which is a sitemap
// and consider a TARGET ELEMENT SELECTOR
// to extract the text from the target element
// and save it to a JSON file
// Using puppeteer to render the page so this is bit slow and robust
async function main(file_to_read, targetElementSelector, file_to_write) {
  const response = await axios.get(file_to_read);
  const xmlcontent = response.data;

  const $ = cheerio.load(xmlcontent, {
    xmlMode: true,
  });

  const urls = $("loc")
    .map((_, elem) => $(elem).text())
    .get();

  const to_write = [];

  for await (const url of urls) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector(targetElementSelector);
    const htmlContent = await page.content();
    await browser.close();

    const $ = cheerio.load(htmlContent);

    const targetElement = $(targetElementSelector);

    targetElement.find("a").remove();
    targetElement.find("script").remove();
    targetElement.find("h1").remove();

    const content = targetElement.text();

    to_write.push({
      url,
      content,
    });

    console.log("Fetched :", url);
  }

  fs.writeFileSync(
    path.join(__dirname, file_to_write),
    JSON.stringify(to_write)
  );
}

(() => {
  try {
    // URL of the main sitemap XML
    const file_to_read = "https://www.example.com/sitemap.xml";
    const targetElementSelector = "div#target";
    const file_to_write = "abc-driving-licence-content.json";
    main(file_to_read, targetElementSelector, file_to_write);
  } catch (e) {
    console.log(e);
  }
})();
