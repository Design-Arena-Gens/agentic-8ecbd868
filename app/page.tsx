'use client';

import { useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [logs, setLogs] = useState<any[]>([]);

  const runAutomation = async () => {
    setLoading(true);
    setStatus('Starting automation...');
    setVideoUrl('');

    try {
      const response = await fetch('/api/run-automation', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setStatus('Success! Video uploaded to YouTube');
        setVideoUrl(data.videoUrl);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      fetchLogs();
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs');
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const setupYouTube = () => {
    window.open('/api/youtube/auth', '_blank');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            AI Video Automation System
          </h1>
          <p className="text-gray-600 mb-6">
            Automatically find trending topics, generate AI videos, and upload to YouTube daily
          </p>

          <div className="flex gap-4 mb-8">
            <button
              onClick={runAutomation}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md"
            >
              {loading ? 'Running...' : 'Run Automation Now'}
            </button>

            <button
              onClick={setupYouTube}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md"
            >
              Setup YouTube OAuth
            </button>

            <button
              onClick={fetchLogs}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md"
            >
              Refresh Logs
            </button>
          </div>

          {status && (
            <div className={`p-4 rounded-lg mb-4 ${
              status.includes('Error')
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {status}
            </div>
          )}

          {videoUrl && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="font-semibold mb-2">Video uploaded successfully!</p>
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                {videoUrl}
              </a>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">1</div>
              <h3 className="font-semibold text-gray-800 mb-2">Find Trends</h3>
              <p className="text-sm text-gray-600">
                Scans YouTube, Google Trends, and other sources for trending topics
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">2</div>
              <h3 className="font-semibold text-gray-800 mb-2">Generate Script</h3>
              <p className="text-sm text-gray-600">
                Uses GPT-4 to create engaging video scripts with scene descriptions
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-lg">
              <div className="text-3xl font-bold text-pink-600 mb-2">3</div>
              <h3 className="font-semibold text-gray-800 mb-2">Create Video</h3>
              <p className="text-sm text-gray-600">
                Generates video using AI models like DALL-E 3 and Stable Video Diffusion
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg">
              <div className="text-3xl font-bold text-red-600 mb-2">4</div>
              <h3 className="font-semibold text-gray-800 mb-2">Upload to YouTube</h3>
              <p className="text-sm text-gray-600">
                Automatically uploads with optimized title, description, and tags
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h2>
          {logs.length === 0 ? (
            <p className="text-gray-600">No activity yet. Run the automation to see logs.</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    log.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-semibold ${
                      log.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {log.success ? '✓ Success' : '✗ Failed'}
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {log.topic && (
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Topic:</strong> {log.topic}
                    </p>
                  )}
                  {log.videoUrl && (
                    <a
                      href={log.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      View video →
                    </a>
                  )}
                  {log.error && (
                    <p className="text-sm text-red-700">
                      <strong>Error:</strong> {log.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Setup Instructions</h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold mb-2">1. Configure API Keys</h3>
              <p className="text-sm">Set up your environment variables in <code className="bg-gray-100 px-2 py-1 rounded">.env</code>:</p>
              <ul className="list-disc ml-6 mt-2 text-sm space-y-1">
                <li><code>OPENAI_API_KEY</code> - For GPT-4 script generation</li>
                <li><code>REPLICATE_API_KEY</code> - For AI video generation</li>
                <li><code>YOUTUBE_CLIENT_ID</code> & <code>YOUTUBE_CLIENT_SECRET</code> - From Google Cloud Console</li>
                <li><code>SERPAPI_KEY</code> - Optional, for Google Trends</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Setup YouTube OAuth</h3>
              <p className="text-sm">Click "Setup YouTube OAuth" above to authorize the app to upload videos to your channel.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Schedule Daily Uploads</h3>
              <p className="text-sm">Run the cron job:</p>
              <code className="block bg-gray-100 px-4 py-2 rounded mt-2 text-sm">
                node scripts/daily-automation.js --cron
              </code>
            </div>

            <div>
              <h3 className="font-semibold mb-2">4. Deploy to Vercel</h3>
              <p className="text-sm">Deploy with environment variables configured for automated daily uploads.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
