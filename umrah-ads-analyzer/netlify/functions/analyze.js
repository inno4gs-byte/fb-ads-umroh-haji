exports.handler = async function (event, context) {
    // Only allow POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { budget, location, ageMin, ageMax, interestType } = JSON.parse(event.body);

        // SECURITY: Access Token is read from server-side environment variable
        // const accessToken = process.env.FB_ACCESS_TOKEN;

        // This is where you would normally fetch data from Facebook Graph API
        // For now, we move the mock logic here to simulate the secure calculation

        // --- SECURE BACKEND LOGIC ---
        const baseReachMap = {
            'all': 4500000,
            'jabar': 1200000,
            'jatim': 950000,
            'jateng': 800000,
            'banten': 600000,
            'sulsel': 400000,
            'sumut': 350000
        };

        let reach = baseReachMap[location] || 1000000;
        const budgetFactor = Math.min(budget / 50000, 2.5);
        reach = Math.floor(reach * budgetFactor);

        const result = {
            reach: reach,
            cpc: Math.floor(1500 + Math.random() * 2000),
            ctr: (0.8 + Math.random() * 1.5).toFixed(2),
            timestamp: new Date().toISOString(),
            source: "Secure Backend"
        };
        // -----------------------------

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
