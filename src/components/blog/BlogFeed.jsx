import BlogCard from './BlogCard';

export default function BlogFeed({ posts }) {
  if (!posts || posts.length === 0) {
    return (
      <div className="py-20 text-center glass rounded-2xl">
        <h3 className="text-xl font-semibold text-[var(--theme-text-primary)] mb-2">Encara no hi ha articles</h3>
        <p className="text-[var(--theme-text-secondary)] text-sm">Torna més endavant per llegir les nostres novetats.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}
