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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage })
    });

    // Log the raw response status for debugging
    console.log('Response status:', response.status);

    // If the response is not OK, log and throw an error to trigger the catch block
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error data from server:', errorData);
      throw new Error('Server returned an error');
    }

    const data = await response.json();
    console.log('Response data:', data);

    // Extract the assistant's reply from the API response
    const reply =
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content;
    return reply || "No reply received.";
  } catch (error) {
    console.error('Error processing request:', error);
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

// ----------------- Voice Recognition Functionality -----------------

// Check if the browser supports the Web Speech API
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!window.SpeechRecognition) {
  alert("Your browser does not support the Web Speech API. Please try Chrome or Edge.");
} else {
  const recognition = new window.SpeechRecognition();
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  
  let finalTranscript = '';

  recognition.addEventListener('start', () => {
    console.log("Speech recognition started");
  });

  recognition.addEventListener('result', event => {
    console.log('Speech recognition result event fired');
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
    console.log("Speech recognition ended");
    document.getElementById('start-voice').disabled = false;
    document.getElementById('stop-voice').disabled = true;
  });

  document.getElementById('start-voice').addEventListener('click', () => {
    console.log("Start Voice button clicked");
    finalTranscript = ''; // Reset transcript
    document.getElementById('user-input').value = '';
    recognition.start();
    document.getElementById('start-voice').disabled = true;
    document.getElementById('stop-voice').disabled = false;
  });

  document.getElementById('stop-voice').addEventListener('click', () => {
    console.log("Stop Voice button clicked");
    recognition.stop();
    document.getElementById('start-voice').disabled = false;
    document.getElementById('stop-voice').disabled = true;
  });
}
