import React from 'react';
import { LMSProvider, useLMS } from './context/LMSContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CourseCatalog } from './components/CourseCatalog';
import { CourseBuilder } from './components/CourseBuilder';
import { CourseViewer } from './components/CourseViewer';
import { CourseManager } from './components/CourseManager';
import { ProfileSettings } from './components/ProfileSettings';
import { Analytics } from './components/Analytics';
import { LoginScreen } from './components/LoginScreen';
import { StudentManager } from './components/StudentManager';
import { Role } from './types';
import { LayoutDashboard, BookOpen, PlusCircle, PieChart, Users, Settings, LogOut, GraduationCap, Home } from 'lucide-react';

const MobileNav = () => {
  const { currentScreen, navigateTo, currentUser } = useLMS();
  const isInstructor = currentUser?.role === Role.INSTRUCTOR;

  const NavIcon = ({ icon: Icon, screen }: any) => (
    <button 
      onClick={() => navigateTo(screen)}
      className={`p-3 rounded-full transition-all duration-300 ${currentScreen === screen ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 -translate-y-2' : 'text-slate-400 hover:text-indigo-500'}`}
    >
      <Icon size={24} strokeWidth={2.5} />
    </button>
  );

  return (
    <div className="md:hidden fixed bottom-6 left-6 right-6 h-16 glass-panel rounded-full flex items-center justify-evenly z-50 shadow-2xl">
      <NavIcon icon={LayoutDashboard} screen="dashboard" />
      {isInstructor ? (
        <>
          <NavIcon icon={PlusCircle} screen="course-builder" />
          <NavIcon icon={PieChart} screen="analytics" />
        </>
      ) : (
        <NavIcon icon={BookOpen} screen="catalog" />
      )}
      <NavIcon icon={Settings} screen="profile" />
    </div>
  );
};

const AppContent = () => {
  const { currentScreen, currentUser, navigateTo, logout } = useLMS();

  // Auth Guard
  if (!currentUser) {
    return <LoginScreen />;
  }

  // If viewing course, render full screen without layout
  if (currentScreen === 'course-viewer') {
    return <CourseViewer />;
  }

  const renderScreen = () => {
    switch(currentScreen) {
      case 'dashboard': return <Dashboard />;
      case 'catalog': return <CourseCatalog />;
      case 'course-builder': return <CourseBuilder />;
      case 'course-manager': return <CourseManager />;
      case 'analytics': return <Analytics />;
      case 'profile': return <ProfileSettings />;
      case 'students': return <StudentManager />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen text-slate-800">
      <Sidebar />
      <MobileNav />
      
      <main className="flex-1 flex flex-col min-h-screen transition-all duration-300 md:ml-[22rem] mr-0 md:mr-6 my-0 md:my-6 rounded-[2.5rem] relative">
        {/* Top Header - Mobile Only or Minimal on Desktop */}
        <header className="h-20 flex justify-between items-center px-6 md:px-8 pb-4 md:pb-0">
           <div className="flex items-center gap-3 md:hidden">
              <div className="bg-gradient-to-tr from-indigo-600 to-purple-500 p-2 rounded-lg shadow-lg shadow-indigo-500/30">
                <GraduationCap className="text-white" size={20} />
              </div>
              <h1 className="text-xl font-bold text-slate-800">LMS</h1>
           </div>
           
           <div className="hidden md:block">
             {/* Breadcrumbs or Page Title could go here */}
           </div>

           <div className="flex items-center gap-4">
               <div className="flex items-center gap-3 bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/60 shadow-sm">
                   <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-slate-700">{currentUser.firstName || currentUser.name}</p>
                      <p className="text-[10px] uppercase tracking-wider text-indigo-500 font-semibold">{currentUser.role}</p>
                   </div>
                   <img src={currentUser.avatar} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-white" />
               </div>
               <button onClick={logout} className="md:hidden p-2 bg-white/50 rounded-full text-slate-400">
                 <LogOut size={20} />
               </button>
           </div>
        </header>

        <div className="flex-1 px-6 md:px-8 pb-24 md:pb-8 overflow-y-auto no-scrollbar">
           {renderScreen()}
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <LMSProvider>
      <AppContent />
    </LMSProvider>
  );
};

export default App;
