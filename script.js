// Core Analysis Logic
const INTEREST_DATA = {
    general: ["Travel", "Umrah", "Hajj", "Islamic Studies", "Mosque", "Halal Tourism"],
    luxury: ["First Class Travel", "Luxury Resorts", "VIP Services", "Business Class", "Five Star Hotel"],
    economy: ["Budget Travel", "Discounts", "Promo Flights", "Backpacking", "Group Buying"]
};

// Async function to get data from Backend API or Fallback
async function getEstimates(location, budget, ageMin, ageMax, interestType) {
    try {
        // Try calling the Secure Backend
        const response = await fetch('/api/analyze', {
            method: 'POST',
            body: JSON.stringify({ budget, location, ageMin, ageMax, interestType }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error("Backend API unreachable");

        const data = await response.json();
        console.log("Using Secure Backend Data");
        return data;

    } catch (error) {
        console.warn("API Failed, using Local Fallback Mock:", error);

        // --- FALLBACK MOCK LOGIC (Local Dev) ---
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

        return {
            reach: reach,
            cpc: Math.floor(1500 + Math.random() * 2000),
            ctr: (0.8 + Math.random() * 1.5).toFixed(2)
        };
    }
}

let demographicsChart = null;

// --- 2026 CALCULATOR LOGIC ---
function runAnalysis() {
    const budget = document.getElementById('budget').value;
    const location = document.getElementById('location').value;
    const interestType = document.getElementById('interestFocus').value;

    // Simulation Config (Benchmarks 2026)
    const benchmarkCPC = 2500; // IDR
    const benchmarkConvRate = 0.05; // 5% Conversion Rate (Lead)
    const profitPerLead = 150000; // Estimate average profit value pending closing

    // 1. Calculate Metrics
    const estimatedClicks = Math.floor(budget / benchmarkCPC);
    const estimatedLeads = Math.floor(estimatedClicks * benchmarkConvRate);
    const cpr = estimatedLeads > 0 ? Math.floor(budget / estimatedLeads) : 0;
    const potentialRevenue = estimatedLeads * profitPerLead;
    const roas = budget > 0 ? (potentialRevenue / budget).toFixed(2) : 0;

    // 2. Fetch Backend Estimates (Mock or Real)
    // For now we simulate specific location reach
    const estimates = getEstimates(location, budget);

    // 3. Update UI
    // Show Results Section
    document.getElementById('results').classList.remove('hidden');

    // Update Stats
    updateStats(estimates.reach, estimates.cpc, cpr, roas, estimatedLeads);

    // Update City List
    updateSegmentation(location);

    // Deep Strategy Update
    updateStrategyVisuals(roas);

    // Charts Logic
    updateCharts(interestType);

    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

// --- DASHBOARD: REAL CAMPAIGN INSIGHTS ---
async function getCampaignInsights() {
    console.log("Fetching Real Campaign Insights...");

    // UI Feedback
    const btn = document.getElementById('btnLoadInsights');
    if (btn) btn.innerText = "Loading...";

    try {
        // Call our new Serverless Backend
        // Note: we use our configured redirect /api/insights -> /.netlify/functions/getInsights
        // Or direct path /.netlify/functions/getInsights
        const response = await fetch("/.netlify/functions/getInsights");
        const data = await response.json();

        if (data.error) {
            console.error("Backend Error:", data.error);
            alert("Gagal mengambil data: " + data.error);
            if (btn) btn.innerText = "Coba Lagi";
            return;
        }

        console.log("Campaign Insights Received:", data);
        renderDashboard(data);
        if (btn) btn.innerText = "Data Updated";

    } catch (err) {
        console.error("Fetch error:", err);
        // Fallback for Demo
        renderDashboardMock();
        if (btn) btn.innerText = "Demo Mode";
    }
}

function renderDashboard(apiData) {
    // If API returns empty data or error, use mock
    if (!apiData || !apiData.data || apiData.data.length === 0) {
        renderDashboardMock();
        return;
    }

    const stats = apiData.data[0]; // Assuming single campaign for demo

    // Update Dashboard DOM elements
    updateDashElement('dashLead', stats.conversions || 0);
    updateDashElement('dashCost', stats.cpc ? "Rp " + stats.cpc : "-");
    // More mapping...
}

function renderDashboardMock() {
    console.log("Rendering Mock Dashboard");
    // Existing static mock values are already valid, just logging
}

function updateDashElement(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
}

function updateRecommendations(min, max, loc, interests) {
    const list = document.getElementById('targetList');
    const locationName = document.querySelector(`#location option[value="${loc}"]`).text;

    list.innerHTML = `
        <li><strong>Lokasi:</strong> <span>${locationName} + Radius 40km</span></li>
        <li><strong>Usia:</strong> <span>${min} - ${max} Tahun (All Gender)</span></li>
        <li><strong>Bahasa:</strong> <span>Indonesian (Wajib)</span></li>
        <li><strong>Minat:</strong> <span>${interests.join(', ')}</span></li>
        <li><strong>Perilaku:</strong> <span>Frequent Travelers, Engaged Shoppers</span></li>
    `;
}

function updateStats(reach, cpc) {
    document.getElementById('reachValue').innerText = new Intl.NumberFormat('id-ID').format(reach);
    document.getElementById('cpcValue').innerText = "Rp " + new Intl.NumberFormat('id-ID').format(cpc);
}

function updateSegmentation(location) {
    const list = document.getElementById('cityList');
    list.innerHTML = "";

    // Mapping for Strategy Cities (Tier 1 & 2)
    const cityMap = {
        'all': ['Jakarta Selatan', 'Surabaya', 'Medan', 'Bandung', 'Makassar'],

        // Jabodetabek
        'jakarta': ['Jaksel (Pondok Indah)', 'Jakpus (Menteng)', 'Jaktim (Cibubur)', 'Jakbar (Puri)', 'Jakut (Kelapa Gading)'],
        'bogor': ['Sentul City', 'Bogor Kota', 'Cibinong', 'Yasmin', 'Baranangsiang'],
        'depok': ['Margonda', 'Cinere', 'Cibubur', 'Sawangan', 'GDC'],
        'bekasi': ['Summarecon', 'Harapan Indah', 'Kemang Pratama', 'Jatiasih', 'Galaxy'],
        'tangerang': ['BSD City', 'Bintaro', 'Gading Serpong', 'Alam Sutera', 'Cikokol'],

        // Jawa
        'bandung': ['Dago', 'Buah Batu', 'Antapani', 'Setiabudi', 'Arcamanik'],
        'semarang': ['Simpang Lima', 'Banyumanik', 'Tembalang', 'Candi', 'Ngaliyan'],
        'yogyakarta': ['Sleman', 'Kotabaru', 'Condongcatur', 'Bantul', 'Kaliurang'],
        'surabaya': ['Surabaya Barat', 'Gubeng', 'Rungkut', 'Pakuwon', 'Tegalsari'],

        // Luar Jawa
        'medan': ['Medan Polonia', 'Setiabudi', 'Medan Baru', 'Helvetia', 'Johor'],
        'palembang': ['Ilir Barat', 'Ilir Timur', 'Sako', 'Plaju', 'Kemuning'],
        'makassar': ['Panakkukang', 'Rappocini', 'Losari', 'Tamalanrea', 'Biringkanaya'],
        'banjarmasin': ['Banjarmasin Tengah', 'Kayu Tangi', 'Gatot Subroto', 'Sultan Adam', 'A. Yani'],
        'balikpapan': ['Balikpapan Baru', 'MT Haryono', 'Sudirman', 'Balikpapan Selatan', 'Gunung Sari'],
        'pontianak': ['Pontianak Selatan', 'Kota Baru', 'Ayani Mega Mall', 'Sungai Jawi', 'Tanjung Pura'],
        'pekanbaru': ['Sudirman', 'Panam', 'Rumbai', 'Sukajadi', 'Marpoyan'],

        // Legacy Fallback
        'jabar': ['Bandung', 'Bekasi', 'Depok', 'Bogor', 'Cimahi'],
        'jatim': ['Surabaya', 'Malang', 'Sidoarjo', 'Kediri', 'Gresik']
    };

    const topCities = cityMap[location] || ['Pusat Kota', 'Kawasan Perumahan Elite', 'Area Bisnis', 'Suburban Premium', 'Kawasan Masjid Besar'];

    topCities.forEach(city => {
        const li = document.createElement('li');
        li.innerText = city;
        list.appendChild(li);
    });

    const tags = document.getElementById('behaviorTags');
    const behaviors = ["Mengakses via Android (80%)", "Jam Aktif: 19.00 - 21.00", "Suka Video Konten", "Pembayaran: Transfer Bank"];
    tags.innerHTML = behaviors.map(b => `<span class="tag">${b}</span>`).join('');
}

function updateCharts(type) {
    const ctx = document.getElementById('demographicsChart').getContext('2d');

    if (demographicsChart) {
        demographicsChart.destroy();
    }

    // Pie chart logic
    demographicsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Wanita', 'Pria'],
            datasets: [{
                data: [55, 45],
                backgroundColor: ['#D4AF37', '#0F5132'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function scrollToOptimization() {
    document.getElementById('optimization').scrollIntoView({ behavior: 'smooth' });
}
