// This is a Netlify Function. It's like AWS Lambda.
// It will be triggered by an HTTP POST request.

exports.handler = async (event) => {
  // Log the entire event to see what's coming in. This is great for debugging.
  console.log(`Function triggered. Received event:`, event);

  // Netlify Functions only allow certain HTTP methods. Let's make sure it's a POST.
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405, // 405 means "Method Not Allowed"
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: 'This function only accepts POST requests.' }),
    };
  }

  try {
    // The request body comes in as a string, so we need to parse it into a JavaScript object.
    const body = JSON.parse(event.body);
    const { user_id, amount } = body;

    // Validate that we received the data we need.
    if (!user_id || typeof amount === 'undefined') {
      return {
        statusCode: 400, // 400 means "Bad Request"
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: 'Request body must contain user_id and amount.' }),
      };
    }

    // This is where you would do the real work, like using a service to send an email or SMS.
    // For this project, we just log a message. This log will be visible in your Netlify function logs.
    const notificationMessage = `Hello ${user_id}, your payment of $${amount.toFixed(2)} has been processed.`;
    console.log(`SIMULATING NOTIFICATION: ${notificationMessage}`);

    // Send back a success response to the caller (your notification_subscriber.js).
    return {
      statusCode: 200, // 200 means "OK"
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: 'Notification processed successfully.' }),
    };

  } catch (error) {
    // If anything goes wrong (like malformed JSON), catch the error and send back a server error response.
    console.error('Function Error:', error);
    return {
      statusCode: 500, // 500 means "Internal Server Error"
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: 'An unexpected error occurred.' }),
    };
  }
};