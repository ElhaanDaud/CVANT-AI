"use client";

import { Button } from "../../ui/button";
import { Download, File } from "lucide-react";
import { getFileDownloadUrl } from "@/lib/appwrite";
import { UploadedFile } from "./ResumeUploader";

interface ResumeDownloaderProps {
  fileInfo: UploadedFile;
}

const ResumeDownloader = ({ fileInfo }: ResumeDownloaderProps) => {
  // Format file size to be human-readable
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleDownload = () => {
    const downloadUrl = getFileDownloadUrl(fileInfo.fileId);
    
    // Create a temporary anchor to trigger download
    const anchor = document.createElement('a');
    anchor.href = downloadUrl.toString();
    anchor.download = fileInfo.originalName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <div className="flex items-center justify-between border border-gray-200 rounded-md p-3 mb-4">
      <div className="flex items-center">
        <File className="h-5 w-5 text-blue-600 mr-2" />
        <div>
          <p className="text-sm font-medium">{fileInfo.originalName}</p>
          <p className="text-xs text-gray-500">{formatFileSize(fileInfo.size)}</p>
        </div>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleDownload}
        className="flex gap-2 text-blue-600"
      >
        <Download size={14} /> Download
      </Button>
    </div>
  );
};

export default ResumeDownloader;