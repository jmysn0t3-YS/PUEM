export function showToast(
    title,
    message,
    type = "success"
){

    const toast =
        document.createElement("div");

    toast.className =
        `toast ${type}`;

    // ICON
    let icon = "ri-check-line";

    if(type === "error"){
        icon = "ri-close-line";
    }

    if(type === "warning"){
        icon = "ri-error-warning-line";
    }

    toast.innerHTML = `
        <i class="${icon}"></i>

        <div class="toast-content">

            <div class="toast-title">
                ${title}
            </div>

            <div class="toast-message">
                ${message}
            </div>

        </div>
    `;

    document.body.appendChild(toast);

    // SHOW
    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    // HIDE
    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {
            toast.remove();
        }, 300);

    }, 3000);
}