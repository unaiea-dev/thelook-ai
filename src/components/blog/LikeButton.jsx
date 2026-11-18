'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toggleLike } from '@/app/actions/blog';
import { useRouter } from 'next/navigation';

export default function LikeButton({ postId, initialLikes, isLikedInitial, user }) {
  const [isLiked, setIsLiked] = useState(isLikedInitial);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();

  const handleToggleLike = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Optimistic UI update
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    
    if (!isLiked) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }

    // Server action
    const result = await toggleLike(postId);
    
    // Revert if error
    if (result.error) {
      setIsLiked(isLiked);
      setLikesCount(initialLikes);
    }
  };

  return (
    <button 
      onClick={handleToggleLike}
      className={`group flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${
        isLiked 
          ? 'bg-red-500/10 border-red-500/30 text-red-500' 
          : 'glass-subtle text-[var(--theme-text-secondary)] hover:text-red-400 hover:border-red-400/30'
      }`}
    >
      <Heart 
        className={`w-5 h-5 transition-transform duration-300 ${isLiked ? 'fill-current' : 'group-hover:scale-110'} ${isAnimating ? 'animate-bounce' : ''}`} 
      />
      <span className="font-medium text-sm">{likesCount}</span>
    </button>
  );
}
