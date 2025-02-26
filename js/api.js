// const BASE_URL = "http://127.0.0.1:8000/api/"; // Deine Backend-URL

// async function fetchWithAuth(endpoint, method = "GET", body = null) {
//     const token = localStorage.getItem("token"); // Token abrufen
//     if (!token) {
//         console.error("❌ Kein Auth-Token gefunden! Bitte einloggen.");
//         return null;
//     }

//     try {
//         let options = {
//             method: method,
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Token ${token}`
//             }
//         };

//         if (body) {
//             console.log("🔍 Vor dem Senden: API-Body", JSON.stringify(body, null, 2)); // DEBUGGING

//             // 🚨 `contacts` aus dem Body entfernen, falls es sich immer noch reinschleicht!
//             if ("contacts" in body) {
//                 console.warn("🚨 WARNUNG: `contacts` existiert im API-Body! Lösche jetzt...");
//                 delete body.contacts;
//             }

//             options.body = JSON.stringify(body);
//         }



//         const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint.replace(/^\/+/, "")}`;
//         const response = await fetch(url, options);

//         const contentType = response.headers.get("content-type");
//         if (!contentType || !contentType.includes("application/json")) {
//             return null;
//         }

//         if (!response.ok) {
//             const errorData = await response.json();
//             console.error(`❌ API-Fehler: ${response.status}`, errorData);
//             return errorData;
//         }

//         return await response.json();
//     } catch (error) {
//         console.error("❌ Fehler bei fetchWithAuth:", error);
//         return null;
//     }
// }


const BASE_URL = "http://127.0.0.1:8000/api/"; // Deine Backend-URL

async function fetchWithAuth(endpoint, method = "GET", body = null) {
    const token = localStorage.getItem("token");
    let guestId = localStorage.getItem("guestId");

    // Falls kein `guestId` existiert, eine neue erzeugen
    if (!guestId) {
        guestId = crypto.randomUUID();
        localStorage.setItem("guestId", guestId);
    }

    // 📌 Header erstellen (Token nur setzen, wenn vorhanden)
    let headers = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Token ${token}`;
    }

    try {
        let options = {
            method: method,
            headers: headers,
        };

        if (body) {
            // 🚨 `contacts` aus dem Body entfernen, falls es sich immer noch reinschleicht!
            if ("contacts" in body) {
                delete body.contacts;
            }
            options.body = JSON.stringify(body);
        }

        // ✅ Falls Gast: `guest_id` an die URL anhängen
        let url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint.replace(/^\/+/, "")}`;
        if (!token) {
            url += url.includes("?") ? `&guest_id=${guestId}` : `?guest_id=${guestId}`;
        }

        const response = await fetch(url, options);

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            return null;
        }

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`❌ API-Fehler: ${response.status}`, errorData);
            return errorData;
        }

        return await response.json();
    } catch (error) {
        console.error("❌ Fehler bei fetchWithAuth:", error);
        return null;
    }
}


