export const fetchBranches = async () => {
	const GET_ALL_BRANCHES_URL = import.meta.env.VITE_FETCH_BRANCHES;

	if (!GET_ALL_BRANCHES_URL) {
		throw new Error("Branch API endpoint is not configured");
	}

	try {
		const response = await fetch(`${GET_ALL_BRANCHES_URL}`, {
			headers: {
				accept: "text/plain",
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch branches. Status: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error fetching branches from:", GET_ALL_BRANCHES_URL, error);

		throw new Error(`Branch service error: ${error.message}`);
	}
};
