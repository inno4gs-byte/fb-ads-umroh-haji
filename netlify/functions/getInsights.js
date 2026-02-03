// Netlify Function (Node.js)
// File: netlify/functions/getInsights.js

// Note: In Node 18+, 'fetch' is built-in.
// If using older versions, uncomment: const fetch = require("node-fetch");

exports.handler = async (event, context) => {
    try {
        // Ambil parameter dari query string (misalnya adAccountId)
        const adAccountId = event.queryStringParameters.adAccountId || process.env.FB_AD_ACCOUNT_ID;

        // Access Token disimpan aman di Environment Variable Netlify
        const accessToken = process.env.FB_ACCESS_TOKEN;

        if (!accessToken) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Missing Server-Side Configuration (FB_ACCESS_TOKEN)" })
            };
        }

        // Default fields requested by the user
        const fields = "campaign_name,impressions,clicks,ctr,cpc,spend,conversions,reach";
        const url = `https://graph.facebook.com/v19.0/${adAccountId}/insights?fields=${fields}&access_token=${accessToken}`;

        console.log("Fetching FB Data...");

        // Using native fetch (Node 18+) or node-fetch if installed
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: data.error.message }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message }),
        };
    }
};
