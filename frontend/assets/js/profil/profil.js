    import { BASE_URL } from "../config.js";


    let passwordStep = 1;

    /* =========================
    ELEMENT
    ========================= */

    const profileUsername =
        document.getElementById(
            "profile-username"
        );

    const infoRole =
        document.getElementById(
            "info-role"
        );

    const btnEditUsername =
        document.querySelector(".btn-primary");
    const btnChangePassword =
        document.querySelector(".btn-warning");

    /* =========================
        form
    ========================= */
    const profileCardForm = document.getElementById("profileCardForm");
    const closeForm = document.getElementById("closeForm");
    const formTitle = document.getElementById("form-title");

    const verifyBtn = document.getElementById("verify-password");
    const updateBtn = document.getElementById("update-password");

    const stepVerify = document.getElementById("step-verify");
    const stepNew = document.getElementById("step-new");

    const confirmPasswordInput = document.getElementById("confirm-password");

    const editUsernameSection = document.getElementById("edit-username-section");
    const changePasswordSection = document.getElementById("change-password-section");

    const newUsernameInput = document.getElementById("new-username");
    const oldPasswordInput = document.getElementById("old-password");
    const newPasswordInput = document.getElementById("new-password");

    const saveUsernameBtn = document.getElementById("save-username");
    const savePasswordBtn = document.getElementById("save-password");

    
    function openForm(type) {
        profileCardForm.classList.remove("hidden");

        // RESET TOTAL PASSWORD STEP (PENTING BANGET)
        resetPasswordStep();

        // paksa reset UI step juga
        stepVerify.classList.remove("hidden");
        stepNew.classList.add("hidden");

        editUsernameSection.classList.remove("active");
        changePasswordSection.classList.remove("active");

        if (type === "username") {
            formTitle.textContent = "Edit Username";
            editUsernameSection.classList.add("active");
        }

        if (type === "password") {
            formTitle.textContent = "Ganti Password";
            changePasswordSection.classList.add("active");
        }
    }

    function closeProfileForm() {
        profileCardForm.classList.add("hidden");

        // reset input
        newUsernameInput.value = "";
        oldPasswordInput.value = "";
        newPasswordInput.value = "";
    }

    function showToast(message, type = "success") {
        const toast = document.getElementById("toast");

        toast.textContent = message;
        toast.className = `toast show ${type}`;

        setTimeout(() => {
            toast.className = "toast";
        }, 2500);
    }

    /* =========================
    PROFILE
    ========================= */

    async function loadProfile() {
        let response;

        try {
            const token = localStorage.getItem("access");

            response = await fetch(
                `${BASE_URL}/accounts/profile/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log("STATUS:", response.status);
            console.log("OK:", response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.log("ERROR BODY:", errorText);
                throw new Error("Gagal mengambil profil");
            }

            const user = await response.json();

            profileUsername.textContent = user.username;
            infoRole.textContent = formatRole(user.role);

        } catch (error) {
            console.error("Gagal memuat profil:", error);
        }
    }

    function formatRole(role){

        const roles = {
            admin: "Admin",
            operator: "Operator",
            viewer: "Viewer"
        };

        return roles[role] || role;
    }

    /* =========================
    BTN
    ========================= */

    btnEditUsername.addEventListener("click", () => {
    openForm("username");
    });

    saveUsernameBtn.addEventListener("click", async () => {
        const newUsername = newUsernameInput.value.trim();
        if (!newUsername) return showToast("Username tidak boleh kosong", "error");

        const token = localStorage.getItem("access");

        try {
            const res = await fetch(`${BASE_URL}/accounts/profile/username/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ username: newUsername })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Gagal");

            profileUsername.textContent = data.username;

            showToast("Username berhasil diupdate", "success");
            closeProfileForm();

        } catch (err) {
            console.error(err);
            showToast("Gagal update username", "error");
        }
    });

    btnChangePassword.addEventListener("click", () => {
        openForm("password");
    });

    verifyBtn.addEventListener("click", async () => {

        const oldPassword = oldPasswordInput.value.trim();
        const token = localStorage.getItem("access");

        if (!oldPassword) {
            return showToast("Password lama wajib diisi", "error");
        }

        try {
            const res = await fetch(`${BASE_URL}/accounts/profile/password/verify/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    old_password: oldPassword
                })
            });

            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || "Gagal");

            showToast("Password terkonfirmasi", "success");

            // pindah ke step 2
            stepVerify.classList.add("hidden");
            stepNew.classList.remove("hidden");

            passwordStep = 2;

        } catch (err) {
            console.error("VERIFY ERROR:", err);
            showToast("Gagal verifikasi password", "error");
            closeProfileForm(); // auto close kalau gagal
        }
    });

    document.querySelectorAll(".toggle-password").forEach(icon => {
        icon.addEventListener("click", () => {

            const targetId = icon.getAttribute("data-target");
            const input = document.getElementById(targetId);

            if (input.type === "password") {
                input.type = "text";
                icon.classList.remove("ri-eye-line");
                icon.classList.add("ri-eye-off-line");
            } else {
                input.type = "password";
                icon.classList.remove("ri-eye-off-line");
                icon.classList.add("ri-eye-line");
            }

        });
    });

    updateBtn.addEventListener("click", async () => {

        const newPass = newPasswordInput.value.trim();
        const confirmPass = confirmPasswordInput.value.trim();
        const oldPassword = oldPasswordInput.value.trim(); // ⬅️ TAMBAH INI
        const token = localStorage.getItem("access");

        if (!newPass || !confirmPass) {
            return showToast("Semua field wajib diisi", "error");
        }

        if (newPass !== confirmPass) {
            return showToast("Password tidak cocok", "error");
        }

        try {
            const res = await fetch(`${BASE_URL}/accounts/profile/password/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    old_password: oldPassword,   // ⬅️ INI WAJIB
                    new_password: newPass
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Gagal");

            showToast("Password berhasil diubah", "success");

            closeProfileForm();
            resetPasswordStep();

        } catch (err) {
            console.log(err);
            showToast("Gagal ubah password", "error");
        }
    });

    closeForm.addEventListener("click", (e) => {
        e.preventDefault();
        closeProfileForm();
    });

    function resetPasswordStep() {
        passwordStep = 1;

        stepVerify.classList.remove("hidden");
        stepNew.classList.add("hidden");

        oldPasswordInput.value = "";
        newPasswordInput.value = "";
        confirmPasswordInput.value = "";
    }

    profileCardForm.addEventListener("click", (e) => {
        if (e.target === profileCardForm) {
            closeProfileForm();
        }
    });

    loadProfile();