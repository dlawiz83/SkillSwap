import { Star, ArrowRight, MessageCircle, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function MatchCard({ user, matchScore, onBook }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
      {/* Match Badge */}
      <div className="absolute top-4 right-4 flex flex-col items-end">
        <span
          className={`text-xs font-bold px-2 py-1 rounded-full ${
            matchScore > 80
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {matchScore}% Match
        </span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
          {user.name.charAt(0)}
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{user.name}</h3>
          <div className="flex items-center text-xs text-slate-500">
            <Star size={12} className="mr-1 text-yellow-500 fill-yellow-500" />
            {user.karma} Karma Points
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
            Teaches
          </p>
          <div className="flex flex-wrap gap-2">
            {user.skillsTeaching?.map((skill, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded-md"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
            Wants to Learn
          </p>
          <div className="flex flex-wrap gap-2">
            {user.skillsLearning?.map((skill, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded-md"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/room/${user.uid}`)} // Navigate to room
          className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          <MessageCircle size={16} />
          Start Session
        </button>
        <button
          onClick={() => onBook(user)} 
          className="flex-1 flex items-center justify-center gap-2 border border-slate-200 text-slate-700 py-2 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          <Calendar size={16} />
          Book
        </button>
      </div>
    </div>
  );
}
