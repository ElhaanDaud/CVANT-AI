"use client";

import { useState, useRef } from "react";
import { Button } from "../../ui/button";
import { useToast } from "../../ui/use-toast";
import { Loader2, Upload, File, X } from "lucide-react";
import { uploadFile, deleteFile } from "@/lib/appwrite";
import {
  updateResumeUploadInfo,
  removeUploadedResume,
} from "@/lib/actions/upload.actions";
import { usePathname } from "next/navigation";

export interface UploadedFile {
  fileId: string;
  fileName: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadDate?: Date;
}

interface ResumeUploaderProps {
  resumeId: string;
  userId: string;
  existingFile?: UploadedFile;
  onUploadComplete?: (fileInfo: UploadedFile) => void;
}

const ResumeUploader = ({
  resumeId,
  userId,
  existingFile,
  onUploadComplete,
}: ResumeUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(
    existingFile || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const pathname = usePathname();

  // Format file size to be human-readable
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type (PDF, DOCX, etc.)
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or DOCX file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      // If there's an existing file, delete it first
      if (uploadedFile?.fileId) {
        await deleteFile(uploadedFile.fileId);
      }

      // Upload the new file
      const uploadResponse = await uploadFile(file, userId);
      
      // Map the response to match the UploadedFile interface
      const uploadedFileInfo: UploadedFile = {
        fileId: uploadResponse.id,
        fileName: uploadResponse.name,
        originalName: uploadResponse.originalName,
        size: uploadResponse.size,
        mimeType: uploadResponse.mimeType,
        uploadDate: new Date()
      };

      // Update the database
      const result = await updateResumeUploadInfo(resumeId, uploadedFileInfo);

      if (result.success) {
        setUploadedFile(uploadedFileInfo);
        toast({
          title: "Resume uploaded",
          description: "Your resume has been uploaded successfully",
          className: "bg-white",
        });

        // Notify parent component if needed
        if (onUploadComplete) {
          onUploadComplete(uploadedFileInfo);
        }
      } else {
        toast({
          title: "Upload failed",
          description: result.error || "Failed to update resume information",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!uploadedFile) return;

    try {
      setIsDeleting(true);

      // Delete from storage
      await deleteFile(uploadedFile.fileId);

      // Update database
      const result = await removeUploadedResume(resumeId, pathname);

      if (result.success) {
        setUploadedFile(null);
        toast({
          title: "Resume deleted",
          description: "Your uploaded resume has been deleted",
          className: "bg-white",
        });

        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        toast({
          title: "Delete failed",
          description: result.error || "Failed to delete resume",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting your file",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-primary-700 border-t-4 bg-white">
      <h2 className="text-lg font-semibold leading-none tracking-tight">
        Upload Resume
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Upload your resume file (PDF or DOCX, max 5MB)
      </p>

      <div className="mt-5">
        {uploadedFile ? (
          <div className="flex items-center justify-between border border-gray-200 rounded-md p-3">
            <div className="flex items-center">
              <File className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium">
                  {uploadedFile.originalName}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(uploadedFile.size)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.click();
                }}
                disabled={isUploading || isDeleting}
              >
                Replace
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-600"
                onClick={handleDeleteFile}
                disabled={isUploading || isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="mr-2 animate-spin" /> Deleting
                  </>
                ) : (
                  <>
                    <X size={14} className="mr-2" /> Remove
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md h-32 p-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} /> Upload Resume
                </>
              )}
            </Button>
            <p className="mt-2 text-xs text-gray-500">
              Click to browse files (PDF or DOCX)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUploader;
