import axios from "axios";

// ❗️Replace these with your real values
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const assistantId = import.meta.env.VITE_ASSISTANT_ID;

const client = axios.create({
  baseURL: "https://api.openai.com/v1",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "OpenAI-Beta": "assistants=v2"
  },
});


let threadId = null;

export async function sendMessage(message) {
  try {
    // Step 1: Create a new thread (once)
    if (!threadId) {
      const threadRes = await client.post("/threads");
      threadId = threadRes.data.id;
    }

    // Step 2: Add user message to the thread
    await client.post(`/threads/${threadId}/messages`, {
      role: "user",
      content: message,
    });

    // Step 3: Run the assistant on the thread
    const runRes = await client.post(`/threads/${threadId}/runs`, {
      assistant_id: assistantId,
    });

    const runId = runRes.data.id;

    // Step 4: Poll until the run completes
    let runStatus = "queued";
    while (runStatus !== "completed") {
      const check = await client.get(`/threads/${threadId}/runs/${runId}`);
      runStatus = check.data.status;
      await new Promise((r) => setTimeout(r, 1000));
    }

    // Step 5: Get assistant's response
    const messages = await client.get(`/threads/${threadId}/messages`);
    const last = messages.data.data.find((m) => m.role === "assistant");

    const textBlock = last?.content?.find(c => c.type === "text");
    return textBlock?.text?.value || "[No response]";
  } catch (err) {
    console.error("Chat error:", err?.response?.data || err.message);
    return "Sorry, something went wrong.";
  }
}
