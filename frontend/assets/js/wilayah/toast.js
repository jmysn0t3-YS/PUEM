export function showToast(message, type = "success"){

    const toast = document.getElementById("toast");

    if(!toast) return;

    toast.className = "toast";
    toast.classList.add(type);
    toast.classList.add("show");

    toast.innerText = message;

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}