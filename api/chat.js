// api/chat.js

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req, res) {
  // Set CORS headers to allow all origins (or restrict to your specific domain)
  res.setHeader('Access-Control-Allow-Origin', '*'); // You can change '*' to 'https://spaigenpact.github.io' for extra security
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for a message in the request body
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Call the OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful banking assistant." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    // If OpenAI returns an error, forward that error message
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // Return the data from OpenAI
    res.status(200).json(data);
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    res.status(500).json({ error: 'Error communicating with OpenAI API' });
  }
}
