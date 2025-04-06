// Test script for Bhookmukt backend API
const testBackend = async () => {
    try {
        // Test 1: Get all donations
        console.log('Testing GET /api/donations...');
        const donationsResponse = await fetch('http://localhost:5000/api/donations');
        const donationsData = await donationsResponse.json();
        console.log('Donations API Response:', donationsData);

        // Test 2: Get all requests
        console.log('\nTesting GET /api/requests...');
        const requestsResponse = await fetch('http://localhost:5000/api/requests');
        const requestsData = await requestsResponse.json();
        console.log('Requests API Response:', requestsData);

        // Test 3: Create a test donation
        console.log('\nTesting POST /api/donations...');
        const testDonation = {
            foodType: "Test Food",
            quantity: 5,
            address: "123 Test Street",
            city: "Test City",
            state: "Test State",
            pincode: "123456",
            availableUntil: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
            description: "Test donation"
        };

        const createDonationResponse = await fetch('http://localhost:5000/api/donations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testDonation)
        });
        const createDonationData = await createDonationResponse.json();
        console.log('Create Donation API Response:', createDonationData);

    } catch (error) {
        console.error('Error testing backend:', error);
    }
};

// Run the tests
testBackend(); 