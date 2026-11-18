import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogEditor from '@/components/blog/BlogEditor';
import { createPost } from '@/app/actions/blog';

export const metadata = {
  title: 'Escriure Article | thelook Blog',
};

export default async function NewPostPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/blog/nou');
  }

  return (
    <>
      <Header user={user} variant="blog" />
      
      <main className="min-h-screen pt-32 pb-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none z-0" />
        <div className="relative z-10 px-6">
          <BlogEditor actionFn={createPost} />
        </div>
      </main>

      <Footer />
    </>
  );
}
