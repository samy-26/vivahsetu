'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function AdminBlogPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', excerpt: '', isPublished: false });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-blogs'],
    queryFn: () => api.get('/blog?page=1&limit=20') as any,
  });

  const { mutate: createBlog, isPending: creating } = useMutation({
    mutationFn: (data: any) => api.post('/blog', data),
    onSuccess: () => { toast.success('Blog created!'); qc.invalidateQueries({ queryKey: ['admin-blogs'] }); setShowForm(false); setForm({ title: '', content: '', excerpt: '', isPublished: false }); },
    onError: () => toast.error('Failed to create blog'),
  });

  const { mutate: deleteBlog } = useMutation({
    mutationFn: (id: number) => api.delete(`/blog/${id}`),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['admin-blogs'] }); },
  });

  const blogs = (data as any)?.data?.blogs || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-500 text-sm">{blogs.length} articles</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />New Post
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Create New Blog Post</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input value={form.title} onChange={(e) => setForm(f => ({...f, title: e.target.value}))} className="input-field" placeholder="Blog post title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
              <input value={form.excerpt} onChange={(e) => setForm(f => ({...f, excerpt: e.target.value}))} className="input-field" placeholder="Short summary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
              <textarea value={form.content} onChange={(e) => setForm(f => ({...f, content: e.target.value}))} className="input-field" rows={8} placeholder="Write blog content here..." />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="published" checked={form.isPublished} onChange={(e) => setForm(f => ({...f, isPublished: e.target.checked}))} className="w-4 h-4 accent-primary-500" />
              <label htmlFor="published" className="text-sm text-gray-700">Publish immediately</label>
            </div>
            <div className="flex gap-3">
              <button onClick={() => createBlog(form)} disabled={creating || !form.title || !form.content} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                {creating && <Loader2 className="w-4 h-4 animate-spin" />}Save Post
              </button>
              <button onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{['Title', 'Status', 'Views', 'Date', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-500">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {blogs.map((blog: any) => (
                <tr key={blog.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{blog.title}</p>
                    <p className="text-xs text-gray-400 truncate max-w-xs">{blog.excerpt}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${blog.isPublished ? 'badge-verified' : 'badge-pending'}`}>{blog.isPublished ? 'Published' : 'Draft'}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{blog.viewCount}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(blog.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteBlog(blog.id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!blogs.length && <tr><td colSpan={5} className="text-center py-12 text-gray-400">No blog posts yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
