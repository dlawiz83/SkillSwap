import { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";

export default function Chat({ match, onClose }) {
  const user = auth.currentUser;
  if (!user) return null;

  const otherUid =
    match.fromUserId === user.uid ? match.toUserId : match.fromUserId;
  const chatId = [user.uid, otherUid].sort().join("_");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    await addDoc(collection(db, "chats", chatId, "messages"), {
      sender: user.uid,
      text: input.trim(),
      timestamp: new Date(),
    });
    setInput("");
  };

  return (
    <div className="fixed bottom-5 right-5 w-80 max-h-[450px] bg-gray-900 rounded-lg p-4 flex flex-col shadow-lg text-white">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">
          Chat with {match.fromUserId === user.uid ? match.toName : match.fromName}
        </h2>
        <button
          onClick={onClose}
          className="text-white font-bold text-xl hover:text-red-500 transition"
          aria-label="Close chat"
        >
          &times;
        </button>
      </div>

      <div className="flex-grow overflow-y-auto mb-3 space-y-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-4/5 px-4 py-2 rounded-lg break-words ${
              m.sender === user.uid
                ? "bg-blue-600 self-end rounded-br-none"
                : "bg-gray-700 self-start rounded-bl-none"
            }`}
          >
            {m.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
        placeholder="Type your message"
        className="w-full rounded-full px-4 py-2 text-black outline-none"
      />

      <button
        onClick={sendMessage}
        className="mt-2 bg-blue-600 hover:bg-blue-700 rounded-full py-2 font-semibold transition"
      >
        Send
      </button>
    </div>
  );
}
