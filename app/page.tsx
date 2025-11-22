'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LinkData {
  id: number;
  code: string;
  url: string;
  clicks: number;
  created_at: string;
  last_clicked_at: string | null;
}

export default function Dashboard() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/links');
      if (!response.ok) throw new Error('Failed to fetch links');
      const data = await response.json();
      setLinks(data);
    } catch (err) {
      setError('Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          code: customCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError('This code already exists. Please choose a different one.');
        } else {
          setError(data.error || 'Failed to create link');
        }
        return;
      }

      setSuccess('Link created successfully!');
      setUrl('');
      setCustomCode('');
      fetchLinks();
    } catch (err) {
      setError('Failed to create link');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      const response = await fetch(`/api/links/${code}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete link');
      setSuccess('Link deleted successfully!');
      fetchLinks();
    } catch (err) {
      setError('Failed to delete link');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(null), 2000);
  };

  const filteredLinks = links.filter(
    (link) =>
      link.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const truncateUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">TinyLink</h1>
          <p className="text-gray-600">Shorten URLs and track clicks</p>
        </header>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-black">Create Short Link</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                URL *
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 text-black focus:ring-blue-500 focus:border-blue-500"
                disabled={submitting}
              />
            </div>
            <div>
              <label htmlFor="customCode" className="block text-sm font-medium text-gray-700 mb-1">
                Custom Code (optional, 6-8 alphanumeric characters)
              </label>
              <input
                type="text"
                id="customCode"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                pattern="[A-Za-z0-9]{6,8}"
                placeholder="Leave empty for auto-generated"
                className="w-full px-4 py-2 border border-gray-300 text-black rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={submitting}
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !url}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Creating...' : 'Create Link'}
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-semibold text-black">All Links</h2>
              <input
                type="text"
                placeholder="Search by code or URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredLinks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'No links match your search.' : 'No links yet. Create your first link above!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Short Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Clicks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Clicked
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLinks.map((link) => (
                    <tr key={link.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono text-blue-600">
                            {link.code}
                          </code>
                          <button
                            onClick={() => copyToClipboard(`${baseUrl}/${link.code}`)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Copy link"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md truncate" title={link.url}>
                          {truncateUrl(link.url)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {link.clicks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(link.last_clicked_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/code/${link.code}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Stats
                          </Link>
                          <button
                            onClick={() => handleDelete(link.code)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
