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
    savePetugas
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

        adminData =
            result.results;

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

                    <button
                        class="btn-icon edit"
                        onclick="editPetugas(${item.id})"
                    >
                        <i class="ri-edit-line"></i>
                    </button>

                    <button
                        class="btn-icon delete"
                        onclick="hapusPetugas(${item.id})"
                    >
                        <i class="ri-delete-bin-line"></i>
                    </button>

                </td>

            </tr>
        `
        ).join("");
}

/* =========================
   SAVE 
========================= */
async function savePetugas(){

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

    if(!username || !password){

        alert(
            "Username dan password wajib diisi"
        );

        return;
    }

    try{

        const response =
            await fetch(
                `${BASE_URL}/accounts/users/`,
                {
                    method:"POST",

                    headers:{
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${getAccessToken()}`
                    },

                    body:JSON.stringify({
                        username,
                        password,
                        role
                    })
                }
            );

        const result =
            await response.json();

        if(!response.ok){

            console.log(result);

            throw new Error(
                "Gagal menambah petugas"
            );
        }

        alert(
            "Petugas berhasil ditambahkan"
        );

        clearForm();

        closeModal(
            "admin-modal"
        );

        loadPetugas();

    }catch(error){

        console.error(error);

        alert(
            "Gagal menambah petugas"
        );
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
            adminData.filter(
                item =>
                    item.username
                    .toLowerCase()
                    .includes(keyword)
            );

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
            item =>
                item.id === id
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

    openAdminModal();
};

/* =========================
   DELETE
========================= */
window.hapusPetugas =
async function(id){

    const konfirmasi =
        confirm(
            "Hapus petugas ini?"
        );

    if(!konfirmasi) return;

    try{

        const token =
            localStorage.getItem(
                "access"
            );

        const response =
            await fetch(
                `${BASE_URL}/accounts/users/${id}/`,
                {
                    method:"DELETE",

                    headers:{
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        if(!response.ok){
            throw new Error();
        }

        loadPetugas();

    }catch(error){

        alert(
            "Gagal menghapus data"
        );
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