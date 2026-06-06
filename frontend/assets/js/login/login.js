import {
    login,
    saveAuth,
    isLogin
} from "../auth.js";

/* SUDAH LOGIN */
if(isLogin()){

    window.location.replace(
        "/index.html"
    );
}

const form =
    document.getElementById(
        "login-form"
    );

const button =
    form.querySelector("button");

/* TOAST */
function showToast(message,type){

    const toast =
        document.getElementById(
            "toast"
        );

    toast.className = "";

    toast.classList.add(
        type
    );

    toast.classList.add(
        "show"
    );

    toast.innerText =
        message;

    setTimeout(()=>{

        toast.classList.remove(
            "show"
        );

    },3000);
}

/* LOGIN */
form.addEventListener(
    "submit",
    async function(e){

        e.preventDefault();

        const username =
            document.getElementById(
                "username"
            ).value.trim();

        const password =
            document.getElementById(
                "password"
            ).value.trim();

        /* VALIDASI */
        if(!username || !password){

            showToast(
                "Username dan password wajib diisi",
                "toast-warning"
            );

            return;
        }

        /* LOADING */
        button.classList.add(
            "btn-loading"
        );

        button.innerHTML = `
            <span class="spinner"></span>
            Loading...
        `;

        try{

            const result =
                await login({
                    username,
                    password
                });

            console.log(result);

            if(result.ok){

                saveAuth(result.data);

                showToast(
                    "Login berhasil",
                    "toast-success"
                );

                setTimeout(()=>{

                    window.location.replace(
                        "/index.html"
                    );

                },1000);

            }else{

                showToast(
                    "Username atau password salah",
                    "toast-error"
                );

                button.classList.remove(
                    "btn-loading"
                );

                button.innerHTML =
                    "Login";
            }

        }catch(error){

            console.log(error);

            showToast(
                "Server error",
                "toast-error"
            );

            button.classList.remove(
                "btn-loading"
            );

            button.innerHTML =
                "Login";
        }
    }
);