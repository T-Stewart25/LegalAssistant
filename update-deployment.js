const fs = require('fs');
const path = require('path');

// Path to the GitHub workflow file
const workflowPath = path.join(__dirname, '.github', 'workflows', 'main_legalassistant.yml');

// Check if the workflow file exists
if (!fs.existsSync(workflowPath)) {
  console.error(`Workflow file not found at ${workflowPath}`);
  process.exit(1);
}

// Read the current workflow file
let workflowContent = fs.readFileSync(workflowPath, 'utf8');

// Find the "Create deployment package" step
const deploymentStepRegex = /(# Create deployment package[\s\S]*?)(\n\s*- name: Upload artifact)/;
const match = workflowContent.match(deploymentStepRegex);

if (!match) {
  console.error('Could not find the "Create deployment package" step in the workflow file');
  process.exit(1);
}

// Add our diagnostic.js and azure-web.config to the deployment package
const updatedDeploymentStep = match[1] + `

          # Copy diagnostic tools
          cp \${{ github.workspace }}/diagnostic.js deployment/
          
          # Use the improved web.config
          cp \${{ github.workspace }}/azure-web.config deployment/web.config
          
          # Copy the fallback index.html
          cp \${{ github.workspace }}/fallback-index.html deployment/fallback-index.html
          
          # Create a simple health check HTML file
          cat > deployment/health.html << 'EOL'
          <!DOCTYPE html>
          <html>
          <head>
            <title>App Health Check</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
              h1 { color: #4CAF50; }
              .status { padding: 20px; background-color: #f8f8f8; border-radius: 5px; }
              .success { color: #4CAF50; }
            </style>
          </head>
          <body>
            <h1>App Health Check</h1>
            <div class="status">
              <h2 class="success">✅ Static file serving is working!</h2>
              <p>If you can see this page, it means your static files are being served correctly.</p>
              <p>However, your main application may still have issues.</p>
              <p>Check the server logs for more information.</p>
            </div>
            <div>
              <h3>Troubleshooting Steps:</h3>
              <ol>
                <li>Verify your web.config is correctly configured</li>
                <li>Check that server.js is in the correct location</li>
                <li>Ensure environment variables are set correctly</li>
                <li>Look at the logs in the Azure portal</li>
                <li>Run the diagnostic.js script: <code>node diagnostic.js</code></li>
              </ol>
            </div>
          </body>
          </html>
          EOL` + match[2];

// Replace the deployment step in the workflow file
workflowContent = workflowContent.replace(deploymentStepRegex, updatedDeploymentStep);

// Write the updated workflow file
fs.writeFileSync(workflowPath, workflowContent);

console.log('Successfully updated the GitHub workflow file to include diagnostic tools and improved web.config');
console.log('Next steps:');
console.log('1. Commit and push these changes to your repository');
console.log('2. The GitHub workflow will deploy the updated application to Azure');
console.log('3. Check the Azure App Service logs for diagnostic information');
console.log('4. Access the health check page at https://your-app-name.azurewebsites.net/health.html');
