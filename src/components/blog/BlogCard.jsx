import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export default function BlogCard({ post }) {
  // Format date natively
  const formattedDate = new Date(post.published_at || post.created_at).toLocaleDateString('ca-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Color mapping per category
  const categoryColors = {
    'moda': 'text-pink-400 bg-pink-400/10 border-pink-400/20',
    'tecnologia': 'text-brand-primary bg-brand-primary/10 border-brand-primary/20',
    'sostenibilitat': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    'tutorials': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    'noticies': 'text-brand-accent bg-brand-accent/10 border-brand-accent/20',
  };

  const catStyle = categoryColors[post.category] || categoryColors['noticies'];

  return (
    <Link 
      href={`/blog/${post.slug}`}
      className="group glass flex flex-col rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative h-48 w-full overflow-hidden bg-zinc-900">
        {post.cover_image_url ? (
          <Image 
            src={post.cover_image_url} 
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20">
            <span className="text-4xl font-bold text-white/10 uppercase tracking-widest text-center px-4">
              {post.category || 'thelook'}
            </span>
          </div>
        )}
        
        <div className="absolute top-4 left-4 z-10">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${catStyle}`}>
            {post.category}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6">
        <h3 className="text-xl font-semibold text-[var(--theme-text-primary)] mb-3 line-clamp-2 group-hover:text-brand-accent transition-colors">
          {post.title}
        </h3>
        
        <p className="text-sm text-[var(--theme-text-secondary)] mb-6 line-clamp-3 flex-1">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--theme-border)]">
          <div className="flex items-center gap-4 text-xs text-[var(--theme-text-muted)] font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              {formattedDate}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              {post.reading_time} min
            </div>
          </div>
          
          <div className="w-8 h-8 rounded-full glass-subtle flex items-center justify-center text-[var(--theme-text-primary)] group-hover:bg-brand-accent group-hover:text-zinc-950 transition-colors">
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
