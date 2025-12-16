import React, { useState } from 'react';
import { useLMS } from '../context/LMSContext';
import { Role, User } from '../types';
import { Search, Eye, Edit2, Trash2, X, Save, User as UserIcon, BookOpen, UserPlus, CheckSquare, Square } from 'lucide-react';

export const StudentManager = () => {
  const { users, editUser, deleteUser, enrollments, courses, enrollStudent } = useLMS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Modal States
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Enrollment Modal State
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollTargetIds, setEnrollTargetIds] = useState<string[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const students = users.filter(u => u.role === Role.STUDENT && (
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  ));

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedIds.size === students.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(students.map(s => s.id)));
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this student account? This action cannot be undone.")) {
      deleteUser(id);
      const newSelected = new Set(selectedIds);
      newSelected.delete(id);
      setSelectedIds(newSelected);
    }
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      editUser(editingUser.id, editingUser);
      setEditingUser(null);
    }
  };

  const openEnrollModal = (ids: string[]) => {
    setEnrollTargetIds(ids);
    setEnrollModalOpen(true);
    setSelectedCourseId(courses.length > 0 ? courses[0].id : '');
  };

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    enrollTargetIds.forEach(studentId => {
      enrollStudent(selectedCourseId, studentId);
    });

    setEnrollModalOpen(false);
    setEnrollTargetIds([]);
    setSelectedIds(new Set());
    alert(`Successfully enrolled ${enrollTargetIds.length} student(s).`);
  };

  const getStudentStats = (studentId: string) => {
    const studentEnrollments = enrollments.filter(e => e.studentId === studentId);
    return {
      enrolledCount: studentEnrollments.length,
      completedCount: studentEnrollments.filter(e => e.progress === 100).length,
      avgProgress: studentEnrollments.length > 0 
        ? Math.round(studentEnrollments.reduce((acc, e) => acc + e.progress, 0) / studentEnrollments.length) 
        : 0
    };
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Student Management</h2>
          <p className="text-slate-500">Manage enrolled students, view progress, and update accounts.</p>
        </div>
        {selectedIds.size > 0 && (
          <button 
            onClick={() => openEnrollModal(Array.from(selectedIds))}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2"
          >
            <UserPlus size={18} />
            Enroll Selected ({selectedIds.size})
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex gap-4">
        <div className="flex-1 relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
           <input 
             type="text" 
             placeholder="Search by name or email..." 
             className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <th className="px-6 py-4 w-12 text-center">
                 <button onClick={toggleAll} className="text-slate-400 hover:text-indigo-600">
                    {students.length > 0 && selectedIds.size === students.length ? <CheckSquare size={20} className="text-indigo-600" /> : <Square size={20} />}
                 </button>
              </th>
              <th className="px-6 py-4 font-semibold">Student</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Enrollments</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map(student => {
               const stats = getStudentStats(student.id);
               const isSelected = selectedIds.has(student.id);
               return (
                <tr key={student.id} className={`hover:bg-slate-50 group transition-colors ${isSelected ? 'bg-indigo-50/50' : ''}`}>
                  <td className="px-6 py-4 text-center">
                     <button onClick={() => toggleSelection(student.id)} className="text-slate-400 hover:text-indigo-600">
                        {isSelected ? <CheckSquare size={20} className="text-indigo-600" /> : <Square size={20} />}
                     </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={student.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-slate-700">{student.name}</p>
                        <p className="text-xs text-slate-500">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Active</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {stats.enrolledCount} Courses
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEnrollModal([student.id])}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg tooltip" title="Enroll in Course"
                      >
                        <UserPlus size={18} />
                      </button>
                      <button 
                        onClick={() => setViewingUser(student)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg tooltip" title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => setEditingUser(student)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg" title="Edit Profile"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(student.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Delete Account"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
               );
            })}
            {students.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  No students found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* VIEW MODAL */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="bg-indigo-600 p-6 text-white relative">
                <button onClick={() => setViewingUser(null)} className="absolute right-4 top-4 text-white/80 hover:text-white">
                   <X size={24} />
                </button>
                <div className="flex items-center gap-4">
                   <img src={viewingUser.avatar} className="w-20 h-20 rounded-full border-4 border-white/20" />
                   <div>
                      <h3 className="text-2xl font-bold">{viewingUser.name}</h3>
                      <p className="text-indigo-200">{viewingUser.email}</p>
                   </div>
                </div>
             </div>
             <div className="p-6 space-y-6">
                <div>
                   <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Bio</h4>
                   <p className="text-slate-600 italic">"{viewingUser.bio || "No bio available."}"</p>
                </div>
                
                <div>
                   <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Enrolled Courses</h4>
                   <div className="space-y-3">
                      {enrollments.filter(e => e.studentId === viewingUser.id).length === 0 && (
                        <p className="text-slate-400 text-sm">No courses enrolled yet.</p>
                      )}
                      {enrollments.filter(e => e.studentId === viewingUser.id).map(enr => {
                         const course = courses.find(c => c.id === enr.courseId);
                         if (!course) return null;
                         return (
                           <div key={enr.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <div className="flex items-center gap-3">
                                 <div className="p-2 bg-indigo-100 text-indigo-600 rounded">
                                    <BookOpen size={16} />
                                 </div>
                                 <span className="font-medium text-slate-700">{course.title}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                 <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{ width: `${enr.progress}%` }}></div>
                                 </div>
                                 <span className="text-xs font-bold text-slate-600">{enr.progress}%</span>
                              </div>
                           </div>
                         );
                      })}
                   </div>
                </div>
             </div>
             <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button onClick={() => setViewingUser(null)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Close</button>
             </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800">Edit Student</h3>
                <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
             </div>
             <form onSubmit={handleEditSave} className="p-6 space-y-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                   <input 
                     type="text" 
                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     value={editingUser.name}
                     onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                     required
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                   <input 
                     type="email" 
                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     value={editingUser.email}
                     onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                     required
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                   <textarea 
                     rows={3}
                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     value={editingUser.bio || ''}
                     onChange={e => setEditingUser({...editingUser, bio: e.target.value})}
                   />
                </div>
                
                <div className="pt-4 flex justify-end gap-2">
                   <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                   <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                      <Save size={18} /> Save Changes
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* ENROLL MODAL */}
      {enrollModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800">Enroll {enrollTargetIds.length} Student(s)</h3>
                <button onClick={() => setEnrollModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
             </div>
             <form onSubmit={handleEnrollSubmit} className="p-6 space-y-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">Select Course</label>
                   {courses.length > 0 ? (
                     <div className="space-y-2">
                        {courses.map(course => (
                           <label key={course.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedCourseId === course.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}>
                              <input 
                                type="radio" 
                                name="course" 
                                value={course.id} 
                                checked={selectedCourseId === course.id} 
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                                className="text-indigo-600 focus:ring-indigo-500"
                              />
                              <div className="flex-1">
                                 <p className="font-semibold text-slate-700">{course.title}</p>
                                 <p className="text-xs text-slate-500">{course.category} • {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Lessons</p>
                              </div>
                           </label>
                        ))}
                     </div>
                   ) : (
                      <p className="text-slate-500 italic">No courses available.</p>
                   )}
                </div>
                
                <div className="pt-4 flex justify-end gap-2">
                   <button type="button" onClick={() => setEnrollModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                   <button 
                     type="submit" 
                     disabled={!selectedCourseId || courses.length === 0}
                     className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                      <UserPlus size={18} /> Confirm Enrollment
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
