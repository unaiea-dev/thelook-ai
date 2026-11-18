'use client';

import Link from 'next/link';

export default function CategoryFilter({ currentCategory }) {
  const categories = [
    { id: 'tots', label: 'Tots els articles' },
    { id: 'moda', label: 'Moda & Estil' },
    { id: 'tecnologia', label: 'Tecnologia AI' },
    { id: 'sostenibilitat', label: 'Sostenibilitat' },
    { id: 'tutorials', label: 'Tutorials' },
    { id: 'noticies', label: 'Notícies' },
  ];

  return (
    <div className="w-full overflow-x-auto hide-scrollbar pb-4 -mx-6 px-6 md:mx-0 md:px-0">
      <div className="flex gap-2 min-w-max">
        {categories.map((cat) => {
          const isActive = currentCategory === cat.id || (!currentCategory && cat.id === 'tots');
          
          return (
            <Link
              key={cat.id}
              href={cat.id === 'tots' ? '/blog' : `/blog/categoria/${cat.id}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/25' 
                  : 'glass-subtle text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-hover)]'
              }`}
            >
              {cat.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
