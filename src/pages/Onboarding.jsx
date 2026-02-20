import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Plus, X, AlertCircle, Loader2 } from "lucide-react"; // Added icons

export default function Onboarding() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // State for tags
  const [teachInput, setTeachInput] = useState("");
  const [learnInput, setLearnInput] = useState("");
  const [skillsTeaching, setSkillsTeaching] = useState([]);
  const [skillsLearning, setSkillsLearning] = useState([]);

  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const addSkill = (type) => {
    setError(""); // Clear error when user tries to fix it
    if (type === "teach" && teachInput.trim()) {
      setSkillsTeaching([...skillsTeaching, teachInput.trim()]);
      setTeachInput("");
    }
    if (type === "learn" && learnInput.trim()) {
      setSkillsLearning([...skillsLearning, learnInput.trim()]);
      setLearnInput("");
    }
  };

  const removeSkill = (type, index) => {
    if (type === "teach") {
      setSkillsTeaching(skillsTeaching.filter((_, i) => i !== index));
    } else {
      setSkillsLearning(skillsLearning.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    setError("");

    if (skillsTeaching.length === 0 || skillsLearning.length === 0) {
      setError("Please add at least one skill to teach and one to learn.");
      return;
    }

    setIsSaving(true);
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        skillsTeaching,
        skillsLearning,
        onboardingComplete: true,
      });
      navigate("/");
    } catch (err) {
      console.error("Error saving profile:", err);
 
      setError("Failed to save profile. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900">
            Build your Skill Profile
          </h1>
          <p className="mt-2 text-slate-600">
            The matching engine uses this to find your perfect swap.
          </p>
        </div>

      
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 font-medium animate-in fade-in">
            <AlertCircle size={20} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
          {/* Section 1: Teaching */}
          <div className="p-6 border-b border-slate-200">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
              What can you teach?
            </label>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="e.g. React, Guitar, Spanish"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                value={teachInput}
                onChange={(e) => setTeachInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill("teach")}
              />
              <button
                onClick={() => addSkill("teach")}
                className="bg-slate-100 hover:bg-slate-200 p-2.5 rounded-md transition-colors"
              >
                <Plus size={20} className="text-slate-700" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skillsTeaching.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill("teach", idx)}
                    className="ml-2 hover:text-emerald-900 hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Section 2: Learning */}
          <div className="p-6 border-b border-slate-200">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
              What do you want to learn?
            </label>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="e.g. Python, Cooking, SEO"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                value={learnInput}
                onChange={(e) => setLearnInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill("learn")}
              />
              <button
                onClick={() => addSkill("learn")}
                className="bg-slate-100 hover:bg-slate-200 p-2.5 rounded-md transition-colors"
              >
                <Plus size={20} className="text-slate-700" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skillsLearning.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill("learn", idx)}
                    className="ml-2 hover:text-blue-900 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-50 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
              {isSaving ? "Saving Profile..." : "Save Profile & Start Swapping"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
