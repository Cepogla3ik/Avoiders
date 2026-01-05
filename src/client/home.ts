import { socket } from "./main";

export default function init(): void {
  const homeLoginButtonElement = document.querySelector<HTMLInputElement>("#home-login");
  const homeRegisterButtonElement = document.querySelector<HTMLInputElement>("#home-register");
  const homeUsernameInputElement = document.querySelector<HTMLInputElement>("#home-username");
  const homePasswordInputElement = document.querySelector<HTMLInputElement>("#home-password");
  const homeRepasswordInputElement = document.querySelector<HTMLInputElement>("#home-repassword");
  const formAuthenticationMessagesElement = document.querySelector<HTMLInputElement>("#form-authentication-messages");
  
  socket.on('message', (data: any) => {
    console.log('Server:', data);
  });
  socket.on("user-already-registered-error", () => {
    showErrorStyles(1);
    if (formAuthenticationMessagesElement) {
      formAuthenticationMessagesElement.textContent = "This username already exists";
    }
  });
  socket.on("forbidden-nickname-reg", () => {
    showErrorStyles(1);
    if (formAuthenticationMessagesElement) {
      formAuthenticationMessagesElement.textContent = "You can't use this nickname";
    }
  });
  socket.on("login-error-user-ingame", () => {
    showErrorStyles(1);
    if (formAuthenticationMessagesElement) {
      formAuthenticationMessagesElement.textContent = "User already in game";
    }
  });
  socket.on("registration-success", () => {
    if (formAuthenticationMessagesElement) {
      formAuthenticationMessagesElement.classList.remove("show-authentication-errors-1", "show-authentication-errors-2");
      formAuthenticationMessagesElement.classList.add("show-authentication-succesful");
      formAuthenticationMessagesElement.style.color = "hsl(160 60% 40%)";
      formAuthenticationMessagesElement.textContent = "Registration successful!";
    }
  });
  socket.on("client-logined", () => {
    if (homeUsernameInputElement) {
      homeUsernameInputElement.value = "";
    }
    if (homePasswordInputElement) {
      homePasswordInputElement.value = "";
    }
    if (homeRepasswordInputElement) {
      homeRepasswordInputElement.value = "";
    }
  
    const homeElement = document.getElementById("home");
    if (homeElement) homeElement.remove();
    
    console.log("Login successful");
  });
  socket.on("client-login-error-psw", () => {
    showErrorStyles(1);
    if (formAuthenticationMessagesElement) {
      formAuthenticationMessagesElement.textContent = "Incorrect password";
    }
  });
  socket.on("client-login-error-usn", () => {
    showErrorStyles(1);
    if (formAuthenticationMessagesElement) {
      formAuthenticationMessagesElement.textContent = "User does not exist";
    }
  });
  
  
  homeRegisterButtonElement?.addEventListener("click", () => {
    const username = homeUsernameInputElement?.value.trim();
    const password = homePasswordInputElement?.value.trim();
    const repassword = homeRepasswordInputElement?.value.trim();
    
    const authMessages = [];
  
    if (!username) authMessages.push("Username is required");
    if (!password) authMessages.push("Password is required"); 
    if (password && password.length < 8) authMessages.push("Password must be at least 8 characters");
    if (password !== repassword) authMessages.push("Passwords do not match");
  
    if (authMessages.length === 0) {
      socket.emit('register', { username, password });
      console.log("Registration request sent...");
    } else {
      showErrorStyles(authMessages.length);
      if (formAuthenticationMessagesElement) {
        formAuthenticationMessagesElement.textContent = authMessages.join(".\n");
      }
      [homeUsernameInputElement, homePasswordInputElement, homeRepasswordInputElement].forEach(input => input?.blur());
    }
  });
  
  homeLoginButtonElement?.addEventListener("click", () => {
    const username = homeUsernameInputElement?.value.trim();
    const password = homePasswordInputElement?.value.trim();
  
    if (username && password) {
      socket.emit("login", { username, password });
    } else {
      showErrorStyles(1);
      if (formAuthenticationMessagesElement) {
        formAuthenticationMessagesElement.textContent = "Please fill in all fields";
      }
    }
  });
  
  function showErrorStyles(count: number) {
    formAuthenticationMessagesElement?.classList.remove("show-authentication-succesful");
    formAuthenticationMessagesElement!.style.color = "hsl(5 60% 40%)";
    
    if (count === 1) {
      formAuthenticationMessagesElement!.style.fontSize = "20px";
      formAuthenticationMessagesElement?.classList.remove("show-authentication-errors-2");
      formAuthenticationMessagesElement?.classList.add("show-authentication-errors-1");
    } else {
      formAuthenticationMessagesElement!.style.fontSize = "18px";
      formAuthenticationMessagesElement?.classList.remove("show-authentication-errors-1");
      formAuthenticationMessagesElement?.classList.add("show-authentication-errors-2");
    }
  }
}