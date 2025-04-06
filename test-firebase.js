const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

async function testFirebaseConnection() {
  try {
    console.log('Testing Firebase connection...');
    
    // Test Firestore
    const db = admin.firestore();
    const testDoc = await db.collection('test').doc('connection').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      message: 'Test connection successful'
    });
    
    console.log('✅ Firestore connection successful!');
    
    // Test Authentication
    const auth = admin.auth();
    const listUsersResult = await auth.listUsers(1);
    console.log('✅ Authentication connection successful!');
    
    console.log('\nFirebase connection test completed successfully!');
    console.log('You can now restart your server with: npm run dev');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Firebase connection test failed:');
    console.error(error);
    process.exit(1);
  }
}

testFirebaseConnection(); 