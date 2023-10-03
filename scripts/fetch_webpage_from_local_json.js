const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const puppeteer = require("puppeteer");

// URL of the main sitemap/

// Read from a JSON file which is a sitemap
// and consider a TARGET ELEMENT SELECTOR
// to extract the text from the target element
// and save it to a JSON file
// Using puppeteer to render the page so this is bit slow and robust
async function main(file_to_read, targetElementSelector, file_to_write) {
  const json = JSON.parse(
    fs.readFileSync(path.join(__dirname, file_to_read), "utf-8")
  );
  console.log(json);

  const to_write = [];

  for await (const url of json) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector(targetElementSelector);
    const htmlContent = await page.content();
    await browser.close();

    // console.log({ htmlContent });
    const $ = cheerio.load(htmlContent);

    // Getting the text from the target element
    const targetElement = $(targetElementSelector);

    // JUST REMOVING link, script and h1 tags
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
}

(() => {
  try {
    // file_to_read is a JSON file in this format:
    // const file_to_read_json = [
    //   "https://www.example.com/driving-licence/fastag-balance-check.html",
    //   "https://www.example.com/driving-licence/driving-licence-apply-online.html",
    // ];
    const file_to_read = "abc-driving-licence.json";
    const targetElementSelector = "div#target";
    const file_to_write = "abc-driving-licence-content.json";
    main(file_to_read, targetElementSelector, file_to_write);
  } catch (e) {
    console.log(e);
  }
})();
