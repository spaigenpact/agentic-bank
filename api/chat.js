// api/chat.js
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Ensure the request contains a "message" field
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

    // Parse the response from OpenAI
    const data = await response.json();

    // If OpenAI returned an error, forward that error
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // Return the response from OpenAI to the client
    res.status(200).json(data);
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    res.status(500).json({ error: 'Error communicating with OpenAI API' });
  }
}
