import { Client, Storage, ID } from "appwrite";

export const appwriteConfig = {
  endpoint:
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
  storageId: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID || "",
};

// Initialize the Appwrite client
const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

// Initialize Appwrite services
export const storage = new Storage(client);

/**
 * Uploads a file to Appwrite storage
 */
export const uploadFile = async (file: File, userId: string) => {
  try {
    const uniqueFileId = ID.unique();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uniqueFileId}.${fileExtension}`;
    
    // Appwrite v17+ createFile signature
    const response = await storage.createFile(
      appwriteConfig.storageId,
      uniqueFileId,
      file
    );

    // Set permissions separately (if needed)
    await storage.updateFile(
      appwriteConfig.storageId,
      response.$id,
      // Updated permissions format
      `user:${userId}` 
    );

    return {
      id: response.$id,
      name: fileName,
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Gets a file download URL
 */
export const getFileDownloadUrl = (fileId: string) => {
  return storage.getFileDownload(appwriteConfig.storageId, fileId);
};

/**
 * Gets a file view URL
 */
export const getFileViewUrl = (fileId: string) => {
  return storage.getFileView(appwriteConfig.storageId, fileId);
};

/**
 * Deletes a file from storage
 */
export const deleteFile = async (fileId: string) => {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};
