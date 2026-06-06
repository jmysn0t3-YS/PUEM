import { BASE_URL } from "../config.js";

/* ELEMENT */
const tbody = document.getElementById("export-table-body");
const btnExport = document.getElementById("btn-export");

let data = [];

/* =========================
   FETCH DATA PREVIEW
========================= */
async function loadData() {

    try {

        const res = await fetch(`${BASE_URL}/bumdes/`);
        data = await res.json();

        // URUTKAN BERDASARKAN KECAMATAN
        data.sort((a, b) => {
            const kecA = (a.desa?.kecamatan?.nama_kec || "").toLowerCase();
            const kecB = (b.desa?.kecamatan?.nama_kec || "").toLowerCase();
            return kecA.localeCompare(kecB);
        });

        renderTable();

    } catch (error) {
        console.error("Gagal load data:", error);
    }
}



/* RENDER TABLE */
function renderTable() {

    tbody.innerHTML = "";

    data.forEach((item, index) => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.nama_bumdes}</td>
            <td>${item.desa?.nama_desa ?? "-"}</td>
            <td>${item.desa?.kecamatan?.nama_kec ?? "-"}</td>
            <td>${item.status_bumdes?.status ?? "-"}</td>
            <td>
                ${item.sektor_usaha?.map(s => s.sektor).join(", ") ?? "-"}
            </td>
            <td>
                ${item.jenis_usaha?.map(j => j.jenis).join(", ") ?? "-"}
            </td>
        `;

        tbody.appendChild(tr);
    });
}

/* =========================
   EXPORT EXCEL (BACKEND)
========================= */
btnExport.addEventListener("click", async () => {
    try {
        const token = localStorage.getItem("access"); // pakai 'access', bukan 'token'

        const res = await fetch(`${BASE_URL}/bumdes/export/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Gagal download");

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "bumdes.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(url);

    } catch (err) {
        console.error(err);
        alert("Export gagal, cek console");
    }
});

/* INIT */
loadData();