const recordBtn = document.getElementById("recordBtn");
const analyzeBtn = document.getElementById("analyzeBtn");
const speechText = document.getElementById("speechText");
const sentimentText = document.getElementById("sentimentText");
const sentimentOutput = document.getElementById("sentimentOutput");
const emergencyOptions = document.getElementById("emergencyOptions");
const policeBtn = document.getElementById("policeBtn");
const hospitalBtn = document.getElementById("hospitalBtn");
const fireBtn = document.getElementById("fireBtn");

let recordedSpeech = "";

// Initialize Speech Recognition API
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US";
recognition.continuous = false;

// Button to start speech recognition
recordBtn.addEventListener("click", () => {
    recognition.start();
    speechText.textContent = "Listening...";
    analyzeBtn.disabled = true;
});

// When speech is recognized
recognition.onresult = (event) => {
    recordedSpeech = event.results[0][0].transcript;
    speechText.textContent = `You said: "${recordedSpeech}"`;
    analyzeBtn.disabled = false;
};

// Button to analyze sentiment of the recorded speech
analyzeBtn.addEventListener("click", async () => {
    if (recordedSpeech) {
        try {
            const sentimentData = await analyzeSentiment(recordedSpeech);

            sentimentText.textContent = `Sentiment: ${sentimentData.sentiment}`;
            sentimentOutput.style.display = "block";

            // Show emergency options if sentiment is negative
            if (sentimentData.sentiment === "Negative") {
                emergencyOptions.style.display = "block";
            } else {
                emergencyOptions.style.display = "none";
            }
        } catch (error) {
            console.error("Error analyzing sentiment:", error);
            sentimentText.textContent = "Error analyzing sentiment.";
        }
    }
});

// Function to send the recorded speech to the Flask backend for analysis
async function analyzeSentiment(text) {
    const response = await fetch('http://127.0.0.1:5000/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text })
    });
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return await response.json();
}

// Function to send an SMS to emergency services
async function sendSms(recipient, message) {
    const response = await fetch('http://127.0.0.1:5000/send_sms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            recipient: recipient,
            message: message
        })
    });

    const data = await response.json();
    if (data.status === 'Message sent successfully!') {
        alert("Emergency message sent!");
    } else {
        alert("Failed to send message.");
    }
}

// Emergency buttons to simulate calling emergency services
policeBtn.addEventListener("click", () => {
    const policeNumber = "+919381657056"; // Replace with the actual number
    const message = "Emergency! Immediate assistance required. Please send help. Location : Kalasalingam University,Krishankoil,TN";
    sendSms(policeNumber, message);
});

hospitalBtn.addEventListener("click", () => {
    const hospitalNumber = "+918688945369"; // Replace with the actual number
    const message = "Emergency! Immediate medical assistance required. Location : Kalasalingam University,Krishankoil,TN";
    sendSms(hospitalNumber, message);
});

fireBtn.addEventListener("click", () => {
    const fireNumber = "+918978920041"; // Replace with the actual number
    const message = "Emergency! Fire services needed immediately. Location : Kalasalingam University,Krishankoil,TN";
    sendSms(fireNumber, message);
});
