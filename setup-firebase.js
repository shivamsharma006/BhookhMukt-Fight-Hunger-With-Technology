const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== Firebase Service Account Setup ===');
console.log('This script will help you set up your Firebase service account credentials.');
console.log('You need to download a service account key file from the Firebase Console:');
console.log('1. Go to https://console.firebase.google.com/');
console.log('2. Select your project "bhookmukt"');
console.log('3. Go to Project Settings > Service Accounts');
console.log('4. Click "Generate New Private Key"');
console.log('5. Save the downloaded JSON file\n');

rl.question('Do you have the service account JSON file? (yes/no): ', (answer) => {
  if (answer.toLowerCase() !== 'yes') {
    console.log('Please download the service account key file and run this script again.');
    rl.close();
    return;
  }

  rl.question('Enter the path to your service account JSON file: ', (filePath) => {
    try {
      // Read the service account file
      const serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Update the .env file
      const envPath = path.join(__dirname, '.env');
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // Replace or add the Firebase service account credentials
      const clientEmailRegex = /FIREBASE_CLIENT_EMAIL=.*/;
      const privateKeyRegex = /FIREBASE_PRIVATE_KEY=.*/;
      
      const clientEmailLine = `FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}`;
      const privateKeyLine = `FIREBASE_PRIVATE_KEY="${serviceAccount.private_key.replace(/\n/g, '\\n')}"`;
      
      if (clientEmailRegex.test(envContent)) {
        envContent = envContent.replace(clientEmailRegex, clientEmailLine);
      } else {
        envContent += `\n${clientEmailLine}`;
      }
      
      if (privateKeyRegex.test(envContent)) {
        envContent = envContent.replace(privateKeyRegex, privateKeyLine);
      } else {
        envContent += `\n${privateKeyLine}`;
      }
      
      fs.writeFileSync(envPath, envContent);
      
      console.log('\n✅ Firebase service account credentials have been added to your .env file!');
      console.log('You can now run the test script with: node test-firebase.js');
      console.log('And then restart your server with: npm run dev');
      
      rl.close();
    } catch (error) {
      console.error('Error:', error.message);
      rl.close();
    }
  });
}); 