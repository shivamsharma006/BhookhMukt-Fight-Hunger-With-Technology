const fs = require('fs');
const path = require('path');

// Read the .env file
const envPath = path.join(__dirname, '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

// Get the private key
const privateKeyMatch = envContent.match(/FIREBASE_PRIVATE_KEY="([^"]+)"/);
if (!privateKeyMatch) {
  console.error('Private key not found in .env file');
  process.exit(1);
}

// Format the private key
const privateKey = privateKeyMatch[1]
  .replace(/\\n/g, '\n')  // Replace literal \n with actual newlines
  .replace(/\n/g, '\\n'); // Replace actual newlines with \n for .env file

// Update the .env file
envContent = envContent.replace(
  /FIREBASE_PRIVATE_KEY="[^"]+"/,
  `FIREBASE_PRIVATE_KEY="${privateKey}"`
);

// Write back to .env file
fs.writeFileSync(envPath, envContent);

console.log('Private key format has been fixed in .env file');
console.log('You can now restart your server with: npm run dev'); 