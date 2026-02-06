import {
  ClockIcon,
  CheckIcon,
  DocumentIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { useState, useRef } from "react";

const Message = ({
  message,
  currentUser,
  isReply = false,
  replyType = "bubble",
  onFileView,
}) => {
  const [viewingFile, setViewingFile] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const audioRef = useRef(null);

  if (!message || (!message.text && !message.attachment)) return null;

  const senderName =
    message.senderName ||
    message.sender?.username ||
    message.sender?.name ||
    message.username ||
    message.UserName ||
    "ChatBot";

  const isCurrentUser = senderName === currentUser;

  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  const handleFileClick = (file) => {
    const fileType = file.type?.split("/")[0];
    const isPdf = file.type === "application/pdf";
    const isDocx =
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.type === "application/msword" ||
      file.name?.toLowerCase().endsWith(".docx") ||
      file.name?.toLowerCase().endsWith(".doc");

    if (fileType === "image" || fileType === "audio") {
      setCurrentFile(file);
      setViewingFile(true);
    } else if (isPdf || isDocx) {
      if (onFileView) onFileView(file);
      else {
        setCurrentFile(file);
        setViewingFile(true);
      }
    } else {
      // For PWA compatibility, download instead of opening
      const a = document.createElement("a");
      a.href = file.url;
      a.download = file.name || "download";
      a.click();
    }
  };

  const renderStatus = () => {
    if (!isCurrentUser) return null;

    return (
      <span className="inline-flex items-center ml-1">
        {message.status === "sending" || message.status === 0 ? (
          <ClockIcon className="h-3 w-3 text-indigo-200" />
        ) : message.isRead || message.readAt ? (
          // Double tick for read messages (blue)
          <>
            <CheckIcon className="h-3 w-3 text-blue-400" />
            <CheckIcon className="h-3 w-3 text-blue-400 -ml-1" />
          </>
        ) : message.status === "delivered" ||
          message.status === "sent" ||
          message.status === 1 ? (
          // Single tick for delivered but unread (gray)
          <CheckIcon className="h-3 w-3 text-indigo-200" />
        ) : null}
      </span>
    );
  };

  const renderAttachment = () => {
    const { name, url, type } = message.attachment || {};
    if (!name || !url || !type) return null;

    const displayName = name.includes("_")
      ? name.substring(name.indexOf("_") + 1)
      : name;
    const fileUrl = url.startsWith("/") ? `http://nbsdevtest:83${url}` : url;
    const file = { name, url: fileUrl, type };
    const fileType = type.split("/")[0];

    if (fileType === "image") {
      return (
        <div className="mb-2">
          <div
            className="relative cursor-pointer"
            onClick={() => handleFileClick(file)}
          >
            {!isImageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
                <PhotoIcon className="h-8 w-8 text-gray-300" />
              </div>
            )}
            <img
              src={fileUrl}
              alt="Attachment"
              className={`max-w-full rounded ${isImageLoaded ? "block" : "invisible"}`}
              onLoad={() => setIsImageLoaded(true)}
            />
          </div>
          <div className="mt-1 text-right">
            <a
              href={fileUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 hover:underline"
            >
              Download image
            </a>
          </div>
        </div>
      );
    }

    if (fileType === "video") {
      return (
        <div className="mb-2">
          <video controls className="w-full max-h-64 rounded-lg">
            <source src={fileUrl} type={type} />
            Your browser does not support video.
          </video>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500 truncate">{displayName}</p>
            <a
              href={fileUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 hover:underline ml-2 flex-shrink-0"
            >
              Download video
            </a>
          </div>
        </div>
      );
    }

    if (fileType === "audio") {
      return (
        <div className="mb-2">
          <audio
            ref={audioRef}
            controls
            className="w-full"
            onError={() => audioRef.current?.load()}
          >
            <source src={fileUrl} type={type} />
            Your browser does not support audio
          </audio>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500 truncate">{displayName}</p>
            <a
              href={fileUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 hover:underline ml-2 flex-shrink-0"
            >
              Download audio
            </a>
          </div>
        </div>
      );
    }

    return (
      <div
        className="flex items-center p-2 rounded mb-2 cursor-pointer bg-gray-200 text-gray-800"
        onClick={() => handleFileClick(file)}
      >
        <DocumentIcon className="h-5 w-5 mr-2" />
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">{displayName}</p>
        </div>
      </div>
    );
  };

  const renderFileViewer = () => {
    if (!viewingFile || !currentFile) return null;
    const fileType = currentFile.type?.split("/")[0];
    const displayName =
      currentFile.name && currentFile.name.includes("_")
        ? currentFile.name.substring(currentFile.name.indexOf("_") + 1)
        : currentFile.name;

    return (
      <div className="fixed inset-0 z-[9999] bg-black bg-opacity-75 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold truncate mr-4">
              {displayName}
            </h3>
            <div className="flex items-center gap-3">
              <a
                href={currentFile.url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 text-sm rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                title="Download"
              >
                Download
              </a>
              <button
                onClick={() => setViewingFile(false)}
                className="text-gray-500 hover:text-gray-700"
                title="Close"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 bg-gray-50">
            {fileType === "image" ? (
              <img
                src={currentFile.url}
                alt={displayName}
                className="max-h-[65vh] mx-auto rounded-lg"
              />
            ) : fileType === "audio" ? (
              <div className="flex justify-center items-center h-full">
                <audio controls className="w-full max-w-md">
                  <source src={currentFile.url} type={currentFile.type} />
                </audio>
              </div>
            ) : currentFile.type === "application/pdf" ? (
              <iframe
                src={currentFile.url}
                title={displayName}
                className="w-full h-[65vh] rounded-lg border"
              />
            ) : currentFile.type?.includes("wordprocessingml") ||
              currentFile.name?.endsWith(".docx") ? (
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(currentFile.url)}`}
                title={displayName}
                className="w-full h-[65vh] rounded-lg border"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <DocumentIcon className="h-12 w-12 mb-2" />
                <p>No preview available for this file type.</p>
                <a
                  href={currentFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-indigo-600 underline"
                >
                  Download
                </a>
              </div>
            )}
          </div>
          <div className="p-4 border-t text-right bg-white">
            <button
              onClick={() => setViewingFile(false)}
              className="px-4 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              ← Back to Chat
            </button>
          </div>
        </div>
      </div>
    );
  };

  const bubbleStyle = isCurrentUser
    ? "bg-indigo-600 text-white rounded-tr-none"
    : "bg-gray-200 text-gray-800 rounded-tl-none";
  const alignClass = isCurrentUser ? "justify-end" : "justify-start";

  return (
    <>
      <div className={`flex ${alignClass} ${isReply ? "ml-10 mt-1" : "mb-3"}`}>
        <div
          className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 ${bubbleStyle} shadow-sm`}
        >
          {/* Sender name */}
          <div className="mb-1 text-xs font-semibold text-indigo-200 truncate">
            {senderName}
          </div>

          {renderAttachment()}

          {message.text && (
            <p className={`text-sm ${message.attachment ? "mt-2" : ""}`}>
              {message.text}
            </p>
          )}

          <div className="flex items-center justify-end mt-1 text-xs">
            <span className={isReply ? "text-gray-600" : "text-indigo-200"}>
              {formatTime(message.time)}
            </span>
            {renderStatus()}
          </div>
        </div>
      </div>

      {/* Replies */}
      {message.replies?.length > 0 &&
        message.replies.map((replyMsg) => (
          <Message
            key={replyMsg.id}
            message={replyMsg}
            currentUser={currentUser}
            isReply={true}
            replyType="bubble"
            onFileView={onFileView}
          />
        ))}

      {/* Seen label - Remove this section since we don't want to show "seen" text */}

      {renderFileViewer()}
    </>
  );
};

export default Message;
