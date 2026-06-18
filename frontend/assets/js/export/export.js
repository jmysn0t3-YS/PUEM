import { BASE_URL } from "../config.js";

/* =========================
   EXPORT EXCEL (BACKEND)
========================= */
exportdata.addEventListener("click", async () => {

    const confirm = await Swal.fire({
        title: "Export Data?",
        text: "Data BUMDES akan diunduh dalam format Excel.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, Export",
        cancelButtonText: "Batal"
    });

    if (!confirm.isConfirmed) return;

    try {

        // Loading
        Swal.fire({
            title: "Mengekspor Data...",
            text: "Mohon tunggu sebentar",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const token = localStorage.getItem("access");

        const res = await fetch(`${BASE_URL}/bumdes/export/`, {
            headers: {
                Authorization: `Bearer ${token}`
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

        // Tutup loading & sukses
        Swal.fire({
            icon: "success",
            title: "BERHASIL!:)",
            text: "Data berhasil diexport.",
            timer: 2000,
            showConfirmButton: false
        });

    } catch (err) {
        console.error(err);

        Swal.fire({
            icon: "error",
            title: "EXPORT GAGAL",
            text: "Terjadi kesalahan saat mengexport Data Bumdes !!!."
        });
    }

});

/* INIT */
loadData();