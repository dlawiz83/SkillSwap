import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { motion } from "framer-motion";

export default function Profile() {
  const [skillCard, setSkillCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserSkillCard = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }
      const q = query(collection(db, "skillSwap"), where("uid", "==", user.uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setSkillCard({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      }
      setLoading(false);
    };

    fetchUserSkillCard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white">
        <p className="text-xl animate-pulse">Loading your skill card...</p>
      </div>
    );
  }

  if (!skillCard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white">
        <p className="text-lg text-white text-opacity-70 italic">
          You have not submitted any skill card yet.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white flex flex-col items-center justify-center px-4 py-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-extrabold mb-8 text-orange-400 text-center"
      >
        My Skill Card
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white bg-opacity-10 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-md w-full"
      >
        <h2 className="text-2xl font-semibold mb-4 text-white">{skillCard.name}</h2>
        <p className="mb-2"><strong>Email:</strong> {skillCard.email}</p>
        <p className="mb-2"><strong>Skills to Teach:</strong> {skillCard.teach}</p>
        <p className="mb-2"><strong>Skills to Learn:</strong> {skillCard.learn}</p>
        {skillCard.description && (
          <p className="italic text-white text-opacity-80 mt-4">"{skillCard.description}"</p>
        )}
      </motion.div>
    </div>
  );
}
