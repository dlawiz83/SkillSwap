import { useState } from "react";
import { motion } from "framer-motion";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

export default function SkillForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [teach, setTeach] = useState("");
  const [learn, setLearn] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === "name") setName(value);
    if (id === "email") setEmail(value);
    if (id === "teach") setTeach(value);
    if (id === "learn") setLearn(value);
    if (id === "description") setDescription(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const user = auth.currentUser;
    if (!user) {
      setError("You must be logged in to submit the form.");
      return;
    }
    if (!name || !email || !teach || !learn) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const q = query(collection(db, "skillSwap"), where("uid", "==", user.uid));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        const existingData = snapshot.docs[0].data();

        const existingTeach = existingData.teach
          ? existingData.teach.split(",").map((s) => s.trim())
          : [];
        const existingLearn = existingData.learn
          ? existingData.learn.split(",").map((s) => s.trim())
          : [];

        const newTeach = teach.split(",").map((s) => s.trim());
        const newLearn = learn.split(",").map((s) => s.trim());

        const combinedTeach = Array.from(new Set([...existingTeach, ...newTeach]));
        const combinedLearn = Array.from(new Set([...existingLearn, ...newLearn]));

        await updateDoc(docRef, {
          teach: combinedTeach.join(", "),
          learn: combinedLearn.join(", "),
          description: description || existingData.description,
          updatedAt: new Date(),
        });

        setSuccess("Your skill card has been updated!");
      } else {
        await addDoc(collection(db, "skillSwap"), {
          uid: user.uid,
          name,
          email,
          teach,
          learn,
          description,
          createdAt: new Date(),
        });

        setSuccess("Your skill card has been created!");
      }

      setName("");
      setEmail("");
      setTeach("");
      setLearn("");
      setDescription("");
    } catch (err) {
      console.error("Error submitting form: ", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex flex-col items-center justify-center px-6 py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="text-white text-4xl font-bold mb-8 select-none">Offer Your Skill</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white bg-opacity-20 backdrop-blur-md rounded-xl shadow-lg p-8 w-full max-w-md"
      >
        <label className="block mb-5">
          <span className="text-white font-semibold">Your Name *</span>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handleChange}
            minLength={3}
            required
            placeholder="Your Name"
            className="mt-1 block w-full rounded-md px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </label>

        <label className="block mb-5">
          <span className="text-white font-semibold">Email *</span>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
            className="mt-1 block w-full rounded-md px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </label>

        <label className="block mb-5">
          <span className="text-white font-semibold">Skill(s) You Can Teach *</span>
          <input
            type="text"
            id="teach"
            value={teach}
            onChange={handleChange}
            required
            placeholder="Comma separated skills"
            className="mt-1 block w-full rounded-md px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </label>

        <label className="block mb-5">
          <span className="text-white font-semibold">Skill(s) You Want to Learn *</span>
          <input
            type="text"
            id="learn"
            value={learn}
            onChange={handleChange}
            required
            placeholder="Comma separated skills"
            className="mt-1 block w-full rounded-md px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </label>

        <label className="block mb-7">
          <span className="text-white font-semibold">Short Description (Optional)</span>
          <textarea
            id="description"
            value={description}
            onChange={handleChange}
            placeholder="Write something about your skills or goals..."
            rows={4}
            className="mt-1 block w-full rounded-md px-4 py-3 text-black resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </label>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full py-3 shadow-lg transition-colors"
        >
          Submit
        </motion.button>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-red-500 font-semibold"
          >
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-green-400 font-semibold"
          >
            {success}
          </motion.p>
        )}
      </form>
    </motion.div>
  );
}
