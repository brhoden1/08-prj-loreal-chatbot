/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

const conversationMessages = [
  {
    role: "system",
    content:
      "You are a friendly, fun, and helpful assistant. You will answer questions about L'Oréal products and services. Ask relevant questions to continue the conversation, or otherwise offer more help. Include emojis if appropriate. If a user's question is unrelated to L'Oréal, please politely redirect them to the topic.",
  },
  {
    role: "assistant",
    content: "Hello! Ask me about L'Oréal products or routines.",
  },
];

// Set initial message
renderMessages();

//Cloudfare Worker URL
const workerUrl = 'https://loreal-chatbot-worker.brhoden1.workers.dev/';

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userText = userInput.value.trim();
  if (!userText) return;

  userInput.value = "";
  conversationMessages.push({ role: "user", content: userText });
  renderMessages();

  // Show a loading message while the API responds
  const loadingMessage = { role: "assistant", content: "Thinking..." };
  conversationMessages.push(loadingMessage);
  renderMessages();

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: conversationMessages,
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices[0]?.message?.content) {
      const assistantReply = data.choices[0].message.content;
      conversationMessages.splice(
        conversationMessages.indexOf(loadingMessage),
        1,
      );
      conversationMessages.push({ role: "assistant", content: assistantReply });
      renderMessages();
    } else {
      conversationMessages.splice(
        conversationMessages.indexOf(loadingMessage),
        1,
      );
      conversationMessages.push({
        role: "assistant",
        content: "No response received from the API.",
      });
      renderMessages();
    }
  } catch (error) {
    conversationMessages.splice(
      conversationMessages.indexOf(loadingMessage),
      1,
    );
    conversationMessages.push({
      role: "assistant",
      content: "Sorry, something went wrong. Please try again later.",
    });
    renderMessages();
    console.error(error);
  }
});

function renderMessages() {
  chatWindow.innerHTML = "";

  conversationMessages
    .filter((message) => message.role !== "system")
    .forEach((message) => {
      const bubble = document.createElement("div");
      bubble.className = `msg ${message.role === "user" ? "user" : "ai"}`;
      bubble.textContent = message.content;
      chatWindow.appendChild(bubble);
    });

  chatWindow.scrollTop = chatWindow.scrollHeight;
}
