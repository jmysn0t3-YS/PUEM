import { apiFetch } from "../api.js";

/* =========================
   ELEMENT
========================= */
const totalBumdes =
    document.getElementById(
        "total-bumdes"
    );

const totalDesa =
    document.getElementById(
        "total-desa"
    );

const totalKecamatan =
    document.getElementById(
        "total-kecamatan"
    );

const activityList =
    document.getElementById(
        "activity-list"
    );

/* CHART */
const ctx =
    document.getElementById(
        "peringkatChart"
    );

const alertList =
    document.getElementById(
        "alert-list"
    );

window.openBumdesDetail = function(id){

    window.location.href =
        `bumdes.html?id=${id}`;
}

/* CHART INSTANCE */
let peringkatChart;

let kecamatanChart;
/* =========================
   LOAD DASHBOARD
========================= */
async function loadDashboard() {

    try {

        const [
            bumdesRes,
            desaRes,
            kecRes
        ] = await Promise.all([
            apiFetch("/bumdes/"),
            apiFetch("/wilayah/desa/"),
            apiFetch("/wilayah/kecamatan/")
        ]);

        const bumdes =
            bumdesRes.results || bumdesRes;
            
        renderAlertData(bumdes);

        const desa =
            desaRes.results || desaRes;

        const kecamatan =
            kecRes.results || kecRes;

        /* =========================
           TOTAL CARD
        ========================= */
        totalBumdes.textContent =
            bumdes.length;

        totalDesa.textContent =
            desa.length;

        totalKecamatan.textContent =
            kecamatan.length;


        /* =========================
        AKTIVITAS TERBARU
        ========================= */

        /* SORT DATA TERBARU */
        const latestBumdes =
            [...bumdes]
            .sort(
                (a, b) =>
                    new Date(b.created_at) -
                    new Date(a.created_at)
            )
            .slice(0, 5);

                /* RESET */
                activityList.innerHTML = "";

                /* RENDER */
                const latestActivity =
            [...bumdes]
            .sort(
                (a, b) =>
                    new Date(
                        b.updated_at || b.created_at
                    ) -
                    new Date(
                        a.updated_at || a.created_at
                    )
            )
            .slice(0, 5);

        activityList.innerHTML = "";

        latestActivity.forEach(item => {

            const created =
            new Date(item.created_at);

            const updated =
                new Date(item.updated_at);

            const isEdited =
                item.updated_at &&
                Math.abs(updated - created) > 5000; // lebih dari 5 detik
            activityList.innerHTML += `
                <div
                    class="activity-card"
                    onclick="openBumdesDetail(${item.id})"
                >

                    <div class="activity-icon">
                        <i class="${
                            isEdited
                                ? "ri-edit-line"
                                : "ri-building-line"
                        }"></i>
                    </div>

                    <div class="activity-content">

                        <h4>
                            ${
                                isEdited
                                ? `BUMDES ${item.nama_bumdes} diperbarui`
                                : `BUMDES ${item.nama_bumdes} ditambahkan`
                            }
                        </h4>

                        <p>
                            ${timeAgo(
                                item.updated_at ||
                                item.created_at
                            )}
                        </p>

                    </div>

                </div>
            `;
        });

        /* =========================
           PERINGKAT GROUPING
        ========================= */
        const peringkatCount = {};

        bumdes.forEach(item => {

            const peringkat =
                item.peringkat_nama ||
                "Tidak Diketahui";

            peringkatCount[peringkat] =
                (peringkatCount[peringkat] || 0) + 1;
        });

        const labels =
            Object.keys(peringkatCount);

        const data =
            Object.values(peringkatCount);
        
        /* =========================
        LEGEND TOTAL
        ========================= */
        document.getElementById(
            "maju-total"
        ).textContent =
            peringkatCount["Maju"] || 0;

        document.getElementById(
            "berkembang-total"
        ).textContent =
            peringkatCount["Berkembang"] || 0;

        document.getElementById(
            "pemula-total"
        ).textContent =
            peringkatCount["Pemula"] || 0;

        document.getElementById(
            "perintis-total"
        ).textContent =
            peringkatCount["Perintis"] || 0;
            

        /* =========================
           COLOR MAP
        ========================= */
        const chartColors = {
            "Maju": "#22c55e",
            "Berkembang": "#3b82f6",
            "Pemula": "#f59e0b",
            "Perintis": "#ef4444",
            "Tidak Diketahui": "#94a3b8"
        };

        const backgroundColors =
            labels.map(label =>
                chartColors[label]
            );

        /* =========================
           DESTROY OLD CHART
        ========================= */
        if (peringkatChart) {
            peringkatChart.destroy();
        }

        /* =========================
           RENDER CHART
        ========================= */
        peringkatChart = new Chart(ctx, {

            type: "pie",

            data: {

                labels: labels,

                datasets: [{
                    data: data,

                    backgroundColor:
                        backgroundColors,

                    borderColor: "#ffffff",

                    borderWidth: 3,

                    hoverOffset: 10
                }]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                animation: {
                    animateRotate: true,
                    animateScale: true
                },

                plugins: {

                    legend: {
                        display: false
                    },

                    tooltip: {

                        backgroundColor:
                            "#0f172a",

                        titleColor: "#fff",

                        bodyColor: "#fff",

                        padding: 12,

                        cornerRadius: 10,

                        callbacks: {

                            label: function(context){

                                return (
                                    context.label +
                                    ": " +
                                    context.raw +
                                    " BUMDES"
                                );
                            }
                        }
                    },

                    /* =========================
                    LABEL DI DALAM CHART
                    ========================= */
                    datalabels: {

                        color: "#fff",

                        font: {
                            weight: "bold",
                            size: 14
                        },

                        formatter: (value, context) => {

                            const total =
                                context.chart.data.datasets[0]
                                .data
                                .reduce((a, b) => a + b, 0);

                            const percentage =
                                ((value / total) * 100)
                                .toFixed(1);

                            return value + "\n" + percentage + "%";
                        }
                    }
                }
            },

            plugins: [ChartDataLabels]
        });

        /* =========================
        BUMDES PER KECAMATAN
        ========================= */
        const kecamatanCount = {};

        bumdes.forEach(item => {

            const desaItem =
                desa.find(
                    d => d.id == item.desa
                );

            const kecamatanItem =
                kecamatan.find(
                    k => k.id == desaItem?.kecamatan
                );

            const namaKecamatan =
                kecamatanItem?.nama_kec ||
                "Tidak Diketahui";

            kecamatanCount[namaKecamatan] =
                (kecamatanCount[namaKecamatan] || 0) + 1;
        });

        /* SORT TERBANYAK */
        const sortedKecamatan =
            Object.entries(kecamatanCount)
            .sort((a, b) => b[1] - a[1]);

        const kecamatanLabels =
            sortedKecamatan.map(item => item[0]);

        const kecamatanData =
            sortedKecamatan.map(item => item[1]);

        /* DESTROY OLD */
        if(kecamatanChart){
            kecamatanChart.destroy();
        }

        /* RENDER BAR CHART */
        const kecamatanCtx =
            document.getElementById(
                "kecamatanChart"
            );

        kecamatanChart =
            new Chart(kecamatanCtx, {

            type: "bar",
            

            data: {

                labels: kecamatanLabels,

                datasets: [{

                    label: "Jumlah BUMDES",

                    data: kecamatanData,

                    borderRadius: 10,

                    backgroundColor: "#3b82f6",

                    hoverBackgroundColor: "#2563eb"
                }]
            },

            options: {

                indexAxis: "y",

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: false
                    }
                },

                scales: {

                    x: {

                        beginAtZero: true,

                        ticks: {

                            stepSize: 1
                        }
                    }
                }
            }
        });

    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

        totalBumdes.textContent = 0;
        totalDesa.textContent = 0;
        totalKecamatan.textContent = 0;
    }
}

function renderAlertData(data){

    const alertData = [];

    data.forEach(item => {

        const kurang = [];

        /* =====================
           BUMDES
        ===================== */
        if(!item.nama_bumdes){
            kurang.push("Nama BUMDES");
        }

        if(!item.desa){
            kurang.push("Desa");
        }

        if(!item.alamat){
            kurang.push("Alamat");
        }

        if(!item.no_hp){
            kurang.push("No HP");
        }

        if(!item.email){
            kurang.push("Email");
        }

        if(!item.status_bumdes){
            kurang.push("Status");
        }

        if(!item.peringkat){
            kurang.push("Peringkat");
        }

        /* =====================
           SEKTOR & JENIS USAHA
        ===================== */
        if(
            !item.sektor_usaha ||
            item.sektor_usaha.length === 0
        ){
            kurang.push("Sektor Usaha");
        }

        if(
            !item.jenis_usaha ||
            item.jenis_usaha.length === 0
        ){
            kurang.push("Jenis Usaha");
        }

        /* =====================
           LEGALIAS
        ===================== */
        if(!item.legalitas?.nomor_perdes){
            kurang.push("Nomor PERDES");
        }

        if(!item.legalitas?.tanggal_perdes){
            kurang.push("Tanggal PERDES");
        }

        if(!item.legalitas?.nomor_ahu){
            kurang.push("Nomor AHU");
        }

        if(!item.legalitas?.tanggal_ahu){
            kurang.push("Tanggal AHU");
        }

        /* =====================
           PETUGAS
        ===================== */
        if(!item.petugas?.penasihat){
            kurang.push("Penasihat");
        }

        if(!item.petugas?.no_penasihat){
            kurang.push("No HP Penasihat");
        }

        if(!item.petugas?.pengawas){
            kurang.push("Pengawas");
        }

        if(!item.petugas?.no_pengawas){
            kurang.push("No HP Pengawas");
        }

        if(!item.petugas?.direktur){
            kurang.push("Direktur");
        }

        if(!item.petugas?.no_direktur){
            kurang.push("No HP Direktur");
        }

        if(!item.petugas?.sekretaris){
            kurang.push("Sekretaris");
        }

        if(!item.petugas?.no_sekretaris){
            kurang.push("No HP Sekretaris");
        }

        if(!item.petugas?.bendahara){
            kurang.push("Bendahara");
        }

        if(!item.petugas?.no_bendahara){
            kurang.push("No HP Bendahara");
        }

        /* =====================
           MASUKKAN KE ALERT
        ===================== */
        if(kurang.length){

            alertData.push({
                id: item.id,
                nama: item.nama_bumdes,
                totalKurang: kurang.length,
                kurang
            });
        }
    });

    alertData.sort(
        (a,b) =>
        b.totalKurang - a.totalKurang
    );

    if(alertData.length === 0){

        alertList.innerHTML = `
            <div class="alert-empty">
                ✓ Semua data BUMDES sudah lengkap
            </div>
        `;

        return;
    }

    alertList.innerHTML = "";

    alertData
        .slice(0,10)
        .forEach(item => {

            alertList.innerHTML += `
                <div
                    class="alert-card"
                    onclick="openBumdesDetail(${item.id})"
                >

                    <div class="alert-title">
                        ⚠️ ${item.nama}
                    </div>

                    <div class="alert-missing">
                        - ${item.kurang.join(", ")}
                    </div>

                </div>
            `;
        });
}

function kosong(value){
    return !value || String(value).trim() === "";
}

function timeAgo(dateString){

    const now =
        new Date();

    const date =
        new Date(dateString);

    const seconds =
        Math.floor(
            (now - date) / 1000
        );

    const minutes =
        Math.floor(seconds / 60);

    const hours =
        Math.floor(minutes / 60);

    const days =
        Math.floor(hours / 24);

    if(seconds < 60){
        return "Baru saja";
    }

    if(minutes < 60){
        return `${minutes} menit lalu`;
    }

    if(hours < 24){
        return `${hours} jam lalu`;
    }

    return `${days} hari lalu`;
}

/* INIT */
loadDashboard();
