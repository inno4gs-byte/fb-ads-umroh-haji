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
            'all': 85000000, // Total Muslim Audience on FB

            // Jabodetabek
            'jakarta': 7500000,
            'bogor': 2100000,
            'depok': 1800000,
            'bekasi': 2400000,
            'tangerang': 1900000,

            // Jawa Tier 1
            'bandung': 3200000,
            'semarang': 1500000,
            'yogyakarta': 1200000,
            'surabaya': 4100000,

            // Luar Jawa
            'medan': 2300000,
            'palembang': 1400000,
            'makassar': 1600000,
            'banjarmasin': 800000,
            'balikpapan': 750000,
            'pontianak': 650000,
            'pekanbaru': 900000,

            // Legacy
            'jabar': 12000000,
            'jatim': 11000000
        };

        // 2. Calculate Estimates
        let reach = baseReachMap[location] || 500000;
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
