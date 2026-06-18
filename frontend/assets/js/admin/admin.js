import { BASE_URL } from "../config.js";
import { getAccessToken } from "../auth.js";

const tableBody =
    document.getElementById(
        "admin-table-body"
    );

const totalPetugas =
    document.getElementById(
        "total-petugas"
    );

const searchInput =
    document.getElementById(
        "search-petugas"
    );

const btnSaveAdmin =
    document.getElementById(
        "btn-save-admin"
    );

btnSaveAdmin.addEventListener(
    "click",
    async function(){

        const id =
            document.getElementById(
                "admin-id"
            ).value;

        if(id){
            await updatePetugas();
        }else{
            await savePetugas();
        }
    }
);

let adminData = [];

async function protectAdminPage(){

    const response =
        await fetch(
            `${BASE_URL}/accounts/profile/`,
            {
                headers:{
                    Authorization:
                        `Bearer ${getAccessToken()}`
                }
            }
        );

    const user =
        await response.json();

    if(user.role !== "admin"){

        alert(
            "Akses ditolak"
        );

        window.location.replace(
            "/index.html"
        );
    }
}

await protectAdminPage();

/* =========================
   LOAD DATA
========================= */
async function loadPetugas(){

    try{

        const token =
            localStorage.getItem(
                "access"
            );

        console.log(
            "TOKEN :",
            token
        );

        const response =
            await fetch(
                `${BASE_URL}/accounts/users/`,
                {
                    headers:{
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        console.log(
            "STATUS :",
            response.status
        );

        if(!response.ok){
            throw new Error(
                "Gagal mengambil data"
            );
        }

        const result =
            await response.json();

        console.log(
            "DATA :",
            result
        );

        adminData = result.results.sort((a, b) => {
            // 1. admin dulu (true = 0, false = 1)
            if (a.role === "admin" && b.role !== "admin") return -1;
            if (a.role !== "admin" && b.role === "admin") return 1;

            // 2. kalau sama role → urutkan id
            return a.id - b.id;
        });

        renderTable(adminData);

    }catch(error){

        console.error(error);

    }
}

/* =========================
   RENDER TABLE
========================= */
function renderTable(data){

    totalPetugas.textContent =
        data.length;

    if(data.length === 0){

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Tidak ada data
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML =
        data.map(
            (item,index)=>`
            <tr>

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${item.username}
                </td>

                <td>
                    ${item.role}
                </td>

                <td>
                    ${
                        item.is_active
                        ? '<span class="badge success">Aktif</span>'
                        : '<span class="badge danger">Nonaktif</span>'
                    }
                </td>

                <td>
                    <div class="action-buttons">

                        <button
                            class="btn warning"
                            onclick="editPetugas(${item.id})"
                        >
                            <i class="ri-edit-line"></i>
                            Edit
                        </button>

                        <button
                            class="btn danger"
                            onclick="hapusPetugas(${item.id})"
                        >
                            <i class="ri-delete-bin-line"></i>
                            Hapus
                        </button>

                    </div>
                </td>

            </tr>
        `
        ).join("");
}

/* =========================
   SAVE 
========================= */
async function savePetugas() {

    const username =
        document.getElementById("admin-username").value.trim();

    const password =
        document.getElementById("admin-password").value.trim();

    const role =
        document.getElementById("admin-role").value;

    if (!username || !password) {

        Swal.fire({
            title: "Validasi",
            text: "Username dan password wajib diisi",
            icon: "warning"
        });

        return;
    }

    try {

    const confirm = await Swal.fire({
        title: "Tambah Petugas?",
        text: "Pastikan data sudah benar sebelum disimpan",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, simpan",
        cancelButtonText: "Batal"
    });

    if (!confirm.isConfirmed) return;

    // =========================
    // LOADING
    // =========================
    Swal.fire({
        title: "Menyimpan data...",
        text: "Harap tunggu",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const response =
        await fetch(
            `${BASE_URL}/accounts/users/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getAccessToken()}`
                },
                body: JSON.stringify({
                    username,
                    password,
                    role
                })
            }
        );

    const result = await response.json();

    if (!response.ok) {

        console.log(result);

        Swal.fire({
            title: "Gagal!",
            text: result?.detail || "Gagal menambah petugas",
            icon: "error"
        });

        return;
    }

    // =========================
    // SUCCESS
    // =========================
    Swal.fire({
        title: "Berhasil!",
        text: "Petugas berhasil ditambahkan",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
    });

    clearForm();
    closeModal("admin-modal");
    loadPetugas();

    } catch (error) {

        console.error(error);

        Swal.fire({
            title: "Error!",
            text: "Terjadi kesalahan pada server",
            icon: "error"
        });
    }
}

function clearForm(){

    document.getElementById(
        "admin-id"
    ).value = "";

    document.getElementById(
        "admin-username"
    ).value = "";

    document.getElementById(
        "admin-password"
    ).value = "";

    document.getElementById(
        "admin-role"
    ).value = "admin";

    document.getElementById(
        "modal-title"
    ).textContent =
        "Tambah Petugas";
}
/* =========================
   SEARCH
========================= */
searchInput.addEventListener(
    "input",
    function(){

        const keyword =
            this.value
            .toLowerCase();

        const filtered =
            adminData.filter(item => {

                const usernameMatch =
                    item.username
                        .toLowerCase()
                        .includes(keyword);

                const roleMatch =
                    item.role
                        .toLowerCase()
                        .includes(keyword);

                return usernameMatch || roleMatch;
            });

        renderTable(filtered);
    }
);

/* =========================
   EDIT
========================= */
window.editPetugas =
function(id){

    const data =
        adminData.find(
            item => item.id === id
        );

    if(!data) return;

    document.getElementById(
        "admin-id"
    ).value = data.id;

    document.getElementById(
        "admin-username"
    ).value = data.username;

    document.getElementById(
        "admin-role"
    ).value = data.role;

    document.getElementById(
        "admin-password"
    ).value = "";

    document.getElementById(
        "modal-title"
    ).textContent =
        "Edit Petugas";

    document.getElementById(
        "btn-save-admin"
    ).textContent =
        "Update";

    openAdminModal();
};
async function updatePetugas(){

    const id =
        document.getElementById(
            "admin-id"
        ).value;

    const username =
        document.getElementById(
            "admin-username"
        ).value.trim();

    const password =
        document.getElementById(
            "admin-password"
        ).value.trim();

    const role =
        document.getElementById(
            "admin-role"
        ).value;

    if(!username){

        return Swal.fire({
            title:"Validasi",
            text:"Username wajib diisi",
            icon:"warning"
        });
    }

    try{

        const confirm =
            await Swal.fire({
                title:"Update Petugas?",
                text:"Data akan diperbarui",
                icon:"question",
                showCancelButton:true,
                confirmButtonText:"Ya, update",
                cancelButtonText:"Batal"
            });

        if(!confirm.isConfirmed) return;

        Swal.fire({
            title:"Mengupdate data...",
            allowOutsideClick:false,
            didOpen:()=>{
                Swal.showLoading();
            }
        });

        const payload = {
            username,
            role
        };

        if(password){
            payload.password = password;
        }

        const response =
            await fetch(
                `${BASE_URL}/accounts/users/${id}/`,
                {
                    method:"PATCH",
                    headers:{
                        "Content-Type":"application/json",
                        Authorization:
                            `Bearer ${getAccessToken()}`
                    },
                    body:JSON.stringify(payload)
                }
            );

        let result = {};

        try{
            result = await response.json();
        }catch(e){}

        if(!response.ok){

            console.log(result);

            return Swal.fire({
                title:"Gagal!",
                text:
                    result?.detail ||
                    "Gagal update petugas",
                icon:"error"
            });
        }

        Swal.fire({
            title:"Berhasil!",
            text:"Petugas berhasil diperbarui",
            icon:"success",
            timer:1500,
            showConfirmButton:false
        });

        closeModal("admin-modal");

        await loadPetugas();

    }catch(error){

        console.error(error);

        Swal.fire({
            title:"Error!",
            text:"Terjadi kesalahan server",
            icon:"error"
        });
    }
}
/* =========================
   DELETE
========================= */
window.hapusPetugas = async function (id) {

    const confirm = await Swal.fire({
        title: "Hapus Petugas?",
        text: "Data tidak bisa dikembalikan",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, hapus",
        cancelButtonText: "Batal"
    });

    if (!confirm.isConfirmed) return;

    try {

        Swal.fire({
            title: "Menghapus...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const token = localStorage.getItem("access");

        const response = await fetch(
            `${BASE_URL}/accounts/users/${id}/`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {

            throw new Error();
        }

        Swal.fire({
            title: "Berhasil!",
            text: "Petugas berhasil dihapus",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
        });

        loadPetugas();

    } catch (error) {

        Swal.fire({
            title: "Gagal!",
            text: "Tidak bisa menghapus data",
            icon: "error"
        });
    }
};
/* =========================
   MODAL
========================= */
window.openAdminModal =
function(){

    document
        .getElementById(
            "admin-modal"
        )
        .classList.add("show");
};

window.openTambahPetugas =
function(){

    clearForm();

    openAdminModal();
};

window.closeModal =
function(id){

    // reset form
    document.getElementById(
        "admin-id"
    ).value = "";

    document.getElementById(
        "admin-username"
    ).value = "";

    document.getElementById(
        "admin-password"
    ).value = "";

    document.getElementById(
        "admin-role"
    ).selectedIndex = 0;

    document.getElementById(
        "modal-title"
    ).textContent =
        "Tambah Petugas";

    document.getElementById(
        "btn-save-admin"
    ).textContent =
        "Simpan";

    // tutup modal
    document
        .getElementById(id)
        .classList.remove("show");
};

/* =========================
   INIT
========================= */
loadPetugas();