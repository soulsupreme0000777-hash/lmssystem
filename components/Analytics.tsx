import React, { useMemo } from 'react';
import { useLMS } from '../context/LMSContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, CheckCircle, DollarSign, Activity } from 'lucide-react';

export const Analytics = () => {
  const { courses, currentUser, enrollments } = useLMS();

  const analyticsData = useMemo(() => {
    if (!currentUser) return null;

    // 1. Get Instructor's Courses
    const myCourses = courses.filter(c => c.instructorId === currentUser.id);
    const myCourseIds = new Set(myCourses.map(c => c.id));

    // 2. Get Enrollments for these courses
    const myEnrollments = enrollments.filter(e => myCourseIds.has(e.courseId));

    // 3. Calculate Stats
    const totalEnrollments = myEnrollments.length;
    
    // Active: Progress > 0 but not 100
    const activeLearners = myEnrollments.filter(e => e.progress > 0 && e.progress < 100).length;
    
    const totalProgress = myEnrollments.reduce((acc, curr) => acc + curr.progress, 0);
    const avgProgress = totalEnrollments > 0 ? Math.round(totalProgress / totalEnrollments) : 0;

    // Estimate Revenue (Assuming $49.99 fixed price per enrollment for demo)
    const estimatedRevenue = totalEnrollments * 49.99;

    // 4. Generate Chart Data (Enrollments over last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    const chartData = [];

    // Loop back 6 months (inclusive of current)
    for (let i = 5; i >= 0; i--) {
      // Create a date for the 1st of the target month
      // logic: current month index minus i handles year wrapping automatically in JS Date setMonth
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const targetMonth = d.getMonth();
      const targetYear = d.getFullYear();
      const monthName = months[targetMonth];

      // Count enrollments matching this month and year
      const count = myEnrollments.filter(e => {
        const eDate = new Date(e.enrolledAt);
        return eDate.getMonth() === targetMonth && eDate.getFullYear() === targetYear;
      }).length;

      chartData.push({
        name: monthName,
        students: count
      });
    }

    // 5. Top Courses
    const topCourses = [...myCourses]
      .sort((a, b) => b.studentsEnrolled - a.studentsEnrolled)
      .slice(0, 5);

    return {
      totalEnrollments,
      activeLearners,
      avgProgress,
      estimatedRevenue,
      chartData,
      topCourses
    };
  }, [courses, enrollments, currentUser]);

  if (!analyticsData) return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
       <div>
          <h2 className="text-2xl font-bold text-slate-800">Analytics Overview</h2>
          <p className="text-slate-500">Track your performance and student engagement metrics.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatBox icon={Users} label="Total Enrollments" value={analyticsData.totalEnrollments} trend="Lifetime" />
          <StatBox icon={Activity} label="Active Learners" value={analyticsData.activeLearners} trend="In Progress" />
          <StatBox icon={CheckCircle} label="Avg. Completion" value={`${analyticsData.avgProgress}%`} trend="Global" />
          <StatBox icon={DollarSign} label="Revenue (Est.)" value={`$${analyticsData.estimatedRevenue.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`} trend="~ $49.99/student" />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="text-lg font-bold text-slate-800 mb-6">Enrollment Growth</h3>
             <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={analyticsData.chartData}>
                      <defs>
                         <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
                      />
                      <Area type="monotone" dataKey="students" stroke="#6366f1" fillOpacity={1} fill="url(#colorStudents)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="text-lg font-bold text-slate-800 mb-6">Top Performing Courses</h3>
             <div className="space-y-4">
                {analyticsData.topCourses.length === 0 && (
                   <p className="text-slate-400 text-sm italic py-4">No courses created yet.</p>
                )}
                {analyticsData.topCourses.map((course, idx) => {
                   const maxStudents = analyticsData.topCourses[0].studentsEnrolled || 1;
                   const percentage = (course.studentsEnrolled / maxStudents) * 100;
                   
                   return (
                     <div key={course.id} className="flex items-center gap-4">
                        <span className="w-6 text-center text-slate-400 font-bold">{idx + 1}</span>
                        <img src={course.thumbnailUrl} className="w-12 h-12 rounded-lg object-cover bg-slate-100" alt={course.title} />
                        <div className="flex-1">
                           <h4 className="font-semibold text-slate-700 truncate">{course.title}</h4>
                           <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                              <div 
                                className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="font-bold text-slate-700">{course.studentsEnrolled}</p>
                           <p className="text-xs text-slate-400">Students</p>
                        </div>
                     </div>
                   );
                })}
             </div>
          </div>
       </div>
    </div>
  );
};

const StatBox = ({ icon: Icon, label, value, trend }: any) => {
   return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
         <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
               <Icon size={20} />
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600`}>
               {trend}
            </span>
         </div>
         <h4 className="text-2xl font-bold text-slate-800 mb-1">{value}</h4>
         <p className="text-sm text-slate-500">{label}</p>
      </div>
   );
};
