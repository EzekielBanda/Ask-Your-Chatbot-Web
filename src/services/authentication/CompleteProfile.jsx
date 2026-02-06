import axios from "axios";

export const completeProfile = async (profileData) => {
	const REQUEST_URL = `${import.meta.env.VITE_API_BASE_URL}/auth/complete-profile`;
	try {
		const response = await axios.put(REQUEST_URL, profileData);
		return response.data;
	} catch (error) {
		console.error("Error completing profile:", error.response?.data || error.message);
		throw error;
	}
};
