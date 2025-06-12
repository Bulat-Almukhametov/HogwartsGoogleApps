const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { exit } = require('process');
const { execSync } = require('child_process');

const { fileName, queryParams } = readConsoleArguments();

generateNxGraphImage();

/*
 * Declarations of the functions used in this script
 */

function readConsoleArguments() {
  const fileName = process.argv[2];
  const queryParams = process.argv[3];

  if (!fileName) {
    console.error('Please provide a file name as the first argument.');
  }

  if (!queryParams) {
    console.error('Please provide query parameters as the second argument.');
  }

  if (!fileName || !queryParams) {
    console.error(
      'Usage: node generate-graph-image.js <fileName> <queryParams>'
    );
    exit(1);
  }
  return { fileName, queryParams };
}

async function generateNxGraphImage() {
  const outputPath = `docs/images/${fileName}`;
  const htmlPath = 'dist/generated-graph/index.html';

  checkOutputPathExists(outputPath);

  let releaseCallback;
  try {
    generateGraphHtml(htmlPath);

    const { page, browser } = await initBrowser();
    releaseCallback = () => browser.close();

    await openHtmlFile(htmlPath, page);

    await hideButtons(page);

    await takeAPictureOfGraph(page, outputPath);
  } catch (error) {
    console.error('Error generating Nx graph image:', error);
    process.exit(1);
  } finally {
    await releaseCallback?.call();
  }
}

async function hideButtons(page) {
  await hideElement(page, '[data-cy="downloadImageButton"]');
  await hideElement(page, '[data-cy="resetLayoutButton"]');
}

async function hideElement(page, selector) {
  const hideElement = await getPageElement(page, selector);
  await hideElement.evaluate((element) => (element.style.display = 'none'));
}

async function takeAPictureOfGraph(page, outputPath) {
  const graphImage = await getPageElement(page, '#cytoscape-graph');

  console.log('Taking screenshot of the graph element...');
  await graphImage.screenshot({
    path: outputPath,
    type: 'png',
    fullPage: false,
    omitBackground: true,
  });
  console.log(`Graph image saved to ${outputPath}`);
}

async function getPageElement(page, graphContainerSelector) {
  const graphElement = await page.waitForSelector(graphContainerSelector, {
    visible: true,
    timeout: 10000,
  });
  return graphElement;
}

async function openHtmlFile(htmlPath, page) {
  const fileUrl = `file://${path.resolve(htmlPath)}#/${queryParams}`;
  console.log(`Navigating to ${fileUrl}`);
  await page.goto(fileUrl, {
    waitUntil: 'networkidle0',
    timeout: 3000,
  });
}

async function initBrowser() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  await page.setViewport({ width: 1920, height: 1080 });
  return { page, browser };
}

function generateGraphHtml(htmlPath) {
  console.log('Generating Nx graph HTML...');
  execSync(`npx nx graph --file=${htmlPath}`, { stdio: 'inherit' });
  console.log('Nx graph HTML generated.');
}

function checkOutputPathExists(outputPath) {
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
}
