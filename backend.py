import ollama
from ollama import ChatResponse
from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

def my_python_logic(user_input):
    system_prompt = (
        "You are an AI Tutor. Your role is to help students learn. "
        "Do not just give the answer. Instead, ask guiding questions and "
        "help the student arrive at the answer themselves. Be encouraging "
        "and supportive."
    )


    response: ChatResponse = ollama.chat(
        model="llama3.1",
        messages=[{'role': 'system', 'content': system_prompt},
        {'role': 'user', 'content': user_input}]
    )
    string = response['message']['content']

    print(f"AI Response: {string}")
    return string

@app.route('/process', methods=['POST'])
def process_data():
    # 1. Get data from the website request
    data = request.get_json()
    
    if not data or 'message' not in data:
        return jsonify({"error": "No message provided"}), 400

    user_message = data['message']
    print(f"Received from website: {user_message}")

    # 2. Run your Python logic
    ai_response = my_python_logic(user_message)

    # 3. Send the result back to the website as JSON
    return jsonify({
        "reply": ai_response,
        "status": "success"
    })

@app.route('/generate_quiz', methods=['POST'])
def generate_quiz():
    data = request.get_json()
    if not data or 'topic' not in data:
        return jsonify({"error": "No topic provided"}), 400

    topic = data['topic']
    print(f"Generating quiz for topic: {topic}")

    # This prompt asks the AI to act as a quiz generator and format the output as JSON
    quiz_prompt = f"""
    You are an AI assistant that generates quizzes.
    Create a 5-question multiple-choice quiz on the topic of "{topic}".
    Provide your response as a single, valid JSON object, with no other text.
    The JSON object must follow this structure:
    {{
        "questions": [
            {{
                "question": "Your question text here",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": "Option B"
            }},
            ... (5 questions total)
        ]
    }}
    """

    try:
        response: ChatResponse = ollama.chat(
            model="llama3.1",
            messages=[{'role': 'user', 'content': quiz_prompt}]
        )
        # The AI's response content should be a JSON string
        json_string = response['message']['content']
        
        # Clean the string in case the AI wraps it in ```json ... ```
        if json_string.strip().startswith("```json"):
            json_string = json_string.strip()[7:-3].strip()

        # Parse the JSON string into a Python object
        quiz_data = json.loads(json_string)

        # Send the JSON object to the frontend
        return jsonify(quiz_data)

    except Exception as e:
        print(f"Error generating or parsing quiz JSON: {e}")
        return jsonify({"error": f"Failed to generate quiz: {e}"}), 500
# --- END NEW SECTION ---

# Run the server
if __name__ == '__main__':
    print("Python server is running on http://127.0.0.1:5000")
    app.run(port=5000, debug=True)