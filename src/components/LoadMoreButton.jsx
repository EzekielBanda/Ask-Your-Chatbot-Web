import { ArrowUpIcon } from "@heroicons/react/24/solid";

const LoadMoreButton = ({ isLoading, hasMoreMessages, onLoadMore }) => {
  return (
    <div className="sticky top-2 z-10 flex justify-center mb-2">
      <button
        onClick={onLoadMore}
        disabled={isLoading || !hasMoreMessages}
        className="flex items-center space-x-1 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm hover:bg-indigo-700 transition-colors shadow-md"
      >
        {isLoading ? (
          <span>Loading...</span>
        ) : (
          <>
            <ArrowUpIcon className="h-4 w-4" />
            <span>See older messages</span>
          </>
        )}
      </button>
    </div>
  );
};

export default LoadMoreButton;
