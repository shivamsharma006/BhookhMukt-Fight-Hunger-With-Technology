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

// Initialize Firebase Admin
let firebaseInitialized = false;
try {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  console.log('Private key format:', privateKey ? 'Valid' : 'Missing');
  console.log('Private key length:', privateKey ? privateKey.length : 0);

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  firebaseInitialized = true;
  console.log('Firebase Admin initialized successfully!');
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

// Check Firebase configuration
async function checkFirebaseConfig() {
  if (!firebaseInitialized) {
    console.log('Firebase Admin not initialized. Cannot check configuration.');
    return;
  }

  try {
    // Check if Authentication is enabled
    const authConfig = await admin.auth().getConfig();
    console.log('\n=== Firebase Authentication Configuration ===');
    console.log('Authentication is enabled:', authConfig.enabled);
    
    // Check if Google provider is enabled
    const googleProvider = authConfig.providers.find(p => p.providerId === 'google.com');
    console.log('Google provider is enabled:', !!googleProvider);
    
    if (!googleProvider) {
      console.log('\n=== Google Authentication is not enabled ===');
      console.log('To enable Google Authentication:');
      console.log('1. Go to the Firebase Console: https://console.firebase.google.com/');
      console.log(`2. Select your project: ${process.env.FIREBASE_PROJECT_ID}`);
      console.log('3. Go to Authentication > Sign-in method');
      console.log('4. Enable Google as a sign-in provider');
      console.log('5. Configure the OAuth consent screen if needed');
      console.log('6. Add your authorized domains');
    } else {
      console.log('\n=== Google Authentication is enabled ===');
      console.log('If you are still experiencing issues:');
      console.log('1. Check if your domain is authorized in Firebase Console');
      console.log('2. Verify that your Firebase project has the necessary API enabled');
      console.log('3. Check if there are any restrictions on your Google Cloud project');
    }
    
    // Check Firestore
    const firestore = admin.firestore();
    await firestore.collection('users').limit(1).get();
    console.log('\n=== Firestore is accessible ===');
    
  } catch (error) {
    console.error('Error checking Firebase configuration:', error);
    
    if (error.code === 'permission-denied') {
      console.log('\n=== Firestore Permission Error ===');
      console.log('Your service account does not have permission to access Firestore.');
      console.log('To fix this:');
      console.log('1. Go to the Firebase Console: https://console.firebase.google.com/');
      console.log(`2. Select your project: ${process.env.FIREBASE_PROJECT_ID}`);
      console.log('3. Go to Firestore Database');
      console.log('4. Check your security rules to ensure your service account has access');
    }
  }
}

// Run the check
checkFirebaseConfig().then(() => {
  rl.question('\nDo you want to enable Google Authentication now? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      console.log('\nTo enable Google Authentication:');
      console.log('1. Go to the Firebase Console: https://console.firebase.google.com/');
      console.log(`2. Select your project: ${process.env.FIREBASE_PROJECT_ID}`);
      console.log('3. Go to Authentication > Sign-in method');
      console.log('4. Enable Google as a sign-in provider');
      console.log('5. Configure the OAuth consent screen if needed');
      console.log('6. Add your authorized domains (including localhost for testing)');
    }
    rl.close();
  });
}); 