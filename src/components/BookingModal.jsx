import { useState } from "react";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Loader2,
  Star,
  AlertCircle,
} from "lucide-react";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function BookingModal({ peer, onClose }) {
  const { userProfile } = useAuth();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // State to catch and display errors gracefully
  const [error, setError] = useState("");

  const slots = peer.availability || [];

  //  Check if the user has enough Karma
  const currentKarma = userProfile?.karma || 0;
  const SESSION_COST = 1;
  const canAfford = currentKarma >= SESSION_COST;

  const handleBook = async () => {
    if (!selectedSlot || !canAfford) return;
    setLoading(true);
    setError(""); // Clear any old errors

    try {
      // 1. Create the calendar booking
      await addDoc(collection(db, "bookings"), {
        hostId: userProfile.uid,
        hostName: userProfile.name,
        peerId: peer.uid || peer.id,
        peerName: peer.name,
        date: selectedSlot.day,
        time: selectedSlot.time,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      });

      // 2.Deduct 1 Karma from the person booking
      const userRef = doc(db, "users", userProfile.uid);
      await updateDoc(userRef, {
        karma: increment(-SESSION_COST),
      });

      // 3.  Give 1 Karma to the person teaching
      const peerRef = doc(db, "users", peer.uid || peer.id);
      await updateDoc(peerRef, {
        karma: increment(SESSION_COST),
      });

      setSuccess(true);

      // Close modal and refresh the page to update the Karma score in the UI
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error("Booking failed", err);
  
      setError(
        "Failed to confirm booking. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <CalendarIcon size={18} className="text-slate-500" />
            Book with {peer.name}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle2
                size={48}
                className="mx-auto text-emerald-500 mb-4"
              />
              <h4 className="text-lg font-bold text-slate-900 mb-1">
                Session Confirmed!
              </h4>
              <p className="text-slate-500 text-sm mb-2">
                We've added this to your dashboard.
              </p>
              <p className="text-sm font-medium text-emerald-600">
                -1 Karma Paid
              </p>
            </div>
          ) : (
            <>
            
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Karma Balance Warning */}
              <div
                className={`mb-4 p-3 rounded-lg border flex items-start gap-3 text-sm ${canAfford ? "bg-slate-50 border-slate-200" : "bg-red-50 border-red-200 text-red-700"}`}
              >
                {canAfford ? (
                  <Star className="text-yellow-500 shrink-0 mt-0.5" size={16} />
                ) : (
                  <AlertCircle
                    className="text-red-500 shrink-0 mt-0.5"
                    size={16}
                  />
                )}
                <div>
                  <p className="font-semibold">
                    Your Balance: {currentKarma} Karma
                  </p>
                  <p className={canAfford ? "text-slate-500" : "text-red-600"}>
                    {canAfford
                      ? `Booking this session costs ${SESSION_COST} Karma.`
                      : "You don't have enough Karma. Teach a session to earn more!"}
                  </p>
                </div>
              </div>

              {slots.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-lg mb-6">
                  <p className="text-slate-500 text-sm mb-3 px-4">
                    {peer.name} hasn't added any available times to their
                    profile yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`w-full flex items-center justify-between p-4 rounded-lg border text-sm transition-all ${
                        selectedSlot?.id === slot.id
                          ? "border-slate-900 ring-1 ring-slate-900 bg-slate-50 text-slate-900 font-medium"
                          : "border-slate-200 text-slate-600 hover:border-slate-400"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <CalendarIcon
                          size={16}
                          className={
                            selectedSlot?.id === slot.id
                              ? "text-slate-900"
                              : "text-slate-400"
                          }
                        />
                        {slot.day}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock
                          size={16}
                          className={
                            selectedSlot?.id === slot.id
                              ? "text-slate-900"
                              : "text-slate-400"
                          }
                        />
                        {slot.time}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <button
                disabled={
                  !selectedSlot || loading || slots.length === 0 || !canAfford
                }
                onClick={handleBook}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-md text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  `Confirm & Pay ${SESSION_COST} Karma`
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
