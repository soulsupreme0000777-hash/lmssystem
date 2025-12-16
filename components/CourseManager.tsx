import React, { useState, useEffect } from 'react';
import { useLMS } from '../context/LMSContext';
import { Course, Module, Lesson, Assignment } from '../types';
import { Save, Plus, Trash2, GripVertical, Video, FileText, File, Loader, ChevronLeft, BookOpen, GraduationCap, Settings, CheckCircle } from 'lucide-react';

export const CourseManager = () => {
  const { 
    courses, 
    navigationParams, 
    navigateTo, 
    updateCourse, 
    deleteCourse, 
    uploadFile, 
    fetchAssignments, 
    createAssignment, 
    deleteAssignment,
    fetchSubmissions,
    gradeSubmission
  } = useLMS();

  const [course, setCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'assignments' | 'gradebook' | 'settings'>('content');
  const [loading, setLoading] = useState(false);

  // Assignment State
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState<Partial<Assignment>>({
     title: '', description: '', totalPoints: 100, dueDate: ''
  });

  // Gradebook State
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState<number>(0);
  const [feedbackInput, setFeedbackInput] = useState('');

  // Course Editing State (Deep copy for modification)
  const [editCourseData, setEditCourseData] = useState<Partial<Course>>({});

  useEffect(() => {
    if (navigationParams?.courseId) {
       const found = courses.find(c => c.id === navigationParams.courseId);
       if (found) {
         setCourse(found);
         setEditCourseData(JSON.parse(JSON.stringify(found))); // Deep copy
         loadAssignments(found.id);
         loadSubmissions(found.id);
       }
    }
  }, [navigationParams, courses]);

  const loadAssignments = async (id: string) => {
    const data = await fetchAssignments(id);
    setAssignments(data);
  };

  const loadSubmissions = async (id: string) => {
    const data = await fetchSubmissions(id);
    setSubmissions(data);
  };

  // --- Curriculum Logic ---
  const handleAddModule = () => {
    const newModule: Module = { id: `mod-${Date.now()}`, title: 'New Module', lessons: [] };
    setEditCourseData(prev => ({ ...prev, modules: [...(prev.modules || []), newModule] }));
  };

  const handleUpdateModule = (id: string, title: string) => {
    setEditCourseData(prev => ({ ...prev, modules: prev.modules?.map(m => m.id === id ? { ...m, title } : m) }));
  };

  const handleDeleteModule = (id: string) => {
    if(!confirm("Delete this module?")) return;
    setEditCourseData(prev => ({ ...prev, modules: prev.modules?.filter(m => m.id !== id) }));
  };

  const handleAddLesson = (moduleId: string) => {
    const newLesson: Lesson = { id: `les-${Date.now()}`, title: 'New Lesson', content: '', type: 'text', durationMinutes: 10 };
    setEditCourseData(prev => ({
       ...prev, 
       modules: prev.modules?.map(m => m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m)
    }));
  };

  const handleUpdateLesson = (moduleId: string, lessonId: string, field: keyof Lesson, value: any) => {
    setEditCourseData(prev => ({
       ...prev,
       modules: prev.modules?.map(m => {
          if (m.id === moduleId) {
             return { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, [field]: value } : l) };
          }
          return m;
       })
    }));
  };

  const handleLessonPdfUpload = async (moduleId: string, lessonId: string, file: File) => {
     try {
       const url = await uploadFile(file, 'courses_files');
       if (url) handleUpdateLesson(moduleId, lessonId, 'pdfUrl', url);
     } catch(e) { alert("Upload failed"); }
  };

  const saveCourseContent = async () => {
    if (!course || !editCourseData.id) return;
    setLoading(true);
    try {
      // @ts-ignore
      await updateCourse({
        ...course,
        ...editCourseData,
        totalDuration: editCourseData.modules?.reduce((acc, m) => acc + m.lessons.reduce((l, cur) => l + cur.durationMinutes, 0), 0) || 0
      });
      alert("Course updated successfully!");
    } catch(e) { alert("Error saving course"); }
    setLoading(false);
  };

  // --- Assignment Logic ---
  const handleCreateAssignment = async () => {
     if(!course) return;
     if(!newAssignment.title || !newAssignment.dueDate) return alert("Title and Due Date required");
     
     setLoading(true);
     try {
        await createAssignment({ ...newAssignment, courseId: course.id });
        setShowAssignForm(false);
        setNewAssignment({ title: '', description: '', totalPoints: 100, dueDate: '' });
        loadAssignments(course.id);
     } catch(e) { console.error(e); }
     setLoading(false);
  };

  const handleDeleteAssignment = async (id: string) => {
     if(!confirm("Delete assignment?")) return;
     await deleteAssignment(id);
     if(course) loadAssignments(course.id);
  };

  // --- Gradebook Logic ---
  const handleGradeSubmit = async (submissionId: string) => {
     await gradeSubmission(submissionId, gradeInput, feedbackInput);
     setGradingId(null);
     if(course) loadSubmissions(course.id);
  };

  if (!course) return <div>Loading...</div>;

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between glass-panel p-6 rounded-3xl">
        <div className="flex items-center gap-6">
          <button onClick={() => navigateTo('dashboard')} className="p-3 bg-white/50 hover:bg-white rounded-full text-slate-500 hover:text-indigo-600 transition-all shadow-sm">
             <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{course.title}</h1>
            <span className={`text-xs px-3 py-1 rounded-full font-bold border ${course.published ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
               {course.published ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 gap-2 bg-white/40 backdrop-blur rounded-2xl w-fit border border-white/50">
         <TabButton active={activeTab === 'content'} onClick={() => setActiveTab('content')} icon={BookOpen} label="Curriculum" />
         <TabButton active={activeTab === 'assignments'} onClick={() => setActiveTab('assignments')} icon={FileText} label="Assignments" />
         <TabButton active={activeTab === 'gradebook'} onClick={() => setActiveTab('gradebook')} icon={GraduationCap} label="Gradebook" />
         <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={Settings} label="Settings" />
      </div>

      {/* --- CONTENT TAB --- */}
      {activeTab === 'content' && (
         <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
               <h3 className="font-bold text-xl text-slate-800">Course Modules</h3>
               <div className="flex gap-3">
                 <button onClick={handleAddModule} className="glass-button px-4 py-2 rounded-xl text-indigo-700 font-bold text-sm hover:bg-white/60 flex items-center gap-2">
                    <Plus size={18} /> Add Module
                 </button>
                 <button onClick={saveCourseContent} disabled={loading} className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 flex items-center gap-2">
                    {loading ? <Loader className="animate-spin" size={18}/> : <Save size={18}/>} Save Changes
                 </button>
               </div>
            </div>

            {editCourseData.modules?.map((module, mIndex) => (
               <div key={module.id} className="glass-card rounded-2xl overflow-hidden animate-in slide-in-from-bottom-2 duration-500">
                  <div className="bg-gradient-to-r from-white/80 to-white/40 px-6 py-4 border-b border-white/50 flex justify-between items-center">
                     <div className="flex items-center gap-4 flex-1">
                        <GripVertical size={20} className="text-slate-400 cursor-move" />
                        <input 
                           type="text" 
                           value={module.title}
                           onChange={(e) => handleUpdateModule(module.id, e.target.value)}
                           className="bg-transparent font-bold text-lg text-slate-700 focus:outline-none focus:border-b-2 border-indigo-500 w-full placeholder-slate-400"
                           placeholder="Module Title"
                        />
                     </div>
                     <button onClick={() => handleDeleteModule(module.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                     </button>
                  </div>
                  <div className="divide-y divide-slate-100/50">
                     {module.lessons.map(lesson => (
                        <div key={lesson.id} className="p-5 flex flex-col gap-4 group hover:bg-white/30 transition-colors">
                           <div className="flex items-start gap-4">
                              <div className="pt-2 p-2 bg-white/60 rounded-lg text-slate-500 shadow-sm">
                                 {lesson.type === 'pdf' ? <File size={18} className="text-red-500"/> : <Video size={18} className="text-indigo-500"/>}
                              </div>
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <input 
                                    type="text" value={lesson.title} 
                                    onChange={(e) => handleUpdateLesson(module.id, lesson.id, 'title', e.target.value)}
                                    className="font-semibold text-slate-700 bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none px-1"
                                    placeholder="Lesson Title"
                                 />
                                 <div className="flex gap-3">
                                    <select 
                                       value={lesson.type}
                                       onChange={(e) => handleUpdateLesson(module.id, lesson.id, 'type', e.target.value)}
                                       className="text-sm bg-white/50 border border-white/60 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    >
                                       <option value="text">Text</option>
                                       <option value="video">Video</option>
                                       <option value="pdf">PDF</option>
                                    </select>
                                    <input 
                                       type="number" value={lesson.durationMinutes}
                                       onChange={(e) => handleUpdateLesson(module.id, lesson.id, 'durationMinutes', parseInt(e.target.value))}
                                       className="text-sm bg-white/50 border border-white/60 rounded-lg px-3 w-20 outline-none"
                                       placeholder="Min"
                                    />
                                    {lesson.type === 'pdf' && (
                                       <label className="cursor-pointer bg-white/50 px-3 py-1.5 rounded-lg border border-white/60 hover:bg-white text-xs font-bold text-slate-600 flex items-center">
                                          Upload
                                          <input 
                                             type="file" accept="application/pdf"
                                             className="hidden"
                                             onChange={(e) => e.target.files && handleLessonPdfUpload(module.id, lesson.id, e.target.files[0])}
                                          />
                                       </label>
                                    )}
                                 </div>
                              </div>
                           </div>
                           <div className="pl-14">
                             {lesson.pdfUrl && <a href={lesson.pdfUrl} target="_blank" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 bg-indigo-50 w-fit px-2 py-1 rounded"><File size={12}/> PDF Attached</a>}
                           </div>
                        </div>
                     ))}
                     <div className="p-3 bg-white/20">
                        <button onClick={() => handleAddLesson(module.id)} className="w-full py-3 text-sm font-bold text-slate-500 border-2 border-dashed border-slate-300/60 rounded-xl hover:bg-white/60 hover:border-indigo-300 hover:text-indigo-600 transition-all">
                           + Add Lesson
                        </button>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      )}

      {/* --- ASSIGNMENTS TAB --- */}
      {activeTab === 'assignments' && (
         <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
               <h3 className="font-bold text-xl text-slate-800">Course Assignments</h3>
               <button onClick={() => setShowAssignForm(!showAssignForm)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 flex items-center gap-2 shadow-lg">
                  <Plus size={16}/> New Assignment
               </button>
            </div>

            {showAssignForm && (
               <div className="glass-card p-6 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex justify-between">
                     <h4 className="font-bold text-slate-700">Create Assignment</h4>
                     <button onClick={() => setShowAssignForm(false)} className="text-slate-400 hover:text-red-500"><Trash2 size={18}/></button>
                  </div>
                  <input type="text" placeholder="Assignment Title" className="w-full p-3 bg-white/60 border border-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none" value={newAssignment.title} onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} />
                  <textarea placeholder="Instructions..." className="w-full p-3 bg-white/60 border border-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none" rows={3} value={newAssignment.description} onChange={e => setNewAssignment({...newAssignment, description: e.target.value})} />
                  <div className="flex gap-4">
                     <div className="flex-1">
                        <label className="text-xs font-bold text-slate-500 ml-1">Due Date</label>
                        <input type="datetime-local" className="w-full p-3 bg-white/60 border border-white rounded-xl outline-none" value={newAssignment.dueDate} onChange={e => setNewAssignment({...newAssignment, dueDate: e.target.value})} />
                     </div>
                     <div className="w-32">
                        <label className="text-xs font-bold text-slate-500 ml-1">Points</label>
                        <input type="number" className="w-full p-3 bg-white/60 border border-white rounded-xl outline-none" value={newAssignment.totalPoints} onChange={e => setNewAssignment({...newAssignment, totalPoints: parseInt(e.target.value)})} />
                     </div>
                  </div>
                  <button onClick={handleCreateAssignment} disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-md">Create Assignment</button>
               </div>
            )}

            <div className="grid gap-4">
               {assignments.map(assign => (
                  <div key={assign.id} className="glass-card p-5 rounded-2xl flex justify-between items-start hover:shadow-md transition-shadow">
                     <div>
                        <h4 className="font-bold text-lg text-slate-800">{assign.title}</h4>
                        <p className="text-sm text-slate-500 mb-3">{assign.description}</p>
                        <div className="flex gap-4 text-xs font-semibold text-slate-400 bg-slate-100/50 px-3 py-1.5 rounded-lg w-fit">
                           <span>Due: {new Date(assign.dueDate).toLocaleDateString()}</span>
                           <span className="w-px bg-slate-300"></span>
                           <span>{assign.totalPoints} Pts</span>
                        </div>
                     </div>
                     <button onClick={() => handleDeleteAssignment(assign.id)} className="text-red-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={20}/></button>
                  </div>
               ))}
               {assignments.length === 0 && !showAssignForm && <p className="text-center text-slate-400 py-12 glass-panel rounded-2xl">No assignments created yet.</p>}
            </div>
         </div>
      )}

      {/* --- GRADEBOOK TAB --- */}
      {activeTab === 'gradebook' && (
         <div className="space-y-6">
            <h3 className="font-bold text-xl text-slate-800 px-2">Submissions</h3>
            <div className="glass-card rounded-3xl overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-white/50 text-slate-500 text-xs uppercase tracking-wider">
                     <tr>
                        <th className="p-5 font-semibold">Student</th>
                        <th className="p-5 font-semibold">Assignment</th>
                        <th className="p-5 font-semibold">Status</th>
                        <th className="p-5 font-semibold">Score</th>
                        <th className="p-5 font-semibold text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {submissions.map(sub => (
                        <tr key={sub.id} className="hover:bg-white/60 transition-colors">
                           <td className="p-5 font-bold text-slate-700">{sub.studentName}</td>
                           <td className="p-5 text-sm text-slate-600">{sub.assignmentTitle}</td>
                           <td className="p-5">
                              <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide ${sub.status === 'graded' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                 {sub.status}
                              </span>
                           </td>
                           <td className="p-5 font-black text-slate-800">{sub.grade !== undefined ? sub.grade : '-'}</td>
                           <td className="p-5 text-right relative">
                              {gradingId === sub.id ? (
                                 <div className="glass-panel p-4 rounded-xl absolute right-10 top-2 z-20 w-72 shadow-2xl animate-in fade-in zoom-in-95">
                                    <div className="flex gap-2 mb-2">
                                       <input type="number" placeholder="Pts" className="border p-2 rounded-lg w-20 bg-white/80" value={gradeInput} onChange={e => setGradeInput(parseInt(e.target.value))} />
                                       <button onClick={() => handleGradeSubmit(sub.id)} className="flex-1 bg-indigo-600 text-white rounded-lg font-bold text-sm">Save</button>
                                    </div>
                                    <textarea placeholder="Feedback..." className="border p-2 rounded-lg w-full text-sm bg-white/80 h-20" value={feedbackInput} onChange={e => setFeedbackInput(e.target.value)} />
                                    <button onClick={() => setGradingId(null)} className="text-xs text-slate-400 hover:text-red-500 mt-1 w-full text-center">Cancel</button>
                                 </div>
                              ) : (
                                 <button onClick={() => { setGradingId(sub.id); setGradeInput(sub.grade || 0); setFeedbackInput(sub.feedback || ''); }} className="text-indigo-600 text-sm font-bold hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                                    {sub.status === 'graded' ? 'Edit' : 'Grade'}
                                 </button>
                              )}
                           </td>
                        </tr>
                     ))}
                     {submissions.length === 0 && (
                        <tr><td colSpan={5} className="p-12 text-center text-slate-400">No submissions found.</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* --- SETTINGS TAB --- */}
      {activeTab === 'settings' && (
         <div className="max-w-xl mx-auto space-y-8 py-4">
            <h3 className="font-bold text-xl text-slate-800 text-center">Course Settings</h3>
            
            <div className="glass-card p-8 rounded-3xl space-y-6">
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Course Title</label>
                  <input type="text" className="w-full p-3 bg-white/60 border border-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none" value={editCourseData.title} onChange={e => setEditCourseData({...editCourseData, title: e.target.value})} />
               </div>
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea className="w-full p-3 bg-white/60 border border-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none" rows={4} value={editCourseData.description} onChange={e => setEditCourseData({...editCourseData, description: e.target.value})} />
               </div>
               <div className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <input type="checkbox" id="published" checked={editCourseData.published} onChange={e => setEditCourseData({...editCourseData, published: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
                  <label htmlFor="published" className="text-sm font-bold text-slate-700 cursor-pointer select-none">Publish Course (Visible to Students)</label>
               </div>
               <button onClick={saveCourseContent} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg">Update Course Details</button>
            </div>

            <div className="glass-card bg-red-50/30 p-8 rounded-3xl border border-red-100">
               <h4 className="font-bold text-red-800 mb-2">Danger Zone</h4>
               <p className="text-sm text-red-600/80 mb-6">Deleting this course will remove all modules, lessons, assignments, and grades permanently.</p>
               <button 
                  onClick={async () => {
                     if(confirm("Are you ABSOLUTELY sure? This cannot be undone.")) {
                        await deleteCourse(course.id);
                        navigateTo('dashboard');
                     }
                  }}
                  className="w-full bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors shadow-red-500/20 shadow-lg"
               >
                  Delete Course Permanently
               </button>
            </div>
         </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
   <button 
      onClick={onClick} 
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${active ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'}`}
   >
      <Icon size={16} /> {label}
   </button>
);
