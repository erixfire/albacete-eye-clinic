import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  ClipboardList, 
  Pill, 
  Settings, 
  LogOut,
  Menu,
  X,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'doctor', 'nurse', 'pharmacist'] },
    { name: 'Patients', path: '/patients', icon: Users, roles: ['admin', 'doctor', 'nurse'] },
    { name: 'Appointments', path: '/appointments', icon: Calendar, roles: ['admin', 'doctor', 'nurse'] },
    { name: 'Inventory', path: '/inventory', icon: Pill, roles: ['admin', 'pharmacist'] },
    { name: 'Admin', path: '/admin', icon: Settings, roles: ['admin'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col md:flex-row relative">
      <div className="app-bg"></div>

      {/* Mobile Header */}
      <div className="md:hidden glass-panel px-4 py-3 flex items-center justify-between sticky top-0 z-50 rounded-b-2xl mx-2 mt-2">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-accent-soft p-1.5 rounded-lg shadow-lg">
            <Eye size={20} />
          </div>
          <span className="font-bold text-gray-900 serif-text text-lg">Albacete Clinic</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar / Mobile Menu */}
      <aside className={cn(
        "fixed inset-0 z-40 md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-64 flex flex-col glass-panel md:m-4 md:rounded-3xl",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden md:flex items-center gap-3">
          <div className="bg-primary text-accent-soft p-2.5 rounded-xl shadow-lg shadow-primary/20">
            <Eye size={24} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 leading-tight serif-text text-xl">Albacete</span>
            <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Eye Clinic</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 mt-4">
          {filteredNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                  : "text-gray-600 hover:bg-black/5 hover:text-primary"
              )}
            >
              <item.icon size={20} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-black/5 m-4 rounded-2xl bg-white/30 backdrop-blur-md">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-10 h-10 rounded-full bg-primary text-accent-soft flex items-center justify-center font-bold shadow-inner">
              {user?.full_name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.full_name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 mt-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 hover:shadow-inner transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
