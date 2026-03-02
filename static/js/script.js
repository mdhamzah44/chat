const API = "/api";

function signup() {
  fetch(API + "/signup", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      username: username.value,
      password: password.value
    })
  }).then(res => res.json()).then(data => {
    alert(data.message || data.error);
  });
}

function login() {
  fetch(API + "/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      username: username.value,
      password: password.value
    })
  }).then(res => res.json()).then(data => {
    if(data.message){
      localStorage.setItem("user", username.value);
      window.location = "home.html";
    } else {
      alert(data.error);
    }
  });
}

if (window.location.pathname.includes("home.html")) {
  fetch(API + "/users")
    .then(res => res.json())
    .then(users => {
      const list = document.getElementById("users");
      users.forEach(user => {
        if(user.username !== localStorage.getItem("user")){
          const li = document.createElement("li");
          li.innerText = user.username;
          li.onclick = () => {
            localStorage.setItem("chatWith", user.username);
            window.location = "chat.html";
          };
          list.appendChild(li);
        }
      });
    });
}

if (window.location.pathname.includes("chat.html")) {
  const user = localStorage.getItem("user");
  const chatWith = localStorage.getItem("chatWith");
  document.getElementById("chatWith").innerText = chatWith;

  function loadMessages(){
    fetch(API + "/messages", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({user1: user, user2: chatWith})
    })
    .then(res => res.json())
    .then(messages => {
      const box = document.getElementById("messages");
      box.innerHTML = "";
      messages.forEach(m => {
        box.innerHTML += `<p><b>${m.sender}:</b> ${m.text}</p>`;
      });
    });
  }

  window.sendMessage = function(){
    fetch(API + "/send", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        sender: user,
        receiver: chatWith,
        text: messageInput.value
      })
    }).then(() => {
      messageInput.value = "";
      loadMessages();
    });
  }

  loadMessages();
  setInterval(loadMessages, 300);
}