import { Builder, By, until } from 'selenium-webdriver';
import { Options, ServiceBuilder } from 'selenium-webdriver/chrome.js';
import fs from 'fs/promises';
import path from 'path';

// Get the path to the chromedriver binary
const chromeDriverPath = path.join(process.cwd(), 'node_modules', 'webdriver-manager', 'selenium', 'chromedriver_113.0.5672.63');
const chromeService = new ServiceBuilder(chromeDriverPath);

const scrape = async () => {
  // Configure the Chrome WebDriver
  const chromeOptions = new Options();
  chromeOptions.headless();

  // Create a new WebDriver instance
  const driver = await new Builder()
  .forBrowser('chrome')
  .setChromeOptions(chromeOptions)
  .setChromeService(chromeService)  
  .build();

  try {
    // Navigate to the desired website
    await driver.get('https://www.tomsguide.com/reviews/google-pixel-6a/');

    // Extract human-readable text content
    const paragraphs = await driver.findElements(By.css('p'));
    let textContent = '';
    
    for (let paragraph of paragraphs) {
      textContent += await paragraph.getText() + '\n\n';
    }

    // Save the extracted text to a file
    await fs.writeFile('./output_docs/output.txt', textContent, 'utf-8');
    console.log('Text content saved to output.txt');
  } catch (error) {
    console.error('Error while scraping:', error);
  } finally {
    // Close the WebDriver instance
    await driver.quit();
  }
};

await scrape();