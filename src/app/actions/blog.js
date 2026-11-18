'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { calculateReadingTime, generateSlug, VALID_CATEGORIES } from '@/utils/blog';
import { redirect } from 'next/navigation';

export async function createPost(formData) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'No autenticat' };
  }

  const title = formData.get('title');
  const content = formData.get('content');
  const excerpt = formData.get('excerpt');
  const category = formData.get('category') || 'noticies';
  const action = formData.get('action');
  const coverUrl = formData.get('coverUrl');

  if (!title || !content) {
    return { error: 'El títol i el contingut són obligatoris' };
  }

  // Validar categoria contra whitelist
  if (!VALID_CATEGORIES.includes(category)) {
    return { error: 'Categoria no vàlida' };
  }

  const readingTime = calculateReadingTime(content);
  const status = action === 'publish' ? 'published' : 'draft';
  const publishedAt = status === 'published' ? new Date().toISOString() : null;
  const authorName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anònim';

  // Retry logic per a col·lisions de slug
  let slug = generateSlug(title);
  let data = null;
  let insertError = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    const result = await supabase
      .from('blog_posts')
      .insert({
        author_id: user.id,
        author_name: authorName,
        slug,
        title,
        content,
        excerpt: excerpt || content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
        category,
        cover_image_url: coverUrl || null,
        status,
        reading_time: readingTime,
        published_at: publishedAt,
      })
      .select()
      .single();

    if (!result.error) {
      data = result.data;
      insertError = null;
      break;
    }

    if (result.error.code === '23505') {
      // unique_violation en slug → regenerar
      slug = generateSlug(title);
      continue;
    }

    insertError = result.error;
    break;
  }

  if (insertError) {
    console.error('Error creating post:', insertError);
    return { error: 'Error al crear l\'article' };
  }

  revalidatePath('/blog');
  redirect(`/blog/${slug}`);
}

export async function updatePost(postId, formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autenticat' };

  // Validar ownership
  const { data: existingPost } = await supabase
    .from('blog_posts')
    .select('author_id')
    .eq('id', postId)
    .single();

  if (existingPost?.author_id !== user.id) {
    return { error: 'No tens permisos per editar aquest article' };
  }

  const title = formData.get('title');
  const content = formData.get('content');
  const excerpt = formData.get('excerpt');
  const category = formData.get('category');
  const action = formData.get('action');
  const coverUrl = formData.get('coverUrl');

  // Validar categoria
  if (category && !VALID_CATEGORIES.includes(category)) {
    return { error: 'Categoria no vàlida' };
  }

  const updates = {};
  if (title) updates.title = title;
  if (content) {
    updates.content = content;
    updates.reading_time = calculateReadingTime(content);
  }
  if (excerpt) updates.excerpt = excerpt;
  if (category) updates.category = category;
  if (coverUrl) updates.cover_image_url = coverUrl;
  
  if (action === 'publish') {
    updates.status = 'published';
    updates.published_at = new Date().toISOString();
  } else if (action === 'unpublish') {
    updates.status = 'draft';
    updates.published_at = null;
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .single();

  if (error) {
    return { error: 'Error al actualitzar l\'article' };
  }

  revalidatePath('/blog');
  revalidatePath(`/blog/${data.slug}`);
  redirect(`/blog/${data.slug}`);
}

export async function deletePost(postId) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autenticat' };

  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', postId)
    .eq('author_id', user.id);

  if (error) {
    return { error: 'Error al eliminar l\'article' };
  }

  revalidatePath('/blog');
  redirect('/blog');
}

// toggleLike atòmic — elimina race condition
export async function toggleLike(postId) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autenticat', code: 'UNAUTHORIZED' };

  // Intento atómico: primero intentar borrar
  const { data: deleted } = await supabase
    .from('blog_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .select();

  if (deleted && deleted.length > 0) {
    return { liked: false };
  }

  // Si no se borró nada → insertar (PK compuesta previene duplicados)
  const { error } = await supabase
    .from('blog_likes')
    .insert({ post_id: postId, user_id: user.id });

  if (error) {
    // Si es duplicate key (race condition residual) → ya estaba liked
    if (error.code === '23505') return { liked: true };
    return { error: 'Error al donar m\'agrada' };
  }

  return { liked: true };
}
