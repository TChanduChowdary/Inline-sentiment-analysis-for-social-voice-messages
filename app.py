from flask import Flask, request, jsonify, render_template
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from flask_cors import CORS
from twilio.rest import Client

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Twilio credentials
TWILIO_ACCOUNT_SID = 'AC2a20851af4316d38526e7b6f5d440365'
TWILIO_AUTH_TOKEN = '8c82cbd71f87e6cdaba30120acce8f82'
TWILIO_PHONE_NUMBER = '+19093445147'

# Initialize Twilio client
twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# Initialize VADER Sentiment Analyzer
analyzer = SentimentIntensityAnalyzer()

# Define keyword categories
positive_keywords = {
    "happy", "joy", "excited", "love", "great", "fantastic", "wonderful",
    "amazing", "awesome", "pleased", "good", "delighted", "positive",
    "grateful", "thankful", "blessed", "beautiful", "successful"
}

negative_keywords = {
    "emergency", "help", "urgent", "danger", "rescue", "threat", 
    "hurt", "attack", "assault", "violence", "panic", "risk", 
    "life-threatening", "immediate help", "can't breathe", "stuck", 
    "injured", "bleeding", "need assistance", "distress", "endangered",
    "accident", "pain", "sad", "angry", "depressed", "disappointed",
    "frustrated", "annoyed", "scared", "fearful", "worried", "afraid"
}

neutral_keywords = {
    "information", "update", "question", "data", "report", "meeting", 
    "schedule", "general", "neutral", "average", "standard", "routine", 
    "normal", "usual", "typical", "regular", "balance", "common", 
    "status", "facts", "details", "summary", "context"
}

# Serve the index.html page
@app.route('/')
def index():
    return render_template('index.html')

# Analyze sentiment based on keywords or VADER analysis
@app.route('/analyze', methods=['POST'])
def analyze_sentiment():
    text = request.json.get('text', '').lower()  # Convert to lowercase for easier matching
    
    # Check for keyword matches in each category
    if any(keyword in text for keyword in positive_keywords):
        sentiment = "Positive"
    elif any(keyword in text for keyword in negative_keywords):
        sentiment = "Negative"
    elif any(keyword in text for keyword in neutral_keywords):
        sentiment = "Neutral"
    else:
        # Fallback to VADER Sentiment Analysis if no keywords are found
        sentiment_score = analyzer.polarity_scores(text)
        
        if sentiment_score['compound'] >= 0.05:
            sentiment = "Positive"
        elif sentiment_score['compound'] <= -0.05:
            sentiment = "Negative"
        else:
            sentiment = "Neutral"

    return jsonify({'sentiment': sentiment})

# Endpoint to send SMS using Twilio
@app.route('/send_sms', methods=['POST'])
def send_sms():
    # Get the recipient phone number and message from the request
    recipient_number = request.json.get('recipient')
    message_body = request.json.get('message')

    if recipient_number and message_body:
        try:
            # Send SMS via Twilio
            message = twilio_client.messages.create(
                body=message_body,
                from_=TWILIO_PHONE_NUMBER,
                to=recipient_number
            )
            return jsonify({'status': 'Message sent successfully!'})
        except Exception as e:
            return jsonify({'status': 'Error sending message', 'error': str(e)}), 500
    else:
        return jsonify({'status': 'Invalid data provided'}), 400

if __name__ == '__main__':
    app.run(debug=True)
