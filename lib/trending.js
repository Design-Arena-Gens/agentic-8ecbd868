const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Get trending topics from multiple sources
 */
async function getTrendingTopics() {
  const trends = [];

  try {
    // Method 1: YouTube Trending (scrape)
    const youtubeResponse = await axios.get('https://www.youtube.com/feed/trending');
    const $ = cheerio.load(youtubeResponse.data);

    // Extract trending video titles
    const youtubeTrends = [];
    $('a#video-title').each((i, el) => {
      if (i < 10) {
        youtubeTrends.push($(el).attr('title'));
      }
    });

    trends.push(...youtubeTrends.filter(Boolean));
  } catch (error) {
    console.error('Error fetching YouTube trends:', error.message);
  }

  try {
    // Method 2: Google Trends via SerpAPI (if configured)
    if (process.env.SERPAPI_KEY) {
      const serpApiResponse = await axios.get('https://serpapi.com/search', {
        params: {
          engine: 'google_trends_trending_now',
          api_key: process.env.SERPAPI_KEY,
          geo: 'US',
        }
      });

      if (serpApiResponse.data.daily_searches) {
        serpApiResponse.data.daily_searches.forEach(day => {
          day.searches?.slice(0, 5).forEach(search => {
            trends.push(search.query);
          });
        });
      }
    }
  } catch (error) {
    console.error('Error fetching Google Trends:', error.message);
  }

  // Fallback topics if no trends found
  if (trends.length === 0) {
    trends.push(
      'Latest Technology News',
      'AI Innovations',
      'Space Exploration Updates',
      'Health and Wellness Tips',
      'Environmental Conservation'
    );
  }

  return [...new Set(trends)].slice(0, 10);
}

/**
 * Select best topic for video creation
 */
async function selectBestTopic(trends) {
  const OpenAI = require('openai');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `Given these trending topics, select the ONE best topic for creating a short, engaging AI-generated video (30-60 seconds):

${trends.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Consider:
- Visual appeal for video
- Broad audience interest
- Ability to explain in 30-60 seconds
- Suitability for AI generation

Respond with ONLY the selected topic text, nothing else.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  return completion.choices[0].message.content.trim();
}

module.exports = {
  getTrendingTopics,
  selectBestTopic,
};
