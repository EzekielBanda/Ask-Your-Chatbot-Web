import {
	DocumentTextIcon,
	DocumentIcon,
	PhotoIcon,
} from "@heroicons/react/24/solid";

export const getFileIcon = (contentType) => {
	if (!contentType) return <DocumentIcon className="h-5 w-5" />;

	if (contentType.includes("image")) {
		return <PhotoIcon className="h-5 w-5" />;
	} else if (contentType.includes("pdf")) {
		return <DocumentTextIcon className="h-5 w-5" />;
	} else if (contentType.includes("word") || contentType.includes("document")) {
		return <DocumentTextIcon className="h-5 w-5" />;
	} else if (contentType.includes("csv") || contentType.includes("sheet")) {
		return <DocumentTextIcon className="h-5 w-5" />;
	}
	return <DocumentIcon className="h-5 w-5" />;
};
