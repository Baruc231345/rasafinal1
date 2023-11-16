const registerBtn = document.getElementById("register");
const registerContainer = document.querySelector(".logincontainer");
const regBtn_register = document.getElementById("regBtn_register");
const success = document.getElementById('success');
const danger = document.getElementById('danger');
const form = document.getElementById('form');


regBtn_register.addEventListener("click", function(event) {
    event.preventDefault(); // prevent the default form submission behavior

    // perform form validation and submission code here
    // ...

    // redirect the user to the homepage
    window.location.href = "/";
});

    form.addEventListener("submit",() => {
        const register = {
            email: reg_name.value,
            password: reg_pass.value
        }       
        fetch("/api/register", {
            method: "POST",
            body: JSON.stringify(register),
            headers: {
                "Content-type": "application/json"
            }
        }) .then(res => res.json())
            .then(data => {
                if (data.status == "error"){
                    danger.style.display = 'block';
                    danger.innerText = data.error
                
                } else{
                    success.style.display = 'block';
                    success.innerText = data.success
                }
            })
    })