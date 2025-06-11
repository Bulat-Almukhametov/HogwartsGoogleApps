const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { exit } = require('process');

const fileName = process.argv[2];
const queryParams = process.argv[3];

if (!fileName) {
  console.error('Please provide a file name as the first argument.');
}

if (!queryParams) {
  console.error('Please provide query parameters as the second argument.');
}

if (!fileName || !queryParams) {
  console.error('Usage: node generate-graph-image.js <fileName> <queryParams>');
  exit(1);
}

generateNxGraphImage();

async function generateNxGraphImage() {
  const outputPath = `docs/images/${fileName}`; // Where you want to save the image
  const htmlPath = 'dist/generated-graph/index.html'; // Path to your generated Nx graph HTML

  // Ensure the output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let browser;
  try {
    // 1. Generate the Nx graph HTML first (Nx CLI command)
    console.log('Generating Nx graph HTML...');
    const { execSync } = require('child_process');
    execSync(`npx nx graph --file=${htmlPath}`, { stdio: 'inherit' });
    console.log('Nx graph HTML generated.');

    // 2. Launch a headless Chromium browser
    browser = await puppeteer.launch({
      headless: true, // Run in headless mode (no visible browser window)
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Recommended for CI environments
    });
    const page = await browser.newPage();

    // Set a suitable viewport size for the screenshot
    await page.setViewport({ width: 1920, height: 1080 }); // Adjust as needed

    // 3. Open the generated Nx graph HTML file
    const fileUrl = `file://${path.resolve(htmlPath)}#/${queryParams}`;
    console.log(`Navigating to ${fileUrl}`);
    await page.goto(fileUrl, {
      waitUntil: 'networkidle0', // Wait until network is idle
      timeout: 60000, // Increase timeout for potentially large graphs
    });

    const downloadButtonSelector = '[data-cy="downloadImageButton"]'; // **CHECK THIS SELECTOR IN YOUR GRAPH.HTML**
    console.log(`Waiting for download button: ${downloadButtonSelector}`);
    const downloadButton = await page.waitForSelector(downloadButtonSelector, {
      visible: true,
      timeout: 10000,
    });

    if (downloadButton) {
      console.log('Download button found');
      const graphContainerSelector = '[data-id="layer0-selectbox"]'; // Or a more specific selector like '.graph-container'
      const graphElement = await page.waitForSelector(graphContainerSelector, {
        visible: true,
        timeout: 10000,
      });

      if (graphElement) {
        console.log('Taking screenshot of the graph element...');
        await graphElement.screenshot({
          path: outputPath,
          type: 'png',
          fullPage: false, // Don't take a screenshot of the entire page, just the element
          omitBackground: true, // To potentially get a transparent background if supported by the graph
        });
        console.log(`Graph image saved to ${outputPath}`);
      } else {
        console.error('Could not find the main graph element to screenshot.');
        throw new Error('Graph element not found.');
      }
    } else {
      console.error('Download button not found. Please check the selector.');
      throw new Error('Download button not found.');
    }
  } catch (error) {
    console.error('Error generating Nx graph image:', error);
    process.exit(1); // Exit with an error code
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
