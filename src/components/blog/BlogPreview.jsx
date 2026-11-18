import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import BlogCard from './BlogCard';

export default async function BlogPreview() {
  const supabase = await createClient();

  // Fetch top 3 latest published posts
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, category, cover_image_url, reading_time, published_at, created_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(3);

  if (error || !posts || posts.length === 0) {
    return null; // Hide section if no posts
  }

  return (
    <section id="blog-preview" className="py-28 relative">
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-brand-primary/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold text-[var(--theme-text-primary)] mb-4">
              L'univers <span className="text-gradient">thelook</span>
            </h2>
            <p className="text-[var(--theme-text-secondary)] text-sm max-w-2xl">
              Les darreres novetats sobre moda, intel·ligència artificial i desenvolupament.
            </p>
          </div>
          
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold glass-subtle text-[var(--theme-text-primary)] hover:bg-[var(--theme-hover)] hover:scale-105 transition-all"
          >
            Veure tots els articles <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
