import React from 'react';
import { useLMS } from '../context/LMSContext';
import { Role } from '../types';
import { LayoutDashboard, BookOpen, PlusCircle, PieChart, GraduationCap, Settings, LogOut, Users } from 'lucide-react';

export const Sidebar = () => {
  const { currentUser, currentScreen, navigateTo, logout } = useLMS();

  if (!currentUser) return null;

  const isInstructor = currentUser.role === Role.INSTRUCTOR;

  const NavItem = ({ icon: Icon, label, screen }: { icon: any, label: string, screen: string }) => (
    <button
      onClick={() => navigateTo(screen as any)}
      className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative
        ${currentScreen === screen 
          ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-700 shadow-sm' 
          : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'}`}
    >
      <div className={`p-2 rounded-xl transition-all ${currentScreen === screen ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-300' : 'bg-white/50 text-slate-400 group-hover:bg-white group-hover:text-indigo-500'}`}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <span className="font-semibold text-sm tracking-wide">{label}</span>
      {currentScreen === screen && (
        <div className="absolute right-0 h-8 w-1 bg-indigo-600 rounded-l-full"></div>
      )}
    </button>
  );

  return (
    <div className="hidden md:flex flex-col w-72 fixed left-6 top-6 bottom-6 rounded-[2.5rem] glass-panel z-50 overflow-hidden shadow-2xl shadow-indigo-100/50 transition-all duration-500 hover:shadow-indigo-200/50">
      
      {/* Header */}
      <div className="p-8 flex items-center gap-3">
        <div className="bg-gradient-to-tr from-indigo-600 to-purple-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30">
          <GraduationCap className="text-white" size={24} />
        </div>
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700">LMS</h1>
      </div>

      <div className="flex-1 px-4 py-2 space-y-2 overflow-y-auto no-scrollbar">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-4 mt-2 opacity-60">Menu</div>
        
        <NavItem icon={LayoutDashboard} label="Dashboard" screen="dashboard" />
        
        {isInstructor ? (
          <>
            <NavItem icon={PlusCircle} label="Course Builder" screen="course-builder" />
            <NavItem icon={PieChart} label="Analytics" screen="analytics" />
            <NavItem icon={Users} label="Students" screen="students" />
          </>
        ) : (
          <NavItem icon={BookOpen} label="Course Catalog" screen="catalog" />
        )}

        <div className="my-6 border-t border-slate-200/50 mx-4"></div>
        
        <NavItem icon={Settings} label="Settings" screen="profile" />
      </div>

      {/* Profile Section */}
      <div className="p-5 mt-auto">
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3 transition-transform hover:-translate-y-1 cursor-pointer" onClick={() => navigateTo('profile')}>
            <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-md" />
            <div className="overflow-hidden flex-1">
                <p className="text-sm font-bold text-slate-800 truncate">{currentUser.name}</p>
                <p className="text-xs text-indigo-500 font-medium capitalize">{currentUser.role.toLowerCase()}</p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); logout(); }}
              className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-full transition-colors"
            >
              <LogOut size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};
