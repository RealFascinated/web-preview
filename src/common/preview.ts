import puppeteer, { Browser } from "puppeteer";
import { formatDuration } from "./utils";

/**
 * The browser instance to use for preview images
 */
let browser: Browser | null = null;

/**
 * The idle timer to use for preview images
 */
let idleTimer: Timer | null = null;
const IDLE_TIMEOUT = 60000; // 1 minute idle timeout

/**
 * Get the browser instance
 *
 * @returns The browser instance
 */
async function getBrowser() {
  if (!browser) {
    const before = performance.now();
    console.log("Launching browser instance");
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      timeout: 30000, // 30 seconds timeout for browser launch
    });
    console.log(`Browser instance launched in ${formatDuration(performance.now() - before)}`);
    startIdleTimer(); // Start the idle timer when the browser is launched
  }
  return browser;
}

/**
 * Start the idle timer
 */
function startIdleTimer() {
  // Clear any existing timer
  if (idleTimer) {
    clearTimeout(idleTimer);
  }

  // Set a new timer to close the browser after the idle timeout
  idleTimer = setTimeout(async () => {
    if (browser) {
      await browser.close();
      browser = null; // Reset the browser instance
      console.log("Browser instance closed due to inactivity.");
    }
  }, IDLE_TIMEOUT);
}

/**
 * Get a new page from the browser instance
 *
 * @returns The new page
 */
async function getPage() {
  const browser = await getBrowser();
  return await browser.newPage();
}

/**
 * Get a screenshot of a page
 *
 * @param url - The URL to screenshot
 * @param width - The width of the screenshot
 * @param height - The height of the screenshot
 * @param idleTime - The idle time to wait for the network to be idle
 * @returns The screenshot
 */
export async function getScreenshot(url: string, width: number, height: number, idleTime: number) {
  console.log(
    `Generating screenshot for ${url} (width: ${width}, height: ${height}, idleTime: ${idleTime})`
  );

  try {
    const page = await getPage();
    await page.setViewport({ width, height });

    // Set navigation timeout
    await page.setDefaultNavigationTimeout(30000);
    await page.setDefaultTimeout(30000);

    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Use setTimeout instead of waitForTimeout
    await new Promise(resolve => setTimeout(resolve, idleTime));

    const screenshot = await page.screenshot();
    await page.close(); // Close just the page, not the browser

    // Reset the idle timer since we just used the browser
    startIdleTimer();

    return screenshot;
  } catch (error) {
    console.error(`Error generating screenshot for ${url}:`, error);
    throw error;
  }
}
