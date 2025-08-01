const mqtt = require('mqtt');
const axios = require('axios');

// --- Configuration ---
const MQTT_BROKER_URL = 'mqtt://localhost:1883';
const MQTT_TOPIC = 'payments/processed';

// IMPORTANT: This URL will be replaced with your live Netlify Function URL later.
const NOTIFICATION_API_URL = 'YOUR_NETLIFY_FUNCTION_URL_GOES_HERE';

if (NOTIFICATION_API_URL.includes('YOUR_NETLIFY')) {
    console.error("CRITICAL: Please deploy your Netlify function and update the 'NOTIFICATION_API_URL' before running this script!");
    process.exit(1);
}

const client = mqtt.connect(MQTT_BROKER_URL);

client.on('connect', () => {
    console.log('Connected to MQTT Broker.');
    client.subscribe(MQTT_TOPIC, (err) => {
        if (err) {
            console.error('Subscription failed:', err);
        } else {
            console.log(`Subscribed to topic: ${MQTT_TOPIC}. Waiting for messages...`);
        }
    });
});

client.on('message', async (topic, message) => {
    console.log(`\nReceived message on topic '${topic}': ${message.toString()}`);
    try {
        const payload = JSON.parse(message.toString());
        console.log('Forwarding payload to cloud notification API...');
        
        const response = await axios.post(NOTIFICATION_API_URL, payload);
        
        console.log(`Cloud function responded with Status: ${response.status}. Response:`, response.data);
    } catch (error) {
        console.error('Error calling notification API:', error.message);
    }
});

client.on('error', (error) => console.error('MQTT Error:', error));

netlify/functions/sendNotification.js


exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    const { user_id, amount } = body;

    if (!user_id || typeof amount === 'undefined') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Bad Request: Missing user_id or amount.' }),
      };
    }

    // In a real-world scenario, you would use a service like Twilio (SMS) or SendGrid (email).
    // Here, we just log to the console. This log is visible in your Netlify dashboard.
    const notificationMessage = `Hello ${user_id}, your payment of $${amount.toFixed(2)} has been processed.`;
    console.log(`SIMULATING NOTIFICATION: ${notificationMessage}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Notification processed successfully.' }),
    };
  } catch (error) {
    console.error('Function Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error.' }),
    };
  }
};