import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { blogPosts } from '../page';

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) return {};
  return { title: `${post.title} | VivahSetu Blog` };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) notFound();

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  // Convert markdown-like content to paragraphs
  const renderContent = (content: string) => {
    return content.split('\n\n').map((block, i) => {
      if (block.startsWith('**') && block.endsWith('**')) {
        const heading = block.replace(/\*\*/g, '');
        return <h2 key={i} className="text-xl font-bold text-gray-900 mt-8 mb-3">{heading}</h2>;
      }
      if (block.startsWith('- ')) {
        const items = block.split('\n').filter(l => l.startsWith('- ')).map(l => l.slice(2));
        return (
          <ul key={i} className="list-disc list-inside space-y-1.5 my-4">
            {items.map((item, j) => {
              const parts = item.split('**');
              return (
                <li key={j} className="text-gray-600 text-base leading-relaxed">
                  {parts.map((part, k) => k % 2 === 1 ? <strong key={k}>{part}</strong> : part)}
                </li>
              );
            })}
          </ul>
        );
      }
      if (/^\d+\./.test(block)) {
        const items = block.split('\n').filter(l => /^\d+\./.test(l));
        return (
          <ol key={i} className="list-decimal list-inside space-y-1.5 my-4">
            {items.map((item, j) => {
              const text = item.replace(/^\d+\.\s*/, '');
              const parts = text.split('**');
              return (
                <li key={j} className="text-gray-600 text-base leading-relaxed">
                  {parts.map((part, k) => k % 2 === 1 ? <strong key={k}>{part}</strong> : part)}
                </li>
              );
            })}
          </ol>
        );
      }
      // Bold inline text
      const parts = block.split('**');
      return (
        <p key={i} className="text-gray-600 text-base leading-relaxed my-3">
          {parts.map((part, k) => k % 2 === 1 ? <strong key={k} className="text-gray-800">{part}</strong> : part)}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen pt-16 bg-white">
      {/* Hero image */}
      <div className="relative h-72 sm:h-96 bg-gray-100">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="max-w-3xl mx-auto">
            <span className="text-xs font-semibold text-white/80 uppercase tracking-wider bg-primary-500/80 backdrop-blur px-3 py-1 rounded-full">
              {post.category}
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold text-white mt-3 leading-tight">{post.title}</h1>
          </div>
        </div>
      </div>

      {/* Article */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Back + Meta */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{post.date}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
          </div>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-100">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900 text-sm">{post.author}</div>
            <div className="text-xs text-gray-400">VivahSetu Editorial</div>
          </div>
        </div>

        {/* Content */}
        <div className="prose-like">
          <p className="text-lg text-gray-700 leading-relaxed font-medium mb-6 pb-6 border-b border-gray-100">
            {post.excerpt}
          </p>
          {renderContent(post.content)}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-primary-50 rounded-2xl p-7 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Find Your Match?</h3>
          <p className="text-gray-600 text-sm mb-5">Join thousands of Brahmana families on VivahSetu. Registration is free.</p>
          <Link href="/auth/register" className="btn-primary inline-flex items-center gap-2">
            Register Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Related articles */}
      <div className="border-t border-gray-100 bg-gray-50 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {related.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="relative h-40 bg-gray-100 overflow-hidden">
                  <Image
                    src={p.thumbnail}
                    alt={p.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="33vw"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs text-primary-500 font-semibold mb-1">{p.category}</p>
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-primary-600 transition-colors">{p.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
