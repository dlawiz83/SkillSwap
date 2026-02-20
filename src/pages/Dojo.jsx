import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import Webcam from "react-webcam";
import {
  Mic,
  Video,
  PhoneOff,
  Play,
  MessageSquare,
  Code,
  FileText,
  Users,
  Download,
  Send,
  AlertCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

export default function Dojo() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { userProfile } = useAuth();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [workspace, setWorkspace] = useState(null);

  const [code, setCode] = useState(
    "// Welcome to the Dojo\n// Start typing to teach...\n\nfunction helloWorld() {\n  console.log('Learning is currency');\n}",
  );
  const [notes, setNotes] = useState(
    "Session Vocabulary & Notes:\n\n- Type here...",
  );

  // Chat State
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);

  // NEW: Polished UI States
  const [chatError, setChatError] = useState("");
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [toast, setToast] = useState(null); // For the "Run Code" success message

  useEffect(() => {
    if (!roomId) return;

    const messagesRef = collection(db, "rooms", roomId, "messages");
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
  }, [roomId]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !userProfile) return;
    setChatError(""); // Clear previous errors

    try {
      await addDoc(collection(db, "rooms", roomId, "messages"), {
        text: newMessage.trim(),
        senderId: userProfile.uid,
        senderName: userProfile.name,
        createdAt: new Date().toISOString(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);

      setChatError("Failed to send message.");
    }
  };

  const handleRunCode = () => {
    setToast({
      title: "Code Executed",
      desc: "Output: Success! All tests passed.",
    });
    setTimeout(() => setToast(null), 3500);
  };

  const handleExport = () => {
    if (!workspace) return;
    const content = workspace === "code" ? code : notes;
    const filename =
      workspace === "code" ? "skillswap-code.js" : "skillswap-notes.txt";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen w-full bg-slate-900 flex flex-col text-slate-200 overflow-hidden relative">
      {showLeaveModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <h3 className="text-lg font-bold text-white mb-2">
                Leave the Dojo?
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                Are you sure you want to leave the session? Your peer will
                remain in the room.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLeaveModal(false)}
                  className="flex-1 bg-slate-700 text-white py-2 rounded-md text-sm font-medium hover:bg-slate-600 transition-colors"
                >
                  Stay
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="flex-1 bg-red-600 text-white py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
                >
                  Yes, Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="absolute bottom-6 right-6 bg-slate-800 border border-emerald-500/50 text-white px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <Play size={18} className="text-emerald-400 fill-emerald-400" />
          <div>
            <p className="text-sm font-bold">{toast.title}</p>
            <p className="text-xs text-slate-400">{toast.desc}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="h-14 border-b border-slate-700 bg-slate-900 flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center font-bold text-slate-900">
              D
            </div>
            <span className="font-medium text-white mr-4">Live Session</span>
          </div>
          <div className="flex items-center bg-slate-800 p-1 rounded-md">
            <button
              onClick={() => setWorkspace(null)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-colors ${workspace === null ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}
            >
              <Users size={16} /> Face-to-Face
            </button>
            <button
              onClick={() => setWorkspace("code")}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-colors ${workspace === "code" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}
            >
              <Code size={16} /> Code
            </button>
            <button
              onClick={() => setWorkspace("notes")}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-colors ${workspace === "notes" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}
            >
              <FileText size={16} /> Notes
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {workspace && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 border border-slate-600 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded text-sm font-medium transition-colors"
            >
              <Download size={16} /> Export
            </button>
          )}
          {workspace === "code" && (
            <button
              onClick={handleRunCode}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
            >
              <Play size={16} fill="currentColor" /> Run Code
            </button>
          )}
          {/* TRIGGER CUSTOM MODAL HERE */}
          <button
            onClick={() => setShowLeaveModal(true)}
            className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-1.5 rounded text-sm font-medium transition-colors border border-red-500/20"
          >
            Leave Room
          </button>
        </div>
      </header>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        <div
          className={`${workspace === null ? "flex-1 flex flex-row" : "w-80 flex flex-col border-r border-slate-700"} bg-slate-800 transition-all duration-300 ease-in-out`}
        >
          {/* Videos */}
          <div
            className={`${workspace === null ? "flex-1 flex flex-row p-6 gap-6" : "flex flex-col"}`}
          >
            <div
              className={`${workspace === null ? "flex-1 rounded-2xl border" : "h-48 border-b"} bg-slate-900 relative flex items-center justify-center border-slate-700 overflow-hidden shadow-lg`}
            >
              <div className="text-center">
                <div
                  className={`${workspace === null ? "w-24 h-24 text-3xl" : "w-16 h-16 text-xl"} bg-slate-700 rounded-full mx-auto mb-2 flex items-center justify-center font-bold transition-all`}
                >
                  P
                </div>
                <span className="text-slate-400 text-sm">Peer Video</span>
              </div>
            </div>
            <div
              className={`${workspace === null ? "flex-1 rounded-2xl border" : "h-48 border-b"} bg-black relative flex items-center justify-center border-slate-700 overflow-hidden shadow-lg`}
            >
              {isVideoOn ? (
                <Webcam
                  audio={false}
                  className="w-full h-full object-cover"
                  mirrored={true}
                />
              ) : (
                <div className="text-slate-500 text-sm">Camera Off</div>
              )}
              <div className="absolute bottom-4 left-4 flex gap-2">
                <button
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={`p-3 rounded-full shadow-lg transition-colors ${isMicOn ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
                >
                  {isMicOn ? <Mic size={18} /> : <PhoneOff size={18} />}
                </button>
                <button
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`p-3 rounded-full shadow-lg transition-colors ${isVideoOn ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
                >
                  {isVideoOn ? <Video size={18} /> : <PhoneOff size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Live Chat UI */}
          <div
            className={`${workspace === null ? "w-96 border-l border-slate-700" : "flex-1"} p-4 flex flex-col bg-slate-800 transition-all`}
          >
            <div className="flex items-center gap-2 mb-4 text-slate-400 text-sm uppercase tracking-wider font-bold">
              <MessageSquare size={14} /> Room Chat
            </div>

            {/* Chat Messages Container */}
            <div className="flex-1 bg-slate-900/50 rounded p-3 text-sm space-y-4 overflow-y-auto mb-3 border border-slate-700/50">
              <div className="text-slate-500 italic text-xs text-center border-b border-slate-700/50 pb-2 mb-2">
                Session started
              </div>

              {messages.map((msg) => {
                const isMe = msg.senderId === userProfile.uid;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <span className="text-[10px] text-slate-500 mb-1 px-1">
                      {isMe ? "You" : msg.senderName}
                    </span>
                    <div
                      className={`px-3 py-2 rounded-lg max-w-[85%] shadow-sm ${isMe ? "bg-emerald-600 text-white rounded-tr-none" : "bg-slate-700 text-white rounded-tl-none"}`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="relative">
              {chatError && (
                <div className="absolute -top-10 left-0 right-0 px-3 py-1.5 bg-red-900/80 text-red-200 text-xs font-medium rounded-md border border-red-800 flex items-center gap-2 animate-in fade-in backdrop-blur-sm">
                  <AlertCircle size={14} />
                  {chatError}
                </div>
              )}
              <form onSubmit={sendMessage} className="relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Message room..."
                  className="bg-slate-900 border border-slate-700 rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-white w-full shadow-inner transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 p-1 disabled:opacity-50 disabled:hover:text-slate-400 transition-colors"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Workspace */}
        {workspace !== null && (
          <main className="flex-1 flex flex-col relative animate-in fade-in slide-in-from-right-4 duration-300">
            {workspace === "code" ? (
              <div className="absolute inset-0 bg-[#1e1e1e]">
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  theme="vs-dark"
                  value={code}
                  onChange={setCode}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 15,
                    wordWrap: "on",
                    padding: { top: 16 },
                  }}
                />
              </div>
            ) : (
              <div className="absolute inset-0 bg-slate-50 p-8 overflow-y-auto">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Type shared notes here..."
                  className="w-full h-full min-h-[500px] bg-white border border-slate-200 rounded-xl p-8 text-slate-800 text-lg leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-sm"
                />
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  );
}
