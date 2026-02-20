import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  or,
  doc,
  deleteDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import {
  Star,
  Clock,
  Video,
  ArrowRight,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for our custom Cancel Modal
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [isCanceling, setIsCanceling] = useState(false);

  const fetchBookings = async () => {
    if (!userProfile?.uid) return;
    try {
      const q = query(
        collection(db, "bookings"),
        or(
          where("hostId", "==", userProfile.uid),
          where("peerId", "==", userProfile.uid),
        ),
      );
      const querySnapshot = await getDocs(q);
      const fetchedBookings = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBookings(fetchedBookings.reverse());
    } catch (error) {
      console.error("Error fetching bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [userProfile]);

  const confirmCancel = async () => {
    if (!bookingToCancel) return;
    setIsCanceling(true);

    try {
      await deleteDoc(doc(db, "bookings", bookingToCancel.id));

      // Refund the Karma
      const payerRef = doc(db, "users", bookingToCancel.hostId);
      const teacherRef = doc(db, "users", bookingToCancel.peerId);

      await updateDoc(payerRef, { karma: increment(1) });
      await updateDoc(teacherRef, { karma: increment(-1) });

      // Close modal and refresh UI
      setBookingToCancel(null);
      fetchBookings();
      window.location.reload();
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      alert("Failed to cancel the booking. Please try again.");
    } finally {
      setIsCanceling(false);
    }
  };


  if (!userProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-in fade-in duration-500">
        <Loader2 size={40} className="animate-spin text-slate-300" />
        <p className="text-slate-500 font-medium uppercase tracking-wider text-sm">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative">
      {/* Custom Cancel Confirmation Modal */}
      {bookingToCancel && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Cancel Session?
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to cancel your session with{" "}
                <span className="font-semibold text-slate-700">
                  {bookingToCancel.hostId === userProfile.uid
                    ? bookingToCancel.peerName
                    : bookingToCancel.hostName}
                </span>
                ?
                {bookingToCancel.hostId === userProfile.uid
                  ? " Your 1 Karma will be refunded."
                  : " The 1 Karma will be refunded to them."}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setBookingToCancel(null)}
                  disabled={isCanceling}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 py-2 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Keep It
                </button>
                <button
                  onClick={confirmCancel}
                  disabled={isCanceling}
                  className="flex-1 flex justify-center items-center gap-2 bg-red-600 text-white py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isCanceling ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Yes, Cancel"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded-xl p-8 text-white flex items-center justify-between shadow-lg">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {userProfile.name?.split(" ")[0]}
          </h1>
          <p className="text-slate-400">Ready to swap some skills today?</p>
        </div>
        <div className="hidden md:flex flex-col items-center bg-slate-800 px-6 py-4 rounded-lg border border-slate-700 shadow-inner">
        
          <span className="text-2xl font-bold">{userProfile.karma || 0}</span>
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Karma Points
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Upcoming Sessions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock size={20} className="text-slate-500" />
            Upcoming Swaps
          </h2>

          {loading ? (
          
            <div className="p-12 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-white space-y-3">
              <Loader2 size={24} className="animate-spin text-slate-300" />
              <p className="text-sm font-medium">Fetching schedule...</p>
            </div>
          ) : bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const isHost = booking.hostId === userProfile.uid;
                const otherPersonName = isHost
                  ? booking.peerName
                  : booking.hostName;
                const otherPersonId = isHost ? booking.peerId : booking.hostId;

                return (
                  <div
                    key={booking.id}
                    className="border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 shrink-0">
                        {otherPersonName?.charAt(0) || "P"}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          Session with {otherPersonName}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {booking.date} at {booking.time}
                        </p>
                        <p className="text-xs font-medium mt-1 text-slate-400">
                          {isHost
                            ? "You paid 1 Karma"
                            : "You will earn 1 Karma"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                      <button
                        onClick={() => setBookingToCancel(booking)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        <XCircle size={16} /> Cancel
                      </button>
                      <button
                        onClick={() => navigate(`/room/${booking.id}`)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                      >
                        <Video size={16} /> Enter Dojo
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 border border-dashed border-slate-300 rounded-xl text-center bg-slate-50">
              <p className="text-slate-500 mb-4">You have no upcoming swaps.</p>
              <button
                onClick={() => navigate("/find")}
                className="text-slate-900 font-medium hover:underline flex items-center justify-center gap-1 mx-auto bg-white border border-slate-200 px-6 py-2 rounded-lg shadow-sm"
              >
                Find a match <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Right Col: Quick Stats */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Your Profile</h2>
          <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm space-y-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                I can teach
              </p>
              <div className="flex flex-wrap gap-2">
                {userProfile.skillsTeaching?.length > 0 ? (
                  userProfile.skillsTeaching.map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400 italic">
                    No skills added yet
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                I want to learn
              </p>
              <div className="flex flex-wrap gap-2">
                {userProfile.skillsLearning?.length > 0 ? (
                  userProfile.skillsLearning.map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-md"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400 italic">
                    No skills added yet
                  </span>
                )}
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => navigate("/profile")}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors w-full text-center"
              >
                Edit Profile & Availability
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
