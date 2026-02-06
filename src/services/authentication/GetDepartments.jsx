// export const fetchDepartments = async () => {
//     const GET_ALL_DEPARTMENTS_URL = import.meta.env.VITE_FETCH_DEPARTMENTS;
//
//     if (!GET_ALL_DEPARTMENTS_URL) {
//         throw new Error("Department API endpoint is not configured");
//     }
//
//     try {
//         const response = await fetch(`${GET_ALL_DEPARTMENTS_URL}`, {
//             headers: {
//                 accept: "text/plain",
//             },
//         });
//
//         if (!response.ok) {
//             throw new Error(`Failed to fetch Department. Status: ${response.status}`);
//         }
//
//         return await response.json();
//     } catch (error) {
//         console.error("Error fetching department from:", GET_ALL_DEPARTMENTS_URL, error);
//
//         throw new Error(`Department service error: ${error.message}`);
//     }
// };


export const fetchDepartments = async () => {

    const GET_ALL_DEPARTMENTS_URL = `${import.meta.env.VITE_API_BASE_URL}/auth/departments`;

    if (!GET_ALL_DEPARTMENTS_URL) {
        throw new Error("Department API endpoint is not configured");
    }

    try {
        const response = await fetch(`${GET_ALL_DEPARTMENTS_URL}`, {
            headers: {
                accept: "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch Department. Status: ${response.status}`);
        }

        const result = await response.json();

        // Return only the array of departments
        return result.data;
    } catch (error) {
        console.error("Error fetching department from:", GET_ALL_DEPARTMENTS_URL, error);
        throw new Error(`Department service error: ${error.message}`);
    }
};





