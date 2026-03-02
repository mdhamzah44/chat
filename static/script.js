const API = "/api";

function signup() {

    // Get input values
  const usernameValue = username.value.trim();
  const passwordValue = password.value.trim();

  // Get or create error message container
  let errorDiv = document.getElementById("signupError");
  if (!errorDiv) {
    errorDiv = document.createElement("div");
    errorDiv.id = "signupError";
    errorDiv.className = "text-danger mb-2";
    username.parentNode.insertBefore(errorDiv, username.nextSibling);
  }

  // Clear previous error
  errorDiv.textContent = "";

  // Validate inputs
  if (!usernameValue || !passwordValue) {
    errorDiv.textContent = "Username and password cannot be blank.";
    return;
  }
  
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


    // Get input values and trim spaces
  const usernameValue = username.value.trim();
  const passwordValue = password.value.trim();

  // Get or create error message container
  let errorDiv = document.getElementById("loginError");
  if (!errorDiv) {
    errorDiv = document.createElement("div");
    errorDiv.id = "loginError";
    errorDiv.className = "text-danger mb-2";
    username.parentNode.insertBefore(errorDiv, username.nextSibling);
  }

  // Clear previous error
  errorDiv.textContent = "";

  // Validate inputs
  if (!usernameValue || !passwordValue) {
    errorDiv.textContent = "Username and password cannot be blank.";
    return;
  }

  
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
      window.location = "home";
    } else {
      alert(data.error);
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
      body: JSON.stringify({user1: user, user2: chatWith})
    })
    .then(res => res.json())
    .then(messages => {
      const box = document.getElementById("messages");
      box.innerHTML = "";
      messages.forEach(m => {
        box.innerHTML += `<p><b>${m.sender}:</b> ${m.text}</p>`;
      });
      box.scrollTop = box.scrollHeight;
    });
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
  setInterval(loadMessages, 2000);
}