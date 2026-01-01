import { socket } from "./main";

// --- СЛУШАТЕЛИ СОБЫТИЙ (ВЫНЕСЕНЫ ИЗ КЛИКОВ) ---
export default function init() {
  const homeLoginButtonElement = document.querySelector("#home-login");
  const homeRegisterButtonElement = document.querySelector("#home-register");
  const homeUsernameInputElement = document.querySelector("#home-username");
  const homePasswordInputElement = document.querySelector("#home-password");
  const homeRepasswordInputElement = document.querySelector("#home-repassword");
  const formAuthenticationMessagesElement = document.querySelector("#form-authentication-messages");
  
  socket.on('message', (data) => {
    console.log('Server:', data);
  });
  socket.on("user-already-registered-error", () => {
    showErrorStyles(1);
    formAuthenticationMessagesElement.textContent = "This username already exists";
  });
  socket.on("forbidden-nickname-reg", () => {
    showErrorStyles(1);
    formAuthenticationMessagesElement.textContent = "You can't use this nickname";
  });
  socket.on("login-error-user-ingame", () => {
    showErrorStyles(1);
    formAuthenticationMessagesElement.textContent = "User already in game";
  });
  socket.on("registration-success", () => {
    formAuthenticationMessagesElement.classList.remove("show-authentication-errors-1", "show-authentication-errors-2");
    formAuthenticationMessagesElement.classList.add("show-authentication-succesful");
    formAuthenticationMessagesElement.style.color = "hsl(160 60% 40%)";
    formAuthenticationMessagesElement.textContent = "Registration successful!";
  });
  socket.on("client-logined", () => {
    homeUsernameInputElement.value = "";
    homePasswordInputElement.value = "";
    homeRepasswordInputElement.value = "";
  
    const homeElement = document.getElementById("home");
    if (homeElement) homeElement.remove();
    
    console.log("Login successful");
  });
  socket.on("client-login-error-psw", () => {
    showErrorStyles(1);
    formAuthenticationMessagesElement.textContent = "Incorrect password";
  });
  socket.on("client-login-error-usn", () => {
    showErrorStyles(1);
    formAuthenticationMessagesElement.textContent = "User does not exist";
  });
  
  
  // --- ОБРАБОТЧИКИ КНОПОК ---
  homeRegisterButtonElement.addEventListener("click", () => {
    const username = homeUsernameInputElement.value.trim();
    const password = homePasswordInputElement.value.trim();
    const repassword = homeRepasswordInputElement.value.trim();
    
    const authMessages = [];
  
    if (!username) authMessages.push("Username is required");
    if (!password) authMessages.push("Password is required"); 
    if (password.length < 8) authMessages.push("Password must be at least 8 characters");
    if (password !== repassword) authMessages.push("Passwords do not match");
  
    if (authMessages.length === 0) {
      socket.emit('register', { username, password });
      console.log("Registration request sent...");
    } else {
      showErrorStyles(authMessages.length);
      formAuthenticationMessagesElement.textContent = authMessages.join(".\n");
      [homeUsernameInputElement, homePasswordInputElement, homeRepasswordInputElement].forEach(input => input.blur());
    }
  });
  
  homeLoginButtonElement.addEventListener("click", () => {
    const username = homeUsernameInputElement.value.trim();
    const password = homePasswordInputElement.value.trim();
  
    if (username && password) {
      socket.emit("login", { username, password });
    } else {
      showErrorStyles(1);
      formAuthenticationMessagesElement.textContent = "Please fill in all fields";
    }
  });
  
  function showErrorStyles(count) {
    formAuthenticationMessagesElement.classList.remove("show-authentication-succesful");
    formAuthenticationMessagesElement.style.color = "hsl(5 60% 40%)";
    
    if (count === 1) {
      formAuthenticationMessagesElement.style.fontSize = "20px";
      formAuthenticationMessagesElement.classList.remove("show-authentication-errors-2");
      formAuthenticationMessagesElement.classList.add("show-authentication-errors-1");
    } else {
      formAuthenticationMessagesElement.style.fontSize = "18px";
      formAuthenticationMessagesElement.classList.remove("show-authentication-errors-1");
      formAuthenticationMessagesElement.classList.add("show-authentication-errors-2");
    }
  }
}