#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the directory where this script is located
const scriptPath = __filename || require.main.filename || process.argv[1];
const scriptDir = path.dirname(path.resolve(scriptPath));

// Find the nested project directory (dora-dori-vista-main/dora-dori-vista-main)
let projectDir = path.join(scriptDir, 'dora-dori-vista-main');

// If script is in parent directory, projectDir should exist
// If script was copied to nested directory, go up one level first
if (!fs.existsSync(projectDir)) {
  const parentDir = path.dirname(scriptDir);
  projectDir = path.join(parentDir, 'dora-dori-vista-main');
}

// Final check - if still not found, we might already be in the project dir
if (!fs.existsSync(projectDir)) {
  // Check if current script location IS the project directory
  if (fs.existsSync(path.join(scriptDir, 'vite.config.js')) && 
      fs.existsSync(path.join(scriptDir, 'src'))) {
    projectDir = scriptDir;
  } else {
    console.error(`Error: Could not find project directory.`);
    console.error(`Script location: ${scriptDir}`);
    process.exit(1);
  }
}

const command = process.argv.slice(2).join(' ');

// Verify package.json exists
if (!fs.existsSync(path.join(projectDir, 'package.json'))) {
  console.error(`Error: package.json not found in: ${projectDir}`);
  process.exit(1);
}

// Set environment variable to prevent recursion
const env = {
  ...process.env,
  DORA_DORI_RUNNING: '1'
};

try {
  // Use --prefix to ensure we run in the correct directory
  // and prevent npm from finding parent package.json
  execSync(`npm --prefix "${projectDir}" ${command}`, {
    stdio: 'inherit',
    shell: true,
    env: env
  });
} catch (error) {
  process.exit(error.status || 1);
}

