const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'build');
const targetDir = path.join(__dirname, '..', 'back', 'public', 'build');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy function
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy build directory
if (fs.existsSync(sourceDir)) {
  console.log(`Copying ${sourceDir} to ${targetDir}...`);
  copyRecursiveSync(sourceDir, targetDir);
  console.log('Build copied successfully!');
} else {
  console.error(`Error: ${sourceDir} does not exist. Run "npm run build:frontend" first.`);
  process.exit(1);
}

