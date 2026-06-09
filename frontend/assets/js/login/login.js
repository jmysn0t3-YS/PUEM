import {
    login,
    saveAuth,
    isLogin
} from "../auth.js";

/* ======================
   REDIRECT JIKA SUDAH LOGIN
====================== */
if (isLogin()) {
    window.location.replace("/index.html");
}

/* ======================
   ELEMENT
====================== */
const form = document.getElementById("login-form");
const button = form.querySelector("button");

const usernameInput =
    document.getElementById("username");

const passwordInput =
    document.getElementById("password");

const toast =
    document.getElementById("toast");

const togglePassword =
    document.getElementById("toggle-password");

/* ======================
   TOAST
====================== */
function showToast(message, type) {

    toast.className = "";
    toast.classList.add(type, "show");

    toast.textContent = message;

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

/* ======================
   BUTTON
====================== */
function setLoading() {

    button.classList.add("btn-loading");

    button.innerHTML = `
        <span class="spinner"></span>
        Loading...
    `;
}

function resetButton() {

    button.classList.remove("btn-loading");
    button.textContent = "Login";
}

/* ======================
   LOGIN
====================== */
form.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const username =
            usernameInput.value.trim();

        const password =
            passwordInput.value.trim();

        /* VALIDASI */
        if (!username || !password) {

            showToast(
                "Username dan password wajib diisi",
                "toast-warning"
            );

            return;
        }

        setLoading();

        try {

            const result = await login({
                username,
                password
            });

            console.log(result);

            if (!result.ok) {

                showToast(
                    "Username atau password salah",
                    "toast-error"
                );

                resetButton();
                return;
            }

            saveAuth(result.data);

            showToast(
                "Login berhasil",
                "toast-success"
            );

            setTimeout(() => {
                window.location.replace(
                    "/index.html"
                );
            }, 1000);

        } catch (error) {

            console.error(error);

            showToast(
                "Server error",
                "toast-error"
            );

            resetButton();
        }
    }
);

/* ======================
   SHOW / HIDE PASSWORD
====================== */
if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        () => {

            const isPassword =
                passwordInput.type ===
                "password";

            passwordInput.type =
                isPassword
                    ? "text"
                    : "password";

            togglePassword.classList.toggle(
                "ri-eye-off-line",
                !isPassword
            );

            togglePassword.classList.toggle(
                "ri-eye-line",
                isPassword
            );
        }
    );
}