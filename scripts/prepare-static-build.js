const fs = require('fs');
const path = require('path');

// Function to recursively remove API directories
function removeApiDirectories(dir) {
  const apiDir = path.join(dir, 'api');
  
  if (fs.existsSync(apiDir)) {
    console.log(`Removing API directory: ${apiDir}`);
    fs.rmSync(apiDir, { recursive: true, force: true });
  }
  
  // Check subdirectories
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const fullPath = path.join(dir, entry.name);
      removeApiDirectories(fullPath);
    }
  }
}

// Main function
function main() {
  const appDir = path.join(__dirname, '..', 'app');
  
  if (fs.existsSync(appDir)) {
    console.log('Preparing for static build...');
    
    // Create a backup of the API directories
    const apiBackupDir = path.join(__dirname, '..', '.api-backup');
    if (!fs.existsSync(apiBackupDir)) {
      fs.mkdirSync(apiBackupDir);
    }
    
    // Backup the API directory
    const apiDir = path.join(appDir, 'api');
    if (fs.existsSync(apiDir)) {
      console.log('Backing up API directory...');
      fs.cpSync(apiDir, path.join(apiBackupDir, 'api'), { recursive: true });
    }
    
    // Remove API directories
    removeApiDirectories(appDir);
    
    console.log('Static build preparation complete!');
  } else {
    console.error('App directory not found!');
    process.exit(1);
  }
}

main(); 