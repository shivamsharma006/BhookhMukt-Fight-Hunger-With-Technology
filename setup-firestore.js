const admin = require('firebase-admin');
const dotenv = require('dotenv');
const readline = require('readline');

// Load environment variables
dotenv.config();

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== Firestore Database Setup ===');
console.log('This script will help you set up your Firestore database.\n');

// Initialize Firebase Admin
const privateKey = process.env.FIREBASE_PRIVATE_KEY 
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

console.log('Firebase Admin initialized successfully!');
console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('Private Key Length:', privateKey ? privateKey.length : 0);

// Function to create initial collections
async function createInitialCollections() {
  try {
    console.log('\nCreating initial collections...');
    
    // Create donations collection
    await admin.firestore().collection('donations').doc('placeholder').set({
      placeholder: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Created donations collection');
    
    // Create requests collection
    await admin.firestore().collection('requests').doc('placeholder').set({
      placeholder: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Created requests collection');
    
    // Create users collection
    await admin.firestore().collection('users').doc('placeholder').set({
      placeholder: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Created users collection');
    
    console.log('\nAll collections created successfully!');
    return true;
  } catch (error) {
    console.error('Error creating collections:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('\nTo set up Firestore, you need to:');
  console.log('1. Go to the Firebase Console: https://console.firebase.google.com/');
  console.log('2. Select your project "bhookmukt"');
  console.log('3. In the left sidebar, click on "Firestore Database"');
  console.log('4. Click "Create Database"');
  console.log('5. Choose "Start in production mode"');
  console.log('6. Select a location closest to your users (e.g., "asia-south1" for India)');
  console.log('7. Click "Enable"');
  
  rl.question('\nHave you created the Firestore database? (yes/no): ', async (answer) => {
    if (answer.toLowerCase() !== 'yes') {
      console.log('Please create the Firestore database and run this script again.');
      rl.close();
      return;
    }
    
    console.log('\nAttempting to create initial collections...');
    const success = await createInitialCollections();
    
    if (success) {
      console.log('\nFirestore setup completed successfully!');
      console.log('You can now restart your server with: npm run dev');
    } else {
      console.log('\nThere was an error setting up Firestore.');
      console.log('Please check the error message above and try again.');
    }
    
    rl.close();
  });
}

main(); 