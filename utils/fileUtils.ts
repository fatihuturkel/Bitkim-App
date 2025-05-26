import * as FileSystem from 'expo-file-system';

/**
 * Moves an image from a temporary URI to the app's document directory, making it permanent.
 * @param tempUri The temporary URI of the image.
 * @returns A promise that resolves with the new path of the saved image in the document directory.
 */
const moveImageToStorage = async (tempUri: string): Promise<string> => {
  const filename = tempUri.split('/').pop();
  if (!filename) {
    throw new Error('Could not extract filename from URI.');
  }
  const newPath = `${FileSystem.documentDirectory}${filename}`;
  
  try {
    await FileSystem.moveAsync({
      from: tempUri,
      to: newPath,
    });
    console.log(`Image moved from ${tempUri} to ${newPath}`);
    return newPath;
  } catch (error) {
    console.error(`Failed to move image from ${tempUri} to ${newPath}:`, error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export { moveImageToStorage as saveImage };

