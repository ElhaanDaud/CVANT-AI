"use server";

import { revalidatePath } from "next/cache";
import Resume from "../models/resume.model";
import { connectToDB } from "../mongoose";

export async function updateResumeUploadInfo(
  resumeId: string,
  fileInfo: {
    fileId: string;
    fileName: string;
    originalName: string;
    size: number;
    mimeType: string;
  },
) {
  try {
    await connectToDB();

    const resume = await Resume.findOne({ resumeId: resumeId });

    if (!resume) {
      return { success: false, error: "Resume not found" };
    }

    // Update the uploaded resume information
    resume.uploadedResume = {
      fileId: fileInfo.fileId,
      fileName: fileInfo.fileName,
      originalName: fileInfo.originalName,
      size: fileInfo.size,
      mimeType: fileInfo.mimeType,
      uploadDate: new Date(),
    };

    await resume.save();

    return { success: true, data: resume };
  } catch (error: any) {
    console.error(`Failed to update resume upload info: ${error.message}`);
    return { success: false, error: error.message };
  }
}

export async function removeUploadedResume(resumeId: string, path: string) {
  try {
    await connectToDB();

    const resume = await Resume.findOne({ resumeId: resumeId });

    if (!resume) {
      return { success: false, error: "Resume not found" };
    }

    // Remove the uploaded resume information
    resume.uploadedResume = undefined;
    await resume.save();

    revalidatePath(path);

    return { success: true };
  } catch (error: any) {
    console.error(`Failed to remove uploaded resume: ${error.message}`);
    return { success: false, error: error.message };
  }
}
