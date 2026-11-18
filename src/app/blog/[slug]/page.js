import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LikeButton from '@/components/blog/LikeButton';
import { Calendar, Clock, ChevronLeft, Share2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const supabase = await createClient();
  
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt, cover_image_url, published_at, author_name, category')
    .eq('slug', slug)
    .single();

  if (!post) return { title: 'Post no trobat' };

  return {
    title: `${post.title} | thelook Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      siteName: 'thelook',
      images: post.cover_image_url ? [post.cover_image_url] : [],
      publishedTime: post.published_at,
      authors: [post.author_name],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Usem author_name directament sense join a auth.users
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !post) {
    notFound();
  }

  // Only author can view draft
  if (post.status === 'draft' && post.author_id !== user?.id) {
    notFound();
  }

  // Check if current user liked it
  let isLiked = false;
  if (user) {
    const { data: like } = await supabase
      .from('blog_likes')
      .select('user_id')
      .eq('post_id', post.id)
      .eq('user_id', user.id)
      .single();
    
    isLiked = !!like;
  }

  const formattedDate = new Date(post.published_at || post.created_at).toLocaleDateString('ca-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // author_name prové de la columna
  const authorName = post.author_name || 'Equip thelook';

  // Sanititzar contingut HTML amb DOMPurify
  const sanitizedContent = DOMPurify.sanitize(post.content || '', {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote', 'img', 'code', 'pre', 'hr', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target', 'rel', 'width', 'height'],
    ALLOW_DATA_ATTR: false,
  });

  // Share URLs natives
  const shareUrl = `https://thelook.com/blog/${post.slug}`;
  const shareText = encodeURIComponent(post.title);
  const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`;
  const whatsappUrl = `https://wa.me/?text=${shareText}%20${encodeURIComponent(shareUrl)}`;

  return (
    <>
      <Header user={user} variant="blog" />
      
      <main className="min-h-screen pt-28 pb-20">
        <article className="max-w-4xl mx-auto px-6">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-[var(--theme-text-secondary)] hover:text-brand-primary transition-colors mb-8">
            <ChevronLeft size={16} /> Tornar al blog
          </Link>

          <header className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-full text-xs font-bold uppercase tracking-wider">
                {post.category}
              </span>
              {post.status === 'draft' && (
                <span className="px-3 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                  Esborrany
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-[var(--theme-text-primary)] leading-tight mb-6">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-[var(--theme-text-secondary)] border-y border-[var(--theme-border)] py-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold text-xs">
                  {authorName.charAt(0)}
                </div>
                <span className="font-medium text-[var(--theme-text-primary)]">{authorName}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                {formattedDate}
              </div>
              
              <div className="flex items-center gap-2">
                <Clock size={16} />
                {post.reading_time} min de lectura
              </div>

              {user?.id === post.author_id && (
                <div className="ml-auto flex gap-3">
                  <Link href={`/blog/editar/${post.slug}`} className="text-brand-accent hover:underline">
                    Editar
                  </Link>
                </div>
              )}
            </div>
          </header>

          {post.cover_image_url && (
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden mb-12 glass">
              <Image 
                src={post.cover_image_url} 
                alt={post.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
              />
            </div>
          )}

          {/* Contingut sanititzat amb DOMPurify */}
          <div className="prose prose-invert prose-lg max-w-none text-[var(--theme-text-secondary)]
            prose-headings:text-[var(--theme-text-primary)] prose-headings:font-semibold
            prose-a:text-brand-primary hover:prose-a:text-brand-secondary
            prose-strong:text-[var(--theme-text-primary)]
            prose-blockquote:border-brand-primary prose-blockquote:bg-brand-primary/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
            mb-16
          ">
            <div className="whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
          </div>

          <div className="flex items-center justify-between py-8 border-t border-[var(--theme-border)]">
            <LikeButton 
              postId={post.id} 
              initialLikes={post.likes_count} 
              isLikedInitial={isLiked} 
              user={user} 
            />
            
            {/* Share links amb icones Lucide */}
            <div className="flex items-center gap-3 text-sm text-[var(--theme-text-secondary)]">
              <span className="flex items-center gap-1.5"><Share2 size={14} /> Compartir:</span>
              <a 
                href={twitterUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass flex items-center justify-center hover:text-brand-primary hover:-translate-y-1 transition-all"
                aria-label="Compartir a Twitter"
              >
                <ExternalLink size={16} />
              </a>
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass flex items-center justify-center hover:text-emerald-400 hover:-translate-y-1 transition-all"
                aria-label="Compartir a WhatsApp"
              >
                <Share2 size={16} />
              </a>
            </div>
          </div>

        </article>
      </main>

      <Footer />
    </>
  );
}
