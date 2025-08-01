const mqtt = require('mqtt');
const axios = require('axios'); // We use axios to make HTTP requests

// --- Configuration ---
const MQTT_BROKER_URL = 'mqtt://localhost:1883';
const MQTT_TOPIC = 'payments/processed';

// =================== THIS IS THE CORRECT URL ===================
const NOTIFICATION_API_URL = 'https://marvelous-profiterole-0d29ff.netlify.app/.netlify/functions/sendNotification';
// ===============================================================

console.log('Starting Notification Subscriber...');

// This safety check will now pass because the URL is correct.
if (NOTIFICATION_API_URL.includes('YOUR_NETLIFY')) {
    console.error("This should not happen. The URL is still a placeholder.");
    process.exit(1);
}

// Connect to the MQTT message broker
const client = mqtt.connect(MQTT_BROKER_URL);

// This function runs once the connection is successful
client.on('connect', () => {
    console.log('✅ Connected to MQTT Broker.');
    
    // Subscribe to the payments topic
    client.subscribe(MQTT_TOPIC, (err) => {
        if (err) {
            console.error('MQTT Subscription failed:', err);
        } else {
            console.log(`✅ Subscribed to topic: '${MQTT_TOPIC}'. Waiting for messages...`);
        }
    });
});

// This function runs every time a message is received on the subscribed topic
client.on('message', async (topic, message) => {
    console.log(`\n📬 Received message on topic '${topic}': ${message.toString()}`);
    
    try {
        // 1. Parse the incoming message from JSON text into a JavaScript object
        const payload = JSON.parse(message.toString());
        
        console.log(`🚀 Forwarding payload to the cloud notification API...`);
        
        // 2. Make an HTTP POST request to our live Netlify Function API
        const response = await axios.post(NOTIFICATION_API_URL, payload);
        
        // 3. Log the successful response from the cloud function
        console.log(`✅ Cloud function responded with Status: ${response.status}. Response:`, response.data);

    } catch (error) {
        // This block runs if the JSON parsing or the API call fails
        console.error('❌ Error processing message or calling notification API:', error.message);
    }
});

// This function runs if there is a general error with the MQTT connection
client.on('error', (error) => console.error('MQTT Client Error:', error));