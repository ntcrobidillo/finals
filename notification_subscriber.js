const mqtt = require('mqtt');
const axios = require('axios');

// --- Configuration ---
const MQTT_BROKER_URL = 'mqtt://172.22.160.1:1883';
const MQTT_TOPIC = 'payments/processed';



const NOTIFICATION_API_URL = 'https://marvelous-profiterole-0d29ff.netlify.app/.netlify/functions/sendNotification';

// This safety check prevents you from running with the placeholder URL.
if (NOTIFICATION_API_URL.includes('YOUR_NETLIFY')) {
    console.error("CRITICAL: Please get your live URL from the Netlify 'Functions' tab and paste it into the NOTIFICATION_API_URL variable before running!");
    process.exit(1);
}

console.log('Starting Notification Subscriber...');

const client = mqtt.connect(MQTT_BROKER_URL);

client.on('connect', () => {
    console.log('✅ Connected to MQTT Broker.');
    client.subscribe(MQTT_TOPIC, (err) => {
        if (err) {
            console.error('MQTT Subscription failed:', err);
        } else {
            console.log(`✅ Subscribed to topic: '${MQTT_TOPIC}'. Waiting for messages...`);
        }
    });
});

client.on('message', async (topic, message) => {
    console.log(`\n📬 Received message on topic '${topic}': ${message.toString()}`);
    try {
        const payload = JSON.parse(message.toString());
        console.log('🚀 Forwarding payload to the cloud notification API...');
        const response = await axios.post(NOTIFICATION_API_URL, payload);
        console.log(`✅ Cloud function responded with Status: ${response.status}. Response:`, response.data);
    } catch (error) {
        console.error('❌ Error processing message or calling notification API:', error.message);
    }
});

client.on('error', (error) => console.error('MQTT Client Error:', error));