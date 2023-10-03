const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

async function main(sitemap_url, file_to_write) {
  // Fetch the main sitemap XML
  const response = await axios.get(sitemap_url);
  const xmlcontent = response.data;

  const $ = cheerio.load(xmlcontent, {
    xmlMode: true,
  });

  // Find all <loc> elements and extract URLs
  const urls = $("loc")
    .map((_, elem) => $(elem).text())
    .get();
  console.log({ urls });

  fs.writeFileSync(path.join(__dirname, file_to_write), JSON.stringify(urls));
}

(async () => {
  try {
    // URL of the main sitemap XML
    // Example
    // const sitemap_url =
    //   "https://abc.com/driving-licence-sitemap.xml";
    // const file_to_write = "abc-driving-licence.json";

    const sitemap_url = "";
    const file_to_write = "";
    await main(sitemap_url, file_to_write);
  } catch (e) {
    console.log(e);
  }
})();
