from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
import os
from datetime import datetime

app = Flask(__name__, template_folder="../templates", static_folder="../static")
CORS(app)

MONGO_URI = os.environ.get("MONGO_URI")

if not MONGO_URI:
    raise Exception("MONGO_URI not set in environment variables")

client = MongoClient(MONGO_URI)
db = client.chatapp

users = db.users
messages = db.messages


app = Flask(
    __name__,
    template_folder="../templates",
    static_folder="../static"
)


# ---------------- PAGES ----------------

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/home")
def home():
    return render_template("home.html")

@app.route("/chat")
def chat():
    return render_template("chat.html")


# ---------------- AUTH ----------------

@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.json
    username = data["username"]
    password = data["password"]

    if users.find_one({"username": username}):
        return jsonify({"error": "User exists"}), 400

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

    users.insert_one({
        "username": username,
        "password": hashed
    })

    return jsonify({"message": "User created"})


@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    username = data["username"]
    password = data["password"]

    user = users.find_one({"username": username})
    if not user:
        return jsonify({"error": "Invalid credentials"}), 400

    if bcrypt.checkpw(password.encode(), user["password"]):
        return jsonify({"message": "Login success"})
    else:
        return jsonify({"error": "Invalid credentials"}), 400


# ---------------- USERS ----------------

@app.route("/api/users")
def get_users():
    all_users = list(users.find({}, {"_id": 0, "password": 0}))
    return jsonify(all_users)


# ---------------- CHAT ----------------

@app.route("/api/send", methods=["POST"])
def send_message():
    data = request.json

    messages.insert_one({
        "sender": data["sender"],
        "receiver": data["receiver"],
        "text": data["text"],
        "timestamp": datetime.utcnow()
    })

    return jsonify({"message": "Sent"})


@app.route("/api/messages", methods=["POST"])
def get_messages():
    data = request.json
    user1 = data["user1"]
    user2 = data["user2"]

    chat = list(messages.find({
        "$or": [
            {"sender": user1, "receiver": user2},
            {"sender": user2, "receiver": user1}
        ]
    }, {"_id": 0}).sort("timestamp", 1))

    return jsonify(chat)

