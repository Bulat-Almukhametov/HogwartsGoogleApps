const fs = require('fs');
const path = require('path');

if (process.argv.length < 4) {
  console.error(
    `Usage: node ${path.basename(
      __filename
    )} <source_folder> <destination_folder>`
  );
  process.exit(1);
}

const srcDir = process.argv[2];
const destDir = process.argv[3];

if (!fs.existsSync(destDir)) {
  console.error(`Destination directory "${destDir}" does not exist.`);
  process.exit(1);
}

processFiles('js', 'script', ' type="module"');
processFiles('css', 'style');

function processFiles(ext, tagName, attributes = '') {
  const regex = new RegExp(`^([^.]+)\\..*\\.${ext}$`, 'i');
  const files = fs.readdirSync(srcDir).filter((f) => regex.test(f));

  for (const file of files) {
    const srcFile = path.join(srcDir, file);
    const content = fs.readFileSync(srcFile, 'utf8');
    const baseName = regex.exec(file)[1];
    const htmlFile = path.join(destDir, `${baseName}-${ext}.html`);

    if (!fs.existsSync(htmlFile)) {
      console.error(
        `Error: Can't write the content of "${srcFile}" to "${htmlFile}" because destination file doesn't exists.`
      );
      process.exit(1);
    }

    fs.writeFileSync(htmlFile, `<${tagName}${attributes}>\n${content}\n</${tagName}>\n`);
    console.log(`Copied: ${htmlFile}`);
  }
}
