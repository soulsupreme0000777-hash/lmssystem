import React, { useState } from 'react';
import { useLMS } from '../context/LMSContext';
import { User, Save, Camera } from 'lucide-react';

export const ProfileSettings = () => {
  const { currentUser, updateUser, navigateTo } = useLMS();
  
  // Local state for form
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    bio: currentUser?.bio || '',
    avatar: currentUser?.avatar || ''
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      updateUser(formData);
      setIsSaving(false);
      // Optional: Show toast here
      alert("Profile updated successfully!");
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
           <User size={28} />
        </div>
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Profile Settings</h2>
           <p className="text-slate-500">Manage your account information and public profile.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <form onSubmit={handleSave} className="space-y-6">
           
           {/* Avatar Section */}
           <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
              <div className="relative group cursor-pointer">
                 <img src={formData.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-slate-50" />
                 <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={24} />
                 </div>
              </div>
              <div>
                 <h3 className="font-bold text-slate-700">Profile Photo</h3>
                 <p className="text-sm text-slate-500 mb-2">This will be displayed on your profile.</p>
                 <div className="flex gap-2">
                    <button type="button" onClick={() => setFormData({...formData, avatar: `https://picsum.photos/seed/${Date.now()}/200`})} className="text-sm bg-slate-100 px-3 py-1 rounded-md text-slate-700 hover:bg-slate-200">Randomize</button>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-sm font-semibold text-slate-700">Full Name</label>
                 <input 
                   type="text" 
                   value={formData.name} 
                   onChange={(e) => setFormData({...formData, name: e.target.value})}
                   className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-semibold text-slate-700">Email Address</label>
                 <input 
                   type="email" 
                   value={formData.email} 
                   onChange={(e) => setFormData({...formData, email: e.target.value})}
                   className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                 />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Bio</label>
              <textarea 
                rows={4}
                value={formData.bio} 
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Tell us a little about yourself..."
              />
           </div>

           <div className="flex justify-end pt-4">
              <button 
                 type="submit" 
                 disabled={isSaving}
                 className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-70 flex items-center gap-2"
              >
                 {isSaving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
};
