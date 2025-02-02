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
    // Extract the assistant's reply from the API response
    const reply =
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content;
    return reply || "No reply received.";
  } catch (error) {
    console.error('Error:', error);
    return "Error processing your request.";
  }
}

// Event listener for the Send button (text-based)
document.getElementById('send-btn').addEventListener('click', async () => {
  const inputField = document.getElementById('user-input');
  const userMessage = inputField.value.trim();
  if (!userMessage) return; // Do nothing if the input is empty

  displayMessage('User', userMessage);
  inputField.value = '';

  const reply = await sendMessageToChatGPT(userMessage);
  displayMessage('Assistant', reply);
});

// ----------------- Voice Recognition Code -----------------

// Check for Web Speech API support
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!window.SpeechRecognition) {
  alert("Your browser does not support the Web Speech API. Please try Chrome or Edge.");
} else {
  const recognition = new window.SpeechRecognition();
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  let finalTranscript = '';

  recognition.addEventListener('result', event => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + " ";
      } else {
        interimTranscript += transcript;
      }
    }
    // Update the input field with the combined transcript
    document.getElementById('user-input').value = finalTranscript + interimTranscript;
  });

  recognition.addEventListener('end', () => {
    // Re-enable voice buttons when recognition stops
    document.getElementById('start-voice').disabled = false;
    document.getElementById('stop-voice').disabled = true;
  });

  // Start voice recognition when the Start Voice button is clicked
  document.getElementById('start-voice').addEventListener('click', () => {
    finalTranscript = ''; // Reset the transcript
    document.getElementById('user-input').value = '';
    recognition.start();
    document.getElementById('start-voice').disabled = true;
    document.getElementById('stop-voice').disabled = false;
  });

  // Stop voice recognition when the Stop Voice button is clicked
  document.getElementById('stop-voice').addEventListener('click', () => {
    recognition.stop();
    document.getElementById('start-voice').disabled = false;
    document.getElementById('stop-voice').disabled = true;
  });
}
