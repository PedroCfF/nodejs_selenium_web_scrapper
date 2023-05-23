import { Builder, By, until } from "selenium-webdriver";
import { Options, ServiceBuilder } from "selenium-webdriver/chrome.js";
import fs from "fs/promises";
import path from "path";

// Get the path to the chromedriver binary
const chromeDriverPath = path.join(
  process.cwd(),
  "node_modules",
  "webdriver-manager",
  "selenium",
  "chromedriver_113.0.5672.63"
);
const chromeService = new ServiceBuilder(chromeDriverPath);

export const scrape = async () => {
  // Configure the Chrome WebDriver
  const chromeOptions = new Options();
  // chromeOptions.headless();

  // Create a new WebDriver instance
  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(chromeOptions)
    .setChromeService(chromeService)
    .build();

  try {
    // Navigate to the desired website
    await driver.get("https://js.langchain.com/docs/getting-started/install");

    // Extract human-readable text content

    // Open the side bar
    let sideMenuButton = await driver.findElement(
      By.css('button[aria-label="Toggle navigation bar"]')
    );
    sideMenuButton.click();

    // Extract the URLs
    let links = await driver.findElements(
      By.css("ul.theme-doc-sidebar-menu.menu__list .menu__link[href]")
    );

    let urls = [];
    for (let link of links) {
      let url = await link.getAttribute("href");
      urls.push(url);
    }

    // Visit each URL and extract the relevant information
    let textContent = "";
    for (let url of urls) {
      await driver.get(url);
      let article = await driver.wait(
        until.elementLocated(By.css("article")),
        10000
      );
      textContent += await article.getText();
      // textContent += "\n\n"; // Add some space between articles
    }

    // Save the extracted text to a file
    await fs.writeFile("./output_docs/output.txt", textContent, "utf-8");
    console.log("Text content saved to output.txt");
  } catch (error) {
    console.error("Error while scraping:", error);
  } finally {
    // Close the WebDriver instance
    await driver.quit();
  }
};
