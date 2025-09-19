import { useState, useRef, useEffect } from "react";
import { Send, Bot } from "lucide-react";

const CHIBO_API_URL = "https://revitameal-chibo-api.vercel.app/api/chibo";

function ChiboAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "chibo",
      text: "Halo! Saya Chibo, asisten nutrisi pribadi Anda. Ada yang bisa saya bantu?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    const userMessage = input;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: userMessage },
    ]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(CHIBO_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from Chibo.");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "chibo",
          text: data.response,
        },
      ]);
    } catch (error) {
      console.error("Error communicating with Chibo:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "chibo",
          text: "Maaf, terjadi kesalahan. Silakan coba lagi.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="p-6 md:p-8 flex flex-col h-full">
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6 sticky top-0 z-10">
        <div className="flex items-center space-x-3 mb-2">
          <Bot className="h-8 w-8 text-[#B23501]" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Tanya Chibo
          </h1>
        </div>
        <p className="text-gray-600">
          Asisten nutrisi pribadi Anda siap membantu.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-white rounded-xl shadow-lg mb-6">
        <div className="flex flex-col space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-center space-x-2 p-3 rounded-lg max-w-sm ${
                  msg.sender === "user"
                    ? "bg-[#F27F34] text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.sender === "chibo" && (
                  <div className="flex-shrink-0">
                    <Bot className="h-6 w-6 text-[#B23501]" />
                  </div>
                )}
                <p>{msg.text}</p>
              </div>
            </div>
          ))}

          {/* Loading bubble */}
          {loading && (
            <div className="flex items-start justify-start">
              <div className="bg-gray-200 text-gray-800 p-3 rounded-lg rounded-bl-none max-w-sm">
                <p>Chibo sedang mengetik...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-lg mt-auto">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pesan Anda..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B23501]"
          />
          <button
            type="submit"
            className="p-3 bg-[#B23501] text-white rounded-lg hover:bg-[#F9A03F] transition-colors duration-200"
          >
            <Send className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChiboAssistant;
