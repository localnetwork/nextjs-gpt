import { useState, useEffect } from "react";
import axios from "axios";
import usePromptStore from "@/lib/store/promptState"; // Import the persisted store

export default function Home() {
  const { prompts, responses, addPrompt, addResponse } = usePromptStore();
  const [inputPrompt, setInputPrompt] = useState("");
  const [loadingIndex, setLoadingIndex] = useState(null); // Track which response is loading
  const [isMounted, setIsMounted] = useState(false); // To handle hydration issues
  const [typingText, setTypingText] = useState(""); // For typing effect

  // Ensure that we only render after the component is mounted
  useEffect(() => {
    setIsMounted(true); // Set isMounted to true once the component is mounted
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return; // Prevent submitting empty prompts

    const promptIndex = prompts.length; // Get the index for the new prompt
    addPrompt(inputPrompt); // Add the prompt to the state

    setLoadingIndex(promptIndex); // Set loading state for this prompt
    setTypingText(""); // Reset typing text for new prompt

    try {
      const res = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/api/prompt",
        {
          prompt: inputPrompt,
        }
      );

      const fullResponse = res?.data?.message || "No response yet.";
      simulateTyping(fullResponse, promptIndex); // Trigger typing animation
    } catch (error) {
      console.error(error);
      addResponse("Error: Could not fetch response.", promptIndex);
      setLoadingIndex(null); // Stop loading if error occurs
    }

    setInputPrompt(""); // Clear input field after submission
  };

  // Simulate typing animation
  const simulateTyping = (text, index) => {
    let i = 0;
    const speed = 50; // Adjust speed of typing here
    const typingInterval = setInterval(() => {
      setTypingText((prevText) => prevText + text.charAt(i)); // Add character by character
      i++;
      if (i === text.length) {
        clearInterval(typingInterval); // Stop when the full response is typed
        addResponse(text, index); // Store the full response after typing is finished
        setLoadingIndex(null); // Clear loading state
      }
    }, speed);
  };

  // Only render the component after it's mounted to prevent hydration errors
  if (!isMounted) {
    return null;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Dio PT</h1>
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-lg p-4">
        <div className="chat-window mb-6 overflow-y-auto h-96 space-y-4 p-4 border border-gray-300 rounded-md bg-gray-100">
          {prompts.map((prompt, index) => (
            <div key={index} className="space-y-2">
              {/* User Prompt */}
              <div className="flex justify-end">
                <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
                  <p>{prompt}</p>
                </div>
              </div>
              {/* GPT Response */}
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg max-w-xs w-full">
                  <pre className="bg-gray-800 text-white p-4 rounded-md whitespace-pre-wrap overflow-x-auto">
                    <code className="font-mono text-sm">
                      {loadingIndex === index
                        ? typingText
                        : responses[index] || "No response yet."}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <textarea
            id="prompt"
            name="prompt"
            rows="3"
            placeholder="Enter your prompt"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={loadingIndex !== null} // Disable while waiting for response
            className="border p-2 rounded w-full"
          />
          <button
            type="submit"
            disabled={loadingIndex !== null} // Disable button while loading
            className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${
              loadingIndex !== null ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
