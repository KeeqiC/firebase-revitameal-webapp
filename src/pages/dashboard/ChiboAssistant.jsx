// src/components/ChiboAssistant.jsx
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, MessageCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CHIBO_API_URL = "https://revitameal-api2.vercel.app/api/chibo";

function ChiboAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "chibo",
      text: "Halo! Saya **Chibo**, asisten nutrisi pribadi Anda. ✨\n\nSaya siap membantu Anda dengan pertanyaan seputar *nutrisi*, diet sehat, dan gaya hidup aktif.\n\nAda yang bisa saya bantu hari ini?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSendMessage = async (e) => {
    e?.preventDefault?.();
    if (input.trim() === "" || loading) return;

    const userMessage = input.trim();
    const newUserMessage = {
      id: Date.now(),
      sender: "user",
      text: userMessage,
    };

    setMessages((prev) => [...prev, newUserMessage]);
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.response) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "chibo",
            text: data.response,
          },
        ]);
      } else {
        throw new Error("No response from Chibo");
      }
    } catch (error) {
      console.error("Error communicating with Chibo:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "chibo",
          text: "❌ Maaf, terjadi kesalahan saat menghubungi server. Silakan coba lagi dalam beberapa saat.",
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

  const getCurrentTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Pagi";
    if (hour < 15) return "Siang";
    if (hour < 18) return "Sore";
    return "Malam";
  };

  const suggestedQuestions = [
    "Bagaimana cara menghitung kebutuhan kalori harian?",
    "Menu sarapan sehat apa yang direkomendasikan?",
    "Tips diet untuk menurunkan berat badan?",
    "Makanan apa yang baik untuk stamina?",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F27F34]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-[#B23501]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#FFD580]/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 h-screen flex flex-col p-6 md:p-8">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-3 h-3 bg-gradient-to-r from-[#F27F34] to-[#B23501] rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Selamat {getCurrentTime()}
            </span>
          </div>
          <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-xl">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-800">
                  Tanya{" "}
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                    Chibo
                  </span>
                </h1>
                <p className="text-xl text-gray-600">
                  Asisten nutrisi pribadi yang siap membantu 24/7
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Messages Container */}
        <div className="flex-1 bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end space-x-3 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "chibo" && (
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                )}

                <div
                  className={`group relative max-w-md lg:max-w-lg xl:max-w-xl p-4 rounded-2xl shadow-lg ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white rounded-br-md"
                      : "bg-white/80 text-gray-800 rounded-bl-md border border-white/30"
                  }`}
                >
                  {/* Wrap ReactMarkdown inside a div (do NOT pass className to ReactMarkdown) */}
                  <div
                    className={`prose prose-sm md:prose-base max-w-none ${
                      msg.sender === "user"
                        ? "prose-invert text-white"
                        : "text-gray-800"
                    }`}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>

                  {msg.sender === "chibo" && (
                    <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-cyan-500" />
                  )}
                </div>

                {msg.sender === "user" && (
                  <div className="w-10 h-10 bg-gradient-to-r from-[#F27F34] to-[#B23501] rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading bubble */}
            {loading && (
              <div className="flex items-end space-x-3 justify-start">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="bg-white/80 text-gray-800 p-4 rounded-2xl rounded-bl-md border border-white/30 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      Chibo sedang mengetik...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="px-6 pb-4">
              <p className="text-sm text-gray-600 mb-3 font-medium">
                Pertanyaan yang sering ditanyakan:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(question)}
                    className="text-left p-3 bg-white/50 hover:bg-white/70 border border-white/30 rounded-xl text-sm text-gray-700 transition-all duration-300 hover:scale-105"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <div className="p-6 border-t border-white/20">
            <form onSubmit={handleSendMessage} className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ketik pertanyaan tentang nutrisi..."
                  disabled={loading}
                  className="w-full px-4 py-4 pr-12 rounded-2xl bg-white/50 border border-white/30 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all duration-300 disabled:opacity-50"
                />
                <MessageCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <button
                type="submit"
                disabled={loading || input.trim() === ""}
                className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                <Send
                  className={`h-6 w-6 relative z-10 transition-transform duration-300 ${
                    loading ? "animate-pulse" : "group-hover:translate-x-0.5"
                  }`}
                />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChiboAssistant;
