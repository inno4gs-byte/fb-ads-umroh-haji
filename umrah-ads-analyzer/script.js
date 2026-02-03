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

async function runAnalysis() {
    // Get inputs
    const budget = document.getElementById('budget').value;
    const location = document.getElementById('location').value;
    const ageMin = document.getElementById('ageMin').value;
    const ageMax = document.getElementById('ageMax').value;
    const interestType = document.getElementById('interestFocus').value;

    // Show Loading
    const resultsSection = document.getElementById('results');
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth' });

    // Fetch Data (Async)
    const estimates = await getEstimates(location, budget, ageMin, ageMax, interestType);
    const interests = INTEREST_DATA[interestType];

    // Update Text Data
    updateRecommendations(ageMin, ageMax, location, interests);
    updateStats(estimates.reach, estimates.cpc);
    updateSegmentation(location);

    // Update Charts
    updateCharts(interestType);
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

function updateSegmentation(loc) {
    const cityList = document.getElementById('cityList');
    // Mock cities based on province
    let cities = ["Jakarta Selatan", "Bandung", "Surabaya", "Bekasi", "Tangerang"];
    if (loc === 'jabar') cities = ["Bandung", "Bekasi", "Bogor", "Depok", "Cirebon"];
    if (loc === 'jatim') cities = ["Surabaya", "Malang", "Sidoarjo", "Gresik", "Kediri"];

    cityList.innerHTML = cities.map(c => `<li>${c}</li>`).join('');

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
