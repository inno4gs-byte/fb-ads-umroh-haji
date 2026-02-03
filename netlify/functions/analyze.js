exports.handler = async function (event, context) {
    // Only allow POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { budget, location, ageMin, ageMax, interestType } = JSON.parse(event.body);

        // --- PRODUCTION: FACEBOOK GRAPH API INTEGRATION ---

        /* 
        // 1. Get Access Token from Environment Variable (Never hardcode!)
        const accessToken = process.env.FB_ACCESS_TOKEN;
        const adAccountId = process.env.FB_AD_ACCOUNT_ID; // Add this to your Env Vars

        // 2. Define Fields requested by User
        const fields = "campaign_name,impressions,clicks,ctr,cpc,spend,conversions,reach";
        
        // 3. Make the Request
        // Note: You might need to npm install node-fetch if your environment doesn't support global fetch
        const fbUrl = `https://graph.facebook.com/v19.0/act_${adAccountId}/insights?fields=${fields}&access_token=${accessToken}`;
        
        const response = await fetch(fbUrl);
        const fbData = await response.json();

        if (fbData.error) throw new Error(fbData.error.message);
        
        // Map FB Data to our format
        const result = {
            reach: fbData.data[0].reach,
            cpc: fbData.data[0].cpc,
            ctr: fbData.data[0].ctr,
            source: "Facebook Graph API"
        };
        */

        // --- SIMULATION (For Demo/No Token) ---

        // 1. Base Logic
        const baseReachMap = {
            'all': 4500000,
            'jabar': 1200000,
            'jatim': 950000,
            'jateng': 800000,
            'banten': 600000,
            'sulsel': 400000,
            'sumut': 350000
        };

        // 2. Calculate Estimates
        let reach = baseReachMap[location] || 1000000;
        const budgetFactor = Math.min(budget / 50000, 2.5);
        reach = Math.floor(reach * budgetFactor);

        // 3. Mock Insights Data (Simulating the 'fields' requested)
        const result = {
            campaign_name: "Umroh Season 2024",
            reach: reach,
            impressions: Math.floor(reach * 1.5),
            clicks: Math.floor(reach * 0.02),
            cpc: Math.floor(1500 + Math.random() * 2000),
            ctr: (0.8 + Math.random() * 1.5).toFixed(2),
            spend: budget,
            conversions: Math.floor(reach * 0.001),
            timestamp: new Date().toISOString(),
            source: "Secure Backend (Simulation)"
        };

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(result)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to process analysis", details: error.message })
        };
    }
};
