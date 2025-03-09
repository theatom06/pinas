import { join } from "path";
import { readFile, writeFile, unlink } from "fs/promises";
import { file } from "bun";

const serverUrl = "http://localhost:3000";
const localFilePath = join(import.meta.dir, "localfile.txt");
const remoteFilePath = "/uploadedfile.txt";
const newRemoteFilePath = "/renamedfile.txt";

// Function to upload a file
async function uploadFile() {
  const fileContent = await readFile(localFilePath);
  const response = await fetch(`${serverUrl}/upload${remoteFilePath}`, {
    method: "POST",
    body: fileContent,
  });

  if (response.ok) {
    console.log("File uploaded successfully");
  } else {
    console.error("Failed to upload file", response.statusText);
  }
}

// Function to download a file
async function downloadFile() {
  const response = await fetch(`${serverUrl}/download${remoteFilePath}`);

  if (response.ok) {
    const fileContent = await response.arrayBuffer();
    await writeFile(localFilePath, Buffer.from(fileContent));
    console.log("File downloaded successfully");
  } else {
    console.error("Failed to download file", response.statusText);
  }
}

// Function to get file metadata
async function getFileMetadata() {
  const response = await fetch(`${serverUrl}/metadata${remoteFilePath}`);

  if (response.ok) {
    const metadata = await response.text();
    console.log("File metadata:", metadata);
  } else {
    console.error("Failed to get file metadata", response.statusText);
  }
}

// Function to rename a file
async function renameFile() {
  const response = await fetch(`${serverUrl}/rename${remoteFilePath}`, {
    method: "POST",
    body: newRemoteFilePath,
  });

  if (response.ok) {
    console.log("File renamed successfully");
  } else {
    console.error("Failed to rename file", response.statusText);
  }
}

// Function to delete a file
async function deleteFile() {
  const response = await fetch(`${serverUrl}/delete${newRemoteFilePath}`, {
    method: "DELETE",
  });

  if (response.ok) {
    console.log("File deleted successfully");
  } else {
    console.error("Failed to delete file", response.statusText);
  }
}

// Function to check server health
async function checkHealth() {
  const response = await fetch(`${serverUrl}/health`);

  if (response.ok) {
    console.log("Health check passed");
  } else {
    console.error("Health check failed", response.statusText);
  }
}

// Function to get server logs
async function getLogs() {
  const response = await fetch(`${serverUrl}/log`);

  if (response.ok) {
    console.log("Server logs retrieved successfully");
  } else {
    console.error("Failed to get server logs", response.statusText);
  }
}

// Function to get hash of a file
async function getFileHash() {
  const response = await fetch(`${serverUrl}/hash${remoteFilePath}`);

  if (response.ok) {
    const hash = await response.text();
    console.log("File hash:", hash);
  } else {
    console.error("Failed to get file hash", response.statusText);
  }
}

// Function to get server time
async function getServerTime() {
  const response = await fetch(`${serverUrl}/time`);

  if (response.ok) {
    const time = await response.text();
    console.log("Server time:", time);
  } else {
    console.error("Failed to get server time", response.statusText);
  }
}

// Function to echo a message
async function echoMessage(message: string) {
  const response = await fetch(`${serverUrl}/echo`, {
    method: "POST",
    body: message,
  });

  if (response.ok) {
    const echoedMessage = await response.text();
    console.log("Echoed message:", echoedMessage);
  } else {
    console.error("Failed to echo message", response.statusText);
  }
}

// Test the server functionality
(async () => {
  // Create a local file for testing
  await writeFile(localFilePath, "This is a test file");

  // Upload the file
  await uploadFile();

  // Get file metadata
  await getFileMetadata();

  // Download the file
  await downloadFile();

  // Get file hash
  await getFileHash();

  // Rename the file
  await renameFile();

  // Delete the file
  await deleteFile();

  // Check server health
  await checkHealth();

  // Get server logs
  await getLogs();

  // Get server time
  await getServerTime();

  // Echo a message
  await echoMessage("Hello, World!");

  // Clean up local test file
  await unlink(localFilePath);
})();