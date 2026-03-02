const API = "/api";

let lastMessageCount = 0;

function signup() {

  const usernameValue = username.value.trim();
  const passwordValue = password.value.trim();

  const errorDiv = document.getElementById("errors");
  errorDiv.textContent = ""; // Clear previous message

  if (!usernameValue || !passwordValue) {
    errorDiv.textContent = "Username and password cannot be blank.";
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
    if (data.message) {
      errorDiv.classList.remove("text-danger");
      errorDiv.classList.add("text-success");
      errorDiv.textContent = data.message;
    } else {
      errorDiv.classList.remove("text-success");
      errorDiv.classList.add("text-danger");
      errorDiv.textContent = data.error;
    }
  });
}

function login() {

  const usernameValue = username.value.trim();
  const passwordValue = password.value.trim();

  const errorDiv = document.getElementById("errors");
  errorDiv.textContent = ""; // Clear previous message

  if (!usernameValue || !passwordValue) {
    errorDiv.textContent = "Username and password cannot be blank.";
    return;
  }

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
      errorDiv.classList.remove("text-success");
      errorDiv.classList.add("text-danger");
      errorDiv.textContent = data.error;
    }
  });
}


// ----------------- HOME -----------------
if (window.location.pathname.includes("home")) {
  const loggedInUser = localStorage.getItem("user");
  fetch(`${window.location.origin}/api/users`)
    .then(res => res.json())
    .then(users => {
      console.log("Users:", users);
      const list = document.getElementById("users");
      users.forEach(user => {
        if(user.username !== loggedInUser){
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

// ----------------- CHAT -----------------
if (window.location.pathname.includes("chat")) {
  const user = localStorage.getItem("user");
  const chatWith = localStorage.getItem("chatWith");
  document.getElementById("chatWith").innerText = chatWith;

function loadMessages(){
  fetch(API + "/messages", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ user1: user, user2: chatWith })
  })
  .then(res => res.json())
  .then(data => {

    const messagesDiv = document.getElementById("messages");

    // If first load → render everything
    if(lastMessageCount === 0){
      messagesDiv.innerHTML = "";
      data.forEach(msg => addMessageToUI(msg));
      lastMessageCount = data.length;
      scrollToBottom();
      return;
    }

    // Only add new messages
    if(data.length > lastMessageCount){
      const newMessages = data.slice(lastMessageCount);
      newMessages.forEach(msg => addMessageToUI(msg));
      lastMessageCount = data.length;
      scrollToBottom();
    }

  });
}

function addMessageToUI(msg){
  const div = document.createElement("div");
  div.classList.add("message");

  if(msg.sender === user){
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

  loadMessages();
  setInterval(loadMessages, 200);
}