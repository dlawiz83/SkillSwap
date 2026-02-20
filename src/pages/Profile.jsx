import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  User,
  Star,
  LogOut,
  Plus,
  X,
  Check,
  Clock,
  Calendar as CalendarIcon,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function Profile() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  // Skills State
  const [teachInput, setTeachInput] = useState("");
  const [learnInput, setLearnInput] = useState("");
  const [skillsTeaching, setSkillsTeaching] = useState([]);
  const [skillsLearning, setSkillsLearning] = useState([]);

  // Availability State
  const [availability, setAvailability] = useState([]);
  const [dayInput, setDayInput] = useState("Monday");
  const [timeInput, setTimeInput] = useState("");

  // Polished UI States
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [error, setError] = useState(""); 

  const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    if (userProfile) {
      setSkillsTeaching(userProfile.skillsTeaching || []);
      setSkillsLearning(userProfile.skillsLearning || []);
      setAvailability(userProfile.availability || []);
    }
  }, [userProfile]);

  if (!userProfile) return null;

  const addSkill = (type) => {
    setError(""); // Clear old errors
    if (
      type === "teach" &&
      teachInput.trim() &&
      !skillsTeaching.includes(teachInput.trim())
    ) {
      setSkillsTeaching([...skillsTeaching, teachInput.trim()]);
      setTeachInput("");
    }
    if (
      type === "learn" &&
      learnInput.trim() &&
      !skillsLearning.includes(learnInput.trim())
    ) {
      setSkillsLearning([...skillsLearning, learnInput.trim()]);
      setLearnInput("");
    }
  };

  const removeSkill = (type, index) => {
    setError("");
    if (type === "teach") {
      setSkillsTeaching(skillsTeaching.filter((_, i) => i !== index));
    } else {
      setSkillsLearning(skillsLearning.filter((_, i) => i !== index));
    }
  };

  const addAvailability = () => {
    setError("");
    if (timeInput) {
      const newSlot = {
        id: Date.now().toString(),
        day: dayInput,
        time: timeInput,
      };
      setAvailability([...availability, newSlot]);
      setTimeInput("");
    }
  };

  const removeAvailability = (id) => {
    setError("");
    setAvailability(availability.filter((slot) => slot.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(""); // Clear previous errors

    try {
      const userRef = doc(db, "users", userProfile.uid);
      await updateDoc(userRef, {
        skillsTeaching,
        skillsLearning,
        availability,
      });
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      
      setError("Failed to save changes. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Failed to log out", err);
      setError("Failed to log out. Please try again.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Profile Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-inner">
          {userProfile.name?.charAt(0) || "U"}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-slate-900">
            {userProfile.name}
          </h1>
          <p className="text-slate-500 mb-2">{userProfile.email}</p>
          <div className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium border border-yellow-200">
            <Star size={14} className="fill-yellow-600 text-yellow-600" />
            {userProfile.karma || 0} Karma Points
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-md hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-sm font-medium"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 font-medium animate-in fade-in">
          <AlertCircle size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {/* Manage Skills Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">
            Manage Your Profile
          </h2>
          <p className="text-sm text-slate-500">
            Update your skills and availability to get matched.
          </p>
        </div>

        {/* Teaching Section */}
        <div className="p-6 border-b border-slate-200">
          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
            Skills I can teach
          </label>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Add a skill..."
              className="flex-1 px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 outline-none transition-colors"
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
                {skill}{" "}
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

        {/* Learning Section */}
        <div className="p-6 border-b border-slate-200">
          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
            Skills I want to learn
          </label>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Add a skill..."
              className="flex-1 px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 outline-none transition-colors"
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
                {skill}{" "}
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

        {/* Availability Section */}
        <div className="p-6">
          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
            My Available Times
          </label>
          <p className="text-sm text-slate-500 mb-4">
            When are you free to swap skills? Other users will see these options
            when booking you.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <select
              value={dayInput}
              onChange={(e) => setDayInput(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 outline-none bg-white transition-colors"
            >
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            <input
              type="time"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 outline-none flex-1 transition-colors"
            />
            <button
              onClick={addAvailability}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add Time
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {availability.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between p-3 border border-slate-200 rounded-md bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <CalendarIcon size={16} className="text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">
                    {slot.day}
                  </span>
                  <Clock size={16} className="text-slate-400 ml-2" />
                  <span className="text-sm text-slate-600">{slot.time}</span>
                </div>
                <button
                  onClick={() => removeAvailability(slot.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            {availability.length === 0 && (
              <div className="col-span-full text-center py-4 text-sm text-slate-400 border border-dashed border-slate-200 rounded-md">
                No availability added yet.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 flex items-center justify-between border-t border-slate-200">
          <div>
            {savedMessage && (
              <span className="flex items-center gap-2 text-emerald-600 text-sm font-medium animate-in fade-in">
                <Check size={16} /> Profile updated!
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
