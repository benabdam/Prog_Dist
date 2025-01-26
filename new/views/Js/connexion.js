document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");
    //const usernameInput = form.querySelector("#username");
    const emailInput = form.querySelector("#email");
    const passwordInput = form.querySelector("#pwd");
    const togglePassword = form.querySelector("#toggle-password");
    const passwordEye = togglePassword.querySelector("i");
    const passwordInputType = passwordInput.getAttribute("type");
    togglePassword.addEventListener("click", function() {
    if (passwordInput.getAttribute("type") === "password") {
      passwordInput.setAttribute("type", "text");
      passwordEye.classList.remove("fa-eye");
      passwordEye.classList.add("fa-eye-slash");
    } else {
      passwordInput.setAttribute("type", "password");
      passwordEye.classList.remove("fa-eye-slash");
      passwordEye.classList.add("fa-eye");
    }
  });
    form.addEventListener("submit", function(event) {
      let errors = [];

     /* if (usernameInput.value.trim() === "") {
        errors.push("Nom d'utilisateur est requis");
        usernameInput.classList.add("is-invalid");
      } else {
        usernameInput.classList.remove("is-invalid");
      }*/

      if (emailInput.value.trim() === "") {
        errors.push("Adresse email est requise");
        emailInput.classList.add("is-invalid");
      } else {
        emailInput.classList.remove("is-invalid");
      }

      if (passwordInput.value.trim() === "") {
        errors.push("Mot de passe est requis");
        passwordInput.classList.add("is-invalid");
      } else {
        passwordInput.classList.remove("is-invalid");
      }

      const errorMessages = form.querySelectorAll(".invalid-feedback");
      errorMessages.forEach(function(element) {
        element.remove();
      });

      if (errors.length > 0) {
        event.preventDefault();
        errors.forEach(function(error) {
          const errorDiv = document.createElement("div");
          errorDiv.className = "invalid-feedback";
          errorDiv.innerText = error;
          if (error === "Nom d'utilisateur est requis") {
            usernameInput.parentNode.appendChild(errorDiv);
          } else if (error === "Adresse email est requise") {
            emailInput.parentNode.appendChild(errorDiv);
          } else if (error === "Mot de passe est requis") {
            passwordInput.parentNode.appendChild(errorDiv);
          }
        });
      }
    });
  });