// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA8rqugGN164U8xaG0h6eoryKETBLxampk",
    authDomain: "bhookmukt.firebaseapp.com",
    projectId: "bhookmukt",
    storageBucket: "bhookmukt.appspot.com",
    messagingSenderId: "772635537013",
    appId: "1:772635537013:web:26143adc17c5e49dfe123c",
    measurementId: "G-YNEQ07JSRG"
};

// Initialize Firebase only if it hasn't been initialized already
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Get Firebase Auth and Firestore instances
const fbAuth = firebase.auth();
const fbStore = firebase.firestore();

// Set persistence to LOCAL to keep user logged in
fbAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// Listen for authentication state changes
fbAuth.onAuthStateChanged((user) => {
    console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
    
    // Get all instances of auth-buttons and user-menu
    const authButtons = document.querySelectorAll('.auth-buttons');
    const userMenus = document.querySelectorAll('.user-menu');
    
    if (user) {
        // User is signed in
        console.log('User is signed in:', user.email);
        
        // Hide all auth buttons and show all user menus
        authButtons.forEach(btn => btn.classList.add('hidden'));
        userMenus.forEach(menu => menu.classList.remove('hidden'));
        
        // Update profile information
        updateProfileInfo(user);
        
        // Create or update user document in Firestore
        const userRef = fbStore.collection('users').doc(user.uid);
        userRef.get().then((doc) => {
            if (!doc.exists) {
                // Create new user document
                userRef.set({
                    email: user.email,
                    displayName: user.displayName || user.email.split('@')[0],
                    photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}`,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // Update last login
                userRef.update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        }).catch((error) => {
            console.error('Error updating user document:', error);
        });
    } else {
        // User is signed out
        console.log('User is signed out');
        
        // Show all auth buttons and hide all user menus
        authButtons.forEach(btn => btn.classList.remove('hidden'));
        userMenus.forEach(menu => menu.classList.add('hidden'));
    }
});

// Function to update profile information
function updateProfileInfo(user) {
    // Get all profile images, names, and emails
    const profileImages = document.querySelectorAll('.profile-image');
    const profileNames = document.querySelectorAll('.profile-name');
    const profileEmails = document.querySelectorAll('.profile-email');
    
    // Update all instances
    profileImages.forEach(img => {
        img.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}`;
    });
    
    profileNames.forEach(name => {
        name.textContent = user.displayName || user.email.split('@')[0];
    });
    
    profileEmails.forEach(email => {
        email.textContent = user.email;
    });
}

// Export Firebase instances for use in other files
window.fbAuth = fbAuth;
window.fbStore = fbStore; 