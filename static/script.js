const API = "/api";
let lastMessageCount = 0;

// ---------------- SIGNUP ----------------
function signup() {
  const usernameValue = username.value.trim();
  const passwordValue = password.value.trim();
  const errorDiv = document.getElementById("errors");

  if (!usernameValue || !passwordValue) {
    errorDiv.textContent = "Username and password required";
    return;
  }

  fetch(API + "/signup", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      username: usernameValue,
      password: passwordValue
    })
  })
  .then(res => res.json())
  .then(data => {
    errorDiv.textContent = data.message || data.error;
  });
}

// ---------------- LOGIN ----------------
function login() {
  const usernameValue = username.value.trim();
  const passwordValue = password.value.trim();
  const errorDiv = document.getElementById("errors");

  fetch(API + "/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      username: usernameValue,
      password: passwordValue
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.message) {
      localStorage.setItem("user", usernameValue);
      window.location = "home";
    } else {
      errorDiv.textContent = data.error;
    }
  });
}

// ---------------- HOME ----------------
if (window.location.pathname.includes("home")) {
  const loggedInUser = localStorage.getItem("user");

  fetch(API + "/users")
    .then(res => res.json())
    .then(users => {
      const list = document.getElementById("users");

      users.forEach(user => {
        if (user.username !== loggedInUser) {
          const li = document.createElement("li");
          li.innerText = user.username;
          li.onclick = () => {
            localStorage.setItem("chatWith", user.username);
            window.location = "chat";
          };
          list.appendChild(li);
        }
      });
    });
}

// ---------------- CHAT ----------------
if (window.location.pathname.includes("chat")) {

  const user = localStorage.getItem("user");
  const chatWith = localStorage.getItem("chatWith");

  document.getElementById("chatWith").innerText = chatWith;

  function loadStatus(){
    fetch(API + "/status/" + chatWith)
      .then(res => res.json())
      .then(data => {
        const statusDiv = document.getElementById("userStatus");

        if (data.online) {
          statusDiv.innerHTML = "🟢 Online";
          statusDiv.style.color = "#22c55e";
        } else {
          const lastSeen = new Date(data.last_seen);
          statusDiv.innerHTML = "Last seen: " + lastSeen.toLocaleString();
          statusDiv.style.color = "#94a3b8";
        }
      });
  }

  function loadMessages(){
    fetch(API + "/messages", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ user1: user, user2: chatWith })
    })
    .then(res => res.json())
    .then(data => {
      const messagesDiv = document.getElementById("messages");

      if (lastMessageCount === 0) {
        messagesDiv.innerHTML = "";
        data.forEach(addMessageToUI);
        lastMessageCount = data.length;
        scrollToBottom();
        return;
      }

      if (data.length > lastMessageCount) {
        const newMessages = data.slice(lastMessageCount);
        newMessages.forEach(addMessageToUI);
        lastMessageCount = data.length;
        scrollToBottom();
      }
    });
  }

  function addMessageToUI(msg){
    const div = document.createElement("div");
    div.classList.add("message");

    if (msg.sender === user) {
      div.classList.add("sent");
    } else {
      div.classList.add("received");
    }

    div.innerText = msg.text;
    document.getElementById("messages").appendChild(div);
  }

  function scrollToBottom(){
    const messages = document.getElementById("messages");
    messages.scrollTop = messages.scrollHeight;
  }

  window.sendMessage = function(){
    const msg = document.getElementById("messageInput").value;
    if(!msg) return;

    fetch(API + "/send", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        sender: user,
        receiver: chatWith,
        text: msg
      })
    }).then(() => {
      document.getElementById("messageInput").value = "";
      loadMessages();
    });
  }

  // heartbeat
  setInterval(() => {
    fetch(API + "/heartbeat", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ username: user })
    });
  }, 5000);

  loadMessages();
  loadStatus();
  setInterval(loadMessages, 1000);
  setInterval(loadStatus, 3000);
}