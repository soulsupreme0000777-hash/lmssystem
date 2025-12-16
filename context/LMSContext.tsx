import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { User, Course, Enrollment, Role, Screen, Assignment, Submission } from '../types';
import { supabase } from '../lib/supabase';

interface LMSContextType {
  currentUser: User | null;
  users: User[];
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string, data: any) => Promise<any>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  editUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  courses: Course[];
  addCourse: (course: Course) => void;
  updateCourse: (course: Course) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  uploadFile: (file: File, bucket: 'avatars' | 'courses_files') => Promise<string | null>;
  enrollments: Enrollment[];
  enrollInCourse: (courseId: string) => void;
  enrollStudent: (courseId: string, studentId: string) => void;
  updateProgress: (courseId: string, lessonId: string) => void;
  // Assignments
  fetchAssignments: (courseId: string) => Promise<Assignment[]>;
  createAssignment: (assignment: Partial<Assignment>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  // Submissions
  fetchSubmissions: (courseId: string) => Promise<any[]>;
  gradeSubmission: (id: string, grade: number, feedback: string) => Promise<void>;
  
  currentScreen: Screen;
  navigateTo: (screen: Screen, params?: any) => void;
  navigationParams: any;
}

const LMSContext = createContext<LMSContextType | undefined>(undefined);

export const LMSProvider = ({ children }: PropsWithChildren) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [navigationParams, setNavigationParams] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth
  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id);
        fetchData();
      } else {
        setCurrentUser(null);
        setEnrollments([]);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
       await fetchProfile(session.user.id);
       fetchData();
    } else {
      setIsLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      setCurrentUser({
        id: data.id,
        email: data.email,
        name: data.name || `${data.first_name || ''} ${data.last_name || ''}`,
        firstName: data.first_name,
        middleName: data.middle_name,
        lastName: data.last_name,
        age: data.age,
        role: data.role as Role,
        avatar: data.avatar || 'https://via.placeholder.com/150',
        bio: data.bio
      });
    }
  };

  const fetchData = async () => {
    try {
      const { data: usersData } = await supabase.from('profiles').select('*');
      if (usersData) {
        setUsers(usersData.map((u: any) => ({
           ...u,
           name: u.name || `${u.first_name} ${u.last_name}`,
           firstName: u.first_name,
           lastName: u.last_name
        })));
      }

      const { data: enrollData } = await supabase.from('enrollments').select('*');
      const formattedEnrollments = (enrollData || []).map((e: any) => ({
        id: e.id,
        courseId: e.course_id,
        studentId: e.student_id,
        progress: e.progress,
        completedLessonIds: e.completed_lesson_ids || [],
        enrolledAt: e.enrolled_at
      }));
      setEnrollments(formattedEnrollments);

      const { data: coursesData } = await supabase.from('courses').select('*');
      const formattedCourses = (coursesData || []).map((c: any) => {
        const count = formattedEnrollments.filter(e => e.courseId === c.id).length;
        return {
          id: c.id,
          title: c.title,
          description: c.description,
          instructorId: c.instructor_id,
          thumbnailUrl: c.thumbnail_url,
          category: c.category,
          modules: c.modules || [],
          published: c.published,
          totalDuration: c.total_duration,
          studentsEnrolled: count 
        };
      });
      setCourses(formattedCourses);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const login = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    return data;
  };

  const signup = async (email: string, pass: string, meta: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          first_name: meta.firstName,
          middle_name: meta.middleName,
          last_name: meta.lastName,
          age: meta.age,
          role: meta.role
        }
      }
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const uploadFile = async (file: File, bucket: 'avatars' | 'courses_files') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);

    if (uploadError) {
      console.error("Upload error", uploadError);
      return null;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const updateUser = async (data: Partial<User>) => {
    if (currentUser) {
      const dbData: any = { ...data };
      if (data.firstName) dbData.first_name = data.firstName;
      if (data.middleName) dbData.middle_name = data.middleName;
      if (data.lastName) dbData.last_name = data.lastName;
      
      const { error } = await supabase.from('profiles').update(dbData).eq('id', currentUser.id);
      if (!error) {
        setCurrentUser({ ...currentUser, ...data });
      }
    }
  };

  const editUser = async (id: string, data: Partial<User>) => {
      const { error } = await supabase.from('profiles').update(data).eq('id', id);
      if (!error) {
         setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
      }
  };

  const deleteUser = async (id: string) => {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (!error) {
        setUsers(prev => prev.filter(u => u.id !== id));
      }
  };

  const addCourse = async (course: Course) => {
    try {
      const dbCourse = {
        title: course.title,
        description: course.description,
        instructor_id: course.instructorId,
        thumbnail_url: course.thumbnailUrl,
        category: course.category,
        modules: course.modules,
        published: course.published,
        total_duration: course.totalDuration
      };

      const { data, error } = await supabase.from('courses').insert([dbCourse]).select().single();
      if (error) throw error;
      await fetchData();
    } catch (e) {
      console.error(e);
      alert("Failed to add course");
    }
  };

  const updateCourse = async (course: Course) => {
    try {
      const dbCourse = {
        title: course.title,
        description: course.description,
        thumbnail_url: course.thumbnailUrl,
        category: course.category,
        modules: course.modules,
        published: course.published,
        total_duration: course.totalDuration
      };
      
      const { error } = await supabase.from('courses').update(dbCourse).eq('id', course.id);
      if (error) throw error;
      await fetchData();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const deleteCourse = async (id: string) => {
     const { error } = await supabase.from('courses').delete().eq('id', id);
     if (error) {
       console.error(error);
       throw error;
     }
     await fetchData();
  };

  const enrollInCourse = (courseId: string) => {
    if (!currentUser) return;
    enrollStudent(courseId, currentUser.id);
  };

  const enrollStudent = async (courseId: string, studentId: string) => {
     try {
       await supabase.from('enrollments').insert([{ course_id: courseId, student_id: studentId }]);
       await fetchData();
     } catch(e) { console.error(e); }
  };

  const updateProgress = async (courseId: string, lessonId: string) => {
    if (!currentUser) return;
    const enrollment = enrollments.find(e => e.courseId === courseId && e.studentId === currentUser.id);
    if (!enrollment || enrollment.completedLessonIds.includes(lessonId)) return;

    const completed = [...enrollment.completedLessonIds, lessonId];
    const course = courses.find(c => c.id === courseId);
    let progress = 0;
    if (course) {
       const total = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
       progress = total > 0 ? Math.round((completed.length / total) * 100) : 100;
    }

    await supabase.from('enrollments').update({ 
      completed_lesson_ids: completed, 
      progress 
    }).eq('id', enrollment.id);
    
    setEnrollments(prev => prev.map(e => e.id === enrollment.id ? {...e, completedLessonIds: completed, progress} : e));
  };

  // --- Assignments ---

  const fetchAssignments = async (courseId: string): Promise<Assignment[]> => {
    const { data } = await supabase.from('assignments').select('*').eq('course_id', courseId).order('created_at', { ascending: false });
    return (data || []).map((a: any) => ({
      id: a.id,
      courseId: a.course_id,
      title: a.title,
      description: a.description,
      dueDate: a.due_date,
      totalPoints: a.total_points
    }));
  };

  const createAssignment = async (assignment: Partial<Assignment>) => {
    const { error } = await supabase.from('assignments').insert([{
      course_id: assignment.courseId,
      title: assignment.title,
      description: assignment.description,
      due_date: assignment.dueDate,
      total_points: assignment.totalPoints
    }]);
    if (error) throw error;
  };

  const deleteAssignment = async (id: string) => {
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    if (error) throw error;
  };

  // --- Submissions ---

  const fetchSubmissions = async (courseId: string): Promise<any[]> => {
    // Get assignments for course first
    const { data: assignments } = await supabase.from('assignments').select('id, title').eq('course_id', courseId);
    if (!assignments || assignments.length === 0) return [];

    const assignmentIds = assignments.map(a => a.id);
    
    // Get submissions for these assignments
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select('*, profiles(first_name, last_name, email)')
      .in('assignment_id', assignmentIds);

    if (error) throw error;

    return (submissions || []).map((s: any) => ({
       id: s.id,
       assignmentId: s.assignment_id,
       assignmentTitle: assignments.find(a => a.id === s.assignment_id)?.title,
       studentId: s.student_id,
       studentName: `${s.profiles?.first_name || ''} ${s.profiles?.last_name || ''}`,
       content: s.content,
       grade: s.grade,
       feedback: s.feedback,
       status: s.status,
       submittedAt: s.submitted_at
    }));
  };

  const gradeSubmission = async (id: string, grade: number, feedback: string) => {
    const { error } = await supabase.from('submissions').update({
      grade,
      feedback,
      status: 'graded'
    }).eq('id', id);
    if (error) throw error;
  };

  const navigateTo = (screen: Screen, params?: any) => {
    setCurrentScreen(screen);
    setNavigationParams(params);
  };

  return (
    <LMSContext.Provider value={{
      currentUser,
      users,
      isLoading,
      login,
      signup,
      logout,
      updateUser,
      editUser,
      deleteUser,
      courses,
      addCourse,
      updateCourse,
      deleteCourse,
      uploadFile,
      enrollments,
      enrollInCourse,
      enrollStudent,
      updateProgress,
      fetchAssignments,
      createAssignment,
      deleteAssignment,
      fetchSubmissions,
      gradeSubmission,
      currentScreen,
      navigateTo,
      navigationParams
    }}>
      {children}
    </LMSContext.Provider>
  );
};

export const useLMS = () => {
  const context = useContext(LMSContext);
  if (!context) throw new Error("useLMS must be used within LMSProvider");
  return context;
};
