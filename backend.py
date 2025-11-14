import ollama
from ollama import ChatResponse
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def my_python_logic(user_input):
    response: ChatResponse = ollama.chat(
        model="llama3.1",
        messages=[{'role': 'user', 'content': user_input}]
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

# Run the server
if __name__ == '__main__':
    print("Python server is running on http://127.0.0.1:5000")
    app.run(port=5000, debug=True)