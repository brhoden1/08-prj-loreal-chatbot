/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userText = userInput.value.trim();
  if (!userText) return;

  // Show a loading message while the API responds
  chatWindow.textContent = "Thinking...";

  // Use the API key from secrets.js
  const apiKey = window.apiKEY;
  if (!apiKey) {
    chatWindow.textContent = "The API key is not available yet.";
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        messages: [
          { role: 'system', content: "You are a friendly, fun, and helpful assistant. You will answer questions about L'Oréal products and services. If a user's question is unrelated to L'Oréal, please politely redirect them to the topic." },
          { role: "user", content: userText }],
        max_completion_tokens: 300,
        temperature: 0.3,
        frequency_penalty: 0.7
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices[0]?.message?.content) {
      chatWindow.textContent = data.choices[0].message.content;
    } else {
      chatWindow.textContent = "No response received from the API.";
    }
  } catch (error) {
    chatWindow.textContent = "Sorry, something went wrong.";
    console.error(error);
  }
});