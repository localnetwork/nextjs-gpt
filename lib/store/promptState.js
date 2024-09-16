// lib/store/promptState.js
import { create } from "zustand";
import { persist } from "zustand/middleware"; // Import persist middleware

// Zustand store with persist middleware for prompts and responses
const usePromptStore = create(
  persist(
    (set) => ({
      prompts: [],
      responses: [],
      // Add a new prompt and initialize a placeholder for the response
      addPrompt: (prompt) =>
        set((state) => ({
          prompts: [...state.prompts, prompt],
          responses: [...state.responses, null], // Initialize response at same index
        })),
      // Add a response at the correct index
      addResponse: (response, index) =>
        set((state) => {
          console.log("eeeee", response);

          const updatedResponses = [...state.responses];
          updatedResponses[index] = response;
          return { responses: updatedResponses };
        }),
    }),
    {
      name: "prompt-storage", // Key for localStorage
      getStorage: () => localStorage, // Use localStorage
    }
  )
);

export default usePromptStore;
