const Replicate = require('replicate');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Generate video script and prompts
 */
async function generateVideoScript(topic) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const scriptPrompt = `Create a compelling 30-60 second video script about: "${topic}"

Requirements:
- Hook viewers in first 3 seconds
- Educational and engaging
- Clear narrative structure
- Suitable for AI video generation
- Include scene descriptions

Format as JSON:
{
  "title": "Video title (under 100 chars)",
  "description": "Video description for YouTube (2-3 sentences)",
  "tags": ["tag1", "tag2", "tag3"],
  "scenes": [
    {"duration": 10, "narration": "text", "visual": "scene description"},
    ...
  ]
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: scriptPrompt }],
    temperature: 0.8,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(completion.choices[0].message.content);
}

/**
 * Generate video using AI (Replicate)
 */
async function generateVideo(script) {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_KEY,
  });

  console.log('Generating video with AI...');

  // Combine all scene visuals into a comprehensive prompt
  const videoPrompt = script.scenes
    .map(scene => scene.visual)
    .join('. ');

  try {
    // Using Stable Video Diffusion or similar model
    const output = await replicate.run(
      "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
      {
        input: {
          video_length: "14_frames_with_svd",
          sizing_strategy: "maintain_aspect_ratio",
          frames_per_second: 6,
          motion_bucket_id: 127,
          cond_aug: 0.02,
          decoding_t: 14,
          input_image: await generateThumbnailImage(script.scenes[0].visual)
        }
      }
    );

    return output;
  } catch (error) {
    console.error('Error with video generation, trying alternative method:', error.message);

    // Fallback: Generate image sequence and convert to video
    return await generateVideoFromImages(script);
  }
}

/**
 * Generate thumbnail image from prompt
 */
async function generateThumbnailImage(prompt) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Create a cinematic, high-quality image: ${prompt}`,
    size: "1024x1024",
    quality: "standard",
    n: 1,
  });

  return response.data[0].url;
}

/**
 * Fallback: Generate video from image sequence
 */
async function generateVideoFromImages(script) {
  const images = [];

  console.log('Generating images for each scene...');

  for (const scene of script.scenes) {
    const imageUrl = await generateThumbnailImage(scene.visual);
    images.push(imageUrl);
  }

  // Return first image as placeholder (in production, you'd use ffmpeg to create video)
  return images[0];
}

/**
 * Download video to local file
 */
async function downloadVideo(videoUrl, outputPath) {
  console.log('Downloading video...');

  const response = await axios({
    method: 'GET',
    url: videoUrl,
    responseType: 'stream',
  });

  const writer = fs.createWriteStream(outputPath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      console.log('Video downloaded successfully');
      resolve(outputPath);
    });
    writer.on('error', reject);
  });
}

/**
 * Main function to generate complete video
 */
async function createVideoFromTopic(topic) {
  console.log(`Creating video for topic: ${topic}`);

  // Generate script
  const script = await generateVideoScript(topic);
  console.log('Script generated:', script.title);

  // Generate video
  const videoUrl = await generateVideo(script);
  console.log('Video generated:', videoUrl);

  // Create output directory
  const outputDir = path.join(process.cwd(), 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Download video
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const videoPath = path.join(outputDir, `video-${timestamp}.mp4`);

  await downloadVideo(videoUrl, videoPath);

  return {
    videoPath,
    script,
  };
}

module.exports = {
  generateVideoScript,
  generateVideo,
  generateThumbnailImage,
  downloadVideo,
  createVideoFromTopic,
};
