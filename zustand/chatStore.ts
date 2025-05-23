import { create } from 'zustand';

// TODO: Consider moving these types to a shared types file (e.g., types/chat.ts)
// and import them here and in app/(app)/analyze/chat/index.tsx.
// These types are based on the ones currently in app/(app)/analyze/chat/index.tsx.

/**
 * UI Message type for rendering messages in chat.
 */
export type Message = {
  id: string;
  text: string;
  imageUri?: string;
  timestamp: Date;
  isUser: boolean;
  isThinking?: boolean;
};

/**
 * Type for messages sent to/received from the OpenAI API.
 */
export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string | { type: string; text?: string; image_url?: { url: string } }[];
};

interface ChatState {
  messages: Message[];
  chatHistory: ChatMessage[];
  addMessage: (message: Message) => void;
  addChatMessageToHistory: (chatMessage: ChatMessage) => void;
  replaceMessages: (messages: Message[]) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  chatHistory: [],
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  addChatMessageToHistory: (chatMessage) => set((state) => ({ chatHistory: [...state.chatHistory, chatMessage] })),
  replaceMessages: (messages) => set({ messages }),
  clearChat: () => set({ messages: [], chatHistory: [] }),
}));