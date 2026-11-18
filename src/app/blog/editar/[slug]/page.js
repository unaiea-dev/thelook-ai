import { createClient } from '@/utils/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogEditor from '@/components/blog/BlogEditor';
import { updatePost, deletePost } from '@/app/actions/blog';

export const metadata = {
  title: 'Editar Article | thelook Blog',
};

export default async function EditPostPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/blog/editar/${slug}`);
  }

  // Fetch the post
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !post) {
    notFound();
  }

  // Double check ownership
  if (post.author_id !== user.id) {
    redirect('/blog'); // Or throw 403
  }

  // Create bound versions of the server actions to pass to the client component
  const updatePostWithId = updatePost.bind(null, post.id);
  const deletePostWithId = deletePost.bind(null, post.id);

  return (
    <>
      <Header user={user} variant="blog" />
      
      <main className="min-h-screen pt-32 pb-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-secondary/10 blur-[120px] rounded-full pointer-events-none z-0" />
        <div className="relative z-10 px-6">
          <BlogEditor 
            post={post} 
            actionFn={updatePostWithId} 
            deleteFn={deletePostWithId} 
          />
        </div>
      </main>

      <Footer />
    </>
  );
}
