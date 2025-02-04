// ---------- Chat Display and TTS Management ---------- //

// Display messages in the chat log
function displayMessage(sender, text) {
  const chatLog = document.getElementById('chat-log');
  const messageEl = document.createElement('p');
  messageEl.innerText = `${sender}: ${text}`;
  chatLog.appendChild(messageEl);
  // Auto-scroll to the bottom when a new message is added
  chatLog.scrollTop = chatLog.scrollHeight;
}

// Speak text out loud (TTS)
function speakText(text) {
  if (!text || text.trim() === "") return;
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech before starting new
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; // Adjust language as needed
    utterance.onstart = () => console.log("Speech started.");
    utterance.onend = () => console.log("Speech ended.");
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn('Speech synthesis not supported in this browser.');
  }
}

// Stop reading (interrupt TTS)
function stopReading() {
  console.log("Stop reading clicked.");
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// ---------- ChatGPT Interaction ---------- //

// Send user message to your serverless ChatGPT endpoint
async function sendMessageToChatGPT(userMessage) {
  try {
    const response = await fetch('https://agentic-bank.vercel.app/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from server:', errorData);
      throw new Error('Server returned an error');
    }

    const data = await response.json();
    console.log('Response data:', data);

    const reply =
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content;

    return reply || "No reply received.";
  } catch (error) {
    console.error('Error sending message:', error);
    return "Error processing your request.";
  }
}

// Process final recognized speech or typed message
async function handleUserMessage(userMessage) {
  if (!userMessage.trim()) return; // ignore empty
  displayMessage('User', userMessage);

  const reply = await sendMessageToChatGPT(userMessage);
  displayMessage('Assistant', reply);
  speakText(reply);
}

// ---------- Text Input: Press Enter to Send ---------- //

const userInput = document.getElementById('user-input');
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    handleUserMessage(userInput.value);
    userInput.value = '';
  }
});

// ---------- Continuous Speech Recognition ---------- //

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!window.SpeechRecognition) {
  console.warn("This browser does not support speech recognition. Text input only.");
} else {
  const recognition = new window.SpeechRecognition();
  recognition.continuous = true;       // keep listening
  recognition.interimResults = true;   // show partial transcripts
  recognition.lang = 'en-US';

  let finalTranscript = '';

  recognition.addEventListener('result', (event) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
        // Send message automatically when final
        handleUserMessage(finalTranscript);
        finalTranscript = '';
      } else {
        interimTranscript += transcript;
      }
    }
    // Optionally display the ongoing transcript in the input field
    userInput.value = finalTranscript + interimTranscript;
  });

  recognition.addEventListener('end', () => {
    // Auto-restart to maintain continuous listening
    recognition.start();
  });

  // Start continuous recognition immediately
  recognition.start();
}

// ---------- Stop Reading Button ---------- //
document.getElementById('stop-reading').addEventListener('click', stopReading);
