const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testApi() {
    try {
        // Create a valid token for an admin user
        // We know we just made all users admins. Let's create a token for user ID "69b9189998c4a5a5dbd1fd87"
        const token = jwt.sign({ user: { id: "69b9189998c4a5a5dbd1fd87" } }, process.env.JWT_SECRET || "secret");
        console.log("Token:", token);

        const response = await axios.get('http://localhost:4000/api/admin/orders', {
            headers: { 'auth-token': token }
        });

        console.log("Response Data:", response.data);
    } catch (error) {
        console.error("API Error:", error.response ? error.response.data : error.message);
    }
}

testApi();
