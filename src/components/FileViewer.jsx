// import { useState, useEffect } from "react";
// import { Document, Page, pdfjs } from "react-pdf";
// import DocxViewer from "./DocxViewer";
// import { XMarkIcon, ArrowLeftIcon, DocumentIcon } from "@heroicons/react/24/solid";

// // Configure PDF.js worker
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// const FileViewer = ({ file, onBackToChat }) => {
//   const [numPages, setNumPages] = useState(null);
//   const [pageNumber, setPageNumber] = useState(1);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     if (file) {
//       setError(null);
//       setIsLoading(true);
//       setPageNumber(1);
//       setNumPages(null);
//     }
//   }, [file]);

//   if (!file) {
//     return (
//       <div className="flex-1 flex items-center justify-center bg-gray-50">
//         <p className="text-gray-500">No file selected</p>
//       </div>
//     );
//   }

//   const fileType = file.type?.toLowerCase();
//   const fileName = file.name || "Unknown file";
//   const displayName = fileName.includes("_")
//     ? fileName.substring(fileName.indexOf("_") + 1)
//     : fileName;

//   const onDocumentLoadSuccess = ({ numPages }) => {
//     setNumPages(numPages);
//     setIsLoading(false);
//     setError(null);
//   };

//   const onDocumentLoadError = (error) => {
//     console.error("PDF loading error:", error);
//     setError("Failed to load PDF document");
//     setIsLoading(false);
//   };

//   const renderPDFViewer = () => (
//     <div className="flex-1 flex flex-col bg-white">
//       <div className="flex-1 overflow-auto flex justify-center p-4">
//         <div className="max-w-4xl w-full">
//           {isLoading && (
//             <div className="flex items-center justify-center h-64">
//               <p className="text-gray-500">Loading PDF...</p>
//             </div>
//           )}
//           {error && (
//             <div className="flex items-center justify-center h-64">
//               <div className="text-center">
//                 <p className="text-red-600 mb-4">{error}</p>
//                 <a
//                   href={file.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-indigo-600 hover:text-indigo-800 underline"
//                 >
//                   Open in new tab
//                 </a>
//               </div>
//             </div>
//           )}
//           {!error && (
//             <Document
//               file={file.url}
//               onLoadSuccess={onDocumentLoadSuccess}
//               onLoadError={onDocumentLoadError}
//               loading={<div className="text-center py-8">Loading PDF...</div>}
//               error={
//                 <div className="text-center py-8 text-red-600">
//                   Failed to load PDF.
//                   <a
//                     href={file.url}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="ml-2 underline hover:text-red-800"
//                   >
//                     Open in new tab
//                   </a>
//                 </div>
//               }
//             >
//               <Page
//                 pageNumber={pageNumber}
//                 renderTextLayer={false}
//                 renderAnnotationLayer={false}
//                 width={Math.min(window.innerWidth - 100, 800)}
//                 className="shadow-lg"
//               />
//             </Document>
//           )}
//         </div>
//       </div>
//       {numPages && numPages > 1 && (
//         <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 border-t">
//           <button
//             disabled={pageNumber <= 1}
//             onClick={() => setPageNumber(pageNumber - 1)}
//             className="px-3 py-1 rounded bg-indigo-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
//           >
//             Previous
//           </button>
//           <span className="text-sm text-gray-700">
//             Page {pageNumber} of {numPages}
//           </span>
//           <button
//             disabled={pageNumber >= numPages}
//             onClick={() => setPageNumber(pageNumber + 1)}
//             className="px-3 py-1 rounded bg-indigo-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );

//   const renderDocxViewer = () => (
//     <div className="flex-1 flex flex-col bg-white overflow-hidden">
//       <div className="flex-1 overflow-auto p-4">
//         <div className="max-w-4xl mx-auto">
//           <DocxViewer
//             url={file.url}
//             className="w-full"
//             style={{ minHeight: "500px" }}
//           />
//         </div>
//       </div>
//     </div>
//   );

//   const renderUnsupportedFile = () => (
//     <div className="flex-1 flex items-center justify-center bg-gray-50">
//       <div className="text-center max-w-md p-8">
//         <DocumentIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//         <h3 className="text-lg font-semibold text-gray-900 mb-2">
//           File Preview Not Available
//         </h3>
//         <p className="text-gray-600 mb-4">
//           This file type cannot be previewed within the chat.
//         </p>
//         <a
//           href={file.url}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
//         >
//           Download & Open
//         </a>
//       </div>
//     </div>
//   );

//   const renderFileContent = () => {
//     if (fileType === "application/pdf") {
//       return renderPDFViewer();
//     } else if (
//       fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
//       fileType === "application/msword" ||
//       fileName.toLowerCase().endsWith('.docx') ||
//       fileName.toLowerCase().endsWith('.doc')
//     ) {
//       return renderDocxViewer();
//     } else {
//       return renderUnsupportedFile();
//     }
//   };

//   return (
//     <div className="flex flex-col h-full bg-white">
//       {/* Header */}
//       <div className="flex items-center justify-between p-4 border-b bg-gray-50">
//         <div className="flex items-center space-x-3">
//           <button
//             onClick={onBackToChat}
//             className="flex items-center space-x-2 px-3 py-1 rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
//             title="Back to Chat"
//           >
//             <ArrowLeftIcon className="h-4 w-4" />
//             <span className="text-sm font-medium">Back to Chat</span>
//           </button>
//           <div className="h-6 w-px bg-gray-300" />
//           <h2 className="text-lg font-semibold text-gray-900 truncate max-w-md" title={displayName}>
//             {displayName}
//           </h2>
//         </div>
//         <div className="flex items-center space-x-2">
//           <a
//             href={file.url}
//             download
//             target="_blank"
//             rel="noopener noreferrer"
//             className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
//             title="Download file"
//           >
//             Download
//           </a>
//           <button
//             onClick={onBackToChat}
//             className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
//             title="Close viewer"
//           >
//             <XMarkIcon className="h-5 w-5" />
//           </button>
//         </div>
//       </div>

//       {/* File content */}
//       {renderFileContent()}
//     </div>
//   );
// };

// export default FileViewer;

import { useState, useEffect } from "react";
import DocxViewer from "./DocxViewer";
import {
  XMarkIcon,
  ArrowLeftIcon,
  DocumentIcon,
} from "@heroicons/react/24/solid";

const FileViewer = ({ file, onBackToChat }) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (file) {
      setError(null);
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [file]);

  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">No file selected</p>
      </div>
    );
  }

  const fileType = file.type?.toLowerCase();
  const fileName = file.name || "Unknown file";
  const displayName = fileName.includes("_")
    ? fileName.substring(fileName.indexOf("_") + 1)
    : fileName;
  const hasGuidPrefix = fileName.includes("_") && fileName.indexOf("_") > 0;

  const renderImageViewer = () => (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex-1 overflow-auto flex justify-center items-center p-4">
        <div className="max-w-full max-h-full">
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                <p className="text-gray-500">Loading image...</p>
              </div>
            </div>
          )}
          {!isLoading && (
            <img
              src={file.url}
              alt={fileName}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setError("Failed to load image");
                setIsLoading(false);
              }}
            />
          )}
          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 underline"
                >
                  Open in new tab
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPDFViewer = () => (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex-1 overflow-auto flex justify-center p-4">
        <div className="max-w-4xl w-full">
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                <p className="text-gray-500">Loading PDF...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 underline"
                >
                  Open in new tab
                </a>
              </div>
            </div>
          )}
          {!error && !isLoading && (
            <div className="border rounded-lg overflow-hidden shadow-lg">
              <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
                {/* <span className="text-sm font-medium text-gray-700">
                  PDF Document
                </span> */}
                {/* <a
                  href={file.url}
                  download={fileName}
                  className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                >
                  Download1
                </a> */}
              </div>
              <iframe
                src={file.url}
                className="w-full h-[600px]"
                title="PDF Document"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setError("Failed to load PDF preview");
                  setIsLoading(false);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDocxViewer = () => (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-4xl mx-auto">
          <DocxViewer
            url={file.url}
            className="w-full"
            style={{ minHeight: "500px" }}
          />
        </div>
      </div>
    </div>
  );

  const renderUnsupportedFile = () => (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-8">
        <DocumentIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          File Preview Not Available
        </h3>
        <p className="text-gray-600 mb-4">
          This file type cannot be previewed within the chat.
        </p>
        <div className="flex gap-3 justify-center">
          <a
            href={file.url}
            download={fileName}
            className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Download File
          </a>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors"
          >
            Open in New Tab
          </a>
        </div>
      </div>
    </div>
  );

  const renderFileContent = () => {
    // Check for images
    if (
      fileType?.includes("image/") ||
      fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/)
    ) {
      return renderImageViewer();
    }
    // Check for PDFs
    else if (
      fileType === "application/pdf" ||
      fileName.toLowerCase().endsWith(".pdf")
    ) {
      return renderPDFViewer();
    }
    // Check for Word documents - use DocxViewer
    else if (
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileType === "application/msword" ||
      fileName.toLowerCase().endsWith(".docx") ||
      fileName.toLowerCase().endsWith(".doc")
    ) {
      return renderDocxViewer();
    }
    // Check for Excel files - use iframe
    else if (
      fileType?.includes("spreadsheet") ||
      fileName.toLowerCase().match(/\.(xls|xlsx)$/)
    ) {
      return renderPDFViewer(); // Reuse iframe viewer
    }
    // For all other files, try iframe first
    else {
      return renderPDFViewer(); // Reuse iframe viewer for other files
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToChat}
            className="flex items-center space-x-2 px-3 py-1 rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
            title="Back to Chat"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Chat</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <h2
            className="text-lg font-semibold text-gray-900 truncate max-w-md"
            title={displayName}
          >
            {displayName}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          {/* <a
            href={file.url}
            download={fileName}
            className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            title="Download file"
          >
            Download
          </a> */}
          <button
            onClick={onBackToChat}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            title="Close viewer"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      {renderFileContent()}
    </div>
  );
};

export default FileViewer;
