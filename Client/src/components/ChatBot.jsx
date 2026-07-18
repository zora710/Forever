import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router";

function ChatBot() {
  const { backendUrl, currency } = useContext(ShopContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text:
        "Hi! I'm your shopping assistant 🤖 Ask me things like \"warm jackets for women under 2000\" or \"cheap cotton shirts for men\".",
      products: [],
    },
  ]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setMessages((prev) => [...prev, { from: "user", text, products: [] }]);
    setInput("");
    setSending(true);

    try {
      const res = await axios.post(backendUrl + "/api/ai/chat", { message: text });
      if (res.data.success) {
        setMessages((prev) => [...prev, { from: "bot", text: res.data.reply, products: res.data.products || [] }]);
      } else {
        setMessages((prev) => [...prev, { from: "bot", text: "Sorry, something went wrong. Please try again.", products: [] }]);
      }
    } catch (error) {
      console.log(error);
      setMessages((prev) => [...prev, { from: "bot", text: "Sorry, something went wrong. Please try again.", products: [] }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-80 sm:w-96 h-[28rem] bg-white border border-gray-300 rounded-lg shadow-xl flex flex-col overflow-hidden">
          <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
            <p className="text-sm font-medium">🤖 Shopping Assistant</p>
            <button onClick={() => setOpen(false)} className="text-white text-lg leading-none">×</button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.from === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[85%] text-sm px-3 py-2 rounded-lg ${
                    m.from === "user" ? "bg-black text-white rounded-br-none" : "bg-white border border-gray-200 rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>

                {m.products && m.products.length > 0 && (
                  <div className="mt-2 flex flex-col gap-2 w-full">
                    {m.products.map((p) => (
                      <div
                        key={p._id}
                        onClick={() => navigate(`/product/${p._id}`)}
                        className="flex items-center gap-2 bg-white border border-gray-200 rounded-md p-2 cursor-pointer hover:border-gray-400 transition"
                      >
                        {p.image && <img src={p.image} className="w-10 h-10 object-cover rounded" alt={p.name} />}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{p.name}</p>
                          <p className="text-xs text-gray-500">{currency}{p.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {sending && <div className="text-xs text-gray-400 animate-pulse">Assistant is typing…</div>}
          </div>

          <form onSubmit={send} className="border-t border-gray-200 p-2 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products…"
              className="flex-1 text-sm outline-none px-2 py-2 border border-gray-300 rounded-full"
            />
            <button type="submit" disabled={sending} className="text-sm px-4 py-2 bg-black text-white rounded-full disabled:opacity-50">
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-black text-white text-2xl flex items-center justify-center shadow-lg hover:scale-105 transition"
        aria-label="Open shopping assistant"
      >
        {open ? "×" : "💬"}
      </button>
    </div>
  );
}

export default ChatBot;
