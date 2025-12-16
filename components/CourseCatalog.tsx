import React, { useState } from 'react';
import { useLMS } from '../context/LMSContext';
import { Clock, Users, PlayCircle, BookOpen, Search, ArrowRight } from 'lucide-react';

export const CourseCatalog = () => {
  const { courses, enrollments, currentUser, enrollInCourse, navigateTo } = useLMS();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCourseAction = (courseId: string) => {
    if (!currentUser) return;
    
    const isEnrolled = enrollments.some(e => e.courseId === courseId && e.studentId === currentUser.id);
    if (isEnrolled) {
      navigateTo('course-viewer', { courseId });
    } else {
      enrollInCourse(courseId);
      navigateTo('course-viewer', { courseId });
    }
  };

  return (
    <div className="space-y-10 animate-fade-in max-w-7xl mx-auto">
      {/* Hero Search Section */}
      <div className="relative rounded-[3rem] overflow-hidden shadow-2xl">
         <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700"></div>
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
         <div className="absolute -left-20 -top-20 w-96 h-96 bg-pink-500/30 rounded-full blur-[80px]"></div>
         <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-500/30 rounded-full blur-[80px]"></div>

         <div className="relative z-10 px-8 py-16 md:py-24 md:px-16 flex flex-col items-center text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">Master New Skills<br/>Unlock Your Potential</h2>
            <p className="text-indigo-100 text-lg md:text-xl mb-10 max-w-2xl font-light">Explore our curated collection of premium courses. From design to development, we have everything you need to grow.</p>
            
            <div className="glass-panel p-2 rounded-2xl w-full max-w-xl flex items-center shadow-2xl transform transition-transform focus-within:scale-105">
               <div className="pl-4 text-indigo-500">
                  <Search size={24} />
               </div>
               <input 
                 type="text" 
                 placeholder="Search for courses, topics, skills..." 
                 className="flex-1 px-4 py-3 bg-transparent text-slate-800 placeholder-slate-500 font-medium focus:outline-none text-lg"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
               <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg">Search</button>
            </div>
         </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(course => {
            const isEnrolled = currentUser ? enrollments.some(e => e.courseId === course.id && e.studentId === currentUser.id) : false;

            return (
              <div key={course.id} className="glass-card rounded-[2rem] overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col group h-full">
                <div className="h-56 overflow-hidden relative">
                   <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                   <span className="absolute top-4 left-4 glass-panel px-4 py-1.5 rounded-full text-xs font-bold text-indigo-900 border-none bg-white/80">
                     {course.category}
                   </span>
                </div>
                
                <div className="p-7 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-slate-800 mb-3 leading-snug">{course.title}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">{course.description}</p>
                  
                  <div className="flex items-center gap-6 text-xs font-semibold text-slate-500 mb-8 border-t border-slate-200/50 pt-6">
                     <div className="flex items-center gap-1.5"><Users size={16} className="text-indigo-500"/> {course.studentsEnrolled} students</div>
                     <div className="flex items-center gap-1.5"><Clock size={16} className="text-pink-500"/> {course.totalDuration} min</div>
                  </div>

                  <button 
                    onClick={() => handleCourseAction(course.id)}
                    className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg
                      ${isEnrolled 
                        ? 'bg-green-500 text-white shadow-green-500/30 hover:bg-green-600' 
                        : 'bg-slate-900 text-white shadow-slate-500/30 hover:bg-slate-800 group-hover:scale-[1.02]'}`}
                  >
                    {isEnrolled ? (
                      <><PlayCircle size={20} /> Continue Learning</>
                    ) : (
                      <><BookOpen size={20} /> Enroll Now <ArrowRight size={18} /></>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-slate-400">
            <Search size={48} className="mb-4 opacity-50" />
            <p className="text-xl font-medium">No courses found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};
