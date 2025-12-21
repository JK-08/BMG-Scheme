import { API_BASE_URL_OLD } from "../Config/API";

export const getTranTypes = async () => {
    const res = await fetch(
        `${API_BASE_URL_OLD}/account/getTranType`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch transaction types");
    }

    return res.json();
};
