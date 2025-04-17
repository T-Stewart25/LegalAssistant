const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== APPLYING ALL AZURE APP SERVICE FIXES ===');

// Function to run a script and handle errors
function runScript(scriptPath, description) {
  console.log(`\n=== ${description} ===`);
  try {
    if (fs.existsSync(scriptPath)) {
      console.log(`Running ${scriptPath}...`);
      execSync(`node ${scriptPath}`, { stdio: 'inherit' });
      console.log(`✅ ${description} completed successfully`);
      return true;
    } else {
      console.error(`❌ Script not found: ${scriptPath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error running ${scriptPath}:`, error.message);
    return false;
  }
}

// Check if all required scripts exist
const requiredScripts = [
  { path: 'update-server.js', description: 'Update server.js with improved logging and path handling' },
  { path: 'update-files-route.js', description: 'Update files.js route with improved path handling' },
  { path: 'update-deployment.js', description: 'Update GitHub workflow with diagnostic tools' }
];

const missingScripts = requiredScripts.filter(script => !fs.existsSync(script.path));

if (missingScripts.length > 0) {
  console.error('❌ The following required scripts are missing:');
  missingScripts.forEach(script => console.error(`   - ${script.path}`));
  process.exit(1);
}

// Run all scripts in order
let allSuccessful = true;

for (const script of requiredScripts) {
  const success = runScript(script.path, script.description);
  if (!success) {
    allSuccessful = false;
  }
}

// Final message
console.log('\n=== SUMMARY ===');
if (allSuccessful) {
  console.log('✅ All fixes were applied successfully!');
} else {
  console.log('⚠️ Some fixes encountered errors. Please check the logs above for details.');
}

console.log('\n=== NEXT STEPS ===');
console.log('1. Commit and push these changes to your repository:');
console.log('   git add .');
console.log('   git commit -m "Fix Azure App Service deployment issues"');
console.log('   git push');
console.log('2. Wait for the GitHub Actions workflow to deploy the updated application');
console.log('3. Check the Azure App Service logs for diagnostic information');
console.log('4. Access your application at https://your-app-name.azurewebsites.net');
console.log('5. If issues persist, access the health check page at https://your-app-name.azurewebsites.net/health.html');
console.log('6. For more information, refer to the AZURE_DEPLOYMENT_GUIDE.md file');
