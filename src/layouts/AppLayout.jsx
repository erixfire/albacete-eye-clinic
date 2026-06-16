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
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-white p-1.5 rounded-lg shadow-sm">
            <Eye size={20} />
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">Albacete</span>
        </div>
        <button className="text-slate-500 hover:text-slate-900 transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-0 z-40 bg-white border-r border-slate-200 md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-64 flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden md:flex items-center gap-3">
          <div className="bg-primary text-white p-2 rounded-xl shadow-sm">
            <Eye size={24} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 leading-tight text-lg tracking-tight">Albacete</span>
            <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Eye Clinic</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {filteredNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-primary-soft text-primary" 
                  : "text-slate-600 hover:bg-primary-soft hover:text-slate-900"
              )}
            >
              <item.icon size={18} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 m-4 rounded-xl bg-primary-soft/50">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-sm">
              {user?.full_name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.full_name}</p>
              <p className="text-[11px] font-medium text-slate-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
