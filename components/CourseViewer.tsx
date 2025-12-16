import React, { useState, useEffect } from 'react';
import { useLMS } from '../context/LMSContext';
import { ChevronLeft, CheckCircle, Circle, Play, FileText, Menu, File } from 'lucide-react';
import { Course, Module, Lesson } from '../types';

export const CourseViewer = () => {
  const { courses, navigationParams, enrollments, updateProgress, navigateTo, currentUser } = useLMS();
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (navigationParams?.courseId) {
      const course = courses.find(c => c.id === navigationParams.courseId);
      if (course) {
        setActiveCourse(course);
        // Default to first lesson if not set
        if (course.modules.length > 0 && course.modules[0].lessons.length > 0) {
           setActiveLesson(course.modules[0].lessons[0]);
        }
      }
    }
  }, [navigationParams, courses]);

  if (!activeCourse) return <div>Loading...</div>;

  const currentEnrollment = enrollments.find(e => e.courseId === activeCourse.id && e.studentId === currentUser.id);
  const completedIds = currentEnrollment?.completedLessonIds || [];

  const handleLessonComplete = () => {
    if (activeLesson) {
      updateProgress(activeCourse.id, activeLesson.id);
    }
  };

  const renderContent = () => {
    if (!activeLesson) return null;

    if (activeLesson.type === 'video') {
       return (
          <iframe 
             src={activeLesson.videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"} 
             className="w-full h-full" 
             frameBorder="0" 
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
             allowFullScreen
          ></iframe>
       );
    } else if (activeLesson.type === 'pdf') {
       if (activeLesson.pdfUrl) {
          return (
             <object data={activeLesson.pdfUrl} type="application/pdf" className="w-full h-full">
                <div className="flex flex-col items-center justify-center h-full bg-slate-100 p-8">
                   <p className="mb-4">Unable to display PDF directly.</p>
                   <a href={activeLesson.pdfUrl} target="_blank" rel="noopener noreferrer" className="bg-indigo-600 text-white px-4 py-2 rounded">Download PDF</a>
                </div>
             </object>
          );
       } else {
          return (
             <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100">
                <File size={48} className="text-slate-400 mb-2"/>
                <p className="text-slate-500">PDF not available.</p>
             </div>
          );
       }
    } else {
       return (
         <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white p-12 text-center">
            <FileText size={48} className="mb-4 text-indigo-400"/>
            <h2 className="text-2xl font-bold mb-2">{activeLesson.title}</h2>
            <p className="text-slate-400 max-w-lg">This is a text-based lesson. Read the content below to complete this module.</p>
         </div>
       );
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-slate-200 flex items-center px-4 bg-white justify-between">
         <div className="flex items-center gap-4">
           <button onClick={() => navigateTo('dashboard')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
             <ChevronLeft size={24} />
           </button>
           <h1 className="font-bold text-slate-800 text-lg line-clamp-1">{activeCourse.title}</h1>
         </div>
         <div className="flex items-center gap-4">
             <div className="hidden md:block">
                <div className="text-xs text-slate-500 mb-1 flex justify-between">
                   <span>Your Progress</span>
                   <span>{currentEnrollment?.progress || 0}%</span>
                </div>
                <div className="w-32 bg-slate-100 rounded-full h-1.5">
                   <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${currentEnrollment?.progress || 0}%` }}></div>
                </div>
             </div>
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 text-slate-500">
                <Menu />
             </button>
         </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 flex justify-center">
           <div className="w-full max-w-4xl h-full flex flex-col">
              {activeLesson ? (
                <div className="space-y-6 h-full flex flex-col">
                   <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg relative flex-shrink-0" style={{ height: activeLesson.type === 'pdf' ? '70vh' : 'auto' }}>
                      {renderContent()}
                   </div>

                   <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold text-slate-800">{activeLesson.title}</h2>
                        <button 
                          onClick={handleLessonComplete}
                          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors
                             ${completedIds.includes(activeLesson.id) 
                               ? 'bg-green-100 text-green-700 cursor-default' 
                               : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                        >
                           {completedIds.includes(activeLesson.id) ? (
                             <><CheckCircle size={18} /> Completed</>
                           ) : (
                             <>Mark as Complete</>
                           )}
                        </button>
                      </div>
                      {activeLesson.type !== 'pdf' && (
                        <div className="prose max-w-none text-slate-600">
                           <p>{activeLesson.content}</p>
                        </div>
                      )}
                   </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">Select a lesson to start</div>
              )}
           </div>
        </div>

        {/* Sidebar Lesson List */}
        <div className={`w-80 bg-white border-l border-slate-200 overflow-y-auto flex-shrink-0 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full hidden md:block md:translate-x-0'}`}>
           <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-700">Course Content</h3>
           </div>
           <div className="divide-y divide-slate-100">
              {activeCourse.modules.map((module, mIndex) => (
                <div key={module.id}>
                   <div className="px-4 py-3 bg-slate-50/50 font-semibold text-sm text-slate-700">
                      Module {mIndex + 1}: {module.title}
                   </div>
                   <div>
                      {module.lessons.map((lesson, lIndex) => {
                         const isCompleted = completedIds.includes(lesson.id);
                         const isActive = activeLesson?.id === lesson.id;
                         return (
                           <button 
                             key={lesson.id}
                             onClick={() => setActiveLesson(lesson)}
                             className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors
                                ${isActive ? 'bg-indigo-50 border-r-4 border-indigo-600' : ''}`}
                           >
                              <div className={`mt-0.5 ${isCompleted ? 'text-green-500' : isActive ? 'text-indigo-600' : 'text-slate-300'}`}>
                                 {isCompleted ? <CheckCircle size={16} /> : <Circle size={16} />}
                              </div>
                              <div>
                                 <p className={`text-sm font-medium ${isActive ? 'text-indigo-700' : 'text-slate-600'}`}>{lIndex + 1}. {lesson.title}</p>
                                 <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                       {lesson.type === 'video' ? <Play size={10} /> : 
                                        lesson.type === 'pdf' ? <File size={10} /> :
                                        <FileText size={10} />}
                                       {lesson.durationMinutes} min
                                    </span>
                                 </div>
                              </div>
                           </button>
                         );
                      })}
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
