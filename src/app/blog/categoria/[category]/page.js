import { createClient } from '@/utils/supabase/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoryFilter from '@/components/blog/CategoryFilter';
import BlogFeed from '@/components/blog/BlogFeed';
import Link from 'next/link';

const PAGE_SIZE = 12;

export async function generateMetadata({ params }) {
  const { category } = await params;
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    title: `${categoryName} | Blog thelook`,
    description: `Llegeix els últims articles sobre ${categoryName} al blog de thelook.`,
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const { category } = await params;
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams?.page) || 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Paginació
  const { data: posts, count } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, category, cover_image_url, reading_time, published_at, created_at', { count: 'exact' })
    .eq('status', 'published')
    .eq('category', category)
    .order('published_at', { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <>
      <Header user={user} variant="blog" />
      
      <main className="min-h-screen pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--theme-text-primary)] mb-4">
              Articles sobre <span className="text-gradient">{categoryName}</span>
            </h1>
          </div>

          <div className="mb-10">
            <CategoryFilter currentCategory={category} />
          </div>

          <BlogFeed posts={posts || []} />

          {/* Paginació */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12">
              {page > 1 && (
                <Link 
                  href={`/blog/categoria/${category}?page=${page - 1}`}
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
                  href={`/blog/categoria/${category}?page=${page + 1}`}
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
