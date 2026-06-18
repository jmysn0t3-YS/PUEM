import { apiFetch } from "../api.js";
import { showToast } from "./toast.js";

/* =========================
   STATE
========================= */
const tbody = document.getElementById("wilayah-body");

let kecamatanData = [];
let desaData = [];
let selectedKecamatanId = "";
let editKecamatanId = null;
let editDesaId = null;
let currentPage = 1;
const rowsPerPage = 10;
/* =========================
   FETCH UTIL
========================= */
async function fetchAllKecamatan() {
    let url = "/wilayah/kecamatan/";
    let all = [];

    while (url) {
        const res = await apiFetch(url);
        all = all.concat(res.results);
        url = res.next;
    }

    return all;
}

/* =========================
   VIEW SWITCH
========================= */
function renderTableHead() {

    document.getElementById("table-head").innerHTML = `
        <tr>
            <th>No</th>
            <th>Kecamatan</th>
            <th>Desa</th>
            <th>Aksi</th>
        </tr>
    `;
}

/* =========================
   RENDER DESA
========================= */
function renderDesaView(){

    tbody.innerHTML = "";

    let list = [...desaData];

    if(selectedKecamatanId){
        list = list.filter(
            d => d.kecamatan == selectedKecamatanId
        );
    }

    list.sort((a,b)=>{

        const kecA =
            kecamatanData.find(
                k => k.id == a.kecamatan
            );

        const kecB =
            kecamatanData.find(
                k => k.id == b.kecamatan
            );

        const namaA =
            kecA?.nama_kec || "";

        const namaB =
            kecB?.nama_kec || "";

        if(namaA !== namaB){
            return namaA.localeCompare(namaB);
        }

        return a.nama_desa.localeCompare(
            b.nama_desa
        );
    });

    /* =========================
       PAGINATION
    ========================= */
    const totalPages =
        Math.ceil(
            list.length / rowsPerPage
        );

    if(currentPage > totalPages){
        currentPage = totalPages || 1;
    }

    const start =
        (currentPage - 1) *
        rowsPerPage;

    const end =
        start + rowsPerPage;

    const paginatedData =
        list.slice(start, end);

    function renderPagination(totalData){

        const pagination =
            document.getElementById(
                "pagination"
            );

        if(!pagination) return;

        const totalPages =
            Math.ceil(
                totalData / rowsPerPage
            );

        pagination.innerHTML = "";

        if(totalPages <= 1) return;

        pagination.innerHTML += `
            <button
                ${currentPage === 1 ? "disabled" : ""}
                onclick="changePage(${currentPage - 1})"
            >
                <i class="ri-arrow-left-s-line"></i>
            </button>
        `;

        let start =
            Math.max(
                currentPage - 2,
                1
            );

        let end =
            Math.min(
                currentPage + 2,
                totalPages
            );

        if(start > 1){
            pagination.innerHTML += `
                <button onclick="changePage(1)">
                    1
                </button>
            `;

            if(start > 2){
                pagination.innerHTML += `
                    <span class="dots">...</span>
                `;
            }
        }

        for(let i = start; i <= end; i++){

            pagination.innerHTML += `
                <button
                    class="${
                        i === currentPage
                        ? "active"
                        : ""
                    }"
                    onclick="changePage(${i})"
                >
                    ${i}
                </button>
            `;
        }

        if(end < totalPages){

            if(end < totalPages - 1){
                pagination.innerHTML += `
                    <span class="dots">...</span>
                `;
            }

            pagination.innerHTML += `
                <button
                    onclick="
                        changePage(${totalPages})
                    "
                >
                    ${totalPages}
                </button>
            `;
        }

        pagination.innerHTML += `
            <button
                ${
                    currentPage === totalPages
                    ? "disabled"
                    : ""
                }
                onclick="
                    changePage(${currentPage + 1})
                "
            >
                <i class="ri-arrow-right-s-line"></i>
            </button>
        `;
    }
    function changePage(page){

        currentPage = page;

        renderDesaView();
    }

    window.changePage = changePage;
    /* =========================
       EMPTY DATA
    ========================= */
    if(list.length === 0){

        tbody.innerHTML = `
            <tr>
                <td colspan="4">
                    Data kosong
                </td>
            </tr>
        `;

        document.getElementById(
            "pagination"
        ).innerHTML = "";

        return;
    }

    /* =========================
       RENDER TABLE
    ========================= */
    paginatedData.forEach((d,i)=>{

        const kec =
            kecamatanData.find(
                k => k.id == d.kecamatan
            );

        tbody.innerHTML += `
            <tr>
                <td>${start + i + 1}</td>

                <td>
                    ${kec?.nama_kec || "-"}
                </td>

                <td>
                    ${d.nama_desa}
                </td>

                <td>
                    <div class="action-buttons">

                        <button
                            class="btn warning"
                            onclick="editDesa(${d.id})"
                        >
                            <i class="ri-edit-line"></i>
                            Edit
                        </button>

                        <button
                            class="btn danger"
                            onclick="deleteDesa(${d.id})"
                        >
                            <i class="ri-delete-bin-line"></i>
                            Hapus
                        </button>

                    </div>
                </td>
            </tr>
        `;
    });

    renderPagination(list.length);
}
/* =========================
   LOAD DATA
========================= */
async function loadWilayah() {
    try {
        const [kecRes, desaRes] = await Promise.all([
            apiFetch("/wilayah/kecamatan/"),
            apiFetch("/wilayah/desa/")
        ]);

        kecamatanData = kecRes.results || kecRes;
        desaData = desaRes.results || desaRes;

        renderDashboard();
        renderSelectKecamatan();
        renderFilterKecamatan();

        renderTableHead();
        renderDesaView();

    } catch (error) {
        console.log("ERROR WILAYAH:", error);

        tbody.innerHTML = `
            <tr>
                <td colspan="4">Gagal mengambil data wilayah</td>
            </tr>
        `;
    }
}

/* =========================
   DASHBOARD
========================= */
function renderDashboard() {
    document.getElementById("total-kecamatan").innerText =
        kecamatanData.length;

    document.getElementById("total-desa").innerText =
        desaData.length;

    renderListDesa();
}

function renderListDesa() {
    const container = document.getElementById("list-desa");

    if (!container) return;

    container.innerHTML = "";

    if (desaData.length === 0) {
        container.innerHTML = "<p>Belum ada desa</p>";
        return;
    }

    desaData.forEach(desa => {
        container.innerHTML += `
            <span class="desa-badge">
                ${desa.nama_desa}
            </span>
        `;
    });
}

/* =========================
   SELECT & FILTER
========================= */
function renderSelectKecamatan() {
    const select = document.getElementById("desa-kecamatan");

    select.innerHTML = `<option value="">Pilih Kecamatan</option>`;

    kecamatanData.forEach(item => {
        select.innerHTML += `
            <option value="${item.id}">
                ${item.nama_kec}
            </option>
        `;
    });
}

function renderFilterKecamatan() {
    const select = document.getElementById("filter-kecamatan");

    select.innerHTML = `<option value="">Semua Kecamatan</option>`;

    kecamatanData.forEach(k => {
        select.innerHTML += `
            <option value="${k.id}">
                ${k.nama_kec}
            </option>
        `;
    });
}

function filterByKecamatan(){

    selectedKecamatanId =
        document.getElementById(
            "filter-kecamatan"
        ).value;

    currentPage = 1;

    renderDesaView();
}

window.filterByKecamatan = filterByKecamatan;

/* =========================
   managekecamatan
========================= */
function renderManageKecamatan(){

    const tbody =
        document.getElementById(
            "kecamatan-manage-body"
        );

    tbody.innerHTML = "";

    kecamatanData.forEach((k,i)=>{

        tbody.innerHTML += `
            <tr>

                <td>${i+1}</td>

                <td>
                    ${k.nama_kec}
                </td>

                <td>
                    <div class="action-buttons">

                        <button
                            class="btn warning"
                            onclick="editKecamatan(${k.id})"
                        >
                            <i class="ri-edit-line"></i>
                            Edit
                        </button>

                        <button
                            class="btn danger"
                            onclick="deleteKecamatan(${k.id})"
                        >
                            <i class="ri-delete-bin-line"></i>
                            Hapus
                        </button>

                    </div>
                </td>

            </tr>
        `;
    });
}

/* =========================
   MODAL
========================= */
function openDesaModal() {
    document.getElementById("desa-modal").classList.add("show");
}
function openKecamatanModal(){

    editKecamatanId = null;

    document.getElementById(
        "nama-kecamatan"
    ).value = "";

    document.querySelector(
        "#kecamatan-modal h3"
    ).textContent =
        "Tambah Kecamatan";

    document
        .getElementById(
            "kecamatan-modal"
        )
        .classList.add("show");
}

function closeModal(id){

    document
        .getElementById(id)
        .classList.remove("show");

    if(id === "kecamatan-modal"){

        editKecamatanId = null;

        document.getElementById(
            "nama-kecamatan"
        ).value = "";

        document.querySelector(
            "#kecamatan-modal h3"
        ).textContent =
            "Tambah Kecamatan";
    }
    if(id === "desa-modal"){

    editDesaId = null;

    document.getElementById(
        "nama-desa"
    ).value = "";

    document.getElementById(
        "desa-kecamatan"
    ).value = "";

    document.querySelector(
        "#desa-modal h3"
    ).textContent =
        "Tambah Desa";
}
}

function openManageKecamatanModal(){

    renderManageKecamatan();

    document
        .getElementById(
            "manage-kecamatan-modal"
        )
        .classList.add("show");
}

window.openKecamatanModal =openKecamatanModal;
window.openDesaModal = openDesaModal;
window.closeModal = closeModal;
window.openManageKecamatanModal =openManageKecamatanModal;


/* =========================
   SAVE
========================= */
async function saveKecamatan() {

    const btn =
        document.querySelector(
            "#kecamatan-modal .btn.primary"
        );

    btn.disabled = true;

    const nama =
        document
        .getElementById(
            "nama-kecamatan"
        )
        .value
        .trim();

    if(!nama){

        showToast(
            "Nama kecamatan wajib diisi",
            "error"
        );

        btn.disabled = false;
        return;
    }

    try{

        const payload = {
            nama_kec:nama
        };

        if(editKecamatanId){

            await apiFetch(
                `/wilayah/kecamatan/${editKecamatanId}/`,
                {
                    method:"PUT",
                    body:JSON.stringify(
                        payload
                    )
                }
            );

            showToast(
                "Kecamatan berhasil diperbarui",
                "success"
            );

        }else{

            await apiFetch(
                "/wilayah/kecamatan/",
                {
                    method:"POST",
                    body:JSON.stringify(
                        payload
                    )
                }
            );

            showToast(
                "Kecamatan berhasil ditambahkan",
                "success"
            );
        }

        document.getElementById(
            "nama-kecamatan"
        ).value = "";

        editKecamatanId = null;

        closeModal(
            "kecamatan-modal"
        );

        await loadWilayah();

        if (
            document
                .getElementById("manage-kecamatan-modal")
                .classList.contains("show")
        ) {
            renderManageKecamatan();
        }

    }catch(error){

        console.log(error);

        showToast(
            "Gagal menyimpan kecamatan",
            "error"
        );

    }finally{

        btn.disabled = false;
    }
}

async function saveDesa(){

    const nama =
        document.getElementById(
            "nama-desa"
        ).value.trim();

    const kecamatan =
        document.getElementById(
            "desa-kecamatan"
        ).value;

    if(!nama || !kecamatan){
        showToast(
            "Lengkapi data",
            "error"
        );
        return;
    }

    try{

        const url =
            editDesaId
            ? `/wilayah/desa/${editDesaId}/`
            : "/wilayah/desa/";

        const method =
            editDesaId
            ? "PUT"
            : "POST";

        await apiFetch(url,{
            method,
            body:JSON.stringify({
                nama_desa:nama,
                kecamatan
            })
        });

        showToast(
            editDesaId
            ? "Desa berhasil diperbarui"
            : "Desa berhasil ditambahkan",
            "success"
        );

        editDesaId = null;

        closeModal("desa-modal");

        await loadWilayah();

    }catch(error){

        console.log(error);

        showToast(
            "Gagal menyimpan desa",
            "error"
        );
    }
}

window.saveKecamatan = saveKecamatan;
window.saveDesa = saveDesa;

/* =========================
   Edit
========================= */
function editKecamatan(id){

    const kec =
        kecamatanData.find(
            k => k.id == id
        );

    if(!kec) return;

    editKecamatanId = id;

    document.getElementById(
        "nama-kecamatan"
    ).value = kec.nama_kec;

    document.querySelector(
        "#kecamatan-modal h3"
    ).textContent =
        "Edit Kecamatan";

    document.getElementById(
        "kecamatan-modal"
    ).classList.add("show");
}
function editDesa(id){

    const desa =
        desaData.find(
            d => d.id == id
        );

    if(!desa) return;

    editDesaId = id;

    document.getElementById(
        "nama-desa"
    ).value =
        desa.nama_desa;

    document.getElementById(
        "desa-kecamatan"
    ).value =
        desa.kecamatan;

    document.querySelector(
        "#desa-modal h3"
    ).textContent =
        "Edit Desa";

    document.getElementById(
        "desa-modal"
    ).classList.add("show");
}


window.editKecamatan = editKecamatan;
window.editDesa = editDesa;

/* =========================
   DELETE
========================= */
async function deleteKecamatan(id){

    const ok = confirm(
        "Yakin hapus kecamatan?"
    );

    if(!ok) return;

    try{

        await apiFetch(
            `/wilayah/kecamatan/${id}/`,
            {
                method:"DELETE"
            }
        );

        showToast(
            "Kecamatan berhasil dihapus",
            "success"
        );

        await loadWilayah();

        renderManageKecamatan();

    }catch(error){

        console.log(error);

        showToast(
            "Gagal menghapus kecamatan",
            "error"
        );
    }
}

async function deleteDesa(id){

    const ok = confirm(
        "Yakin hapus desa ini?"
    );

    if(!ok) return;

    try{

        await apiFetch(
            `/wilayah/desa/${id}/`,
            {
                method:"DELETE"
            }
        );

        showToast(
            "Desa berhasil dihapus",
            "success"
        );

        await loadWilayah();

    }catch(error){

        console.log(error);

        showToast(
            "Gagal menghapus desa",
            "error"
        );
    }
}

window.deleteDesa = deleteDesa;
window.deleteKecamatan = deleteKecamatan;

/* =========================
   INIT
========================= */
loadWilayah();