const formatDate = (dateString) => {
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	const date = new Date(dateString);
	if (isNaN(date)) return dateString;

	const isToday = date.toDateString() === today.toDateString();
	const isYesterday = date.toDateString() === yesterday.toDateString();

	if (isToday) return "Today";
	if (isYesterday) return "Yesterday";

	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

export default formatDate;
