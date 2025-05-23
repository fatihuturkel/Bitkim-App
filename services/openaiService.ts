import { OPENAI_API_KEY } from '@/constants/Config'; // Ensure you have the correct environment variable set up
import OpenAI from 'openai';

// Initialize the OpenAI client
// You should use environment variables for the API key in a production app
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    "HTTP-Referer": "expodeneme1", // Optional. Site URL for rankings on openrouter.ai.
    "X-Title": "expodeneme1", // Optional. Site title for rankings on openrouter.ai.
  },
});

// Type definitions for chat messages
type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string | { type: string; text?: string; image_url?: { url: string } }[];
};

// Define a type that is compatible with OpenAI's ChatCompletionMessageParam
type OpenAIChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function generateAIResponse(prompt: string, imageUrl?: string, history: ChatMessage[] = []): Promise<string> {
  try {
    // Create a system message to define the assistant's role
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are a friendly and helpful chatbot created by the Bitkim project. Your expertise is identifying plant diseases and providing gardening advice.
    
    **Core Functions:**
    *   Answer user questions about plants, gardening techniques, tools, products, services, locations, timing, and plant diseases with relevant, structured, and concise information.
    *   Analyze user-provided images: Identify the plant type if visible, detect potential diseases, and provide feedback based *only* on the image content.
    
    **Interaction Guidelines:**
    *   Match the user's tone and style of communication.
    *   Match the user's language (English or Turkish) based on their input.
    *   If a question is unclear or more information is needed to provide accurate advice (especially for disease diagnosis), politely ask for clarification.
    *   If you cannot answer a relevant question (e.g., lack specific data), state that you don't have the information.
    *   If the user asks about topics outside of plants, gardening, or plant diseases, politely state that your expertise is limited to these areas.
    *   If the user provides an image, analyze it and provide feedback based on the content of the image.
    *   If images are not relevant to plants, gardening, or plant diseases, politely inform the user that you cannot assist with those images.
    *   Maintain a friendly and helpful tone throughout the conversation.
    *   Keep your answers structured (e.g., using bullet points for lists or steps) and reasonably short.`
    };

    // Prepend the system message to the conversation history
    const messagesWithSystemPrompt = [systemMessage, ...history];

    // For debugging - log the messages being sent to OpenAI
    console.log("Sending messages to OpenAI:", JSON.stringify(messagesWithSystemPrompt, null, 2));

    // Make the API call with the complete history including system message
    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-exp:free",
      messages: messagesWithSystemPrompt as OpenAIChatMessage[],
    });

    const assistantResponse = response.choices[0]?.message?.content || "I don't have a response for that.";

    return assistantResponse;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return "Sorry, I encountered an error processing your request.";
  }
}