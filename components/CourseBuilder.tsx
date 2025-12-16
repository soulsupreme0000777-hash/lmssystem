import React, { useState } from 'react';
import { useLMS } from '../context/LMSContext';
import { Course, Module, Lesson } from '../types';
import { Save, Plus, Trash2, GripVertical, Video, FileText, File, Loader } from 'lucide-react';

export const CourseBuilder = () => {
  const { addCourse, navigateTo, currentUser, uploadFile } = useLMS();
  const [uploading, setUploading] = useState<string | null>(null); // Lesson ID being uploaded to
  
  const [courseData, setCourseData] = useState<Partial<Course>>({
    title: '',
    description: '',
    category: '',
    thumbnailUrl: `https://picsum.photos/seed/${Date.now()}/800/400`,
    modules: []
  });

  const handleAddModule = () => {
    const newModule: Module = {
      id: `mod-${Date.now()}`,
      title: 'New Module',
      lessons: []
    };
    setCourseData(prev => ({
      ...prev,
      modules: [...(prev.modules || []), newModule]
    }));
  };

  const handleAddLesson = (moduleId: string) => {
    const newLesson: Lesson = {
      id: `les-${Date.now()}`,
      title: 'New Lesson',
      content: 'Lesson content placeholder...',
      type: 'text',
      durationMinutes: 10
    };

    setCourseData(prev => ({
      ...prev,
      modules: prev.modules?.map(m => {
        if (m.id === moduleId) {
          return { ...m, lessons: [...m.lessons, newLesson] };
        }
        return m;
      })
    }));
  };

  const handleDeleteModule = (moduleId: string) => {
    if(!confirm("Are you sure you want to delete this module?")) return;
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules?.filter(m => m.id !== moduleId)
    }));
  };

  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules?.map(m => {
        if (m.id === moduleId) {
          return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
        }
        return m;
      })
    }));
  };

  const updateModuleTitle = (moduleId: string, title: string) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules?.map(m => m.id === moduleId ? { ...m, title } : m)
    }));
  };

  const updateLesson = (moduleId: string, lessonId: string, field: keyof Lesson, value: any) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules?.map(m => {
        if (m.id === moduleId) {
          return {
            ...m,
            lessons: m.lessons.map(l => l.id === lessonId ? { ...l, [field]: value } : l)
          };
        }
        return m;
      })
    }));
  };

  const handlePdfUpload = async (moduleId: string, lessonId: string, file: File) => {
    if (file.type !== 'application/pdf') {
      alert("Only PDF files are allowed.");
      return;
    }

    setUploading(lessonId);
    try {
      const url = await uploadFile(file, 'courses_files');
      if (url) {
        updateLesson(moduleId, lessonId, 'pdfUrl', url);
      } else {
        alert("Upload failed.");
      }
    } catch (e) {
      console.error(e);
      alert("Error uploading file.");
    } finally {
      setUploading(null);
    }
  };

  const handleSave = () => {
    if (!courseData.title || !courseData.modules?.length) {
       alert("Please fill in course title and at least one module.");
       return;
    }

    // @ts-ignore
    const newCourse: Course = {
      id: `c-${Date.now()}`,
      title: courseData.title,
      description: courseData.description || '',
      category: courseData.category || 'General',
      instructorId: currentUser!.id,
      thumbnailUrl: courseData.thumbnailUrl || '',
      published: true,
      studentsEnrolled: 0,
      totalDuration: courseData.modules.reduce((acc, m) => acc + m.lessons.reduce((lAcc, l) => lAcc + l.durationMinutes, 0), 0),
      modules: courseData.modules
    };

    addCourse(newCourse);
    navigateTo('dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Course Builder</h2>
          <p className="text-slate-500">Create and structure your course curriculum manually.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium"
        >
          <Save size={18} /> Publish Course
        </button>
      </div>

      {/* Basic Info */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
        <h3 className="font-bold text-slate-800">Course Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" 
            placeholder="Course Title" 
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={courseData.title}
            onChange={(e) => setCourseData({...courseData, title: e.target.value})}
          />
          <input 
            type="text" 
            placeholder="Category (e.g. Design)" 
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={courseData.category}
            onChange={(e) => setCourseData({...courseData, category: e.target.value})}
          />
        </div>
        <textarea 
          placeholder="Course Description"
          rows={3}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          value={courseData.description}
          onChange={(e) => setCourseData({...courseData, description: e.target.value})}
        />
      </div>

      {/* Curriculum */}
      <div className="space-y-4">
         <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-lg">Curriculum</h3>
            <button 
              onClick={handleAddModule}
              className="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:underline bg-indigo-50 px-3 py-1.5 rounded-lg"
            >
               <Plus size={16} /> Add Module
            </button>
         </div>

         {courseData.modules?.length === 0 && (
           <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-xl text-slate-400">
             No modules yet. Click "Add Module" to start building your curriculum.
           </div>
         )}

         {courseData.modules?.map((module, mIndex) => (
           <div key={module.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all hover:shadow-md">
             <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-3 flex-1">
                   <GripVertical size={18} className="text-slate-400 cursor-move" />
                   <input 
                      type="text" 
                      value={module.title}
                      onChange={(e) => updateModuleTitle(module.id, e.target.value)}
                      className="bg-transparent font-semibold text-slate-700 focus:outline-none focus:border-b border-indigo-500 w-full"
                   />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">{module.lessons.length} Lessons</span>
                  <button onClick={() => handleDeleteModule(module.id)} className="text-slate-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
             </div>
             <div className="divide-y divide-slate-100 bg-white">
               {module.lessons.map((lesson) => (
                 <div key={lesson.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 group">
                    <div className="pt-1">
                      {lesson.type === 'video' ? <Video size={16} className="text-slate-400"/> : 
                       lesson.type === 'pdf' ? <File size={16} className="text-red-400"/> :
                       <FileText size={16} className="text-slate-400"/>}
                    </div>
                    <div className="flex-1 space-y-2">
                       <input 
                         type="text" 
                         value={lesson.title}
                         onChange={(e) => updateLesson(module.id, lesson.id, 'title', e.target.value)}
                         className="block w-full text-sm font-medium text-slate-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1 -ml-1"
                         placeholder="Lesson Title"
                       />
                       
                       <div className="flex gap-4">
                         <select 
                           value={lesson.type}
                           onChange={(e) => updateLesson(module.id, lesson.id, 'type', e.target.value)}
                           className="text-xs border border-slate-200 rounded px-2 py-1"
                         >
                           <option value="text">Text Lesson</option>
                           <option value="video">Video Lesson</option>
                           <option value="pdf">PDF Document</option>
                           <option value="quiz">Quiz</option>
                         </select>
                         <input 
                            type="number"
                            value={lesson.durationMinutes}
                            onChange={(e) => updateLesson(module.id, lesson.id, 'durationMinutes', parseInt(e.target.value))}
                            className="text-xs border border-slate-200 rounded px-2 py-1 w-20"
                            placeholder="Min"
                         />
                       </div>

                       {/* PDF Upload */}
                       {lesson.type === 'pdf' && (
                         <div className="mt-2">
                            {lesson.pdfUrl ? (
                               <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
                                  <File size={16} /> PDF Uploaded
                                  <button onClick={() => updateLesson(module.id, lesson.id, 'pdfUrl', '')} className="text-xs text-red-500 underline ml-auto">Remove</button>
                               </div>
                            ) : (
                               <div className="flex items-center gap-2">
                                  <input 
                                    type="file" 
                                    accept="application/pdf"
                                    onChange={(e) => e.target.files && handlePdfUpload(module.id, lesson.id, e.target.files[0])}
                                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                  />
                                  {uploading === lesson.id && <Loader className="animate-spin text-indigo-600" size={16} />}
                               </div>
                            )}
                         </div>
                       )}

                       {/* Content Text (only if not PDF/Video) */}
                       {lesson.type !== 'pdf' && lesson.type !== 'video' && (
                           <textarea 
                             value={lesson.content}
                             onChange={(e) => updateLesson(module.id, lesson.id, 'content', e.target.value)}
                             rows={2}
                             className="block w-full text-xs text-slate-500 bg-slate-50 focus:bg-white border-none focus:ring-1 focus:ring-indigo-500 rounded p-2 resize-none"
                             placeholder="Brief content description..."
                           />
                       )}
                    </div>
                    <button 
                      onClick={() => handleDeleteLesson(module.id, lesson.id)}
                      className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                       <Trash2 size={16} />
                    </button>
                 </div>
               ))}
               <div className="p-3 bg-slate-50/50">
                  <button 
                    onClick={() => handleAddLesson(module.id)}
                    className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm font-medium hover:border-indigo-300 hover:text-indigo-600 flex justify-center items-center gap-2"
                  >
                    <Plus size={16} /> Add Lesson
                  </button>
               </div>
             </div>
           </div>
         ))}
      </div>
    </div>
  );
};
