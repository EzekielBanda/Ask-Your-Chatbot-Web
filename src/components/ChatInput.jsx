import { useState, useRef } from "react";
import { BsPaperclip } from "react-icons/bs";
import { HiMicrophone } from "react-icons/hi";
import { VscSend } from "react-icons/vsc";

const ChatInput = ({ onSendMessage, selectedCategory, currentUser }) => {
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleSend = async () => {
    if (message.trim() || attachment) {
      // Handle audio attachment
      if (attachment && attachment.type?.startsWith("audio/")) {
        const { uploadAndSendAudio } =
          await import("../services/chat/UploadAndSendAudio");
        try {
          await uploadAndSendAudio(
            attachment,
            message,
            currentUser,
            () => {}, // setMessages handled by parent
            () => {}, // setIsUploading
            selectedCategory?.label,
          );
        } catch (err) {
          console.error("Audio upload failed:", err);
        }
      } else {
        onSendMessage(message, { attachment });
      }

      setMessage("");
      setAttachment(null);
      setIsExpanded(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    // Auto-expand textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  };

  const handleMicClick = async () => {
    if (!isRecording) {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream);
        const chunks = [];

        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/webm" });
          const audioFile = new File([blob], `audio_${Date.now()}.webm`, {
            type: "audio/webm",
          });
          setAttachment(audioFile);
          stream.getTracks().forEach((track) => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
        setRecordingTime(0);

        // Start timer
        const interval = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
        setRecordingInterval(interval);
      } catch (err) {
        console.error("Microphone access denied:", err);
        alert("Microphone access is required for voice messages.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setAttachment(null);
      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="border-t border-gray-200 bg-gray-100">
      <div className="p-4">
        {/* Recording interface */}
        {isRecording && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-700 font-medium">Recording</span>
                <span className="text-red-600 font-mono">
                  {formatTime(recordingTime)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={stopRecording}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                >
                  Stop
                </button>
                <button
                  onClick={cancelRecording}
                  className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* File attachment preview */}
        {attachment && !isRecording && (
          <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200 flex items-center justify-between group shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              {attachment.type?.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(attachment)}
                  alt={attachment.name}
                  className="w-12 h-12 object-cover rounded flex-shrink-0"
                />
              ) : attachment.type?.startsWith("audio/") ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <audio controls className="h-8">
                    <source
                      src={URL.createObjectURL(attachment)}
                      type={attachment.type}
                    />
                  </audio>
                </div>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {attachment.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(attachment.size || 0)}
                </p>
              </div>
            </div>
            <button
              onClick={() => setAttachment(null)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors opacity-0 group-hover:opacity-100"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Input area */}
        <div className="flex items-center gap-1.5">
          {/* Message textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsExpanded(true)}
              placeholder="Type your message... (Shift + Enter for new line)"
              rows={1}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all scrollbar-hide"
              style={{
                minHeight: "44px",
                maxHeight: "120px",
                fontFamily: "inherit",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            />
          </div>

          {/* Attach file button - Right side */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-600 bg-white border border-gray-300 hover:bg-red-400
             hover:border-gray-400 rounded-lg transition-all transition-scale-105
              flex-shrink-0 shadow-sm hover:shadow-md hover:text-white"
            title="Attach file"
          >
            <BsPaperclip className="w-4 h-4" />
          </button>

          {/* Mic button - Right side */}
          <button
            onClick={handleMicClick}
            disabled={isRecording}
            className={`p-2 rounded-lg transition-all flex-shrink-0 shadow-sm hover:shadow-md ${
              isRecording
                ? "text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
                : "text-gray-600 bg-white border border-gray-300 hover:bg-red-400 hover:border-gray-400 hover:text-white"
            }`}
            title="Voice message"
          >
            <HiMicrophone className="w-4 h-4" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!message.trim() && !attachment}
            className={`p-1.5 text-white rounded-lg transition-all flex-shrink-0 group ${
              message.trim() || attachment
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            title="Send message"
          >
            <VscSend className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Category indicator */}
        {selectedCategory && (
          <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M7.493 16.414a6.5 6.5 0 1 1 9.014-9.014"
                fillOpacity="0.3"
              />
            </svg>
            Category:{" "}
            <span className="font-medium text-gray-700">
              {selectedCategory.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
