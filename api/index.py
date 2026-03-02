from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

MONGO_URI = os.environ.get("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client.chatapp

users = db.users
messages = db.messages


# ------------------ AUTH ------------------

@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.json
    username = data["username"]
    password = data["password"]

    if users.find_one({"username": username}):
        return jsonify({"error": "User exists"}), 400

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

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

    if bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return jsonify({"message": "Login success"})
    else:
        return jsonify({"error": "Invalid credentials"}), 400


# ------------------ USERS ------------------

@app.route("/api/users", methods=["GET"])
def get_users():
    all_users = list(users.find({}, {"_id": 0, "password": 0}))
    return jsonify(all_users)


# ------------------ CHAT ------------------

@app.route("/api/send", methods=["POST"])
def send_message():
    data = request.json
    sender = data["sender"]
    receiver = data["receiver"]
    text = data["text"]

    messages.insert_one({
        "sender": sender,
        "receiver": receiver,
        "text": text,
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


if __name__ == "__main__":
    app.run()