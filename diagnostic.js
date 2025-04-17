const fs = require('fs');
const path = require('path');

console.log('=== AZURE APP SERVICE DIAGNOSTIC TOOL ===');
console.log('Current time:', new Date().toISOString());
console.log('\n=== ENVIRONMENT VARIABLES ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('WEBSITES_PORT:', process.env.WEBSITES_PORT);

console.log('\n=== CURRENT DIRECTORY ===');
console.log('__dirname:', __dirname);
console.log('process.cwd():', process.cwd());

console.log('\n=== FILE STRUCTURE ===');

// Function to list files recursively
function listFilesRecursively(dir, indent = '') {
  if (!fs.existsSync(dir)) {
    console.log(`${indent}Directory does not exist: ${dir}`);
    return;
  }
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      console.log(`${indent}📁 ${file}/`);
      // Only go one level deep to avoid too much output
      if (indent.length < 4) {
        listFilesRecursively(filePath, indent + '  ');
      } else {
        console.log(`${indent}  ...`);
      }
    } else {
      console.log(`${indent}📄 ${file} (${stats.size} bytes)`);
    }
  });
}

// List files in the current directory
console.log('Current directory files:');
listFilesRecursively(process.cwd());

// Check for index.html in various locations
console.log('\n=== CHECKING FOR INDEX.HTML ===');
const possibleIndexLocations = [
  path.join(process.cwd(), 'index.html'),
  path.join(process.cwd(), 'public', 'index.html'),
  path.join(process.cwd(), 'UI', 'dist', 'index.html'),
  path.join(process.cwd(), 'UI', 'build', 'index.html'),
  path.join(process.cwd(), 'UI', 'public', 'index.html'),
  path.join(__dirname, '..', 'index.html'),
  path.join(__dirname, '..', 'public', 'index.html')
];

possibleIndexLocations.forEach(location => {
  console.log(`Checking ${location}: ${fs.existsSync(location) ? 'EXISTS' : 'NOT FOUND'}`);
  if (fs.existsSync(location)) {
    console.log(`  Size: ${fs.statSync(location).size} bytes`);
    // Print first few lines of the file
    const content = fs.readFileSync(location, 'utf8').split('\n').slice(0, 5).join('\n');
    console.log(`  First few lines:\n${content}\n...`);
  }
});

// Check for server.js in various locations
console.log('\n=== CHECKING FOR SERVER.JS ===');
const possibleServerLocations = [
  path.join(process.cwd(), 'server.js'),
  path.join(process.cwd(), 'server', 'server.js'),
  path.join(__dirname, 'server.js'),
  path.join(__dirname, '..', 'server', 'server.js')
];

possibleServerLocations.forEach(location => {
  console.log(`Checking ${location}: ${fs.existsSync(location) ? 'EXISTS' : 'NOT FOUND'}`);
});

// Check for web.config
console.log('\n=== CHECKING FOR WEB.CONFIG ===');
const possibleWebConfigLocations = [
  path.join(process.cwd(), 'web.config'),
  path.join(process.cwd(), 'public', 'web.config'),
  path.join(process.cwd(), 'UI', 'public', 'web.config')
];

possibleWebConfigLocations.forEach(location => {
  console.log(`Checking ${location}: ${fs.existsSync(location) ? 'EXISTS' : 'NOT FOUND'}`);
  if (fs.existsSync(location)) {
    console.log(`  Size: ${fs.statSync(location).size} bytes`);
    // Print the content of the file
    const content = fs.readFileSync(location, 'utf8');
    console.log(`  Content:\n${content}`);
  }
});

console.log('\n=== DIAGNOSTIC COMPLETE ===');
