'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface LinkData {
  id: number;
  code: string;
  url: string;
  clicks: number;
  created_at: string;
  last_clicked_at: string | null;
}

export default function StatsPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [link, setLink] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    fetchLink();
  }, [code]);

  const fetchLink = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/links/${code}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Link not found');
        } else {
          setError('Failed to load link');
        }
        return;
      }
      const data = await response.json();
      setLink(data);
    } catch (err) {
      setError('Failed to load link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-red-600 mb-4">{error || 'Link not found'}</div>
            <Link href="/" className="text-blue-600 hover:text-blue-900">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-900 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Link Statistics</h1>
          <p className="text-gray-600">Detailed information about this short link</p>
        </header>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-black">Link Details</h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Short Code</dt>
              <dd className="mt-1 flex items-center gap-2">
                <code className="text-lg font-mono text-blue-600">{link.code}</code>
                <button
                  onClick={() => copyToClipboard(`${baseUrl}/${link.code}`)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Copy link"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Clicks</dt>
              <dd className="mt-1 text-2xl font-bold text-gray-900">{link.clicks}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Target URL</dt>
              <dd className="mt-1">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-900 break-all"
                >
                  {link.url}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-gray-900">{formatDate(link.created_at)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Clicked</dt>
              <dd className="mt-1 text-gray-900">{formatDate(link.last_clicked_at)}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-black">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <a
              href={`${baseUrl}/${link.code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Test Redirect
            </a>
            <button
              onClick={() => copyToClipboard(`${baseUrl}/${link.code}`)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Copy Short Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

