const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== Firebase API Setup Guide ===');
console.log('Your Firebase project needs to have certain APIs enabled to work properly.');
console.log('This script will guide you through enabling the required APIs.\n');

console.log('Required APIs:');
console.log('1. Cloud Firestore API');
console.log('2. Firebase Authentication API');
console.log('3. Firebase Storage API\n');

console.log('To enable these APIs, follow these steps:');
console.log('1. Go to the Firebase Console: https://console.firebase.google.com/');
console.log('2. Select your project "bhookmukt"');
console.log('3. In the left sidebar, click on "Project settings"');
console.log('4. Go to the "Service accounts" tab');
console.log('5. Click on "Google Cloud Platform"');
console.log('6. In the Google Cloud Console, go to "APIs & Services" > "Library"');
console.log('7. Search for and enable each of the required APIs listed above\n');

rl.question('Have you enabled all the required APIs? (yes/no): ', (answer) => {
  if (answer.toLowerCase() !== 'yes') {
    console.log('Please enable the required APIs and run this script again.');
    rl.close();
    return;
  }

  console.log('\nGreat! Now let\'s restart your server to apply the changes.');
  console.log('You can restart your server with: npm run dev');
  
  rl.question('Would you like to restart the server now? (yes/no): ', (restart) => {
    if (restart.toLowerCase() === 'yes') {
      console.log('\nRestarting the server...');
      exec('npm run dev', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`Stderr: ${stderr}`);
          return;
        }
        console.log(`Stdout: ${stdout}`);
      });
    } else {
      console.log('\nYou can restart the server later with: npm run dev');
    }
    rl.close();
  });
}); 