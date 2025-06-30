import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [skillCards, setSkillCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchCards = async () => {
      const snapShot = await getDocs(collection(db, "skillSwap"));
      const data = snapShot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSkillCards(data);
    };
    fetchCards();
  }, []);

  const user = auth.currentUser;

  const filterCards = skillCards
    .filter((card) => card.uid !== user?.uid)
    .filter(
      (card) =>
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.learn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.teach.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleMatchRequest = async (toUserId, cardId, card) => {
    if (!user) {
      setMessage({ text: "Please log in to request a match.", type: "error" });
      return;
    }

    const senderCard = skillCards.find((c) => c.uid === user.uid);
    if (!senderCard) {
      setMessage({
        text: "Please fill out your skill card before requesting a match.",
        type: "error",
      });
      return;
    }

    try {
      const matchQuery = query(
        collection(db, "matchRequests"),
        where("fromUserId", "==", user.uid),
        where("toUserId", "==", toUserId),
        where("cardId", "==", cardId),
        where("status", "==", "pending")
      );
      const matchSnapshot = await getDocs(matchQuery);
      if (!matchSnapshot.empty) {
        setMessage({ text: "You already sent a request for this skill.", type: "error" });
        return;
      }

      await addDoc(collection(db, "matchRequests"), {
        fromUserId: user.uid,
        toUserId,
        cardId,
        status: "pending",
        createdAt: new Date(),

        fromName: senderCard.name,
        fromEmail: senderCard.email,
        fromTeach: senderCard.teach,
        fromLearn: senderCard.learn,

        toName: card.name,
        toEmail: card.email,
        toTeach: card.teach,
        toLearn: card.learn,
      });

      setMessage({ text: "Match request sent!", type: "success" });
    } catch (err) {
      console.error("Error sending request:", err);
      setMessage({ text: "Something went wrong.", type: "error" });
    }
  };

  // Clear message after 4 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: "", type: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 px-6 py-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white text-center text-4xl font-bold mb-4"
      >
        SkillSwap
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="text-white text-center text-2xl mb-10"
      >
        Learn Something. Teach Something.
      </motion.h2>

      {/* Message box */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 max-w-xl mx-auto px-6 py-3 rounded text-center font-semibold ${
              message.type === "error"
                ? "bg-red-500 text-white"
                : "bg-green-500 text-white"
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="flex justify-center mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <input
          type="text"
          placeholder="Search Skills"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-xl px-5 py-3 rounded-full bg-white text-black text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </motion.div>

      {filterCards.length === 0 ? (
        <p className="text-white text-center text-lg mt-4">
          No matches found for your search
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filterCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white bg-opacity-20 backdrop-blur-md text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between"
            >
              <div>
                <h3 className="font-bold text-xl mb-2">{card.name}</h3>
                <p className="text-sm mb-1">
                  <strong>Wants to Learn:</strong> {card.learn}
                </p>
                <p className="text-sm mb-1">
                  <strong>Can Teach:</strong> {card.teach}
                </p>
                {card.description && (
                  <p className="text-sm italic mt-2">"{card.description}"</p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMatchRequest(card.uid, card.id, card)}
                className="mt-4 bg-orange-500 hover:bg-orange-600 transition-colors text-white px-4 py-2 rounded-full font-semibold shadow-md"
              >
                Request Match
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
