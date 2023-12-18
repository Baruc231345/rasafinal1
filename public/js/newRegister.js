const registerBtn = document.getElementById("register");
const registerContainer = document.querySelector(".logincontainer");
const regBtn_register = document.getElementById("regBtn_register");
const success = document.getElementById('success');
const danger = document.getElementById('danger');
const form = document.getElementById('form');
const toggleIcon = document.getElementById('toggleIcon'); // Define toggleIcon

regBtn_register.addEventListener("click", function(event) {
    event.preventDefault();
    window.location.href = "/";
});

form.addEventListener("submit", () => {
    const register = {
        email: reg_name.value,
        password: reg_pass.value
    };       
    fetch("/api/register", {
        method: "POST",
        body: JSON.stringify(register),
        headers: {
            "Content-type": "application/json"
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.status == "error") {
            danger.style.display = 'block';
            danger.innerText = data.error;
        } else {
            success.style.display = 'block';
            success.innerText = data.success;
        }
    });
});

function togglePassword(inputId) {
    var passwordInput = document.getElementById(inputId);

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'fas fa-eye-slash'; // 'fas' for Font Awesome 6
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'fas fa-eye'; // 'fas' for Font Awesome 6
    }
}
