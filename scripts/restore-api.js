const fs = require('fs');
const path = require('path');

// Main function
function main() {
  const appDir = path.join(__dirname, '..', 'app');
  const apiBackupDir = path.join(__dirname, '..', '.api-backup');
  
  if (fs.existsSync(apiBackupDir)) {
    console.log('Restoring API directories...');
    
    // Restore the API directory
    const apiBackup = path.join(apiBackupDir, 'api');
    if (fs.existsSync(apiBackup)) {
      console.log('Restoring API directory...');
      fs.cpSync(apiBackup, path.join(appDir, 'api'), { recursive: true });
    }
    
    // Clean up backup
    fs.rmSync(apiBackupDir, { recursive: true, force: true });
    
    console.log('API restoration complete!');
  } else {
    console.log('No API backup found. Nothing to restore.');
  }
}

main(); 