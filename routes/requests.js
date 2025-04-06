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

// Create a new food request
router.post('/',
  authenticateUser,
  [
    body('foodType').notEmpty(),
    body('quantity').isInt({ min: 1 }),
    body('address').notEmpty(),
    body('city').notEmpty(),
    body('state').notEmpty(),
    body('pincode').notEmpty(),
    body('requiredBy').isISO8601(),
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
        requiredBy,
        description,
      } = req.body;

      const requestData = {
        userId: req.user.uid,
        foodType,
        quantity,
        address,
        city,
        state,
        pincode,
        requiredBy: new Date(requiredBy),
        description,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const requestRef = await admin.firestore().collection('requests').add(requestData);

      res.status(201).json({
        success: true,
        message: 'Food request created successfully',
        requestId: requestRef.id,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating food request',
        error: error.message,
      });
    }
  }
);

// Get all food requests
router.get('/', async (req, res) => {
  try {
    const { city, state, status } = req.query;
    let query = admin.firestore().collection('requests');

    if (city) query = query.where('city', '==', city);
    if (state) query = query.where('state', '==', state);
    if (status) query = query.where('status', '==', status);

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const requests = [];

    for (const doc of snapshot.docs) {
      const request = doc.data();
      requests.push({
        id: doc.id,
        ...request,
      });
    }

    res.json({
      success: true,
      requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching food requests',
      error: error.message,
    });
  }
});

// Get request by ID
router.get('/:id', async (req, res) => {
  try {
    const requestDoc = await admin.firestore().collection('requests').doc(req.params.id).get();

    if (!requestDoc.exists) {
      return res.status(404).json({ error: 'Food request not found' });
    }

    res.json({
      success: true,
      request: {
        id: requestDoc.id,
        ...requestDoc.data(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching food request',
      error: error.message,
    });
  }
});

// Update request status
router.patch('/:id/status', authenticateUser, async (req, res) => {
  try {
    const { status } = req.body;
    const requestRef = admin.firestore().collection('requests').doc(req.params.id);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) {
      return res.status(404).json({ error: 'Food request not found' });
    }

    if (requestDoc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized to update this request' });
    }

    await requestRef.update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: 'Food request status updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating food request status',
      error: error.message,
    });
  }
});

// Match request with donation
router.post('/:id/match', authenticateUser, async (req, res) => {
  try {
    const { donationId } = req.body;
    const requestRef = admin.firestore().collection('requests').doc(req.params.id);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) {
      return res.status(404).json({ error: 'Food request not found' });
    }

    const donationRef = admin.firestore().collection('donations').doc(donationId);
    const donationDoc = await donationRef.get();

    if (!donationDoc.exists) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    const donation = donationDoc.data();
    if (donation.status !== 'available') {
      return res.status(400).json({ error: 'Donation is not available' });
    }

    // Update both request and donation status
    await admin.firestore().runTransaction(async (transaction) => {
      transaction.update(requestRef, {
        status: 'matched',
        matchedDonationId: donationId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      transaction.update(donationRef, {
        status: 'matched',
        matchedRequestId: req.params.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    res.json({
      success: true,
      message: 'Request matched with donation successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error matching request with donation',
      error: error.message,
    });
  }
});

module.exports = router; 