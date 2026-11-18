'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Image as ImageIcon, Loader2, Save, Send, ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function BlogEditor({ post = null, actionFn, deleteFn }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  const [title, setTitle] = useState(post?.title || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [content, setContent] = useState(post?.content || '');
  const [category, setCategory] = useState(post?.category || 'noticies');
  const [coverUrl, setCoverUrl] = useState(post?.cover_image_url || '');
  
  const fileInputRef = useRef(null);

  const categories = ['moda', 'tecnologia', 'sostenibilitat', 'tutorials', 'noticies'];

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('La imatge no pot superar els 2MB');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/blog/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setCoverUrl(data.url);
    } catch (err) {
      setError(err.message || 'Error al pujar la imatge');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (actionType) => {
    if (!title.trim() || !content.trim()) {
      setError('El títol i el contingut són obligatoris');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('excerpt', excerpt);
    formData.append('category', category);
    formData.append('coverUrl', coverUrl);
    formData.append('action', actionType);

    try {
      // Usar la función importada (createPost o updatePost)
      const result = await actionFn(formData);
      if (result?.error) throw new Error(result.error);
      // La redirección sucede dentro de la server action
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Estàs segur que vols esborrar aquest article? Aquesta acció és irreversible.')) return;
    
    setLoading(true);
    try {
      const result = await deleteFn();
      if (result?.error) throw new Error(result.error);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-[var(--theme-text-secondary)] hover:text-brand-primary transition-colors">
          <ArrowLeft size={16} /> Tornar al blog
        </Link>
        <div className="flex gap-3">
          {post && (
            <button 
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-full transition-colors disabled:opacity-50"
            >
              <Trash2 size={16} /> Esborrar
            </button>
          )}
          <button 
            onClick={() => handleSubmit('draft')}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--theme-text-primary)] glass hover:bg-[var(--theme-hover)] rounded-full transition-colors disabled:opacity-50"
          >
            <Save size={16} /> Guardar Esborrany
          </button>
          <button 
            onClick={() => handleSubmit('publish')}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full hover:scale-105 transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} 
            Publicar
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="glass p-6 md:p-8 rounded-3xl space-y-6">
        {/* Cover Image Upload */}
        <div>
          <label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2 uppercase tracking-wider">
            Imatge de portada
          </label>
          <div 
            onClick={() => !uploading && fileInputRef.current?.click()}
            className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl border-2 border-dashed border-[var(--theme-border)] bg-[var(--theme-input-bg)] flex flex-col items-center justify-center cursor-pointer hover:border-brand-primary/50 transition-colors overflow-hidden group"
          >
            {coverUrl ? (
              <>
                <Image src={coverUrl} alt="Cover preview" fill className="object-cover" sizes="(max-width: 896px) 100vw, 896px" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white font-medium flex items-center gap-2"><ImageIcon size={18}/> Canviar imatge</span>
                </div>
              </>
            ) : (
              <div className="text-[var(--theme-text-muted)] flex flex-col items-center gap-3">
                {uploading ? (
                  <Loader2 size={32} className="animate-spin text-brand-primary" />
                ) : (
                  <>
                    <ImageIcon size={32} />
                    <span>Fes clic per pujar una imatge (màx 2MB)</span>
                  </>
                )}
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/png, image/jpeg, image/webp" 
              className="hidden" 
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Títol de l'article..."
            className="w-full bg-transparent text-3xl md:text-5xl font-bold text-[var(--theme-text-primary)] placeholder:text-[var(--theme-text-muted)] focus:outline-none"
          />
        </div>

        {/* Category & Excerpt */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2 uppercase tracking-wider">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-glass-border)] rounded-xl py-3 px-4 text-sm text-[var(--theme-text-primary)] focus:outline-none focus:ring-1 focus:ring-brand-primary/50 appearance-none"
            >
              {categories.map(c => (
                <option key={c} value={c} className="bg-[var(--theme-bg)]">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2 uppercase tracking-wider">
              Resum (Excerpt)
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Un breu resum de l'article... (opcional)"
              rows={2}
              className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-glass-border)] rounded-xl py-3 px-4 text-sm text-[var(--theme-text-primary)] focus:outline-none focus:ring-1 focus:ring-brand-primary/50 resize-none"
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2 uppercase tracking-wider">
            Contingut (suporta HTML/Markdown bàsic)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escriu el teu article aquí..."
            rows={15}
            className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-glass-border)] rounded-xl py-4 px-5 text-[var(--theme-text-primary)] focus:outline-none focus:ring-1 focus:ring-brand-primary/50 font-mono text-sm leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
