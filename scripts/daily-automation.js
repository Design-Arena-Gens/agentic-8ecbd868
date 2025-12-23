require('dotenv').config();
const cron = require('node-cron');
const { getTrendingTopics, selectBestTopic } = require('../lib/trending');
const { createVideoFromTopic } = require('../lib/video-generator');
const { uploadToYouTube } = require('../lib/youtube-uploader');
const fs = require('fs');
const path = require('path');

/**
 * Main automation workflow
 */
async function runDailyAutomation() {
  console.log('\n========================================');
  console.log('Starting daily video automation...');
  console.log('Time:', new Date().toLocaleString());
  console.log('========================================\n');

  try {
    // Step 1: Get trending topics
    console.log('Step 1: Fetching trending topics...');
    const trends = await getTrendingTopics();
    console.log('Found trends:', trends.length);
    trends.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));

    // Step 2: Select best topic
    console.log('\nStep 2: Selecting best topic...');
    const selectedTopic = await selectBestTopic(trends);
    console.log('Selected topic:', selectedTopic);

    // Step 3: Generate video
    console.log('\nStep 3: Generating video...');
    const { videoPath, script } = await createVideoFromTopic(selectedTopic);
    console.log('Video created:', videoPath);

    // Step 4: Upload to YouTube
    console.log('\nStep 4: Uploading to YouTube...');
    const uploadResult = await uploadToYouTube(videoPath, {
      title: script.title,
      description: script.description,
      tags: script.tags,
    });

    console.log('\n========================================');
    console.log('SUCCESS!');
    console.log('Video URL:', uploadResult.videoUrl);
    console.log('========================================\n');

    // Log success
    logResult({
      success: true,
      topic: selectedTopic,
      videoUrl: uploadResult.videoUrl,
      videoId: uploadResult.videoId,
      timestamp: new Date().toISOString(),
    });

    return uploadResult;
  } catch (error) {
    console.error('\n========================================');
    console.error('ERROR:', error.message);
    console.error('========================================\n');

    // Log failure
    logResult({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    throw error;
  }
}

/**
 * Log results to file
 */
function logResult(result) {
  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, 'automation.log');
  const logEntry = JSON.stringify(result) + '\n';

  fs.appendFileSync(logFile, logEntry);
}

/**
 * Start cron job for daily automation
 */
function startCronJob() {
  const schedule = process.env.CRON_SCHEDULE || '0 9 * * *'; // Default: 9 AM daily

  console.log('Starting cron job with schedule:', schedule);

  cron.schedule(schedule, async () => {
    try {
      await runDailyAutomation();
    } catch (error) {
      console.error('Cron job failed:', error);
    }
  });

  console.log('Cron job started. Waiting for scheduled time...');
}

// Run immediately if called directly
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--now')) {
    // Run immediately
    runDailyAutomation()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  } else if (args.includes('--cron')) {
    // Start cron job
    startCronJob();
  } else {
    console.log('Usage:');
    console.log('  node scripts/daily-automation.js --now   # Run immediately');
    console.log('  node scripts/daily-automation.js --cron  # Start cron job');
  }
}

module.exports = {
  runDailyAutomation,
  startCronJob,
};
