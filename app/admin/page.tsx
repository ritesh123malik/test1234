// app/admin/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminClient from './AdminClient';

export default async function AdminPage() {
  const supabase = await createClient();

  let user = null;
  try {
    const authPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Auth timeout')), 5000)
    );
    const { data } = await Promise.race([authPromise, timeoutPromise]) as any;
    user = data?.user ?? null;
  } catch (e) {
    console.warn('AdminPage: Auth check timed out');
  }
  if (!user) redirect('/auth/login');

  // Only admin emails can access
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',');
  if (!adminEmails.includes(user.email || '')) {
    redirect('/dashboard');
  }

  const [companiesRes, questionsRes, usersRes, subsRes, submissionsRes] = await Promise.all([
    supabase.from('companies').select('*').order('name'),
    supabase.from('questions').select('*, company:companies(name)').order('created_at', { ascending: false }).limit(50),
    supabase.from('profiles').select('id, email, full_name, college, created_at').order('created_at', { ascending: false }).limit(50),
    supabase.from('subscriptions').select('*, profile:profiles(email)').neq('plan', 'free').order('created_at', { ascending: false }),
    supabase.from('question_submissions').select('*').order('created_at', { ascending: false }),
  ]);

  return (
    <div className="min-h-screen bg-bg noise">
      <AdminClient
        companies={companiesRes.data || []}
        questions={questionsRes.data || []}
        users={usersRes.data || []}
        subscriptions={subsRes.data || []}
        pendingSubmissions={submissionsRes.data || []}
      />
    </div>
  );
}
