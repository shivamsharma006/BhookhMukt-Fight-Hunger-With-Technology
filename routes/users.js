const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { body, validationResult } = require('express-validator');

// Middleware to verify Firebase ID token
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get user profile
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        uid: req.user.uid,
        ...userDoc.data(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message,
    });
  }
});

// Update user profile
router.patch('/profile', authenticateUser, async (req, res) => {
  try {
    const { name, phone, address, city, state, pincode } = req.body;

    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (pincode) updateData.pincode = pincode;

    await admin.firestore().collection('users').doc(req.user.uid).update(updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
});

// Get user's donations
router.get('/donations', authenticateUser, async (req, res) => {
  try {
    const snapshot = await admin.firestore()
      .collection('donations')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const donations = [];
    for (const doc of snapshot.docs) {
      donations.push({
        id: doc.id,
        ...doc.data(),
      });
    }

    res.json({
      success: true,
      donations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user donations',
      error: error.message,
    });
  }
});

// Get user's requests
router.get('/requests', authenticateUser, async (req, res) => {
  try {
    const snapshot = await admin.firestore()
      .collection('requests')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const requests = [];
    for (const doc of snapshot.docs) {
      requests.push({
        id: doc.id,
        ...doc.data(),
      });
    }

    res.json({
      success: true,
      requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user requests',
      error: error.message,
    });
  }
});

// Update user role (admin only)
router.patch('/:uid/role', authenticateUser, async (req, res) => {
  try {
    const { role } = req.body;

    // Check if the current user is an admin
    const currentUserDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    if (!currentUserDoc.exists || currentUserDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update user roles' });
    }

    // Update the user's role
    await admin.firestore().collection('users').doc(req.params.uid).update({
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: 'User role updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message,
    });
  }
});

module.exports = router; 