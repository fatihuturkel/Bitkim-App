import { create } from 'zustand';

interface ImageSelectionState {
  selectedImageUris: string[];
  setSelectedImageUris: (uris: string[]) => void;
  addImageUri: (uri: string) => void;
  clearSelectedImages: () => void;
}

export const useImageSelectionStore = create<ImageSelectionState>((set) => ({
  selectedImageUris: [],
  setSelectedImageUris: (uris) => set({ selectedImageUris: uris }),
  addImageUri: (uri) => set((state) => ({ selectedImageUris: [...state.selectedImageUris, uri] })),
  clearSelectedImages: () => set({ selectedImageUris: [] }),
}));