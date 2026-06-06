import { BASE_URL } from "./config.js";

/* =========================
   API FETCH
========================= */
export async function apiFetch(
    endpoint,
    options = {}
){

    const token =
        localStorage.getItem(
            "access"
        );

    const headers = {
        "Content-Type":
            "application/json",

        ...options.headers
    };

    /* JWT */
    if(token){

        headers["Authorization"] =
            `Bearer ${token}`;
    }

    try{

        const response =
            await fetch(
                `${BASE_URL}${endpoint}`,
                {
                    ...options,
                    headers
                }
            );

        /* UNAUTHORIZED */
        if(response.status === 401){

            localStorage.clear();

            window.location.replace(
                "/login.html"
            );

            return;
        }

        /* ERROR */
        if(!response.ok){

            const errorData =
                await response.json();

            throw errorData;
        }

        /* DELETE */
        if(response.status === 204){
            return true;
        }

        return await response.json();

    }catch(error){

        console.log(
            "API ERROR:",
            error
        );

        throw error;
    }
}