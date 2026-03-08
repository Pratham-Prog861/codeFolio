const axios = require('axios');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// This requires the service account key which is available in your workspace
// We assume it's located two directories up, at the root of the project
try {
    const serviceAccount = require('../../codefolio-ef9fc-firebase-adminsdk-fbsvc-c3e5153b48.json');
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
} catch (error) {
    console.error("Failed to initialize Firebase Admin SDK. Make sure the service account file exists and the path is correct.");
    console.error(error);
    process.exit(1);
}

const db = admin.firestore();

/**
 * Fetch all Expo Push Tokens from Firestore
 */
async function getPushTokens() {
    const tokens = [];
    try {
        const snapshot = await db.collection('push_tokens').get();
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.token) {
                tokens.push(data.token);
            }
        });
        console.log(`[Firebase] Retrieved ${tokens.length} push tokens.`);
        return tokens;
    } catch (error) {
        console.error("[Firebase] Error fetching push tokens:", error);
        return [];
    }
}

/**
 * Fetch the most trending GitHub repository created in the last 7 days.
 */
async function fetchTrendingRepo() {
    try {
        // Calculate the date 7 days ago
        const date = new Date();
        date.setDate(date.getDate() - 7);
        const dateString = date.toISOString().split('T')[0];

        console.log(`\n[GitHub] Fetching trending repositories created after ${dateString}...`);

        // Search GitHub for repos created > date, sorted by stars
        const response = await axios.get(
            `https://api.github.com/search/repositories?q=created:>${dateString}&sort=stars&order=desc`,
            {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                }
            }
        );

        if (response.data && response.data.items && response.data.items.length > 0) {
            const topRepo = response.data.items[0];
            return {
                name: topRepo.name,
                owner: topRepo.owner.login,
                starCount: topRepo.stargazers_count,
                url: topRepo.html_url,
                // Using owner avatar URL as fallback since Android has much better compatibility with static avatar URLs
                // compared to dynamic opengraph URLs which sometimes fail to load.
                imageUrl: topRepo.owner.avatar_url
            };
        } else {
            throw new Error("No repositories found in the given timeframe.");
        }
    } catch (error) {
        console.error("[GitHub] Error fetching trending repo:");
        if (error.response) {
            console.error(error.response.data);
        } else {
            console.error(error.message);
        }
        throw error;
    }
}

/**
 * Send push notifications using the Expo Push API.
 */
async function sendPushNotification(tokens, title, body, imageUrl, url) {
    if (tokens.length === 0) {
        console.log("[Expo] No tokens found. Skipping push notification.");
        return;
    }

    try {
        const messages = tokens.map((token) => ({
            to: token,
            sound: 'default',
            title: title,
            body: body,
            data: { url: url },
            image: imageUrl,
        }));

        console.log(`[Expo] Sending push notifications to ${messages.length} device(s)...`);

        const response = await axios.post(
            'https://exp.host/--/api/v2/push/send',
            messages,
            {
                headers: {
                    'Accept': 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log("[Expo] API Response:", response.data);

        // Filter out errors like DeviceNotRegistered
        if (response.data && response.data.data) {
            response.data.data.forEach(async (receipt, index) => {
                if (receipt.status === 'error' && receipt.details && receipt.details.error === 'DeviceNotRegistered') {
                    const invalidToken = tokens[index];
                    console.log(`[Expo] Token ${invalidToken} is no longer registered. Removing from database...`);
                    await db.collection('push_tokens').doc(invalidToken).delete();
                }
            });
        }

    } catch (error) {
        console.error("[Expo] Error sending push notification via Expo:", error.message);
        throw error;
    }
}

/**
 * Main task executing both GitHub fetch and Expo push.
 */
async function runTrendingTask() {
    console.log("-----------------------------------------");
    console.log(`Starting trending repo push task at ${new Date().toISOString()}...`);
    try {
        const repo = await fetchTrendingRepo();
        console.log(`[GitHub] Found top trending repo: ${repo.owner}/${repo.name} (⭐ ${repo.starCount})`);

        const tokens = await getPushTokens();
        const title = '🔥 Trending Repo Today';
        const body = `${repo.owner}/${repo.name} ⭐ ${repo.starCount}`;

        await sendPushNotification(tokens, title, body, repo.imageUrl, repo.url);

        console.log("Task completed successfully.");
        console.log("-----------------------------------------\n");
    } catch (_error) {
        console.error("Task failed to complete.");
        console.log("-----------------------------------------\n");
    }
}

/**
 * Send a notification when a new resume is created.
 * @param {string} resumeUsername - The username for the resume 
 * @param {string} resumeUrl - The URL of the created resume
 */
async function sendResumeCreationPush(resumeUsername, resumeUrl) {
    console.log("-----------------------------------------");
    console.log(`Starting resume creation push task for: ${resumeUsername}`);
    try {
        const tokens = await getPushTokens();
        const title = '📄 New GitHub Resume Created!';
        const body = `Check out the new resume crafted for ${resumeUsername} 🚀`;
        // We can use a generic resume icon or the user's avatar
        const imageUrl = `https://github.com/${resumeUsername}.png`;

        await sendPushNotification(tokens, title, body, imageUrl, resumeUrl);

        console.log("Resume notification sent successfully.");
        console.log("-----------------------------------------\n");
    } catch (error) {
        console.error("Resume notification failed:", error.message);
        console.log("-----------------------------------------\n");
    }
}

// Check if running in trending one-off mode
if (process.argv.includes('--run-now')) {
    runTrendingTask().then(() => process.exit(0));
}

// Check if running resume mode (e.g. node sendPush.js --resume username url)
if (process.argv.includes('--resume')) {
    const usernameIndex = process.argv.indexOf('--resume') + 1;
    const urlIndex = process.argv.indexOf('--resume') + 2;
    const username = process.argv[usernameIndex];
    const url = process.argv[urlIndex] || `https://codefolio.com/${username}`;

    sendResumeCreationPush(username, url).then(() => process.exit(0));
}

module.exports = {
    runTrendingTask,
    sendResumeCreationPush
};
