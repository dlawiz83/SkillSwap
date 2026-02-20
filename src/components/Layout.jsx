import { Outlet, Link } from "react-router-dom";
import { LayoutGrid, Users, MessageSquare, User, LogOut } from "lucide-react";

export default function Layout() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            SkillSwap
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" icon={<LayoutGrid size={18} />} label="Dashboard" />
          <NavLink to="/find" icon={<Users size={18} />} label="Find Peers" />
          <NavLink
            to="/messages"
            icon={<MessageSquare size={18} />}
            label="Messages"
          />
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/profile"
            className="p-2 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-2"
          >
            <User size={20} className="text-slate-600" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
