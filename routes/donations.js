const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { body, validationResult } = require('express-validator');

// Middleware to verify Firebase ID token
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      // For testing purposes, create a mock user
      req.user = { uid: 'test-user-' + Date.now() };
      return next();
    }
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    // For testing purposes, create a mock user
    req.user = { uid: 'test-user-' + Date.now() };
    next();
  }
};

// Create a new donation
router.post('/',
  authenticateUser,
  [
    body('foodType').notEmpty(),
    body('quantity').isInt({ min: 1 }),
    body('address').notEmpty(),
    body('city').notEmpty(),
    body('state').notEmpty(),
    body('pincode').notEmpty(),
    body('availableUntil').isISO8601(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        foodType,
        quantity,
        address,
        city,
        state,
        pincode,
        availableUntil,
        description,
      } = req.body;

      const donationData = {
        userId: req.user.uid,
        foodType,
        quantity,
        address,
        city,
        state,
        pincode,
        availableUntil: new Date(availableUntil),
        description,
        status: 'available',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const donationRef = await admin.firestore().collection('donations').add(donationData);

      res.status(201).json({
        success: true,
        message: 'Donation created successfully',
        donationId: donationRef.id,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating donation',
        error: error.message,
      });
    }
  }
);

// Get all donations
router.get('/', async (req, res) => {
  try {
    const { city, state, status } = req.query;
    let query = admin.firestore().collection('donations');

    if (city) query = query.where('city', '==', city);
    if (state) query = query.where('state', '==', state);
    if (status) query = query.where('status', '==', status);

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const donations = [];

    for (const doc of snapshot.docs) {
      const donation = doc.data();
      donations.push({
        id: doc.id,
        ...donation,
      });
    }

    res.json({
      success: true,
      donations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching donations',
      error: error.message,
    });
  }
});

// Get donation by ID
router.get('/:id', async (req, res) => {
  try {
    const donationDoc = await admin.firestore().collection('donations').doc(req.params.id).get();

    if (!donationDoc.exists) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    res.json({
      success: true,
      donation: {
        id: donationDoc.id,
        ...donationDoc.data(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching donation',
      error: error.message,
    });
  }
});

// Update donation status
router.patch('/:id/status', authenticateUser, async (req, res) => {
  try {
    const { status } = req.body;
    const donationRef = admin.firestore().collection('donations').doc(req.params.id);
    const donationDoc = await donationRef.get();

    if (!donationDoc.exists) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    if (donationDoc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized to update this donation' });
    }

    await donationRef.update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: 'Donation status updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating donation status',
      error: error.message,
    });
  }
});

module.exports = router; 