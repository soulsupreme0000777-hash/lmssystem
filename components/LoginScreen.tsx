import React, { useState } from 'react';
import { useLMS } from '../context/LMSContext';
import { Role } from '../types';
import { GraduationCap, Lock, Mail, User, ArrowRight, Loader, UserPlus, LogIn, Sparkles } from 'lucide-react';

export const LoginScreen = () => {
  const { login, signup, isLoading } = useLMS();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Signup extra fields
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [role, setRole] = useState<Role>(Role.STUDENT);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, { firstName, middleName, lastName, age, role });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="relative">
           <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
           <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="text-indigo-500 animate-pulse" size={20}/>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
       {/* Decorational Orbs */}
       <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300/30 rounded-full blur-[100px] animate-float"></div>
       <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-300/30 rounded-full blur-[100px] animate-float" style={{animationDelay: '2s'}}></div>

       <div className="glass-panel w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative z-10 min-h-[600px] animate-in fade-in zoom-in-95 duration-500">
          
          {/* Left Side: Visual */}
          <div className="md:w-5/12 relative bg-gradient-to-br from-indigo-600/90 to-purple-700/90 p-12 text-white flex flex-col justify-between overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1000&q=80')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
             
             <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-8">
                   <Sparkles size={16} className="text-yellow-300" />
                   <span className="text-sm font-semibold tracking-wide">Next Gen Learning</span>
                </div>
                <h1 className="text-5xl font-black leading-tight mb-4">
                  {isLogin ? "Welcome\nBack." : "Start\nJourney."}
                </h1>
                <p className="text-indigo-100 text-lg font-light leading-relaxed opacity-90">
                  {isLogin 
                    ? "Your personal learning nebula awaits. Dive back into your courses." 
                    : "Join a universe of knowledge. Create your unique profile today."}
                </p>
             </div>

             <div className="relative z-10 mt-12">
                <div className="flex -space-x-4 mb-4">
                   {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white/30 bg-white/20 backdrop-blur flex items-center justify-center text-xs font-bold">
                         <User size={14}/>
                      </div>
                   ))}
                </div>
                <p className="text-xs font-medium text-indigo-200">Join 10,000+ active learners</p>
             </div>
          </div>

          {/* Right Side: Form */}
          <div className="md:w-7/12 p-8 md:p-12 bg-white/40 flex flex-col justify-center overflow-y-auto">
             <div className="max-w-md mx-auto w-full">
                <div className="flex justify-between items-center mb-8">
                   <h2 className="text-2xl font-bold text-slate-800">
                      {isLogin ? "Sign In" : "Create Account"}
                   </h2>
                   <button 
                     onClick={() => { setIsLogin(!isLogin); setError(''); }}
                     className="text-indigo-600 font-semibold text-sm hover:text-indigo-800 transition-colors flex items-center gap-1"
                   >
                     {isLogin ? "No account?" : "Have account?"}
                   </button>
                </div>

                {error && (
                  <div className="glass-button bg-red-50/50 border-red-200 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-start gap-2">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-red-500 flex-shrink-0"></div>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                   {!isLogin && (
                     <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                       <div className="grid grid-cols-2 gap-4">
                          <InputGroup label="First Name" value={firstName} onChange={setFirstName} />
                          <InputGroup label="Last Name" value={lastName} onChange={setLastName} />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <InputGroup label="Middle Name" value={middleName} onChange={setMiddleName} required={false} />
                          <InputGroup label="Age" value={age} onChange={setAge} type="number" />
                       </div>
                     </div>
                   )}

                   <InputGroup label="Email" value={email} onChange={setEmail} type="email" icon={Mail} />
                   <InputGroup label="Password" value={password} onChange={setPassword} type="password" icon={Lock} />

                   {!isLogin && (
                      <div className="pt-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">I am a...</label>
                        <div className="grid grid-cols-2 gap-4">
                           <RoleSelect selected={role === Role.STUDENT} onClick={() => setRole(Role.STUDENT)} label="Student" />
                           <RoleSelect selected={role === Role.INSTRUCTOR} onClick={() => setRole(Role.INSTRUCTOR)} label="Instructor" />
                        </div>
                      </div>
                   )}

                   <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all active:scale-[0.98] flex justify-center items-center gap-2 mt-4"
                   >
                      {loading ? <Loader className="animate-spin" /> : <>{isLogin ? "Continue Learning" : "Get Started"} <ArrowRight size={18} /></>}
                   </button>
                </form>
             </div>
          </div>
       </div>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, type = "text", icon: Icon, required = true }: any) => (
  <div>
     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">{label}</label>
     <div className="relative group">
        {Icon && <Icon className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />}
        <input 
          required={required}
          type={type} 
          className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all outline-none shadow-sm text-slate-700 font-medium`}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
     </div>
  </div>
);

const RoleSelect = ({ selected, onClick, label }: any) => (
  <div 
    onClick={onClick}
    className={`cursor-pointer p-3 rounded-xl border-2 transition-all text-center font-bold text-sm
      ${selected ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700 shadow-sm' : 'border-transparent bg-white/50 text-slate-500 hover:bg-white hover:shadow-sm'}`}
  >
    {label}
  </div>
);
