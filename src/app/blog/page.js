import { createClient } from '@/utils/supabase/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogFeed from '@/components/blog/BlogFeed';
import CategoryFilter from '@/components/blog/CategoryFilter';
import Link from 'next/link';
import { PenLine } from 'lucide-react';

export const metadata = {
  title: 'Blog - thelook',
  description: 'Descobreix les últimes novetats sobre moda, intel·ligència artificial i thelook.',
};

export const revalidate = 3600;

const PAGE_SIZE = 12;

export default async function BlogPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams?.page) || 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Paginació amb rang i recompte exacte
  const { data: posts, count } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, category, cover_image_url, reading_time, published_at, created_at', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  return (
    <>
      <Header user={user} variant="blog" />
      
      <main className="min-h-screen pt-32 pb-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none z-0" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-start justify-between mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[var(--theme-text-primary)] mb-4">
                El <span className="text-gradient">Blog</span>
              </h1>
              <p className="text-lg text-[var(--theme-text-secondary)] max-w-2xl">
                Idees, reflexions i novetats sobre el futur del teu armari intel·ligent.
              </p>
            </div>
            {user && (
              <Link 
                href="/blog/nou"
                className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full hover:scale-105 transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)]"
              >
                <PenLine size={16} /> Escriure article
              </Link>
            )}
          </div>

          <div className="mb-10">
            <CategoryFilter currentCategory="tots" />
          </div>

          <BlogFeed posts={posts || []} />

          {/* Paginació */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12">
              {page > 1 && (
                <Link 
                  href={`/blog?page=${page - 1}`}
                  className="px-5 py-2.5 rounded-full glass-subtle text-sm font-medium text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-hover)] transition-all"
                >
                  ← Anterior
                </Link>
              )}
              <span className="text-sm text-[var(--theme-text-muted)]">
                Pàgina {page} de {totalPages}
              </span>
              {page < totalPages && (
                <Link 
                  href={`/blog?page=${page + 1}`}
                  className="px-5 py-2.5 rounded-full glass-subtle text-sm font-medium text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-hover)] transition-all"
                >
                  Següent →
                </Link>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
