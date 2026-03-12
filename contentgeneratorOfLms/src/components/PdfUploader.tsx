import React, { useRef } from "react";
import "./PdfUploader.css";

interface PdfUploaderProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  fileName: string | null;
}

export function PdfUploader({ onFileSelect, disabled, fileName }: PdfUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      onFileSelect(file);
    }
    e.target.value = "";
  };

  return (
    <div className="pdf-uploader">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleChange}
        disabled={disabled}
        className="pdf-uploader-input"
        aria-label="Choose PDF file"
      />
      <button
        type="button"
        className="pdf-uploader-button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
      >
        {fileName ? `Replace: ${fileName}` : "Insert PDF"}
      </button>
      <p className="pdf-uploader-hint">Select a subject book PDF to extract content and view the tree structure.</p>
    </div>
  );
}
