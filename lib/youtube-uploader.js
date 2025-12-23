const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

/**
 * Initialize YouTube OAuth2 client
 */
function getOAuth2Client() {
  const OAuth2 = google.auth.OAuth2;

  const oauth2Client = new OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
  );

  if (process.env.YOUTUBE_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
    });
  }

  return oauth2Client;
}

/**
 * Upload video to YouTube
 */
async function uploadToYouTube(videoPath, metadata) {
  const auth = getOAuth2Client();
  const youtube = google.youtube({ version: 'v3', auth });

  const { title, description, tags } = metadata;

  console.log('Uploading to YouTube...');

  try {
    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: title || 'AI Generated Video',
          description: description || 'Created with AI automation',
          tags: tags || ['AI', 'automation', 'trending'],
          categoryId: '28', // Science & Technology
          defaultLanguage: 'en',
          defaultAudioLanguage: 'en',
        },
        status: {
          privacyStatus: 'public', // or 'private', 'unlisted'
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        body: fs.createReadStream(videoPath),
      },
    });

    const videoId = response.data.id;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    console.log('Upload successful!');
    console.log('Video URL:', videoUrl);

    return {
      videoId,
      videoUrl,
      response: response.data,
    };
  } catch (error) {
    console.error('Error uploading to YouTube:', error.message);
    throw error;
  }
}

/**
 * Get authorization URL for OAuth
 */
function getAuthorizationUrl() {
  const oauth2Client = getOAuth2Client();

  const scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });

  return url;
}

/**
 * Exchange authorization code for tokens
 */
async function getTokensFromCode(code) {
  const oauth2Client = getOAuth2Client();

  const { tokens } = await oauth2Client.getToken(code);

  return tokens;
}

module.exports = {
  uploadToYouTube,
  getAuthorizationUrl,
  getTokensFromCode,
  getOAuth2Client,
};
