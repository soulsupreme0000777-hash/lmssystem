import React from 'react';
import { useLMS } from '../context/LMSContext';
import { Role } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Book, Users, Clock, Award, PlayCircle, Edit, ArrowUpRight, ChevronRight } from 'lucide-react';

export const Dashboard = () => {
  const { currentUser, courses, enrollments, navigateTo } = useLMS();

  if (currentUser.role === Role.INSTRUCTOR) {
    const myCourses = courses.filter(c => c.instructorId === currentUser.id);
    const totalStudents = myCourses.reduce((acc, c) => acc + c.studentsEnrolled, 0);
    const totalDuration = myCourses.reduce((acc, c) => acc + c.totalDuration, 0);

    const chartData = myCourses.map(c => ({
      name: c.title.length > 15 ? c.title.substring(0, 15) + '...' : c.title,
      students: c.studentsEnrolled
    }));

    return (
      <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Instructor Dashboard</h2>
            <p className="text-slate-500 font-medium mt-1">Overview of your impact and course performance.</p>
          </div>
          <button onClick={() => navigateTo('course-builder')} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2">
             <span>Create New Course</span>
             <ArrowUpRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={Book} title="Active Courses" value={myCourses.length} color="from-blue-500 to-cyan-500" />
          <StatCard icon={Users} title="Total Students" value={totalStudents} color="from-indigo-500 to-purple-500" />
          <StatCard icon={Clock} title="Content Hours" value={Math.round(totalDuration / 60)} color="from-fuchsia-500 to-pink-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2 glass-card rounded-3xl p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Enrollment Overview</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(99, 102, 241, 0.1)', radius: 8}} 
                    contentStyle={{borderRadius: '16px', border: 'none', background: 'rgba(255,255,255,0.9)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} 
                  />
                  <Bar dataKey="students" fill="url(#barGradient)" radius={[6, 6, 6, 6]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions / Mini List */}
          <div className="glass-card rounded-3xl p-8 flex flex-col">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Recent Courses</h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
               {myCourses.slice(0, 5).map(course => (
                 <div key={course.id} className="p-3 rounded-xl bg-white/40 border border-white/50 hover:bg-white/70 transition-colors cursor-pointer group" onClick={() => navigateTo('course-manager', { courseId: course.id })}>
                    <div className="flex justify-between items-start mb-1">
                       <h4 className="font-bold text-slate-700 line-clamp-1 group-hover:text-indigo-600 transition-colors">{course.title}</h4>
                       <span className={`w-2 h-2 rounded-full ${course.published ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                       <span>{course.studentsEnrolled} Students</span>
                       <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500"/>
                    </div>
                 </div>
               ))}
            </div>
            <button onClick={() => navigateTo('course-builder')} className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-indigo-200 text-indigo-500 font-bold hover:bg-indigo-50 transition-colors">
               + Create New
            </button>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="glass-card rounded-3xl p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Course Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-4 pl-4 font-semibold">Course Title</th>
                  <th className="pb-4 font-semibold">Category</th>
                  <th className="pb-4 font-semibold">Students</th>
                  <th className="pb-4 font-semibold">Status</th>
                  <th className="pb-4 pr-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {myCourses.map(course => (
                  <tr key={course.id} className="group hover:bg-white/40 transition-colors rounded-lg">
                    <td className="py-4 pl-4 font-bold text-slate-700 rounded-l-lg">{course.title}</td>
                    <td className="py-4 text-slate-500 text-sm">
                       <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200">{course.category}</span>
                    </td>
                    <td className="py-4 text-slate-500 font-medium">{course.studentsEnrolled}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${course.published ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {course.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-right rounded-r-lg">
                       <button 
                         onClick={() => navigateTo('course-manager', { courseId: course.id })}
                         className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors inline-flex items-center gap-1"
                       >
                          Manage
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  } else {
    // STUDENT DASHBOARD
    const myEnrollments = enrollments.filter(e => e.studentId === currentUser.id);
    const enrolledCourses = courses.filter(c => myEnrollments.some(e => e.courseId === c.id));
    
    return (
      <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
        <div className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden">
           <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
           <div className="relative z-10">
              <h2 className="text-4xl font-black text-slate-800 mb-2">My Learning</h2>
              <p className="text-lg text-slate-500 max-w-lg">Track your progress and continue your journey to mastery. You're doing great!</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <StatCard icon={Book} title="Enrolled Courses" value={myEnrollments.length} color="from-blue-500 to-cyan-500" />
           <StatCard icon={Award} title="Certificates" value={myEnrollments.filter(e => e.progress === 100).length} color="from-amber-400 to-orange-500" />
           <StatCard icon={Clock} title="Learning Hours" value={12} color="from-emerald-400 to-teal-500" />
        </div>

        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-6 px-2">In Progress</h3>
          {enrolledCourses.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-3xl border-dashed border-2 border-slate-300">
               <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
                  <Book size={32} />
               </div>
               <p className="text-slate-500 mb-6 text-lg">You haven't enrolled in any courses yet.</p>
               <button onClick={() => navigateTo('catalog')} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all">Browse Catalog</button>
            </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {enrolledCourses.map(course => {
                  const enrollment = myEnrollments.find(e => e.courseId === course.id);
                  return (
                    <div key={course.id} className="glass-card rounded-3xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300 flex flex-col h-full">
                       <div className="h-48 relative overflow-hidden">
                          <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-lg">
                             {course.category}
                          </span>
                       </div>
                       <div className="p-6 flex-1 flex flex-col">
                          <h4 className="text-lg font-bold text-slate-800 line-clamp-1 mb-1">{course.title}</h4>
                          <p className="text-xs text-slate-500 mb-4">{course.totalDuration} min • By Instructor</p>
                          
                          <div className="mt-auto space-y-3">
                             <div>
                                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                   <span>Progress</span>
                                   <span>{enrollment?.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                   <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${enrollment?.progress}%` }}></div>
                                </div>
                             </div>
                             
                             <button 
                               onClick={() => navigateTo('course-viewer', { courseId: course.id })}
                               className="w-full flex justify-center items-center gap-2 bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition-colors shadow-lg"
                             >
                                <PlayCircle size={18} />
                                Continue
                             </button>
                          </div>
                       </div>
                    </div>
                  );
                })}
             </div>
          )}
        </div>
      </div>
    );
  }
};

const StatCard = ({ icon: Icon, title, value, color }: any) => (
  <div className="glass-card p-6 rounded-3xl flex items-center gap-5 hover:translate-y-[-4px] transition-transform duration-300">
    <div className={`bg-gradient-to-br ${color} p-4 rounded-2xl text-white shadow-lg shadow-indigo-500/20`}>
      <Icon size={28} />
    </div>
    <div>
      <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{title}</p>
      <p className="text-3xl font-black text-slate-800">{value}</p>
    </div>
  </div>
);
