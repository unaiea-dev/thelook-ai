import { createClient } from '@/utils/supabase/server';

export default async function sitemap() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at, category')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  const postEntries = (posts || []).map(post => ({
    url: `https://thelook.com/blog/${post.slug}`,
    lastModified: post.updated_at,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Páginas estáticas del blog
  const staticEntries = [
    {
      url: 'https://thelook.com/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  // Categorías
  const categories = ['moda', 'tecnologia', 'sostenibilitat', 'tutorials', 'noticies'];
  const categoryEntries = categories.map(cat => ({
    url: `https://thelook.com/blog/categoria/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticEntries, ...categoryEntries, ...postEntries];
}
