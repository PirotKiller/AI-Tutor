# AI Tutor Chatbot

This is a full-stack, local-first AI Tutor chatbot designed to help students learn. It features a conversational chat interface, a dynamic quiz playground, all powered by a local `ollama` model.

The entire application runs on your local machine, ensuring privacy and fast responses.

## ✨ Features

* **Conversational AI Tutor:** A chat interface to ask questions and get help from an AI.
* **Quiz Playground:** A separate section to generate multiple-choice quizzes on any topic you provide.
* **Voice Conversation Mode:** Full hands-free operation with built-in Speech-to-Text (STT) and Text-to-Speech (TTS).
* **Local-First:** All chat history is saved securely in your browser's local storage.
* **Locally Powered:** Uses `ollama` to run the `llama3.1` model (or any other compatible model) locally.

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Backend:** Python 3, Flask
* **AI:** `ollama` (running `llama3.1` or other models)

## 🚀 Setup and Installation

To get this project running, you need to set up both the backend server and the frontend.

### Prerequisites

1.  **Python 3:** Make sure Python is installed on your system.
2.  **Ollama:** You must have `ollama` installed and running. You can get it from <https://ollama.com/>.
3.  **A Local Model:** Pull the model used in the code.

    ```sh
    ollama pull llama3.1
    ```

### 1. Backend Setup

The backend is a simple Flask server that connects to `ollama`.

1.  **Navigate to your project directory:**

    ```sh
    cd /path/to/your-project
    ```

2.  **Install Python dependencies:**

    ```sh
    # We need Flask for the server, flask-cors for cross-origin requests, and ollama for the AI
    pip install Flask flask-cors ollama
    ```

3.  **Run the backend server:**

    ```sh
    python backend.py
    ```

    The server will start, and you should see a message: `Python server is running on http://127.0.0.1:5000`

### 2. Frontend Setup

The frontend is a simple static website.

1.  **Open the `index.html` file** in your web browser.
2.  You can just double-click the file, or right-click and "Open with..." your preferred browser.

## 💡 How to Use

1.  Make sure the **backend server is running** (from `python backend.py`).
2.  Make sure **`ollama` is running** in the background.
3.  Open **`index.html`** in your browser.

You can now:

* **Chat:** Type a message or use the microphone to talk to the AI.
* **Switch to Quiz:** Click the "**Playground**" button to open the quiz generator.
* **Toggle Voice:** Click the "**Voice Conversation**" toggle for a hands-free, two-way voice chat.
