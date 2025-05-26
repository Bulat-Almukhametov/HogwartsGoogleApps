const fs = require('fs');
const path = require('path');

const folderToManage = process.argv[2];
if (!folderToManage) {
  console.error(
    'Folder name not provided. Please provide a folder name as an argument.'
  );
  process.exit(1);
}

const folderPath = path.join(process.cwd(), folderToManage);

try {
  if (fs.existsSync(folderPath)) {
    console.log(
      `Folder "${folderToManage}" already exists at "${folderPath}". Removing older one...`
    );
    fs.rmSync(folderPath, { recursive: true, force: true });
    console.log(`Successfully removed older folder "\${folderToManage}".`);
  }

  fs.mkdirSync(folderPath);
  console.log(
    `Successfully created new folder "${folderToManage}" at "${folderPath}".`
  );
  console.log('Folder operation complete!');
} catch (error) {
  console.error(`An error occurred during folder operation: ${error.message}`);
  process.exit(1);
}
