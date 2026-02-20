import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { calculateMatchScore } from "../utils/matching";
import MatchCard from "../components/MatchCard";
import { Search, Loader2, AlertCircle } from "lucide-react";
import BookingModal from "../components/BookingModal";

export default function FindPeers() {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingPeer, setBookingPeer] = useState(null);

  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      setError(""); // Clear old errors
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter out self
        const others = usersList.filter((u) => u.uid !== userProfile?.uid);

        // Calculate Scores
        const scoredUsers = others.map((u) => ({
          ...u,
          matchScore: calculateMatchScore(userProfile, u),
        }));

        // Sort by Score (High to Low)
        scoredUsers.sort((a, b) => b.matchScore - a.matchScore);

        setUsers(scoredUsers);
      } catch (err) {
        console.error("Error fetching users:", err);

        setError(
          "Failed to load peers. Please check your connection and try again.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (userProfile) {
      fetchUsers();
    }
  }, [userProfile]);

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.skillsTeaching?.some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Find a Learning Partner
          </h1>
          <p className="text-slate-500">
            Based on your skills, these are your best matches.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80 shadow-sm rounded-lg">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name or skill..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 font-medium">
          <AlertCircle size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
          <Loader2 size={32} className="animate-spin text-slate-300" />
          <p className="text-sm font-medium uppercase tracking-wider">
            Loading your matches...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <MatchCard
              key={user.id || user.uid}
              user={user}
              matchScore={user.matchScore}
              onBook={setBookingPeer}
            />
          ))}
        </div>
      )}

      {!loading && !error && filteredUsers.length === 0 && (
        <div className="text-center py-20 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          No matches found. Try updating your profile or checking back later.
        </div>
      )}

      {bookingPeer && (
        <BookingModal peer={bookingPeer} onClose={() => setBookingPeer(null)} />
      )}
    </div>
  );
}
