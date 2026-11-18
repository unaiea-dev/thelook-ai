import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// Whitelist estricta de MIME → extensió
const ALLOWED_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

// Rate limiting simple en memòria
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60_000; // 1 minuto
const RATE_LIMIT_MAX = 10; // max uploads por minuto

function checkRateLimit(userId) {
  const now = Date.now();
  const entry = rateLimit.get(userId);
  
  if (!entry || now - entry.timestamp > RATE_LIMIT_WINDOW) {
    rateLimit.set(userId, { timestamp: now, count: 1 });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  entry.count++;
  return true;
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticat' }, { status: 401 });
    }

    // Rate limit check
    if (!checkRateLimit(user.id)) {
      return NextResponse.json({ error: 'Massa peticions. Espera un moment.' }, { status: 429 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No s\'ha proporcionat cap arxiu' }, { status: 400 });
    }

    // Validar MIME type contra whitelist estricta (NO SVG)
    if (!ALLOWED_TYPES[file.type]) {
      return NextResponse.json({ error: 'Només JPG, PNG i WebP' }, { status: 400 });
    }

    // Validar tamaño (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'La imatge no pot superar els 2MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validar magic bytes de l'arxiu
    const header = new Uint8Array(buffer.slice(0, 4));
    const isJPEG = header[0] === 0xFF && header[1] === 0xD8;
    const isPNG = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47;
    const isWebP = header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46;

    if (!isJPEG && !isPNG && !isWebP) {
      return NextResponse.json({ error: 'Arxiu corrupte o no vàlid' }, { status: 400 });
    }

    // Forçar extensió des del MIME type (ignorar file.name)
    const extension = ALLOWED_TYPES[file.type];
    const timestamp = Date.now();
    const fileName = `${user.id}/${timestamp}.${extension}`;

    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json({ error: 'Error al pujar la imatge' }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (error) {
    console.error('Server error during upload:', error);
    return NextResponse.json({ error: 'Error intern del servidor' }, { status: 500 });
  }
}
