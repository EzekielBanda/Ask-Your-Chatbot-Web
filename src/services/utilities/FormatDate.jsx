export const formatTime = (dateString) => {
	const date = new Date(dateString);
	return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const formatDate = (dateString) => {
	const date = new Date(dateString);
	const today = new Date();

	if (date.toDateString() === today.toDateString()) {
		return "Today";
	}

	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);
	if (date.toDateString() === yesterday.toDateString()) {
		return "Yesterday";
	}

	return date.toLocaleDateString([], { month: "short", day: "numeric" });
};
