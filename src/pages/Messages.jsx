import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  orderBy,
  getDocs,
} from "firebase/firestore";
import {
  Send,
  User as UserIcon,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

export default function Messages() {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);


  const [error, setError] = useState("");

  // Generate a unique, consistent ID for any two users chatting
  const getChatId = (uid1, uid2) => {
    return [uid1, uid2].sort().join("_");
  };

  // 1. Fetch all users for the sidebar contacts
  useEffect(() => {
    async function fetchUsers() {
      if (!userProfile?.uid) return;
      const snapshot = await getDocs(collection(db, "users"));
      const allUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Filter out ourselves
      setUsers(allUsers.filter((u) => u.uid !== userProfile.uid));
    }
    fetchUsers();
  }, [userProfile]);

  // 2. Listen for messages when a user is selected
  useEffect(() => {
    if (!selectedUser || !userProfile) return;

    const chatId = getChatId(
      userProfile.uid,
      selectedUser.uid || selectedUser.id,
    );
    const messagesRef = collection(db, "direct_messages", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
      setTimeout(
        () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    });

    return () => unsubscribe();
  }, [selectedUser, userProfile]);

  // 3. Send a direct message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !userProfile) return;

    setError(""); // Clear previous errors

    const chatId = getChatId(
      userProfile.uid,
      selectedUser.uid || selectedUser.id,
    );

    try {
      await addDoc(collection(db, "direct_messages", chatId, "messages"), {
        text: newMessage.trim(),
        senderId: userProfile.uid,
        createdAt: new Date().toISOString(),
      });
      setNewMessage("");
    } catch (err) {
      console.error("Error sending DM:", err);
   
      setError("Message failed to send. Check your connection.");
    }
  };

  if (!userProfile) return null;

  return (
    <div className="h-[calc(100vh-8rem)] bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex animate-in fade-in duration-300">
      {/* LEFT: Contacts Sidebar */}
      <div className="w-1/3 min-w-[250px] border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare size={18} /> Inbox
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => {
                setSelectedUser(user);
                setError(""); // Clear error when switching chats
              }}
              className={`w-full text-left p-4 flex items-center gap-3 border-b border-slate-100 transition-colors ${selectedUser?.id === user.id ? "bg-slate-100 border-l-4 border-l-slate-900" : "hover:bg-white"}`}
            >
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 shrink-0">
                {user.name?.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="font-medium text-slate-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  Teaches: {user.skillsTeaching?.[0] || "Various"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 bg-white flex items-center gap-3 shadow-sm z-10">
              <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center font-bold text-white">
                {selectedUser.name?.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  {selectedUser.name}
                </h3>
                <p className="text-xs text-emerald-600 font-medium">
                  Available for Swap
                </p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <UserIcon size={48} className="text-slate-300" />
                  <p>Start the conversation with {selectedUser.name}</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === userProfile.uid;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`px-4 py-2 rounded-2xl max-w-[75%] ${isMe ? "bg-slate-900 text-white rounded-br-sm" : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm"}`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-slate-200">
           
              {error && (
                <div className="mb-3 px-3 py-2 bg-red-50 text-red-600 text-xs font-medium rounded-md border border-red-200 flex items-center gap-2 animate-in fade-in">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <form onSubmit={sendMessage} className="flex gap-2 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${selectedUser.name}...`}
                  className="flex-1 bg-slate-100 border-transparent rounded-full px-5 py-3 text-sm focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-slate-900 text-white p-3 rounded-full hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center shrink-0"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
            <MessageSquare size={64} className="text-slate-200" />
            <p className="text-lg font-medium text-slate-500">
              Select a peer to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
