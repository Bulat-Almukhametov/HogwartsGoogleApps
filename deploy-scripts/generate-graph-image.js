const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { exit } = require('process');
const { execSync } = require('child_process');
const { ExifTool } = require('exiftool-vendored');

const DESCRIPTION_IMAGE_ATTRIBUTE = 'XMP-dc:Description';

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
  const imagePath = `docs/images/${fileName}`;
  const tempDir = 'dist/generated-graph';
  const htmlPath = `${tempDir}/index.html`;
  const graphPath = `${tempDir}/graph.json`;

  checkDirectoryForImage(imagePath);

  const checksum = generateGraph(graphPath);
  const imageDescription = await readDescriptionFromImageMetadata(imagePath);

  const newImageDescription = `The image represents the Nx graph with checksum: ${checksum}`;
  if (newImageDescription === imageDescription) {
    console.log('Graph image is up to date. No need to regenerate the image.');
    return;
  }

  generateHtml(htmlPath);
  await convertHtmlToPng(htmlPath, imagePath);
  await writeDescriptionToImageMetadata(newImageDescription, imagePath);
}

async function convertHtmlToPng(htmlPath, outputPath) {
  let releaseCallback;
  try {
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

function generateHtml(htmlPath) {
  console.log('Generating HTML...');
  execSync(`npx nx graph --file=${htmlPath}`, { stdio: 'inherit' });
  console.log('HTML generated.');
}

function generateGraph(graphPath) {
  console.log('Generating Nx graph...');
  execSync(`npx nx graph --file=${graphPath}`, { stdio: 'inherit' });
  console.log('Nx graph generated.');

  const checksum = execSync(`git hash-object ${graphPath}`, {
    encoding: 'utf8',
  }).trim();
  console.log('Nx graph checksum:', checksum);

  return checksum;
}

async function readDescriptionFromImageMetadata(imagePath) {
  if (!fs.existsSync(imagePath)) {
    return null;
  }

  const exiftool = new ExifTool();
  const metadata = await exiftool.read(imagePath, { readArgs: ['-a', '-G1'] });
  const description = metadata[DESCRIPTION_IMAGE_ATTRIBUTE];
  console.log(`Description from previous image: "${description}"`);
  await exiftool.end();

  return description;
}

async function writeDescriptionToImageMetadata(checksum, imagePath) {
  const exiftool = new ExifTool();
  const data = {};
  data[DESCRIPTION_IMAGE_ATTRIBUTE] = checksum;

  await exiftool.write(imagePath, data, {
    writeArgs: ['-overwrite_original', imagePath],
  });
  await exiftool.end();
  console.log('Description was written to image metadata.');
}

function checkDirectoryForImage(outputPath) {
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
}
