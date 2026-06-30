import { apiFetch } from "../api.js";

const tbody =
    document.getElementById(
        "bumdes-table-body"
    );

const totalBumdes =
    document.getElementById(
        "total-bumdes"
    );

const searchInput =
    document.getElementById(
        "search-bumdes"
    );

const filterKecamatan =
    document.getElementById(
        "filter-kecamatan"
    );

const params =
    new URLSearchParams(
        window.location.search
    );

const bumdesId =
    params.get("id");

let bumdesData = [];
// TOM SELECT
let sektorSelect;
let jenisSelect;
// edit
let editMode = false;
let editId = null;
let isEditing = false;
// desa
let desaSelect;

let currentPage = 1;
const rowsPerPage = 10;

/* =========================
   LOAD BUMDES
========================= */
async function loadBumdes(){

    try{

        const kecamatanId =
            filterKecamatan.value;

        let endpoint =
            "/bumdes/";

        // FILTER KECAMATAN
        if(kecamatanId){

            endpoint +=
                `?desa__kecamatan=${kecamatanId}`;
        }

        const data =
            await apiFetch(
                endpoint
            );

        const results = data.results || data;

            // URUTKAN BERDASARKAN KECAMATAN
            results.sort((a, b) => {
                const kecA = (a.kecamatan_nama || "").toLowerCase();
                const kecB = (b.kecamatan_nama || "").toLowerCase();

                if (kecA < kecB) return -1;
                if (kecA > kecB) return 1;
                return 0;
            });

        bumdesData = results;

        function openDetailById(id){

            const data =
                bumdesData.find(
                    item => item.id === id
                );

            if(!data){
                return;
            }

            showDetail(id);
        }

        totalBumdes.textContent =
            results.length;

        renderTable(results);
        if(bumdesId){

            openDetailById(
                parseInt(bumdesId)
            );
        }

    }catch(error){

        console.error(
            "Gagal load bumdes",
            error
        );
    }
}

/* =========================
   RENDER TABLE
========================= */
function renderTable(data){

    tbody.innerHTML = "";

    if(!data.length){

        tbody.innerHTML = `
            <tr>
                <td colspan="8">
                    Data kosong
                </td>
            </tr>
        `;

        renderPagination(0);
        return;
    }

    const totalPages =
        Math.ceil(
            data.length / rowsPerPage
        );

    if(currentPage > totalPages){
        currentPage = totalPages;
    }

    const start =
        (currentPage - 1) *
        rowsPerPage;

    const end =
        start + rowsPerPage;

    const pageData =
        data.slice(start, end);

    pageData.forEach((item,index)=>{

        tbody.innerHTML += `
            <tr>

                <td>${start + index + 1}</td>

                <td>${item.nama_bumdes || "-"}</td>

                <td>${item.desa_nama || "-"}</td>

                <td>${item.kecamatan_nama || "-"}</td>

                <td>${item.status_nama || "-"}</td>

                <td>
                    ${
                        item.sektor_usaha_nama
                        ? item.sektor_usaha_nama.join(", ")
                        : "-"
                    }
                </td>

                <td>
                    ${
                        item.jenis_usaha_nama
                        ? item.jenis_usaha_nama.join(", ")
                        : "-"
                    }
                </td>

                <td>
                    <div class="action-buttons">

                        <button
                            class="btn info"
                            onclick="showDetail(${item.id})"
                        >
                            <i class="ri-eye-line"></i>
                        </button>

                        <button
                            class="btn warning"
                            onclick="openEdit(${item.id})"
                        >
                            <i class="ri-edit-line"></i>
                        </button>

                        <button
                            class="btn danger"
                            onclick="deleteBumdes(${item.id})"
                        >
                            <i class="ri-delete-bin-line"></i>
                        </button>

                    </div>
                </td>

            </tr>
        `;
    });

    renderPagination(data.length);
}

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

    for(let i=1; i<=totalPages; i++){

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

    pagination.innerHTML += `
        <button
            ${
                currentPage === totalPages
                ? "disabled"
                : ""
            }
            onclick="changePage(${currentPage + 1})"
        >
            <i class="ri-arrow-right-s-line"></i>
        </button>
    `;
}

function changePage(page){

    currentPage = page;

    const keyword =
        searchInput.value
        .toLowerCase();

    const filtered =
        bumdesData.filter(item =>

            item.nama_bumdes
            ?.toLowerCase()
            .includes(keyword)

            ||

            item.desa_nama
            ?.toLowerCase()
            .includes(keyword)

            ||

            item.kecamatan_nama
            ?.toLowerCase()
            .includes(keyword)

            ||

            item.sektor_usaha_nama
            ?.join(" ")
            .toLowerCase()
            .includes(keyword)

            ||

            item.jenis_usaha_nama
            ?.join(" ")
            .toLowerCase()
            .includes(keyword)
        );

    renderTable(filtered);
}

window.changePage =
    changePage;


/* =========================
   SEARCH
========================= */
searchInput.addEventListener(
    "input",
    function(){

        currentPage = 1;

        const keyword =
            this.value.toLowerCase();

        const filtered =
            bumdesData.filter(item =>

                item.nama_bumdes
                ?.toLowerCase()
                .includes(keyword)

                ||

                item.kecamatan_nama
                ?.toLowerCase()
                .includes(keyword)

                ||

                item.desa_nama
                ?.toLowerCase()
                .includes(keyword)

                ||

                item.sektor_usaha_nama
                ?.join(" ")
                .toLowerCase()
                .includes(keyword)

                ||

                item.jenis_usaha_nama
                ?.join(" ")
                .toLowerCase()
                .includes(keyword)
            );

        renderTable(filtered);
    }
);

/* =========================
   FILTER KECAMATAN
========================= */
async function loadKecamatan(){

    try{

        const data =
            await apiFetch(
                "/wilayah/kecamatan/"
            );

        const results =
            data.results || data;

        filterKecamatan.innerHTML =
            `
            <option value="">
                Semua Kecamatan
            </option>
            `;

        results.forEach(item => {

            filterKecamatan.innerHTML += `
                <option value="${item.id}">
                    ${item.nama_kec}
                </option>
            `;
        });

    }catch(error){

        console.log(
            "Gagal load kecamatan",
            error
        );
    }
}

filterKecamatan.addEventListener(
    "change",
    function(){

        loadBumdes();
    }
);

/* =========================
   Load DEsa
========================= */
async function loadDesa(){

    try{

        const data =
            await apiFetch(
                "/wilayah/desa/"
            );

        const results =
            data.results || data;

        const desaSelect =
            document.getElementById(
                "desa-bumdes"
            );

        desaSelect.innerHTML = `
            <option value="">
                Pilih Desa
            </option>
        `;

        results.forEach(item => {

            desaSelect.innerHTML += `
                <option value="${item.id}">
                    ${item.nama_desa}
                </option>
            `;
        });

    }catch(error){

        console.log(
            "Gagal load desa",
            error
        );
    }
}

/* =========================
   STATUS
========================= */
async function loadStatus(){

    try{

        const data =
            await apiFetch(
                "/atribut/status/"
            );

        const results =
            data.results || data;

        const select =
            document.getElementById(
                "status-bumdes"
            );

        select.innerHTML = `
            <option value="">
                Pilih Status
            </option>
        `;

        results.forEach(item => {

            select.innerHTML += `
                <option value="${item.id}">
                    ${item.status}
                </option>
            `;
        });

    }catch(error){

        console.log(error);
    }
}

/* =========================
   PERINGKAT
========================= */
async function loadPeringkat(){

    try{

        const data =
            await apiFetch(
                "/atribut/peringkat/"
            );

        const results =
            data.results || data;

        const select =
            document.getElementById(
                "peringkat-bumdes"
            );

        select.innerHTML = `
            <option value="">
                Pilih Peringkat
            </option>
        `;

        results.forEach(item => {

            select.innerHTML += `
                <option value="${item.id}">
                    ${item.peringkat}
                </option>
            `;
        });

    }catch(error){

        console.log(error);
    }
}

/* =========================
   loadSektor
========================= */
async function loadSektor(){

    try{

        const data =
            await apiFetch(
                "/atribut/sektor-usaha/"
            );

        const results =
            data.results || data;

        const select =
            document.getElementById(
                "sektor-bumdes"
            );

        select.innerHTML = "";

        results.forEach(item => {

            select.innerHTML += `
                <option value="${item.id}">
                    ${item.sektor}
                </option>
            `;
        });

    }catch(error){

        console.log(error);
    }
}

/* =========================
   loadJenis
========================= */
async function loadJenis(){

    try{

        const data =
            await apiFetch(
                "/atribut/jenis-usaha/"
            );

        const results =
            data.results || data;

        const select =
            document.getElementById(
                "jenis-bumdes"
            );

        select.innerHTML = "";

        results.forEach(item => {

            select.innerHTML += `
                <option value="${item.id}">
                    ${item.jenis}
                </option>
            `;
        });

    }catch(error){

        console.log(error);
    }
}
async function saveSektorBaru(){

    const nama =
        document
        .getElementById(
            "input-sektor"
        )
        .value.trim();

    if(!nama){

        alert(
            "Nama sektor wajib diisi"
        );

        return;
    }

    try{

        const response =
            await apiFetch(
                "/atribut/sektor-usaha/",
                {
                    method:"POST",

                    body:JSON.stringify({
                        sektor:nama
                    })
                }
            );

        sektorSelect.addOption({
            value:response.id,
            text:response.sektor
        });

        sektorSelect.addItem(
            response.id
        );

        // reset input
        document
            .getElementById(
                "input-sektor"
            )
            .value = "";

        closeModal(
            "modal-tambah-sektor"
        );
        showToast(
            "Sektor usaha berhasil ditambahkan",
            "success"
        );

    }catch(error){

        console.log(error);
        

        showToast(
            "Gagal tambah sektor",
            "error"
        );
    }
}



window.saveSektorBaru =
    saveSektorBaru;
async function loadSektorUntukJenis(){

    try{

        const data =
            await apiFetch(
                "/atribut/sektor-usaha/"
            );

        const results =
            data.results || data;

        const select =
            document.getElementById(
                "jenis-sektor"
            );

        select.innerHTML = `
            <option value="">
                Pilih Sektor
            </option>
        `;

        results.forEach(item => {

            select.innerHTML += `
                <option value="${item.id}">
                    ${item.sektor}
                </option>
            `;
        });

    }catch(error){

        console.log(error);
    }
}
async function saveJenisBaru(){

    try{

        const jenis =
            document.getElementById(
                "input-jenis"
            ).value.trim();

        const sektor =
            document.getElementById(
                "jenis-sektor"
            ).value;

        if(!jenis || !sektor){

            showToast(
                "Lengkapi data terlebih dahulu",
                "error"
            );

            return;
        }

        const response = await apiFetch(
            "/atribut/jenis-usaha/",
            {
                method: "POST",
                body: JSON.stringify({
                    jenis: jenis,
                    sektor: sektor
                })
            }
        );

        console.log(response);

        // refresh data
        await loadJenis();

        // update options TomSelect TANPA destroy
        jenisSelect.clearOptions();

        const sektorIds = [].concat(sektorSelect.getValue());

            // ambil ulang hanya berdasarkan sektor yang sedang aktif di form
            if (sektorIds.length) {

                const requests = sektorIds.map(id =>
                    apiFetch(`/atribut/jenis-usaha/?sektor=${id}`)
                );

                const responses = await Promise.all(requests);

                const all = [];

                responses.forEach(res => {
                    const results = res.results || res;
                    all.push(...results);
                });

                // reset options biar tidak numpuk
                jenisSelect.clearOptions();

                const unique = new Map();

                all.forEach(item => {
                    if (!unique.has(item.id)) {
                        unique.set(item.id, item);
                    }
                });

                unique.forEach(item => {
                    jenisSelect.addOption({
                        value: item.id,
                        text: item.jenis
                    });
                });

            } else {
                // 🔥 INI PENTING: jangan load semua data
                jenisSelect.clearOptions();
                jenisSelect.clear();
            }

        // auto select item baru
        jenisSelect.addItem(response.id);

        closeModal(
            "modal-tambah-jenis"
        );

        document.getElementById(
            "input-jenis"
        ).value = "";

        showToast(
            "Jenis Usaha Di Tambahkan",
            "success"
        );

    }catch(error){

        console.log(
            "ERROR SAVE JENIS",
            error
        );

        showToast(
            "Gagal tambah jenis usaha",
            "error"
        );
    }
} 
window.saveJenisBaru =
    saveJenisBaru;
function openSektorModal(){

    document
        .getElementById(
            "modal-tambah-sektor"
        )
        .classList.add("show");
}

window.openSektorModal =
    openSektorModal;
function openJenisModal(){

    loadSektorUntukJenis();

    document
        .getElementById(
            "modal-tambah-jenis"
        )
        .classList.add("show");
}

window.openJenisModal =
    openJenisModal;


async function loadJenisBySektor(sektorIds){

    try{

        jenisSelect.clear();
        jenisSelect.clearOptions();

        // belum pilih sektor
        if(!sektorIds.length){

            jenisSelect.disable();
            return;
        }

        jenisSelect.enable();

        for(const sektorId of sektorIds){

            const data =
                await apiFetch(
                    `/atribut/jenis-usaha/?sektor=${sektorId}`
                );

            const results =
                data.results || data;

            results.forEach(item => {

                if(
                    !jenisSelect.options[item.id]
                ){

                    jenisSelect.addOption({
                        value:item.id,
                        text:item.jenis
                    });
                }
            });
        }

        jenisSelect.refreshOptions(false);

    }catch(error){

        console.log(
            "Gagal load jenis",
            error
        );
    }
}


function setFormMode(mode){

    const title =
        document.querySelector(
            ".form-title-et"
        );

    const btn =
        document.getElementById(
            "btn-save-bumdes"
        );

    if(mode === "edit"){

        title.textContent =
            "Edit Data BUMDES";

        btn.textContent =
            "Update";

    }else{

        title.textContent =
            "Tambah Data BUMDES";

        btn.textContent =
            "Simpan";
    }
}
/* =========================
   Tambah
========================= */
function openBumdesModal(){

    setFormMode("add");

    document
        .getElementById(
            "bumdes-modal"
        )
        .classList.add("show");
}

window.openBumdesModal =
    openBumdesModal;

console.log("SAVE CLICKED", { editMode, editId });
    
async function saveBumdes() {

    const isEdit = editMode && editId;

    const url = isEdit
        ? `/bumdes/${editId}/`
        : `/bumdes/`;

    const method = isEdit ? "PUT" : "POST";

    const payload = {
        nama_bumdes: document.getElementById("nama-bumdes").value,
        desa: document.getElementById("desa-bumdes").value,
        alamat: document.getElementById("alamat-bumdes").value,
        no_hp: document.getElementById("nohp-bumdes").value,
        email: document.getElementById("email-bumdes").value,
        status_bumdes: document.getElementById("status-bumdes").value,
        peringkat: document.getElementById("peringkat-bumdes").value,

        sektor_usaha: [].concat(sektorSelect.getValue()),
        jenis_usaha: [].concat(jenisSelect.getValue()),

        legalitas: {
            nomor_perdes:
                document.getElementById("nomor-perdes").value || null,

            tanggal_perdes:
                document.getElementById("tanggal-perdes").value || null,

            nomor_ahu:
                document.getElementById("nomor-ahu").value || null,

            tanggal_ahu:
                document.getElementById("tanggal-ahu").value || null,
        },

        petugas: {
            penasihat:
                document.getElementById("penasihat").value || null,

            no_penasihat:
                document.getElementById("no-penasihat").value || null,

            pengawas:
                document.getElementById("pengawas").value || null,

            no_pengawas:
                document.getElementById("no-pengawas").value || null,

            direktur:
                document.getElementById("direktur").value || null,

            no_direktur:
                document.getElementById("no-direktur").value || null,

            sekretaris:
                document.getElementById("sekretaris").value || null,

            no_sekretaris:
                document.getElementById("no-sekretaris").value || null,

            bendahara:
                document.getElementById("bendahara").value || null,

            no_bendahara:
                document.getElementById("no-bendahara").value || null,
        }
    };

    try{

        await apiFetch(url,{
            method:method,
            body:JSON.stringify(payload)
        });

        showToast(
            isEdit
                ? "Data BUMDES berhasil diperbarui"
                : "Data BUMDES berhasil ditambahkan",
            "success"
        );

    }catch(error){

        console.error(
            "ERROR SAVE BUMDES:",
            error
        );

        alert(error.message);

        return;
    }
    const currentId = editId;

    editMode = false;
    editId = null;

    closeModal("bumdes-modal");

    await loadBumdes();

    // jika edit dari detail
    if(currentId){

        showDetail(currentId);

    }
}

window.saveBumdes =
    saveBumdes;

function resetForm(){

    document.getElementById("nama-bumdes").value = "";
    document.getElementById("alamat-bumdes").value = "";
    document.getElementById("nohp-bumdes").value = "";
    document.getElementById("email-bumdes").value = "";

    // GANTI INI
    desaSelect.clear();

    document.getElementById("status-bumdes").value = "";
    document.getElementById("peringkat-bumdes").value = "";

    document.getElementById("nomor-perdes").value = "";
    document.getElementById("tanggal-perdes").value = "";
    document.getElementById("nomor-ahu").value = "";
    document.getElementById("tanggal-ahu").value = "";

    document.getElementById("penasihat").value = "";
    document.getElementById("no-penasihat").value = "";

    document.getElementById("pengawas").value = "";
    document.getElementById("no-pengawas").value = "";

    document.getElementById("direktur").value = "";
    document.getElementById("no-direktur").value = "";

    document.getElementById("sekretaris").value = "";
    document.getElementById("no-sekretaris").value = "";

    document.getElementById("bendahara").value = "";
    document.getElementById("no-bendahara").value = "";

    sektorSelect.clear();
    jenisSelect.clear();
    jenisSelect.clearOptions();
}

/* =========================
   Edit
========================= */
async function openEdit(id){
    isEditing = true;

    const item = bumdesData.find(d => d.id === id);
    if(!item) return;

    editMode = true;
    editId = id;

    setFormMode("edit");

    // BUMDES
    document.getElementById("nama-bumdes").value = item.nama_bumdes;
    document.getElementById("alamat-bumdes").value = item.alamat;
    document.getElementById("nohp-bumdes").value = item.no_hp;
    document.getElementById("email-bumdes").value = item.email;

    desaSelect.setValue(item.desa?.id ?? item.desa);
    document.getElementById("status-bumdes").value = item.status_bumdes;
    document.getElementById("peringkat-bumdes").value = item.peringkat;

    // LEGALITAS
    document.getElementById("nomor-perdes").value = item.legalitas?.nomor_perdes || "";
    document.getElementById("tanggal-perdes").value = item.legalitas?.tanggal_perdes || "";
    document.getElementById("nomor-ahu").value = item.legalitas?.nomor_ahu || "";
    document.getElementById("tanggal-ahu").value = item.legalitas?.tanggal_ahu || "";

    // PETUGAS
    document.getElementById("penasihat").value = item.petugas?.penasihat || "";
    document.getElementById("no-penasihat").value = item.petugas?.no_penasihat || "";

    document.getElementById("pengawas").value = item.petugas?.pengawas || "";
    document.getElementById("no-pengawas").value = item.petugas?.no_pengawas || "";

    document.getElementById("direktur").value = item.petugas?.direktur || "";
    document.getElementById("no-direktur").value = item.petugas?.no_direktur || "";

    document.getElementById("sekretaris").value = item.petugas?.sekretaris || "";
    document.getElementById("no-sekretaris").value = item.petugas?.no_sekretaris || "";

    document.getElementById("bendahara").value = item.petugas?.bendahara || "";
    document.getElementById("no-bendahara").value = item.petugas?.no_bendahara || "";

    // sektor & jenis (TomSelect)
    
    sektorSelect.clear(true);
    jenisSelect.clear(true);

    // set sektor dulu
    sektorSelect.setValue(item.sektor_usaha);

    // load jenis berdasarkan sektor
    await setJenisOptionsBySektor(item.sektor_usaha);

    // baru set jenis
    jenisSelect.setValue(item.jenis_usaha);
    // selesai loading edit
    isEditing = false;

    document
        .getElementById(
            "bumdes-modal"
        )
        .classList.add("show");
}

window.openEdit = openEdit;


async function setJenisOptionsBySektor(sektorIds){

    jenisSelect.clearOptions();

    if(!sektorIds.length){
        jenisSelect.disable();
        return;
    }

    jenisSelect.enable();

    try {
        const requests = sektorIds.map(id =>
            apiFetch(`/atribut/jenis-usaha/?sektor=${id}`)
        );

        const responses = await Promise.all(requests);

        const allData = [];

        responses.forEach(res => {
            const results = res.results || res;
            allData.push(...results);
        });

        // hapus duplikat
        const unique = new Map();

        allData.forEach(item => {
            if(!unique.has(item.id)){
                unique.set(item.id, item);
            }
        });

        unique.forEach(item => {
            jenisSelect.addOption({
                value: item.id,
                text: item.jenis
            });
        });

        jenisSelect.refreshOptions(false);

    } catch (error) {
        console.log("Gagal load jenis", error);
    }
}
/* =========================
   Haous
========================= */
async function deleteBumdes(id){

    const confirmDelete =
        confirm("Yakin ingin menghapus data ini?");

    if(!confirmDelete) return;

    try{

        await apiFetch(`/bumdes/${id}/`, {
            method: "DELETE"
        });

        // TUTUP DETAIL
        document
            .getElementById("detail-modal")
            .classList.remove("show");

        showToast(
            "Data berhasil dihapus",
            "success"
        );

        loadBumdes();

    }catch(error){

        console.log(error);

        showToast(
            "Gagal menghapus data",
            "error"
        );
    }
}

window.deleteBumdes = deleteBumdes;


/* =========================
   DETAIL
========================= */
function showDetail(id){

    const item =
        bumdesData.find(
            data => data.id === id
        );

    if(!item) return;

    const detailContent =
        document.getElementById(
            "detail-content"
        );

    detailContent.innerHTML = `

        <div class="detail-section">

            <h3>
                ${item.nama_bumdes}
            </h3>

            <span class="status-badge">
                ${item.status_nama || "-"}
            </span>

        </div>

        <!-- INFORMASI -->
        <div class="detail-card">

            <h4>Informasi BUMDES</h4>

            <div class="detail-grid">

                <div>
                    <label>Desa</label>
                    <p>${item.desa_nama || "-"}</p>
                </div>

                <div>
                    <label>Kecamatan</label>
                    <p>${item.kecamatan_nama || "-"}</p>
                </div>

                <div>
                    <label>Alamat</label>
                    <p>${item.alamat || "-"}</p>
                </div>

                <div>
                    <label>No HP</label>
                    <p>${item.no_hp || "-"}</p>
                </div>

                <div>
                    <label>Email</label>
                    <p>${item.email || "-"}</p>
                </div>

                <div>
                    <label>Peringkat</label>
                    <p>${item.peringkat_nama || "-"}</p>
                </div>

            </div>

        </div>

        <!-- SEKTOR -->
        <div class="detail-card">

            <h4>Sektor Usaha</h4>

            <div class="tag-list">

                ${
                    item.sektor_usaha_nama?.map(
                        sektor => `
                            <span class="tag">
                                ${sektor}
                            </span>
                        `
                    ).join("")
                }

            </div>

        </div>

        <!-- JENIS -->
        <div class="detail-card">

            <h4>Jenis Usaha</h4>

            <div class="tag-list">

                ${
                    item.jenis_usaha_nama?.map(
                        jenis => `
                            <span class="tag green">
                                ${jenis}
                            </span>
                        `
                    ).join("")
                }

            </div>

        </div>

        <!-- LEGALITAS -->
        <div class="detail-card">

            <h4>Legalitas</h4>

            <div class="detail-grid">

                <div>
                    <label>Nomor PERDES</label>

                    <p>
                        ${
                            item.legalitas
                            ?.nomor_perdes || "-"
                        }
                    </p>
                </div>

                <div>
                    <label>Tanggal PERDES</label>

                    <p>
                        ${
                            item.legalitas
                            ?.tanggal_perdes || "-"
                        }
                    </p>
                </div>

                <div>
                    <label>Nomor AHU</label>

                    <p>
                        ${
                            item.legalitas
                            ?.nomor_ahu || "-"
                        }
                    </p>
                </div>

                <div>
                    <label>Tanggal AHU</label>

                    <p>
                        ${
                            item.legalitas
                            ?.tanggal_ahu || "-"
                        }
                    </p>
                </div>

            </div>

        </div>

        <!-- PETUGAS -->
        <div class="detail-card">

            <h4>Petugas</h4>

            <div class="detail-grid">

                <div>
                    <label>Penasihat</label>

                    <p>
                        ${item.petugas?.penasihat || "-"}
                    </p>

                    <small>
                        ${
                            item.petugas?.no_penasihat || "-"
                        }
                    </small>
                </div>

                <div>
                    <label>Pengawas</label>

                    <p>
                        ${item.petugas?.pengawas || "-"}
                    </p>

                    <small>
                        ${
                            item.petugas?.no_pengawas || "-"
                        }
                    </small>
                </div>

                <div>
                    <label>Direktur</label>

                    <p>
                        ${item.petugas?.direktur || "-"}
                    </p>

                    <small>
                        ${
                            item.petugas?.no_direktur || "-"
                        }
                    </small>
                </div>

                <div>
                    <label>Sekretaris</label>

                    <p>
                        ${item.petugas?.sekretaris || "-"}
                    </p>

                    <small>
                        ${
                            item.petugas?.no_sekretaris || "-"
                        }
                    </small>
                </div>

                <div>
                    <label>Bendahara</label>

                    <p>
                        ${item.petugas?.bendahara || "-"}
                    </p>

                    <small>
                        ${
                            item.petugas?.no_bendahara || "-"
                        }
                    </small>
                </div>

            </div>

        </div>
            <button
            class="btn warning"
            onclick="openEdit(${item.id})"
            >
            <i class="ri-edit-line"></i>
            Edit
            </button>

            <button
            class="btn danger"
            onclick="deleteBumdes(${item.id})"
            >
            <i class="ri-delete-bin-line"></i>
            Hapus
            </button>      
    `;

    document
        .getElementById(
            "detail-modal"
        )
        .classList.add("show");
}

window.showDetail =
    showDetail;

function closeModal(id){

    document
        .getElementById(id)
        .classList.remove("show");

    if(id === "bumdes-modal"){

        editMode = false;
        editId = null;
        isEditing = false;

        resetForm();

        const btnSave =
            document.getElementById(
                "btn-save-bumdes"
            );

        btnSave.textContent =
            "Simpan";
    }
}

window.closeModal =
    closeModal;


window.addEventListener(
    "keydown",
    function(e){

        if(e.key === "Escape"){

            document
                .querySelectorAll(".modal")
                .forEach(modal => {
                    modal.classList.remove(
                        "show"
                    );
                });
        }
    }
);
document
    .querySelectorAll(".modal")
    .forEach(modal => {

        modal.addEventListener(
            "click",
            function(e){

                if(e.target === modal){

                    modal.classList.remove(
                        "show"
                    );
                }
            }
        );
    });

/* =========================
   INIT
========================= */
async function init(){

    await loadKecamatan();

    await loadDesa();

    await loadStatus();

    await loadPeringkat();

    await loadSektor();

    // DESA
     desaSelect = new TomSelect("#desa-bumdes", {
        create: false,
        placeholder: "Cari Desa...",
        maxOptions: 1000
    });

    // SEKTOR
    sektorSelect =
        new TomSelect(
            "#sektor-bumdes",
            {
                plugins:["remove_button"],
                placeholder:"Pilih sektor usaha"
            }
        );

    // JENIS
    jenisSelect =
        new TomSelect(
            "#jenis-bumdes",
            {
                plugins:["remove_button"],
                placeholder:"Pilih jenis usaha"
            }
        );

    // EVENT SEKTOR
    sektorSelect.on("change", async function(){
         if (isEditing) return;

        const sektorIds = [].concat(sektorSelect.getValue());

        await setJenisOptionsBySektor(sektorIds);
    });

    // LOAD TABLE
    loadBumdes();
}


function showToast(message, type = "success") {

    const container =
        document.getElementById(
            "toast-container"
        );

    const toast =
        document.createElement("div");

    toast.className =
        `toast ${type}`;

    toast.innerHTML = message;

    container.appendChild(toast);

    setTimeout(() => {

        toast.style.opacity = "0";

        toast.style.transition =
            "0.3s";

        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 3000);
}
init();

