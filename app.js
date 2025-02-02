// Check for SpeechRecognition API support (with vendor prefixes)
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!window.SpeechRecognition) {
  alert("Your browser does not support the Web Speech API. Please try Chrome or Edge on desktop or mobile.");
}

const recognition = new window.SpeechRecognition();
recognition.interimResults = true;  // Live updating transcript
recognition.lang = 'en-US';         // Adjust language if needed

// Get references to UI elements
const transcriptElement = document.getElementById('text');
const actionElement = document.getElementById('action');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');

let fullTranscript = "";

// Process speech recognition results
recognition.addEventListener('result', e => {
  let interimTranscript = "";
  
  // Loop through each result
  for (let i = e.resultIndex; i < e.results.length; i++) {
    const transcriptPart = e.results[i][0].transcript;
    if (e.results[i].isFinal) {
      fullTranscript += transcriptPart + " ";
    } else {
      interimTranscript += transcriptPart;
    }
  }
  
  transcriptElement.innerText = fullTranscript + interimTranscript;
});

// When recognition stops, process the full transcript to suggest an action
recognition.addEventListener('end', () => {
  processTranscript(fullTranscript);
});

// Event listeners for buttons
startBtn.addEventListener('click', () => {
  // Reset transcript and UI for a new session
  fullTranscript = "";
  transcriptElement.innerText = "";
  actionElement.innerText = "";
  
  recognition.start();
  startBtn.disabled = true;
  stopBtn.disabled = false;
});

stopBtn.addEventListener('click', () => {
  recognition.stop();
  startBtn.disabled = false;
  stopBtn.disabled = true;
});

// Simple keyword-based next best action logic
function processTranscript(text) {
  const lowerText = text.toLowerCase();
  let suggestedAction = "Please provide more details.";

  if (lowerText.includes("balance")) {
    suggestedAction = "Display account balance.";
  } else if (lowerText.includes("transaction") || lowerText.includes("history")) {
    suggestedAction = "Show recent transactions.";
  } else if (lowerText.includes("loan")) {
    suggestedAction = "Provide loan information.";
  } else if (lowerText.includes("credit card")) {
    suggestedAction = "Assist with credit card queries.";
  }
  
  actionElement.innerText = suggestedAction;
}
