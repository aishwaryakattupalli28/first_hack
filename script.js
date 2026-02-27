const years = ['2021', '2022', '2023', '2024', '2025'];

/* =========================
   BASE DATASET
========================= */

const baseDataset = {
    biryani: {
        Paradise: [350, 380, 400, 420, 450],
        Bawarchi: [310, 330, 350, 370, 380],
        ShahGhouse: [370, 380, 400, 410, 420],
        CafeBahar: [340, 360, 380, 390, 400],
        Mehfil: [300, 310, 330, 350, 360],
        AlphaHotel: [320, 340, 360, 380, 390],
        PistaHouse: [390, 410, 430, 460, 480]
    },
    vegBiryani: {
        Paradise: [280, 300, 320, 340, 360],
        Bawarchi: [250, 270, 290, 310, 330],
        ShahGhouse: [260, 280, 300, 320, 340],
        CafeBahar: [240, 260, 280, 300, 320],
        Mehfil: [220, 230, 250, 270, 290],
        AlphaHotel: [230, 250, 270, 290, 310],
        PistaHouse: [300, 320, 340, 360, 380]
    },
    butterChicken: {
        Paradise: [420, 440, 460, 480, 520],
        Bawarchi: [380, 400, 420, 430, 450],
        ShahGhouse: [400, 420, 450, 470, 490],
        CafeBahar: [370, 390, 410, 430, 450],
        Mehfil: [350, 360, 380, 400, 420],
        AlphaHotel: [360, 380, 400, 420, 440],
        PistaHouse: [450, 470, 490, 520, 550]
    },
    chicken65: {
        Paradise: [280, 300, 320, 350, 370],
        Bawarchi: [250, 270, 290, 310, 330],
        ShahGhouse: [260, 280, 300, 320, 340],
        CafeBahar: [240, 260, 280, 300, 320],
        Mehfil: [220, 230, 250, 270, 290],
        AlphaHotel: [230, 250, 270, 290, 310],
        PistaHouse: [300, 320, 340, 360, 380]
    }
};

/* =========================
   RATINGS (Display Only)
========================= */

const restaurantRatings = {
    Paradise: 4.3,
    Bawarchi: 4.1,
    ShahGhouse: 4.2,
    CafeBahar: 4.0,
    Mehfil: 3.9,
    AlphaHotel: 3.8,
    PistaHouse: 4.4
};

/* =========================
   CITY MULTIPLIER
========================= */

const cityMultiplier = {
    hyderabad: 1.00,
    bangalore: 1.12,
    mumbai: 1.20,
    delhi: 1.10
};

/* =========================
   GLOBAL CHART VARIABLES
========================= */

let trendChart;
let revenueChart;

/* =========================
   HELPER FUNCTIONS
========================= */

function getSegment(price) {
    if (price >= 500) return "Premium";
    if (price >= 400) return "Mid-Range";
    return "Economy";
}

function getZomatoPrice(price) {
    return Math.round(price * 1.15 + 15);
}

function getSwiggyPrice(price) {
    return Math.round(price * 1.18 + 20);
}

/* =========================
   SMART REVENUE OPTIMIZATION
========================= */

function optimizePrice(currentPrice) {

    const baseOrders = 1000;
    let bestRevenue = currentPrice * baseOrders;
    let bestPrice = currentPrice;

    for (let i = -10; i <= 10; i++) {

        let candidatePrice = currentPrice * (1 + i / 100);
        let priceChangePercent = (candidatePrice - currentPrice) / currentPrice;

        let adjustedOrders = baseOrders * (1 - (priceChangePercent * 0.5));

        if (adjustedOrders < 600) adjustedOrders = 600;

        let revenue = candidatePrice * adjustedOrders;

        if (revenue > bestRevenue) {
            bestRevenue = revenue;
            bestPrice = candidatePrice;
        }
    }

    return {
        suggestedPrice: Math.round(bestPrice),
        revenueGain: Math.round(bestRevenue - (currentPrice * baseOrders))
    };
}

/* =========================
   MAIN DASHBOARD FUNCTION
========================= */

function updateDashboard() {

    const dish = document.getElementById("dishSelect").value;
    const city = document.getElementById("citySelect").value;

    const multiplier = cityMultiplier[city];
    const baseData = baseDataset[dish];

    const tableBody = document.getElementById("priceTableBody");

    tableBody.innerHTML = "";

    const adjustedData = {};

    Object.keys(baseData).forEach(name => {
        adjustedData[name] = baseData[name].map(price =>
            Math.round(price * multiplier)
        );
    });

    /* KPI VARIABLES */
    let totalRevenueGain = 0;
    let totalPrice = 0;
    let totalRating = 0;
    let highestPrice = 0;
    let premiumLeader = "";

    Object.keys(adjustedData).forEach(name => {

        const current = adjustedData[name].slice(-1)[0];
        const zomato = getZomatoPrice(current);
        const swiggy = getSwiggyPrice(current);
        const optimization = optimizePrice(current);
        const rating = restaurantRatings[name];

        totalRevenueGain += optimization.revenueGain;
        totalPrice += current;
        totalRating += rating;

        if (current > highestPrice) {
            highestPrice = current;
            premiumLeader = name;
        }

        tableBody.innerHTML += `
            <tr>
                <td>${name}</td>
                <td style="color:#ffb703;font-weight:bold;">${rating}</td>
                <td>${current}</td>
                <td>${zomato}</td>
                <td>${swiggy}</td>
                <td>${getSegment(current)}</td>
                <td style="color:#2a9d8f;font-weight:bold;">
                    ${optimization.suggestedPrice}
                </td>
                <td style="color:#2a9d8f;font-weight:bold;">
                    +${optimization.revenueGain}
                </td>
            </tr>
        `;
    });

    /* =========================
       UPDATE KPI CARDS
    ========================= */

    const count = Object.keys(adjustedData).length;

    document.getElementById("avgPrice").innerText =
        "₹" + Math.round(totalPrice / count);

    document.getElementById("avgRating").innerText =
        (totalRating / count).toFixed(1) + " ⭐";

    document.getElementById("totalRevenue").innerText =
        "₹" + totalRevenueGain;

    document.getElementById("premiumLeader").innerText =
        premiumLeader;

    /* =========================
       TREND CHART
    ========================= */

    if (trendChart) trendChart.destroy();

    trendChart = new Chart(document.getElementById('trendChart'), {
        type: 'line',
        data: {
            labels: years,
            datasets: Object.keys(adjustedData).map((name, index) => ({
                label: name,
                data: adjustedData[name],
                borderColor: `hsl(${index * 50}, 70%, 50%)`,
                tension: 0.4
            }))
        }
    });

    /* =========================
       REVENUE GAIN BAR CHART
    ========================= */

    if (revenueChart) revenueChart.destroy();

    revenueChart = new Chart(document.getElementById('revenueChart'), {
        type: 'bar',
        data: {
            labels: Object.keys(adjustedData),
            datasets: [{
                label: 'Revenue Gain',
                data: Object.keys(adjustedData).map(name =>
                    optimizePrice(adjustedData[name].slice(-1)[0]).revenueGain
                )
            }]
        }
    });
}

/* =========================
   EVENT LISTENERS
========================= */

document.getElementById("dishSelect")
    .addEventListener("change", updateDashboard);

document.getElementById("citySelect")
    .addEventListener("change", updateDashboard);

/* INITIAL LOAD */
updateDashboard();










