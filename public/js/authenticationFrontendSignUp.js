document.getElementById("signin").addEventListener("click", () => {
  window.location.href = "/authentication/";
});

// Password visibility toggle
const togglePasswordBtn = document.getElementById("togglePassword");
const passwordField = document.getElementById("password_field");
if (togglePasswordBtn) {
  togglePasswordBtn.addEventListener("click", () => {
    const isPass = passwordField.type === "password";
    passwordField.type = isPass ? "text" : "password";
    togglePasswordBtn.innerHTML = isPass
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
  });
}

// Form submit
const form = document.querySelector(".form_container");
const btnText = document.getElementById("btnText");
const submitBtn = document.getElementById("submitBtn");
const errorDiv = document.getElementById("ifincorrect");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorDiv.classList.add("hidden");

  const username = document.getElementById("username").value.trim();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email_field").value.trim();
  const password = passwordField.value;
  const college = document.getElementById("college").value.trim();
  const branch = document.getElementById("branch").value.trim();
  const year = document.getElementById("year").value.trim();

  btnText.textContent = "Creating Account...";
  submitBtn.style.opacity = "0.7";

  try {
    const response = await fetch("/authentication/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        name,
        email,
        password,
        college,
        branch,
        year,
      }),
    });
    const data = await response.json();
    if (!data.success) {
      errorDiv.textContent = data.message || "Failed to create account.";
      errorDiv.classList.remove("hidden");
      btnText.textContent = "Sign Up";
      submitBtn.style.opacity = "1";
    } else {
      window.location.href = "/";
    }
  } catch (err) {
    errorDiv.textContent = "Network error. Please try again.";
    errorDiv.classList.remove("hidden");
    btnText.textContent = "Sign Up";
    submitBtn.style.opacity = "1";
  }
});