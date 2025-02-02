// Function to display a message in the chat log
function displayMessage(sender, text) {
  const chatLog = document.getElementById('chat-log');
  const messageEl = document.createElement('p');
  messageEl.innerText = `${sender}: ${text}`;
  chatLog.appendChild(messageEl);
  // Auto-scroll to the bottom when a new message is added
  chatLog.scrollTop = chatLog.scrollHeight;
}

// Function to send the user's message to your serverless ChatGPT endpoint
async function sendMessageToChatGPT(userMessage) {
  try {
    const response = await fetch('https://agentic-bank.vercel.app/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: userMessage })
    });
    
    const data = await response.json();
    // Extract the assistant's reply from the response data
    const reply = data.choices && data.choices[0] && data.choices[0].message.content;
    return reply || "No reply received.";
  } catch (error) {
    console.error('Error:', error);
    return "Error processing your request.";
  }
}

// Event listener for the send button
document.getElementById('send-btn').addEventListener('click', async () => {
  const inputField = document.getElementById('user-input');
  const userMessage = inputField.value.trim();
  if (!userMessage) return; // Do nothing if the input is empty
  
  // Display the user's message
  displayMessage('User', userMessage);
  // Clear the input field
  inputField.value = '';
  
  // Get ChatGPT's response and display it
  const reply = await sendMessageToChatGPT(userMessage);
  displayMessage('Assistant', reply);
});
