// import { useEffect, useRef, useState } from "react";

// // Lazy load docx-preview to keep bundle smaller in web
// let docxPreviewLib = null;
// async function getDocxPreview() {
//   if (docxPreviewLib) return docxPreviewLib;
//   const mod = await import("docx-preview");
//   docxPreviewLib = mod;
//   return mod;
// }

// const DocxViewer = ({ url, className = "", style = {} }) => {
//   const containerRef = useRef(null);
//   const [status, setStatus] = useState("idle"); // idle | loading | ready | error
//   const [error, setError] = useState("");

//   useEffect(() => {
//     let cancelled = false;
//     const render = async () => {
//       if (!url || !containerRef.current) return;
//       setStatus("loading");
//       setError("");
//       try {
//         const res = await fetch(url);
//         if (!res.ok) throw new Error(`Failed to fetch DOCX: ${res.status}`);
//         const buf = await res.arrayBuffer();
//         const { default: docx } = await getDocxPreview();
//         if (cancelled) return;
//         // Clear previous
//         containerRef.current.innerHTML = "";
//         await docx.renderAsync(buf, containerRef.current, undefined, {
//           className: "docx",
//           inWrapper: true,
//         });
//         if (!cancelled) setStatus("ready");
//       } catch (e) {
//         console.error("DOCX render error:", e);
//         if (!cancelled) {
//           setError(e.message || "Failed to render document");
//           setStatus("error");
//         }
//       }
//     };

//     render();
//     return () => {
//       cancelled = true;
//     };
//   }, [url]);

//   return (
//     <div className={className} style={style}>
//       {status === "loading" && (
//         <p className="text-sm text-gray-500">Loading document...</p>
//       )}
//       {status === "error" && (
//         <div className="text-sm text-red-600">
//           Failed to preview this document.
//           {/* <div className="mt-2">
//             <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">Open in new tab</a>
//           </div> */}
//         </div>
//       )}
//       <div ref={containerRef} className="prose max-w-none docx-preview" />
//     </div>
//   );
// };

// export default DocxViewer;

import { useState, useEffect, useRef } from "react";

const DocxViewer = ({ url, className = "", style = {} }) => {
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const loadDocument = async () => {
      if (!url) return;
      
      setStatus("loading");
      setError("");
      
      try {
        // Import mammoth dynamically
        const mammoth = await import('mammoth');
        
        // Fetch the document
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch document: ${response.status}`);
        
        const arrayBuffer = await response.arrayBuffer();
        
        // Convert to HTML using mammoth
        const result = await mammoth.convertToHtml({ arrayBuffer });
        
        if (!cancelled) {
          setHtmlContent(result.value);
          setStatus("ready");
        }
      } catch (err) {
        console.error("Error loading document:", err);
        if (!cancelled) {
          setError(err.message || "Failed to load document");
          setStatus("error");
        }
      }
    };

    loadDocument();
    
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (status === "loading") {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`} style={style}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
          <p className="text-gray-500">Loading document...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={`p-6 border-2 border-dashed border-red-300 rounded-lg bg-red-50 ${className}`} style={style}>
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-900 mb-2">Preview Unavailable</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            Open in New Tab
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`} style={style}>
      <div 
        ref={containerRef}
        className="prose max-w-none p-6 bg-white border rounded-lg"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};

export default DocxViewer;
