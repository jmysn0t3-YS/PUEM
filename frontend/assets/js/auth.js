import { BASE_URL } from "./config.js";

/* LOGIN */
export async function login(data){

    try{

        const response = await fetch(
            `${BASE_URL}/token/`,
            {
                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify(data)
            }
        );

        const result =
            await response.json();

        return {
            ok: response.ok,
            data: result
        };

    }catch(error){

        console.log(error);

        return {
            ok:false,
            data:null
        };
    }
}

/* SAVE TOKEN */
export function saveAuth(data){

    localStorage.setItem(
        "access",
        data.access
    );

    localStorage.setItem(
        "refresh",
        data.refresh
    );
}

/* GET ACCESS TOKEN */
export function getAccessToken(){

    return localStorage.getItem(
        "access"
    );
}

/* CHECK LOGIN */
export function isLogin(){

    return !!localStorage.getItem(
        "access"
    );
}

async function checkRole(){

    try{

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

            document
                .getElementById(
                    "menu-admin"
                )
                .style.display =
                "none";
        }

    }catch(error){

        console.error(error);
    }
}

checkRole();

/* LOGOUT */
export function logout(){

    localStorage.removeItem(
        "access"
    );

    localStorage.removeItem(
        "refresh"
    );

    window.location.replace(
        "/login.html"
    );
}