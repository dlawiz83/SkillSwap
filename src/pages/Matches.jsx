import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase/firebaseConfig";
import Chat from "./Chat";
import { motion } from "framer-motion";

export default function Matches() {
  const [activeTab, setActiveTab] = useState("incoming");
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [acceptedMatches, setAcceptedMatches] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeChatUser, setActiveChatUser] = useState(null);

  async function fetchIncomingRequests(uid) {
    try {
      setLoading(true);
      const q = query(
        collection(db, "matchRequests"),
        where("toUserId", "==", uid),
        where("status", "==", "pending")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setIncomingRequests(data);
    } catch (err) {
      console.error("Error fetching incoming match requests:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSentRequests(uid) {
    try {
      setLoading(true);
      const q = query(
        collection(db, "matchRequests"),
        where("fromUserId", "==", uid),
        where("status", "in", ["pending", "rejected"])
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSentRequests(data);
    } catch (err) {
      console.error("Error fetching sent match requests:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAcceptedMatches(uid) {
    try {
      setLoading(true);
      const sentQuery = query(
        collection(db, "matchRequests"),
        where("fromUserId", "==", uid),
        where("status", "==", "accepted")
      );
      const receivedQuery = query(
        collection(db, "matchRequests"),
        where("toUserId", "==", uid),
        where("status", "==", "accepted")
      );

      const [sentSnap, receivedSnap] = await Promise.all([
        getDocs(sentQuery),
        getDocs(receivedQuery),
      ]);

      const sentMatches = sentSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const receivedMatches = receivedSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const combined = [...sentMatches, ...receivedMatches];
      setAcceptedMatches(combined);
    } catch (err) {
      console.error("Error fetching accepted matches:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchIncomingRequests(currentUser.uid);
        fetchSentRequests(currentUser.uid);
        fetchAcceptedMatches(currentUser.uid);
      } else {
        setIncomingRequests([]);
        setSentRequests([]);
        setAcceptedMatches([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAccept = async (requestId) => {
    try {
      const requestRef = doc(db, "matchRequests", requestId);
      await updateDoc(requestRef, { status: "accepted" });
      setIncomingRequests((prev) => prev.filter((req) => req.id !== requestId));
      if (user) {
        await fetchAcceptedMatches(user.uid);
        await fetchSentRequests(user.uid);
      }
    } catch (err) {
      console.error("Error accepting match:", err);
    }
  };

  const handleReject = async (requestId) => {
    try {
      const requestRef = doc(db, "matchRequests", requestId);
      await updateDoc(requestRef, { status: "rejected" });
      setIncomingRequests((prev) => prev.filter((req) => req.id !== requestId));
      if (user) await fetchSentRequests(user.uid);
    } catch (err) {
      console.error("Error rejecting match:", err);
    }
  };

  const openChat = (match) => {
    setActiveChatUser(match);
  };

 
  const tabClass = (tabName) =>
    `cursor-pointer px-6 py-3 text-lg font-semibold tracking-wide rounded-t-xl transition-colors duration-200 select-none ${
      activeTab === tabName
        ? "bg-orange-500 text-white shadow-lg"
        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
    }`;

  
  const Card = ({ children }) => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.03, boxShadow: "0 8px 20px rgba(255, 165, 0, 0.4)" }}
      className=" bg-gradient-to-br from-purple-700 via-pink-600 to-pink-400 bg-opacity-90 text-black p-6 rounded-3xl shadow-md cursor-default"
    >
      {children}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="text-white bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 min-h-screen flex justify-center items-center px-6">
        <p className="text-xl animate-pulse font-semibold">Loading match requests...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-white bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 min-h-screen flex justify-center items-center px-6">
        <p className="text-lg font-semibold text-center max-w-md">
          Please log in to see your match requests.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 min-h-screen px-10 pt-8 pb-16 text-white">
      <div className="flex space-x-4 mb-8 border-b border-orange-500">
        <button onClick={() => setActiveTab("incoming")} className={tabClass("incoming")}>
          Incoming Requests
        </button>
        <button onClick={() => setActiveTab("accepted")} className={tabClass("accepted")}>
          Accepted Matches
        </button>
        <button onClick={() => setActiveTab("sent")} className={tabClass("sent")}>
          Your Sent Requests
        </button>
      </div>

      {activeTab === "incoming" && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-extrabold mb-8 text-orange-400 select-none">Incoming Match Requests</h1>
          {incomingRequests.length === 0 ? (
            <p className="text-lg text-orange-300 italic select-none">No incoming match requests.</p>
          ) : (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {incomingRequests.map((req) => (
                <Card key={req.id}>
                  <h3 className="text-xl font-semibold mb-2">{req.fromName || "Unknown"}</h3>
                  <p className="text-sm mb-1"><strong>Email:</strong> {req.fromEmail}</p>
                  <p className="text-sm mb-1"><strong>Wants to Learn:</strong> {req.fromLearn}</p>
                  <p className="text-sm"><strong>Can Teach:</strong> {req.fromTeach}</p>
                  <div className="flex justify-between mt-6 gap-4">
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-full font-semibold shadow-md transition"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full font-semibold shadow-md transition"
                    >
                      Reject
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </motion.section>
      )}

      {activeTab === "accepted" && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-extrabold mb-8 text-green-400 select-none">Accepted Matches</h1>
          {acceptedMatches.length === 0 ? (
            <p className="text-lg text-green-300 italic select-none">No accepted matches yet.</p>
          ) : (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {acceptedMatches.map((match) => {
                const isSender = match.fromUserId === user.uid;
                const otherName = isSender ? match.toName : match.fromName;
                const otherEmail = isSender ? match.toEmail : match.fromEmail;
                const otherLearn = isSender ? match.toLearn : match.fromLearn;
                const otherTeach = isSender ? match.toTeach : match.fromTeach;

                return (
                  <Card key={match.id}>
                    <h3 className="text-xl font-semibold mb-2">{otherName}</h3>
                   
                    <p className="text-sm mb-1"><strong>Wants to Learn:</strong> {otherLearn}</p>
                    <p className="text-sm"><strong>Can Teach:</strong> {otherTeach}</p>
                    <p className="text-back font-semibold mt-4 select-none">Matched</p>
                    <button
                      onClick={() => openChat(match)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 mt-5 rounded-full font-semibold shadow-md transition"
                    >
                      💬 Chat
                    </button>
                  </Card>
                );
              })}
            </div>
          )}
        </motion.section>
      )}

      {activeTab === "sent" && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-extrabold mb-8 text-blue-400 select-none">Your Sent Requests</h1>
          {sentRequests.length === 0 ? (
            <p className="text-lg text-blue-300 italic select-none">No sent match requests.</p>
          ) : (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sentRequests.map((req) => (
                <Card key={req.id}>
                  <h3 className="text-xl font-semibold mb-2">To: {req.toName}</h3>
                  <p className="text-sm mb-1"><strong>Status:</strong> {req.status.charAt(0).toUpperCase() + req.status.slice(1)}</p>
                  <p className="text-sm mb-1"><strong>Wants to Learn:</strong> {req.toLearn}</p>
                  <p className="text-sm"><strong>Can Teach:</strong> {req.toTeach}</p>
                </Card>
              ))}
            </div>
          )}
        </motion.section>
      )}

      {activeChatUser && <Chat match={activeChatUser} onClose={() => setActiveChatUser(null)} />}
    </div>
  );
}
