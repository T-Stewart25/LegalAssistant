# Azure App Service Deployment Troubleshooting Guide

This guide will help you diagnose and fix issues with your Azure App Service deployment for your full-stack application.

## Understanding the Issue

When you see the message "Your web app is running and waiting for your content" in Azure App Service, it typically means one of the following:

1. The application files are not in the expected location
2. The web.config file is not properly configured
3. The server is not starting correctly
4. Environment variables are not set correctly

## Diagnostic Tools

This repository includes several diagnostic tools to help identify and fix the issue:

### 1. diagnostic.js

This script will provide detailed information about your Azure App Service environment, including:
- Environment variables
- File structure
- Location of key files (index.html, server.js, web.config)

To run the diagnostic script in Azure App Service:

1. Go to the Azure Portal
2. Navigate to your App Service
3. Select "Advanced Tools" (Kudu) from the left menu
4. Click "Go" to open Kudu
5. Select "Debug Console" > "CMD" or "PowerShell"
6. Navigate to the site/wwwroot directory
7. Run `node diagnostic.js`
8. Review the output for any issues

### 2. azure-web.config

An improved web.config file that properly configures IIS to:
- Route API requests to your Node.js server
- Serve static files correctly
- Route all other requests to your React app

### 3. update-deployment.js

A script to update your GitHub Actions workflow to include the diagnostic tools and improved web.config in your deployment package.

## Step-by-Step Troubleshooting

### 1. Check Your Deployment Structure

Your application should have the following structure in Azure App Service:

```
site/wwwroot/
├── index.html              # Main React app entry point
├── assets/                 # Static assets from React build
├── server/                 # Server directory
│   ├── server.js           # Main server file
│   ├── routes/             # API routes
│   └── ...                 # Other server files
├── web.config              # IIS configuration
├── diagnostic.js           # Diagnostic tool
└── health.html             # Health check page
```

### 2. Verify Environment Variables

Make sure the following environment variables are set in Azure App Service:

- `NODE_ENV`: Should be set to `production`
- `WEBSITES_PORT`: Should match the port your server listens on (typically 3001)

To check/set environment variables:
1. Go to the Azure Portal
2. Navigate to your App Service
3. Select "Configuration" from the left menu
4. Check the "Application settings" section

### 3. Check Server Logs

Azure App Service logs can provide valuable information about what's going wrong:

1. Go to the Azure Portal
2. Navigate to your App Service
3. Select "Log stream" from the left menu
4. Review the logs for any errors

### 4. Test Static File Serving

Access the health check page to verify if static files are being served correctly:
```
https://your-app-name.azurewebsites.net/health.html
```

If this page loads but your main application doesn't, it indicates an issue with your React app or routing configuration.

### 5. Implement the Fix

To fix the deployment issues:

1. Add the diagnostic.js and azure-web.config files to your repository
2. Run the update-deployment.js script to update your GitHub Actions workflow:
   ```
   node update-deployment.js
   ```
3. Commit and push the changes to your repository
4. Wait for the GitHub Actions workflow to deploy the updated application
5. Check the Azure App Service logs for any remaining issues

## Common Issues and Solutions

### Issue: Server not starting

**Solution**: Check the server logs in Azure Portal. Make sure the server.js file is in the correct location and the start command is properly configured.

### Issue: Static files not being served

**Solution**: Verify the web.config file is correctly configured to serve static files. Make sure the static files are in the expected location.

### Issue: API routes not working

**Solution**: Check that the web.config is properly routing API requests to your server.js file. Verify that your server is correctly handling API routes.

### Issue: Environment variables not set

**Solution**: Set the required environment variables in the Azure Portal under App Service > Configuration > Application settings.

## Additional Resources

- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Troubleshooting Node.js applications in Azure App Service](https://docs.microsoft.com/en-us/azure/app-service/app-service-web-nodejs-best-practices-and-troubleshoot-guide)
- [Deploying React applications to Azure](https://docs.microsoft.com/en-us/azure/static-web-apps/deploy-react)
