// ======================================================================
// Coffeelytics - Financial Dashboard Application
// ======================================================================

// Register Chart.js datalabels plugin globally
Chart.register(ChartDataLabels);

// Global state
let activeTab = 'structure';
let activeScenario = 'base'; // 'weak' | 'base' | 'good'
let chartInstance = null;
let costChartInstance = null;
let equityChartInstance = null;
let editingShareholderId = null;
let shareholders = [
    { id: 1, name: "Báº¡n (Cá»• Ä‘Ã´ng sÃ¡ng láº­p)", contribution: 80000000, role: "operate" }
];

// ======================================================================
// Scenario Selection Logic (Weak / Base / Good)
// ======================================================================
window.selectScenario = function(scenarioType) {
    activeScenario = scenarioType;
    
    // Update pills
    document.querySelectorAll('.pill-btn').forEach(btn => btn.classList.remove('active'));
    const pill = document.getElementById(`pill-${scenarioType}`);
    if (pill) pill.classList.add('active');
    
    // Update forecast cards
    document.querySelectorAll('.forecast-card').forEach(card => card.classList.remove('active'));
    const card = document.getElementById(`card-forecast-${scenarioType}`);
    if (card) card.classList.add('active');

    // Update scenario input card in accordion
    document.querySelectorAll('.scenario-input-card').forEach(c => c.classList.remove('active'));
    const inputCard = document.querySelector(`.scenario-input-card.level-${scenarioType}`);
    if (inputCard) inputCard.classList.add('active');

    updateDashboard();
};

// ======================================================================
// UI Accordion Logic
// ======================================================================
window.toggleAccordion = function(header) {
    const item = header.parentElement;
    item.classList.toggle('active');
    const content = item.querySelector('.accordion-content');
    if (item.classList.contains('active')) {
        content.style.display = 'block';
    } else {
        content.style.display = 'none';
    }
};

window.toggleAllAccordions = function(expand) {
    document.querySelectorAll('.accordion-item').forEach(item => {
        const content = item.querySelector('.accordion-content');
        if (expand) {
            item.classList.add('active');
            if (content) content.style.display = 'block';
        } else {
            item.classList.remove('active');
            if (content) content.style.display = 'none';
        }
    });
};

window.applyBusinessPreset = function(presetType) {
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.preset === presetType) btn.classList.add('active');
    });

    let data = {};
    let newShareholders = [];

    if (presetType === 'takeaway') {
        data = {
            'inp-deposit': 10000000,
            'inp-renovate': 8000000,
            'inp-equipment': 25000000,
            'inp-raw-start': 5000000,
            'inp-decor-misc': 2000000,
            'inp-depr-years': 3,
            'inp-buffer': 15000000,
            'inp-loan': 20000000,
            'inp-interest': 12,
            'inp-term': 12,
            'inp-rent': 4000000,
            'inp-utilities': 1200000,
            'inp-shift-morning-staff': 1,
            'inp-shift-morning-rate': 18000,
            'inp-shift-afternoon-staff': 1,
            'inp-shift-afternoon-rate': 18000,
            'inp-shift-evening-staff': 0,
            'inp-shift-evening-rate': 20000,
            'inp-ft-manager-count': 0,
            'inp-ft-manager-salary': 0,
            'inp-weekend-multiplier': 1.1,
            'inp-commission-rate': 0,
            'inp-misc': 300000,
            'inp-price': 22000,
            'inp-cost-pct': 25,
            'inp-vol-weak': 40,
            'inp-vol-base': 65,
            'inp-vol-good': 100,
            'inp-discount-rate': 15,
            'inp-growth-rev': 10,
            'inp-growth-opex': 5,
            'inp-div-retained': 20,
            'inp-div-payout': 80
        };
        newShareholders = [
            { id: 1, name: "Chá»§ quÃ¡n", contribution: 45000000, role: "operate" }
        ];
    } else if (presetType === 'garden') {
        data = {
            'inp-deposit': 36000000,
            'inp-renovate': 50000000,
            'inp-equipment': 80000000,
            'inp-raw-start': 20000000,
            'inp-decor-misc': 14000000,
            'inp-depr-years': 5,
            'inp-buffer': 50000000,
            'inp-loan': 100000000,
            'inp-interest': 12,
            'inp-term': 24,
            'inp-rent': 14000000,
            'inp-utilities': 4500000,
            'inp-shift-morning-staff': 2,
            'inp-shift-morning-rate': 20000,
            'inp-shift-afternoon-staff': 2,
            'inp-shift-afternoon-rate': 20000,
            'inp-shift-evening-staff': 2,
            'inp-shift-evening-rate': 22000,
            'inp-ft-manager-count': 1,
            'inp-ft-manager-salary': 8000000,
            'inp-weekend-multiplier': 1.2,
            'inp-commission-rate': 2,
            'inp-misc': 1500000,
            'inp-price': 35000,
            'inp-cost-pct': 28,
            'inp-vol-weak': 90,
            'inp-vol-base': 150,
            'inp-vol-good': 220,
            'inp-discount-rate': 15,
            'inp-growth-rev': 15,
            'inp-growth-opex': 6,
            'inp-div-retained': 25,
            'inp-div-payout': 75
        };
        newShareholders = [
            { id: 1, name: "NhÃ  sÃ¡ng láº­p (Váº­n hÃ nh)", contribution: 100000000, role: "operate" },
            { id: 2, name: "Cá»• Ä‘Ã´ng Ä‘áº§u tÆ° A", contribution: 50000000, role: "invest" }
        ];
    } else {
        // standard (QuÃ¡n mÃ¡y láº¡nh chuáº©n 50m2)
        data = {
            'inp-deposit': 18000000,
            'inp-renovate': 18000000,
            'inp-equipment': 40000000,
            'inp-raw-start': 10000000,
            'inp-decor-misc': 4000000,
            'inp-depr-years': 5,
            'inp-buffer': 30000000,
            'inp-loan': 40000000,
            'inp-interest': 12,
            'inp-term': 12,
            'inp-rent': 6000000,
            'inp-utilities': 2200000,
            'inp-shift-morning-staff': 1,
            'inp-shift-morning-rate': 18000,
            'inp-shift-afternoon-staff': 1,
            'inp-shift-afternoon-rate': 18000,
            'inp-shift-evening-staff': 1,
            'inp-shift-evening-rate': 20000,
            'inp-ft-manager-count': 0,
            'inp-ft-manager-salary': 7000000,
            'inp-weekend-multiplier': 1.15,
            'inp-commission-rate': 0,
            'inp-misc': 500000,
            'inp-price': 28000,
            'inp-cost-pct': 26,
            'inp-vol-weak': 55,
            'inp-vol-base': 85,
            'inp-vol-good': 130,
            'inp-discount-rate': 15,
            'inp-growth-rev': 12,
            'inp-growth-opex': 5,
            'inp-div-retained': 20,
            'inp-div-payout': 80
        };
        newShareholders = [
            { id: 1, name: "Báº¡n (Cá»• Ä‘Ã´ng sÃ¡ng láº­p)", contribution: 80000000, role: "operate" }
        ];
    }

    setInputsData(data);
    shareholders = newShareholders;
    
    renderShareholders();
    updateDashboard();

    if (typeof confetti === 'function') {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    }
};
// ======================================================================
// Formatting helpers
// ======================================================================
function formatVND(value) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value) {
    if (value === undefined || value === null) return "";
    let str = value.toString();
    let isNegative = str.startsWith('-');
    let num = str.replace(/\D/g, '');
    if (!num) return isNegative ? "-" : "";
    let formatted = num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (isNegative ? "-" : "") + formatted;
}

function parseNumber(value) {
    if (typeof value === 'number') return isNaN(value) ? 0 : value;
    if (value === undefined || value === null) return 0;
    let str = value.toString();
    let isNegative = str.startsWith('-');
    let num = parseInt(str.replace(/\./g, '').replace(/,/g, '').replace(/-/g, '')) || 0;
    return isNegative ? -num : num;
}

// ======================================================================
// Number Animation Effect
// ======================================================================
function animateValue(obj, start, end, duration, formatFn = formatShortVND) {
    if (!obj) return;
    if (obj._animId) {
        cancelAnimationFrame(obj._animId);
    }
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentVal = Math.floor(progress * (end - start) + start);
        obj.innerHTML = formatFn(currentVal);
        if (progress < 1) {
            obj._animId = window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = formatFn(end);
            obj._animId = null;
        }
    };
    obj._animId = window.requestAnimationFrame(step);
}


function formatShortVND(value) {
    let isNegative = value < 0;
    let absVal = Math.abs(value);
    let formatted = '';
    if (absVal >= 1000000) {
        formatted = (absVal / 1000000).toFixed(1) + 'M Ä‘';
    } else if (absVal >= 1000) {
        formatted = (absVal / 1000).toFixed(0) + 'k Ä‘';
    } else {
        formatted = absVal + ' Ä‘';
    }
    return (isNegative ? '-' : '') + formatted;
}

// Short format for chart labels (compact)
function formatChartLabel(value) {
    let isNegative = value < 0;
    let absVal = Math.abs(value);
    let formatted = '';
    if (absVal >= 1000000) {
        formatted = (absVal / 1000000).toFixed(1) + 'M';
    } else if (absVal >= 1000) {
        formatted = (absVal / 1000).toFixed(0) + 'k';
    } else {
        formatted = absVal.toFixed(0);
    }
    return (isNegative ? '-' : '') + formatted;
}

// ======================================================================
// Standard EMI loan payment calculation
// ======================================================================
function calculateEMI(P, r_annual, N) {
    if (P <= 0 || N <= 0) return 0;
    if (r_annual <= 0) return P / N;
    let i = (r_annual / 12) / 100;
    return P * i * Math.pow(1 + i, N) / (Math.pow(1 + i, N) - 1);
}

// ======================================================================
// Tax calculation based on Vietnamese tax law 2025
// Doanh nghiá»‡p: Thuáº¿ TNDN tÃ­nh trÃªn lá»£i nhuáº­n
//   - DT nÄƒm â‰¤ 1 tá»·: miá»…n thuáº¿ TNDN
//   - DT nÄƒm â‰¤ 3 tá»·: 15%
//   - DT nÄƒm â‰¤ 50 tá»·: 17%
//   - DT nÄƒm > 50 tá»·: 20%
// User can override with manual % in inp-tax-rate
// ======================================================================
function calculateTax(monthlyProfit, annualRevenue) {
    if (monthlyProfit <= 0) return 0;
    const dynamicTaxRate = getSuggestedTaxRate(annualRevenue);
    return monthlyProfit * (dynamicTaxRate / 100);
}

function getSuggestedTaxRate(annualRevenue) {
    if (annualRevenue <= 1000000000) return 0; // miá»…n thuáº¿
    if (annualRevenue <= 3000000000) return 15;
    if (annualRevenue <= 50000000000) return 17;
    return 20;
}

function calculateMonthlySalary(rev = 0) {
    const shiftMorningStaff = parseNumber(document.getElementById('inp-shift-morning-staff')?.value || '0');
    const shiftMorningRate = parseNumber(document.getElementById('inp-shift-morning-rate')?.value || '0');
    const shiftAfternoonStaff = parseNumber(document.getElementById('inp-shift-afternoon-staff')?.value || '0');
    const shiftAfternoonRate = parseNumber(document.getElementById('inp-shift-afternoon-rate')?.value || '0');
    const shiftEveningStaff = parseNumber(document.getElementById('inp-shift-evening-staff')?.value || '0');
    const shiftEveningRate = parseNumber(document.getElementById('inp-shift-evening-rate')?.value || '0');
    
    const ftManagerCount = parseNumber(document.getElementById('inp-ft-manager-count')?.value || '0');
    const ftManagerSalary = parseNumber(document.getElementById('inp-ft-manager-salary')?.value || '0');
    const weekendMultiplier = parseFloat(document.getElementById('inp-weekend-multiplier')?.value || '1.0');
    const commissionRate = parseFloat(document.getElementById('inp-commission-rate')?.value || '0');

    const baseDailyShiftCost = (shiftMorningStaff * 6 * shiftMorningRate) + 
                               (shiftAfternoonStaff * 6 * shiftAfternoonRate) + 
                               (shiftEveningStaff * 5 * shiftEveningRate);
    
    const monthlyShiftSalary = (baseDailyShiftCost * 22) + (baseDailyShiftCost * weekendMultiplier * 8);
    const monthlyManagerSalary = ftManagerCount * ftManagerSalary;
    
    const baseSalary = monthlyShiftSalary + monthlyManagerSalary;
    const commission = rev * (commissionRate / 100);
    
    return {
        baseSalary: baseSalary,
        commission: commission,
        totalSalary: baseSalary + commission,
        total: baseSalary + commission
    };
}

// ======================================================================
// Setup inputs for auto-formatting as the user types
// ======================================================================
function setupInputFormatting() {
    const idsToFormat = [
        'inp-deposit', 'inp-renovate', 'inp-equipment', 'inp-raw-start', 'inp-decor-misc', 'inp-buffer',
        'inp-loan', 'inp-rent', 'inp-utilities', 'inp-shift-morning-rate', 'inp-shift-afternoon-rate', 'inp-shift-evening-rate', 'inp-ft-manager-salary', 'inp-misc', 'inp-price', 'inp-sh-contrib'
    ];
    idsToFormat.forEach(id => {
        const input = document.getElementById(id);
        if (!input) return;
        
        // Initial format on load
        if (input.value) {
            input.value = formatNumber(input.value);
        }

        input.addEventListener('input', (e) => {
            let selectionStart = input.selectionStart;
            let rawVal = input.value;
            
            let isNegative = rawVal.startsWith('-');
            let digits = rawVal.replace(/\D/g, '');
            
            if (digits === "") {
                input.value = isNegative ? "-" : "";
                updateDashboard();
                return;
            }
            
            let formattedValue = (isNegative ? "-" : "") + digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            
            let dotsBeforeCursor = (input.value.slice(0, selectionStart).match(/\./g) || []).length;
            input.value = formattedValue;
            let newDotsBeforeCursor = (formattedValue.slice(0, selectionStart).match(/\./g) || []).length;
            let diff = newDotsBeforeCursor - dotsBeforeCursor;
            
            input.setSelectionRange(selectionStart + diff, selectionStart + diff);
            
            updateDashboard();
        });
    });
}

// ======================================================================
// Rent â†’ Deposit synchronization (3 months)
// ======================================================================
function setupRentDepositSync() {
    const rentInput = document.getElementById('inp-rent');
    if (!rentInput) return;
    
    rentInput.addEventListener('input', () => {
        const rent = parseNumber(rentInput.value);
        const depositInput = document.getElementById('inp-deposit');
        if (depositInput && rent >= 0) {
            const deposit = rent * 3;
            depositInput.value = formatNumber(deposit);
        }
    });
}

// ======================================================================
// Input Validation
// ======================================================================
function validateInputs() {
    const errors = [];
    
    const depositInput = document.getElementById('inp-deposit');
    const renovateInput = document.getElementById('inp-renovate');
    const equipmentInput = document.getElementById('inp-equipment');
    const rawStartInput = document.getElementById('inp-raw-start');
    const decorMiscInput = document.getElementById('inp-decor-misc');
    const bufferInput = document.getElementById('inp-buffer');
    
    const loanInput = document.getElementById('inp-loan');
    const interestInput = document.getElementById('inp-interest');
    const termInput = document.getElementById('inp-term');
    
    const rentInput = document.getElementById('inp-rent');
    const utilitiesInput = document.getElementById('inp-utilities');
    
    const shiftMorningStaffInput = document.getElementById('inp-shift-morning-staff');
    const shiftMorningRateInput = document.getElementById('inp-shift-morning-rate');
    const shiftAfternoonStaffInput = document.getElementById('inp-shift-afternoon-staff');
    const shiftAfternoonRateInput = document.getElementById('inp-shift-afternoon-rate');
    const shiftEveningStaffInput = document.getElementById('inp-shift-evening-staff');
    const shiftEveningRateInput = document.getElementById('inp-shift-evening-rate');
    const ftManagerCountInput = document.getElementById('inp-ft-manager-count');
    const ftManagerSalaryInput = document.getElementById('inp-ft-manager-salary');
    const weekendMultiplierInput = document.getElementById('inp-weekend-multiplier');
    const commissionRateInput = document.getElementById('inp-commission-rate');
    
    const miscInput = document.getElementById('inp-misc');
    
    const priceInput = document.getElementById('inp-price');
    const costPctInput = document.getElementById('inp-cost-pct');
    const growthRevInput = document.getElementById('inp-growth-rev');
    const growthOpexInput = document.getElementById('inp-growth-opex');

    const volWeakInput = document.getElementById('inp-vol-weak');
    const volBaseInput = document.getElementById('inp-vol-base');
    const volGoodInput = document.getElementById('inp-vol-good');
    const deprYearsInput = document.getElementById('inp-depr-years');
    const discountRateInput = document.getElementById('inp-discount-rate');
    
    const clearError = (input) => {
        if (input) input.classList.remove('input-error');
    };
    
    const setError = (input, msg) => {
        if (input) input.classList.add('input-error');
        errors.push(msg);
    };
    
    // Clear borders
    [depositInput, renovateInput, equipmentInput, rawStartInput, decorMiscInput, bufferInput, 
     loanInput, interestInput, termInput, rentInput, utilitiesInput, 
     shiftMorningStaffInput, shiftMorningRateInput, shiftAfternoonStaffInput, shiftAfternoonRateInput, 
     shiftEveningStaffInput, shiftEveningRateInput, ftManagerCountInput, ftManagerSalaryInput, 
     weekendMultiplierInput, commissionRateInput, miscInput, 
     priceInput, costPctInput, volWeakInput, volBaseInput, volGoodInput, growthRevInput, growthOpexInput,
     deprYearsInput, discountRateInput].forEach(clearError);
    
    const deposit = parseNumber(depositInput.value);
    const renovate = parseNumber(renovateInput.value);
    const equipment = parseNumber(equipmentInput.value);
    const rawStart = parseNumber(rawStartInput.value);
    const decorMisc = parseNumber(decorMiscInput.value);
    const buffer = parseNumber(bufferInput.value);
    const loan = parseNumber(loanInput.value);
    const rent = parseNumber(rentInput.value);
    const utilities = parseNumber(utilitiesInput.value);
    
    const shiftMorningStaff = parseNumber(shiftMorningStaffInput.value);
    const shiftMorningRate = parseNumber(shiftMorningRateInput.value);
    const shiftAfternoonStaff = parseNumber(shiftAfternoonStaffInput.value);
    const shiftAfternoonRate = parseNumber(shiftAfternoonRateInput.value);
    const shiftEveningStaff = parseNumber(shiftEveningStaffInput.value);
    const shiftEveningRate = parseNumber(shiftEveningRateInput.value);
    const ftManagerCount = parseNumber(ftManagerCountInput.value);
    const ftManagerSalary = parseNumber(ftManagerSalaryInput.value);
    const weekendMultiplier = parseFloat(weekendMultiplierInput.value) || 1.0;
    const commissionRate = parseFloat(commissionRateInput.value) || 0;
    
    const misc = parseNumber(miscInput.value);
    const price = parseNumber(priceInput.value);
    
    const interest = parseFloat(interestInput.value) || 0;
    const term = parseInt(termInput.value) || 0;
    const costPct = parseFloat(costPctInput.value) || 0;

    const volWeak = parseFloat(volWeakInput?.value) || 0;
    const volBase = parseFloat(volBaseInput?.value) || 0;
    const volGood = parseFloat(volGoodInput?.value) || 0;
    const deprYears = parseInt(deprYearsInput?.value) || 0;
    const discountRate = parseFloat(discountRateInput?.value) || 0;
    
    // Check bounds
    if (deposit < 0) setError(depositInput, "Cá»c máº·t báº±ng khÃ´ng Ä‘Æ°á»£c Ã¢m.");
    if (renovate < 0) setError(renovateInput, "Sá»­a chá»¯a & Decor khÃ´ng Ä‘Æ°á»£c Ã¢m.");
    if (equipment < 0) setError(equipmentInput, "MÃ¡y mÃ³c & Thiáº¿t bá»‹ khÃ´ng Ä‘Æ°á»£c Ã¢m.");
    if (rawStart < 0) setError(rawStartInput, "NguyÃªn liá»‡u ban Ä‘áº§u khÃ´ng Ä‘Æ°á»£c Ã¢m.");
    if (decorMisc < 0) setError(decorMiscInput, "Decor nhá» khÃ´ng Ä‘Æ°á»£c Ã¢m.");
    if (buffer < 0) setError(bufferInput, "Quá»¹ dá»± phÃ²ng khÃ´ng Ä‘Æ°á»£c Ã¢m.");
    
    if (loan < 0) setError(loanInput, "Sá»‘ tiá»n vay ngÃ¢n hÃ ng khÃ´ng Ä‘Æ°á»£c Ã¢m.");
    if (interest < 0) setError(interestInput, "LÃ£i suáº¥t vay khÃ´ng Ä‘Æ°á»£c nhá» hÆ¡n 0.");
    if (term <= 0) setError(termInput, "Thá»i háº¡n vay pháº£i lá»›n hÆ¡n 0 thÃ¡ng.");
    
    if (rent < 0) setError(rentInput, "Tiá»n thuÃª máº·t báº±ng khÃ´ng Ä‘Æ°á»£c Ã¢m.");
    if (utilities < 0) setError(utilitiesInput, "Chi phÃ­ Ä‘iá»‡n nÆ°á»›c khÃ´ng Ä‘Æ°á»£c Ã¢m.");
    
    if (shiftMorningStaff < 0) setError(shiftMorningStaffInput, "Sá»‘ NV ca sÃ¡ng khÃ´ng Ä‘Æ°á»£c Ã¢m.");
    if (shiftMorningRate < 0) setError(shiftMorningRateInput, "LÆ°Æ¡ng ca sÃ¡ng khÃ´ng Ä‘Æ°á»£c Ã¢m.");
    if (shiftAfternoonStaff < 0) setError(shiftAfternoonStaffInput, "Sá»‘ NV ca chiá»u khÃ´ng Ä‘Æ°á»£c Ã¢m.");
    if (shiftAfternoonRate < 0) setError(shiftAfternoonRateInput, "LÆ°Æ¡ng ca chiá»u khÃ´ng Ä‘Æ°á»£c Ã¢m.");
    if (shiftEveningStaff < 0) setError(shiftEveningStaffInput, "Sá»‘ NV ca tá»‘i khÃ´ng Ä‘Æ°á»£c Ã¢m.");
    if (shiftEveningRate < 0) setError(shiftEveningRateInput, "LÆ°Æ¡ng ca tá»‘i khÃ´ng Ä‘Æ°á»£c Ã¢m.");
    if (ftManagerCount < 0) setError(ftManagerCountInput, "Sá»‘ quáº£n lÃ½ khÃ´ng Ä‘Æ°á»£c Ã¢m.");
    if (ftManagerSalary < 0) setError(ftManagerSalaryInput, "LÆ°Æ¡ng quáº£n lÃ½ khÃ´ng Ä‘Æ°á»£c Ã¢m.");
    if (weekendMultiplier < 1.0) setError(weekendMultiplierInput, "Há»‡ sá»‘ cuá»‘i tuáº§n khÃ´ng Ä‘Æ°á»£c nhá» hÆ¡n 1.0.");
    if (commissionRate < 0 || commissionRate > 100) setError(commissionRateInput, "Tá»· lá»‡ thÆ°á»Ÿng pháº£i tá»« 0% Ä‘áº¿n 100%.");
    
    if (misc < 0) setError(miscInput, "Chi phÃ­ phÃ¡t sinh khÃ´ng Ä‘Æ°á»£c Ã¢m.");
    if (price <= 0) setError(priceInput, "GiÃ¡ bÃ¡n trung bÃ¬nh pháº£i lá»›n hÆ¡n 0 Ä‘/ly.");
    
    if (costPct < 0 || costPct > 100) setError(costPctInput, "Tá»· lá»‡ Cost nguyÃªn váº­t liá»‡u pháº£i náº±m tá»« 0% Ä‘áº¿n 100%.");
    if (volWeak < 0) setError(volWeakInput, "Sáº£n lÆ°á»£ng ká»‹ch báº£n Yáº¿u khÃ´ng Ä‘Æ°á»£c Ã¢m.");
    if (volBase < 0) setError(volBaseInput, "Sáº£n lÆ°á»£ng ká»‹ch báº£n Trung bÃ¬nh khÃ´ng Ä‘Æ°á»£c Ã¢m.");
    if (volGood < 0) setError(volGoodInput, "Sáº£n lÆ°á»£ng ká»‹ch báº£n Tá»‘t khÃ´ng Ä‘Æ°á»£c Ã¢m.");
    if (deprYears <= 0) setError(deprYearsInput, "Thá»i gian kháº¥u hao tÃ i sáº£n pháº£i lá»›n hÆ¡n 0 nÄƒm.");
    if (discountRate < 0 || discountRate > 100) setError(discountRateInput, "LÃ£i suáº¥t chiáº¿t kháº¥u ká»³ vá»ng pháº£i tá»« 0% Ä‘áº¿n 100%.");
    
    const setupCosts = deposit + renovate + equipment + rawStart + decorMisc;
    const totalCapitalNeeded = setupCosts + buffer;
    
    if (loan > totalCapitalNeeded) {
        setError(loanInput, `Tiá»n vay ngÃ¢n hÃ ng (${formatVND(loan)}) Ä‘ang lá»›n hÆ¡n Tá»•ng vá»‘n cáº§n thiáº¿t (${formatVND(totalCapitalNeeded)}). Cá»• Ä‘Ã´ng khÃ´ng thá»ƒ gÃ³p pháº§n vá»‘n Ã¢m.`);
    }
    
    const errorBox = document.getElementById('error-warning-box');
    const errorList = document.getElementById('error-list');
    
    if (errors.length > 0) {
        errorBox.style.display = 'block';
        errorList.innerHTML = errors.map(err => `<li>${err}</li>`).join('');
        return false;
    } else {
        errorBox.style.display = 'none';
        errorList.innerHTML = '';
        return true;
    }
}

// ======================================================================
// Shareholder Functions (Add / Edit / Delete / Cancel)
// ======================================================================
window.saveShareholder = function() {
    const nameInput = document.getElementById('inp-sh-name');
    const contribInput = document.getElementById('inp-sh-contrib');
    const roleInput = document.getElementById('inp-sh-role');
    const name = nameInput.value.trim();
    const contrib = parseNumber(contribInput.value);
    const role = roleInput ? roleInput.value : 'invest';

    if (!name) {
        alert("Vui lÃ²ng nháº­p tÃªn cá»• Ä‘Ã´ng!");
        return;
    }
    if (contrib <= 0) {
        alert("Vui lÃ²ng nháº­p sá»‘ vá»‘n gÃ³p lá»›n hÆ¡n 0!");
        return;
    }

    if (editingShareholderId !== null) {
        // Update existing shareholder
        const sh = shareholders.find(s => s.id === editingShareholderId);
        if (sh) {
            sh.name = name;
            sh.contribution = contrib;
            sh.role = role;
        }
        editingShareholderId = null;
        document.getElementById('btn-save-shareholder').textContent = 'ThÃªm Cá»• ÄÃ´ng';
        document.getElementById('btn-cancel-edit').style.display = 'none';
    } else {
        // Add new shareholder
        const newSh = {
            id: Date.now(),
            name: name,
            contribution: contrib,
            role: role
        };
        shareholders.push(newSh);
    }

    nameInput.value = "";
    contribInput.value = "";
    if (roleInput) roleInput.value = "invest";
    
    updateDashboard();
}

window.editShareholder = function(id) {
    const sh = shareholders.find(s => s.id === id);
    if (!sh) return;

    editingShareholderId = id;
    document.getElementById('inp-sh-name').value = sh.name;
    document.getElementById('inp-sh-contrib').value = formatNumber(sh.contribution);
    const roleInput = document.getElementById('inp-sh-role');
    if (roleInput) roleInput.value = sh.role || 'invest';
    
    document.getElementById('btn-save-shareholder').textContent = 'LÆ°u Thay Äá»•i';
    document.getElementById('btn-cancel-edit').style.display = 'inline-flex';

    // Scroll to the form
    document.getElementById('inp-sh-name').focus();
}

window.cancelEdit = function() {
    editingShareholderId = null;
    document.getElementById('inp-sh-name').value = '';
    document.getElementById('inp-sh-contrib').value = '';
    const roleInput = document.getElementById('inp-sh-role');
    if (roleInput) roleInput.value = 'invest';
    document.getElementById('btn-save-shareholder').textContent = 'ThÃªm Cá»• ÄÃ´ng';
    document.getElementById('btn-cancel-edit').style.display = 'none';
}

window.deleteShareholder = function(id) {
    shareholders = shareholders.filter(s => s.id !== id);
    if (editingShareholderId === id) {
        cancelEdit();
    }
    updateDashboard();
}

// Role label mapping
function getRoleLabel(role) {
    switch (role) {
        case 'operate': return 'ðŸ”§ GÃ³p vá»‘n + Váº­n hÃ nh';
        case 'invest': return 'ðŸ’° Chá»‰ gÃ³p vá»‘n';
        default: return 'ðŸ’° Chá»‰ gÃ³p vá»‘n';
    }
}

function getRoleBadgeClass(role) {
    return role === 'operate' ? 'role-badge-operate' : 'role-badge-invest';
}

// ======================================================================
// Render shareholder table with Dividend Policy + Roles + Edit
// ======================================================================
function renderShareholders(totalCapitalNeeded, loan, netProfit) {
    const container = document.getElementById('sh-table-container');
    
    if (shareholders.length === 0) {
        container.innerHTML = `<div class="empty-state">ChÆ°a cÃ³ cá»• Ä‘Ã´ng nÃ o Ä‘Ã³ng gÃ³p vá»‘n. HÃ£y thÃªm cá»• Ä‘Ã´ng báº±ng máº«u phÃ­a trÃªn.</div>`;
        return;
    }

    const payoutPct = parseFloat(document.getElementById('inp-div-payout').value) || 80;

    container.innerHTML = `
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>Cá»• Ä‘Ã´ng</th>
                        <th>Vai trÃ²</th>
                        <th>Vá»‘n gÃ³p (VND)</th>
                        <th>% Cá»• pháº§n</th>
                        <th>Cá»• tá»©c / thÃ¡ng</th>
                        <th>HoÃ n vá»‘n (Cá»• tá»©c)</th>
                        <th class="td-actions">HÃ nh Ä‘á»™ng</th>
                    </tr>
                </thead>
                <tbody id="sh-table-body"></tbody>
            </table>
        </div>
    `;

    const activeTbody = document.getElementById('sh-table-body');
    const requiredEquity = totalCapitalNeeded - loan;
    const totalEquityContributed = shareholders.reduce((sum, s) => sum + s.contribution, 0);
    
    let totalPct = 0;
    let sumDiv = 0;

    shareholders.forEach(s => {
        const shPct = totalEquityContributed > 0 ? (s.contribution / totalEquityContributed) * 100 : 0;
        totalPct += shPct;

        const shDiv = (netProfit || 0) * (shPct / 100) * (payoutPct / 100);
        sumDiv += shDiv;

        let paybackStr = "VÃ´ háº¡n (Lá»—)";
        if (shDiv > 0) {
            const months = s.contribution / shDiv;
            paybackStr = `${months.toFixed(1)} thÃ¡ng`;
        }

        const roleLabel = getRoleLabel(s.role);
        const roleBadgeClass = getRoleBadgeClass(s.role);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${s.name}</strong></td>
            <td><span class="role-badge ${roleBadgeClass}">${roleLabel}</span></td>
            <td>${formatNumber(s.contribution)} Ä‘</td>
            <td><span class="badge-leverage" style="display:inline-block">${shPct.toFixed(1)}%</span></td>
            <td class="${shDiv >= 0 ? 'val-profit' : 'val-loss'}">${shDiv >= 0 ? '+' : ''}${formatShortVND(shDiv)}</td>
            <td><em style="font-size:11px">${paybackStr}</em></td>
            <td class="td-actions">
                <button class="btn btn-edit" onclick="editShareholder(${s.id})" style="padding: 4px 8px; font-size:11px; margin-right: 4px;">Sá»­a</button>
                <button class="btn btn-danger" onclick="deleteShareholder(${s.id})" style="padding: 4px 8px; font-size:11px;">XÃ³a</button>
            </td>
        `;
        activeTbody.appendChild(tr);
    });

    // Add summary row
    const trSummary = document.createElement('tr');
    trSummary.style.fontWeight = 'bold';
    trSummary.style.background = 'rgba(255,255,255,0.02)';
    trSummary.innerHTML = `
        <td>Tá»”NG Cá»˜NG Cá»” Tá»¨C</td>
        <td>-</td>
        <td>${formatNumber(totalEquityContributed)} Ä‘</td>
        <td>${totalPct.toFixed(0)}%</td>
        <td class="${sumDiv >= 0 ? 'val-profit' : 'val-loss'}">${sumDiv >= 0 ? '+' : ''}${formatShortVND(sumDiv)}</td>
        <td>-</td>
        <td>-</td>
    `;
    activeTbody.appendChild(trSummary);

    // Display warning or success about required funding vs actual contributed funding
    const statusDiv = document.createElement('div');
    statusDiv.style.marginTop = '12px';
    statusDiv.style.fontSize = '12px';
    statusDiv.style.fontWeight = '600';
    statusDiv.style.padding = '10px 14px';
    statusDiv.style.borderRadius = '10px';
    statusDiv.style.display = 'flex';
    statusDiv.style.alignItems = 'center';
    statusDiv.style.gap = '8px';

    const isLight = document.body.classList.contains('light-theme');
    const diff = totalEquityContributed - requiredEquity;

    if (diff < 0) {
        statusDiv.style.background = 'rgba(248, 113, 113, 0.1)';
        statusDiv.style.border = '1px solid rgba(248, 113, 113, 0.2)';
        statusDiv.style.color = isLight ? '#b91c1c' : 'var(--danger)';
        statusDiv.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            <span>Thiáº¿u vá»‘n: Tá»•ng vá»‘n gÃ³p hiá»‡n táº¡i (${formatNumber(totalEquityContributed)}Ä‘) Ä‘ang thiáº¿u <strong>${formatNumber(Math.abs(diff))}Ä‘</strong> so vá»›i nhu cáº§u vá»‘n tá»± cÃ³ (${formatNumber(requiredEquity)}Ä‘). HÃ£y gÃ³p thÃªm hoáº·c tÄƒng khoáº£n vay.</span>
        `;
    } else if (diff > 0) {
        statusDiv.style.background = 'rgba(52, 211, 153, 0.1)';
        statusDiv.style.border = '1px solid rgba(52, 211, 153, 0.2)';
        statusDiv.style.color = isLight ? '#047857' : 'var(--success)';
        statusDiv.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
            <span>DÆ° vá»‘n: Tá»•ng vá»‘n gÃ³p (${formatNumber(totalEquityContributed)}Ä‘) thá»«a <strong>${formatNumber(diff)}Ä‘</strong> so vá»›i nhu cáº§u vá»‘n tá»± cÃ³ (${formatNumber(requiredEquity)}Ä‘). Sá»‘ dÆ° nÃ y giÃºp gia tÄƒng Quá»¹ dá»± phÃ²ng thá»±c táº¿.</span>
        `;
    } else {
        statusDiv.style.background = 'var(--primary-glow)';
        statusDiv.style.border = '1px solid rgba(56, 189, 248, 0.2)';
        statusDiv.style.color = isLight ? '#0369a1' : 'var(--primary)';
        statusDiv.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
            <span>CÃ¢n báº±ng: Tá»•ng vá»‘n gÃ³p khá»›p hoÃ n toÃ n vá»›i nhu cáº§u vá»‘n tá»± cÃ³ (${formatNumber(requiredEquity)}Ä‘).</span>
        `;
    }
    container.appendChild(statusDiv);
}


// ======================================================================
// Dynamic Investor Pitch suggestions calculator
// ======================================================================
function updateInvestorPitch(equity, baseNet, volBase, breakeven) {
    const actualEquity = equity > 0 ? equity : 1;
    const payoutPct = parseFloat(document.getElementById('inp-div-payout').value) || 80;
    
    // 1. Margin of safety
    const safetyMargin = volBase > 0 ? ((volBase - breakeven) / volBase) * 100 : 0;
    const safetyValElement = document.getElementById('pitch-safety-val');
    const safetyDescElement = document.getElementById('pitch-safety-desc');
    
    if (safetyValElement && safetyDescElement) {
        safetyValElement.innerText = `${safetyMargin.toFixed(1)}%`;
        if (safetyMargin > 30) {
            safetyValElement.style.color = 'var(--success)';
            safetyDescElement.innerText = "BiÃªn an toÃ n ráº¥t cao. Sáº£n lÆ°á»£ng bÃ¡n cÃ³ thá»ƒ sá»¥t giáº£m tá»›i 30% mÃ  quÃ¡n váº«n khÃ´ng bá»‹ lá»—. ÄÃ¢y lÃ  luáº­n Ä‘iá»ƒm cá»±c tá»‘t Ä‘á»ƒ thuyáº¿t phá»¥c cá»• Ä‘Ã´ng.";
        } else if (safetyMargin > 0) {
            safetyValElement.style.color = 'var(--warning)';
            safetyDescElement.innerText = "BiÃªn an toÃ n dÆ°Æ¡ng nhÆ°ng á»Ÿ má»©c háº¹p. Cá»• Ä‘Ã´ng sáº½ muá»‘n tháº¥y káº¿ hoáº¡ch marketing rÃµ rÃ ng Ä‘á»ƒ duy trÃ¬ lÆ°á»£ng khÃ¡ch á»•n Ä‘á»‹nh.";
        } else {
            safetyValElement.style.color = 'var(--danger)';
            safetyDescElement.innerText = "Hiá»‡n táº¡i sáº£n lÆ°á»£ng bÃ¡n dá»± kiáº¿n tháº¥p hÆ¡n Ä‘iá»ƒm hÃ²a vá»‘n. Cáº§n giáº£m bá»›t Ä‘á»‹nh phÃ­ váº­n hÃ nh hoáº·c tÄƒng giÃ¡ bÃ¡n Ä‘á»ƒ táº¡o sá»©c hÃºt vá»›i nhÃ  Ä‘áº§u tÆ°.";
        }
    }

    // 2. Payback based on Dividend
    const paybackValElement = document.getElementById('pitch-payback-val');
    const paybackDescElement = document.getElementById('pitch-payback-desc');
    if (paybackValElement && paybackDescElement) {
        const baseDividend = baseNet * (payoutPct / 100);
        if (baseDividend > 0) {
            const paybackMonths = actualEquity / baseDividend;
            paybackValElement.innerText = `${paybackMonths.toFixed(1)} thÃ¡ng`;
            paybackValElement.style.color = 'var(--success)';
            paybackDescElement.innerText = `Thá»i gian hoÃ n vá»‘n dá»± kiáº¿n báº±ng dÃ²ng tiá»n cá»• tá»©c thá»±c nháº­n hÃ ng thÃ¡ng lÃ  khoáº£ng ${paybackMonths.toFixed(1)} thÃ¡ng. ÄÃ¢y lÃ  tá»‘c Ä‘á»™ hoÃ n vá»‘n ráº¥t tá»‘t.`;
        } else {
            paybackValElement.innerText = "KhÃ´ng thá»ƒ tÃ­nh (Lá»—)";
            paybackValElement.style.color = 'var(--danger)';
            paybackDescElement.innerText = "QuÃ¡n Ä‘ang chá»‹u lá»— hoáº·c khÃ´ng chi tráº£ cá»• tá»©c. Cáº§n tá»‘i Æ°u láº¡i Ä‘á»‹nh phÃ­ hoáº·c tÄƒng giÃ¡ bÃ¡n.";
        }
    }
}

// ======================================================================
// Update Disbursement Timeline Breakdown
// ======================================================================
function updateDisbursement(deposit, renovate, equipment, rawStart, decorMisc, buffer) {
    const phases = [
        { id: 'p1', amount: deposit },
        { id: 'p2', amount: renovate + decorMisc * 0.5 },
        { id: 'p3', amount: equipment + decorMisc * 0.5 },
        { id: 'p4', amount: rawStart },
        { id: 'p5', amount: buffer }
    ];

    // Update totals
    phases.forEach(phase => {
        const el = document.getElementById(`disburse-${phase.id}`);
        if (el) el.innerText = formatVND(phase.amount);
    });

    const totalEquityContributed = shareholders.reduce((sum, s) => sum + s.contribution, 0);
    if (totalEquityContributed === 0) return;

    phases.forEach(phase => {
        const bdEl = document.getElementById(`breakdown-${phase.id}`);
        if (bdEl) {
            if (phase.amount > 0) {
                let html = '<ul style="list-style: none; padding-left: 0; margin-bottom: 0;">';
                shareholders.forEach(s => {
                    const ratio = s.contribution / totalEquityContributed;
                    const sAmount = phase.amount * ratio;
                    html += `<li style="display:flex; justify-content:space-between; border-top: 1px dashed rgba(150,150,150,0.15); padding: 4px 0;">
                        <span style="color:var(--text-muted);">- ${s.name} (${(ratio*100).toFixed(1)}%):</span>
                        <span style="color:var(--text-main); font-weight:600;">${formatShortVND(sAmount)}</span>
                    </li>`;
                });
                html += '</ul>';
                bdEl.innerHTML = html;
            } else {
                bdEl.innerHTML = '';
            }
        }
    });
}

// ======================================================================
// Sensitivity Analysis Table
// ======================================================================
function renderSensitivityTable(basePrice, baseCostPct, fixedMonthlyOpex, monthlyDebt, monthlyDepreciation, volBase) {
    const table = document.getElementById('sensitivity-table');
    if (!table) return;

    // Variations: price Â±20% in steps of 10%, costPct Â±10% in steps of 5%
    const priceMultipliers = [-20, -10, 0, 10, 20];
    const costVariations = [-10, -5, 0, 5, 10];

    let html = '<thead><tr><th class="sensitivity-corner">GiÃ¡ bÃ¡n \\ Cost %</th>';
    costVariations.forEach(cv => {
        const actualCost = baseCostPct + cv;
        html += `<th>Cost ${actualCost}%${cv !== 0 ? ' (' + (cv > 0 ? '+' : '') + cv + '%)' : ''}</th>`;
    });
    html += '</tr></thead><tbody>';

    priceMultipliers.forEach(pm => {
        const actualPrice = basePrice * (1 + pm / 100);
        html += `<tr><td class="sensitivity-row-label">${formatNumber(Math.round(actualPrice))}Ä‘${pm !== 0 ? ' (' + (pm > 0 ? '+' : '') + pm + '%)' : ''}</td>`;
        
        costVariations.forEach(cv => {
            const actualCost = baseCostPct + cv;
            const rev = volBase * 30 * actualPrice;
            const cogs = rev * (actualCost / 100);
            const profitBeforeTax = rev - cogs - fixedMonthlyOpex - monthlyDebt - monthlyDepreciation;
            const dynamicTaxRate = getSuggestedTaxRate(rev * 12);
            const tax = profitBeforeTax > 0 ? profitBeforeTax * (dynamicTaxRate / 100) : 0;
            const netProfit = profitBeforeTax - tax;
            
            let cellClass = '';
            if (netProfit > 0) cellClass = 'sensitivity-positive';
            else if (netProfit < 0) cellClass = 'sensitivity-negative';
            else cellClass = 'sensitivity-zero';

            // Highlight the center cell (base case)
            let extraClass = (pm === 0 && cv === 0) ? ' sensitivity-base' : '';
            
            const tooltipText = `Doanh thu: ${formatNumber(Math.round(rev))}Ä‘\n- Cost NVL (${actualCost}%): ${formatNumber(Math.round(cogs))}Ä‘\n- Äá»‹nh phÃ­: ${formatNumber(Math.round(fixedMonthlyOpex))}Ä‘\n- Kháº¥u hao: ${formatNumber(Math.round(monthlyDepreciation))}Ä‘\n- LÃ£i vay: ${formatNumber(Math.round(monthlyDebt))}Ä‘\n- Thuáº¿ TNDN (${dynamicTaxRate}%): ${formatNumber(Math.round(tax))}Ä‘\n------------------------\n= Lá»£i nhuáº­n rÃ²ng: ${formatNumber(Math.round(netProfit))}Ä‘`;
            
            html += `<td class="${cellClass}${extraClass}" title="${tooltipText}">${formatShortVND(netProfit)}</td>`;
        });
        
        html += '</tr>';
    });

    html += '</tbody>';
    table.innerHTML = html;
}

function renderBreakevenAnalysis(basePrice, baseCostPct, fixedMonthlyOpex, monthlyDebt, monthlyDepreciation, volBase) {
    const wrapper = document.getElementById('breakeven-tab');
    if (!wrapper) return;

    const rent = parseNumber(document.getElementById('inp-rent').value);
    const commissionRate = parseFloat(document.getElementById('inp-commission-rate')?.value || '0');

    // Vary price by Â±10k, Â±5k
    const prices = [basePrice - 10000, basePrice - 5000, basePrice, basePrice + 5000, basePrice + 10000].filter(p => p > 0);
    // Vary rent by Â±5M, Â±2.5M
    const rents = [rent - 5000000, rent - 2500000, rent, rent + 2500000, rent + 5000000].filter(r => r >= 0);

    let priceRowsHtml = '';
    prices.forEach(p => {
        let cellsHtml = '';
        const unitMargin = p * (1 - baseCostPct / 100 - commissionRate / 100);
        
        rents.forEach(r => {
            if (unitMargin <= 0) {
                cellsHtml += `<td style="text-align: right; padding: 8px; color: var(--danger); font-weight: 500;">Lá»— gá»™p/ly</td>`;
            } else {
                const newOpex = fixedMonthlyOpex - rent + r;
                const beVol = (newOpex + monthlyDebt + monthlyDepreciation) / (30 * unitMargin);
                const isBaseCase = (p === basePrice && r === rent);
                const extraStyle = isBaseCase ? 'background: rgba(2, 132, 199, 0.15); font-weight: bold; border: 2px solid var(--primary);' : '';
                cellsHtml += `<td style="text-align: right; padding: 8px; ${extraStyle}">${Math.ceil(beVol)} ly</td>`;
            }
        });

        priceRowsHtml += `
            <tr>
                <td style="text-align: left; padding: 8px; font-weight: 500;">${formatNumber(p)}Ä‘</td>
                ${cellsHtml}
            </tr>
        `;
    });

    wrapper.innerHTML = `
        <h3 class="chart-sub-title">ðŸŽ¯ Ma Tráº­n Sáº£n LÆ°á»£ng HÃ²a Vá»‘n (Ly/NgÃ y) Theo GiÃ¡ BÃ¡n & Tiá»n ThuÃª</h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
            Báº£ng dÆ°á»›i Ä‘Ã¢y thá»ƒ hiá»‡n sá»‘ ly nÆ°á»›c quÃ¡n cáº§n bÃ¡n Ä‘Æ°á»£c <strong>má»—i ngÃ y</strong> Ä‘á»ƒ hÃ²a vá»‘n (bao gá»“m Ä‘á»‹nh phÃ­, ná»£ vay ngÃ¢n hÃ ng vÃ  kháº¥u hao) khi thay Ä‘á»•i giÃ¡ thuÃª máº·t báº±ng (cá»™t) vÃ  giÃ¡ bÃ¡n láº» (dÃ²ng). Ã” tÃ´ Ä‘áº­m cÃ³ viá»n xanh lÃ  má»©c giÃ¡ & tiá»n thuÃª hiá»‡n táº¡i cá»§a báº¡n.
        </p>

        <!-- Table -->
        <div style="overflow-x: auto; margin-bottom: 24px;">
            <table class="sensitivity-table" style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr>
                        <th class="sensitivity-corner" style="text-align: left; padding: 8px; background: rgba(2, 132, 199, 0.08);">GiÃ¡ bÃ¡n \\ Tiá»n thuÃª</th>
                        ${rents.map(r => `<th style="text-align: right; padding: 8px; background: rgba(2, 132, 199, 0.08);">${formatShortVND(r)}/thÃ¡ng</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${priceRowsHtml}
                </tbody>
            </table>
        </div>

        <h3 class="chart-sub-title" style="margin-top: 24px; margin-bottom: 8px;">ðŸ“ˆ Äá»“ Thá»‹ Äiá»ƒm HÃ²a Vá»‘n Cáº¯t Nhau (Break-Even Point Chart)</h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
            Giao Ä‘iá»ƒm giá»¯a hai Ä‘Æ°á»ng tháº³ng chÃ­nh lÃ  Ä‘iá»ƒm hÃ²a vá»‘n cá»§a dá»± Ã¡n.
        </p>
        <div class="chart-container" style="position: relative; height: 280px; width: 100%; margin-bottom: 24px;">
            <canvas id="breakevenChart"></canvas>
        </div>
    `;

    // Draw Breakeven Chart using Chart.js
    setTimeout(() => {
        const ctx = document.getElementById('breakevenChart');
        if (!ctx) return;

        const maxVol = Math.max(Math.ceil(volBase * 1.5), 100);
        const steps = 10;
        const labels = [];
        const dataRev = [];
        const dataCost = [];

        for (let v = 0; v <= maxVol; v += steps) {
            labels.push(v + " ly");
            const rev = v * 30 * basePrice;
            const cogs = rev * (baseCostPct / 100);
            const commission = rev * (commissionRate / 100);
            const cost = (fixedMonthlyOpex + monthlyDebt + monthlyDepreciation) + cogs + commission;
            dataRev.push(Math.round(rev));
            dataCost.push(Math.round(cost));
        }

        const isLight = document.body.classList.contains('light-theme');
        const textColor = isLight ? '#475569' : '#9ca3af';
        const gridColor = isLight ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.05)';

        new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Tá»•ng Doanh Thu (VND)',
                        data: dataRev,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.05)',
                        borderWidth: 2,
                        tension: 0,
                        pointRadius: 3
                    },
                    {
                        label: 'Tá»•ng Chi PhÃ­ (VND)',
                        data: dataCost,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.05)',
                        borderWidth: 2,
                        tension: 0,
                        pointRadius: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: textColor, font: { family: 'Outfit', size: 12 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + formatVND(context.raw);
                            }
                        }
                    },
                    datalabels: { display: false }
                },
                scales: {
                    y: {
                        grid: { color: gridColor },
                        ticks: {
                            color: textColor,
                            callback: function(value) { return formatShortVND(value); }
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: textColor }
                    }
                }
            }
        });
    }, 50);
}

// ======================================================================
// Long Term Projections
// ======================================================================
function renderLongTermProjections(basePrice, baseCostPct, fixedOpex, monthlyDebt, monthlyDepr, baseVol, totalEquity) {
    const revGrowth = parseFloat(document.getElementById('inp-growth-rev')?.value || 10) / 100;
    const opexGrowth = parseFloat(document.getElementById('inp-growth-opex')?.value || 5) / 100;
    
    const lblInfOpex = document.getElementById('lbl-inf-opex');
    const lblInfRev = document.getElementById('lbl-inf-rev');
    if (lblInfOpex) lblInfOpex.innerText = (opexGrowth * 100).toFixed(0);
    if (lblInfRev) lblInfRev.innerText = (revGrowth * 100).toFixed(0);

    let currentRev = baseVol * 30 * basePrice * 12;
    let currentCogs = currentRev * (baseCostPct / 100);
    const commissionRate = parseFloat(document.getElementById('inp-commission-rate')?.value || '0');
    let currentCommission = currentRev * (commissionRate / 100);
    let currentOpex = (fixedOpex * 12) + currentCommission; 

    const labels = ["NÄƒm 1", "NÄƒm 2", "NÄƒm 3", "NÄƒm 4", "NÄƒm 5"];
    const dataRev = [];
    const dataOpex = [];
    const dataNet = [];

    let totalNet3Years = 0;
    let year3Net = 0;

    for (let i = 1; i <= 5; i++) {
        const yRev = currentRev * Math.pow(1 + revGrowth, i - 1);
        const yCogs = yRev * (baseCostPct / 100);
        const yFixedOpex = fixedOpex * 12 * Math.pow(1 + opexGrowth, i - 1);
        const yCommission = yRev * (commissionRate / 100);
        const yOpex = yFixedOpex + yCommission;
        
        const yDebt = monthlyDebt * 12;
        const yDepr = monthlyDepr * 12;

        const profitBeforeTax = (yRev - yCogs) - yOpex - yDebt - yDepr;
        const tax = calculateTax(profitBeforeTax / 12, yRev) * 12; 
        const yNet = profitBeforeTax - tax;

        dataRev.push(Math.round(yRev));
        dataOpex.push(Math.round(yCogs + yOpex + yDebt + yDepr + tax));
        dataNet.push(Math.round(yNet));

        if (i <= 3) totalNet3Years += yNet;
        if (i === 3) year3Net = yNet;
    }

    const valContainer = document.getElementById('longterm-valuation');
    if (valContainer) {
        const peRatio = 3; 
        const valuation = year3Net > 0 ? year3Net * peRatio : 0;
        
        valContainer.innerHTML = `
            <div style="font-size: 14px; margin-bottom: 12px;"><strong style="color:var(--primary);">ðŸ’¡ PhÃ¢n TÃ­ch Äá»‹nh GiÃ¡ Doanh Nghiá»‡p (Cuá»‘i NÄƒm 3)</strong></div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                    <div style="font-size: 12px; color: var(--text-muted);">Lá»£i nhuáº­n rÃ²ng NÄƒm 3:</div>
                    <div style="font-size: 18px; font-weight: bold; color: ${year3Net > 0 ? 'var(--success)' : 'var(--danger)'};">${formatVND(year3Net)}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: var(--text-muted);">Äá»‹nh giÃ¡ quÃ¡n (P/E = 3):</div>
                    <div style="font-size: 18px; font-weight: bold; color: var(--primary);">${formatVND(valuation)}</div>
                </div>
            </div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 12px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 8px;">
                * Náº¿u quÃ¡n hoáº¡t Ä‘á»™ng á»•n Ä‘á»‹nh tá»›i nÄƒm thá»© 3 vá»›i cÃ¡c giáº£ Ä‘á»‹nh láº¡m phÃ¡t/tÄƒng trÆ°á»Ÿng trÃªn, báº¡n cÃ³ thá»ƒ chÃ o bÃ¡n/sang nhÆ°á»£ng láº¡i quÃ¡n vá»›i má»©c giÃ¡ tham kháº£o khoáº£ng ${formatShortVND(valuation)}.
            </div>
        `;
    }

    setTimeout(() => {
        const ctx = document.getElementById('longtermChart');
        if (!ctx) return;
        const oldChart = Chart.getChart('longtermChart');
        if (oldChart) oldChart.destroy();
        const isLight = document.body.classList.contains('light-theme');
        const textColor = isLight ? '#475569' : '#9ca3af';
        const gridColor = isLight ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.05)';

        new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Doanh Thu',
                        data: dataRev,
                        backgroundColor: 'rgba(56, 189, 248, 0.8)',
                        borderRadius: 4
                    },
                    {
                        label: 'Tá»•ng Chi PhÃ­',
                        data: dataOpex,
                        backgroundColor: 'rgba(248, 113, 113, 0.8)',
                        borderRadius: 4
                    },
                    {
                        label: 'Lá»£i Nhuáº­n RÃ²ng',
                        data: dataNet,
                        backgroundColor: 'rgba(52, 211, 153, 0.8)',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { color: textColor } },
                    tooltip: {
                        callbacks: {
                            label: function(context) { return context.dataset.label + ': ' + formatVND(context.raw); }
                        }
                    },
                    datalabels: { display: false }
                },
                scales: {
                    y: { grid: { color: gridColor }, ticks: { color: textColor, callback: function(value) { return formatShortVND(value); } } },
                    x: { grid: { display: false }, ticks: { color: textColor } }
                }
            }
        });
    }, 50);
}

// ======================================================================
// Generate Dynamic Number Explanation
// ======================================================================
function renderExplanation(basePrice, baseCostPct, fixedMonthlyOpex, monthlyDebt, monthlyDepreciation, volBase, setupCosts, deposit, renovate, equipment, rawStart, decorMisc, totalEquityContributed, breakeven, baseScenario) {
    const el = document.getElementById('explanation-tab');
    if (!el) return;
    
    const buffer = parseNumber(document.getElementById('inp-buffer').value);
    const loan = parseNumber(document.getElementById('inp-loan').value);
    const interest = parseFloat(document.getElementById('inp-interest').value) || 0;
    const term = parseInt(document.getElementById('inp-term').value) || 12;

    const totalCap = setupCosts + buffer;
    
    const rent = parseNumber(document.getElementById('inp-rent').value);
    const utilities = parseNumber(document.getElementById('inp-utilities').value);
    const salaryObj = calculateMonthlySalary(baseScenario.rev);
    const salary = salaryObj.totalSalary;
    const misc = parseNumber(document.getElementById('inp-misc').value);
    
    const deprYears = parseInt(document.getElementById('inp-depr-years').value) || 5;
    
    const taxRate = getSuggestedTaxRate(baseScenario.rev * 12);
    
    const grossMargin = basePrice - (basePrice * (baseCostPct / 100));
    
    el.innerHTML = `
        <div style="background: rgba(15,23,42,0.03); padding: 20px; border-radius: 8px; border: 1px solid var(--border-color);">
            <h3 style="margin-bottom: 16px; color: var(--primary); font-size: 18px; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px;">Diá»…n Giáº£i CÃ¡c Con Sá»‘ Äang Hiá»ƒn Thá»‹</h3>
            
            <p><strong>1. Nhu cáº§u vá»‘n & Äáº§u tÆ° ban Ä‘áº§u (Tá»•ng: ${formatVND(totalCap)})</strong></p>
            <ul style="margin-bottom: 16px; margin-top: 4px; padding-left: 20px;">
                <li><strong>Chi phÃ­ thiáº¿t láº­p (${formatVND(setupCosts)})</strong>: ÄÃ¢y lÃ  tiá»n "cháº¿t" Ä‘á»• vÃ o quÃ¡n trÆ°á»›c khi má»Ÿ cá»­a.
                    <br>Bao gá»“m: Cá»c máº·t báº±ng (${formatShortVND(deposit)}), Sá»­a chá»¯a (${formatShortVND(renovate)}), MÃ¡y mÃ³c (${formatShortVND(equipment)}), NguyÃªn liá»‡u (${formatShortVND(rawStart)}), KhÃ¡c (${formatShortVND(decorMisc)}).
                </li>
                <li><strong>Quá»¹ dá»± phÃ²ng (${formatVND(buffer)})</strong>: Tiá»n máº·t Ä‘á»ƒ sáºµn trong ngÃ¢n hÃ ng Ä‘á»ƒ gá»“ng lá»— thá»i gian Ä‘áº§u.</li>
            </ul>

            <p><strong>2. Nguá»“n vá»‘n & ÄÃ²n báº©y tÃ i chÃ­nh</strong></p>
            <ul style="margin-bottom: 16px; margin-top: 4px; padding-left: 20px;">
                <li><strong>Vá»‘n tá»± cÃ³ (Báº¡n vÃ  Cá»• Ä‘Ã´ng gÃ³p):</strong> ${formatVND(totalEquityContributed)} (${((totalEquityContributed / totalCap) * 100).toFixed(1)}%)</li>
                <li><strong>Vá»‘n Ä‘i vay ngÃ¢n hÃ ng:</strong> ${formatVND(loan)} (${((loan / totalCap) * 100).toFixed(1)}%)</li>
                <li><strong>Chi phÃ­ tráº£ ná»£ hÃ ng thÃ¡ng:</strong> Vá»›i lÃ£i suáº¥t ${interest}%/nÄƒm vay trong ${term} thÃ¡ng, má»—i thÃ¡ng pháº£i tráº£ cáº£ gá»‘c láº«n lÃ£i lÃ  <strong>${formatVND(Math.round(monthlyDebt))}</strong>.</li>
            </ul>

            <p><strong>3. Chi phÃ­ duy trÃ¬ má»—i thÃ¡ng (Äá»‹nh phÃ­: ${formatVND(fixedMonthlyOpex)})</strong></p>
            <ul style="margin-bottom: 16px; margin-top: 4px; padding-left: 20px;">
                <li>ThuÃª máº·t báº±ng: ${formatShortVND(rent)} | Äiá»‡n nÆ°á»›c: ${formatShortVND(utilities)} | LÆ°Æ¡ng: ${formatShortVND(salary)} | KhÃ¡c: ${formatShortVND(misc)}. DÃ¹ khÃ´ng bÃ¡n Ä‘Æ°á»£c ly nÃ o, thÃ¡ng nÃ o báº¡n cÅ©ng gÃ¡nh chá»«ng nÃ y chi phÃ­.</li>
                <li><strong>Kháº¥u hao tÃ i sáº£n:</strong> TÃ­nh dá»±a trÃªn MÃ¡y mÃ³c (${formatShortVND(equipment)}) + Decor (${formatShortVND(decorMisc)}) chia cho ${deprYears} nÄƒm = <strong>${formatVND(Math.round(monthlyDepreciation))}/thÃ¡ng</strong>. (ÄÃ¢y khÃ´ng pháº£i tiá»n chi ra, mÃ  lÃ  sá»± hao mÃ²n).</li>
            </ul>

            <p><strong>4. CÆ¡ cáº¥u GiÃ¡ bÃ¡n 1 ly nÆ°á»›c</strong></p>
            <ul style="margin-bottom: 16px; margin-top: 4px; padding-left: 20px;">
                <li>GiÃ¡ bÃ¡n trung bÃ¬nh: <strong>${formatVND(basePrice)}</strong></li>
                <li>Tá»· lá»‡ giÃ¡ vá»‘n (Cost): ${baseCostPct}% (TÆ°Æ¡ng Ä‘Æ°Æ¡ng ${formatVND(basePrice * baseCostPct / 100)} tiá»n nguyÃªn váº­t liá»‡u).</li>
                <li>LÃ£i gá»™p (Tiá»n lá»i sau khi trá»« nguyÃªn liá»‡u): <strong>${formatVND(grossMargin)}/ly</strong>.</li>
            </ul>

            <p><strong>5. Sá»‘ ly cáº§n bÃ¡n Ä‘á»ƒ HÃ’A Vá»N: ${Math.ceil(breakeven)} ly/ngÃ y</strong></p>
            <ul style="margin-bottom: 16px; margin-top: 4px; padding-left: 20px;">
                <li>Má»—i thÃ¡ng báº¡n cáº§n gÃ¡nh: Äá»‹nh phÃ­ (${formatShortVND(fixedMonthlyOpex)}) + Tiá»n ná»£ (${formatShortVND(monthlyDebt)}) + Kháº¥u hao (${formatShortVND(monthlyDepreciation)}) = ${formatVND(fixedMonthlyOpex + monthlyDebt + monthlyDepreciation)}.</li>
                <li>Vá»›i má»©c lÃ£i gá»™p ${formatVND(grossMargin)}/ly, báº¡n cáº§n bÃ¡n Ä‘Æ°á»£c khoáº£ng ${Math.ceil(breakeven * 30)} ly/thÃ¡ng, tÆ°Æ¡ng Ä‘Æ°Æ¡ng <strong>~${Math.ceil(breakeven)} ly/ngÃ y</strong> thÃ¬ quÃ¡n má»›i Ä‘á»§ tiá»n bÃ¹ chi phÃ­.</li>
            </ul>

            <p><strong>6. Káº¿t quáº£ Dá»± Kiáº¿n (BÃ¡n Ä‘Æ°á»£c ${volBase} ly/ngÃ y)</strong></p>
            <ul style="margin-top: 4px; padding-left: 20px;">
                <li><strong>Doanh thu:</strong> ${volBase} ly Ã— 30 ngÃ y Ã— ${formatVND(basePrice)} = <strong>${formatVND(baseScenario.rev)}</strong></li>
                <li><strong>Trá»« NguyÃªn liá»‡u (${baseCostPct}%):</strong> - ${formatVND(baseScenario.cogs)}</li>
                <li><strong>Trá»« Äá»‹nh phÃ­ hÃ ng thÃ¡ng:</strong> - ${formatVND(fixedMonthlyOpex)}</li>
                <li><strong>Trá»« Tiá»n tráº£ ná»£ ngÃ¢n hÃ ng:</strong> - ${formatVND(Math.round(monthlyDebt))}</li>
                <li><strong>Trá»« Kháº¥u hao mÃ¡y mÃ³c:</strong> - ${formatVND(Math.round(monthlyDepreciation))}</li>
                <li><strong>Thuáº¿ TNDN (${taxRate}%):</strong> - ${formatVND(Math.round(baseScenario.tax))}</li>
                <li style="margin-top:8px;">=> <strong>Lá»¢I NHUáº¬N RÃ’NG (Cáº¥t tÃºi): <span style="color:${baseScenario.net >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatVND(baseScenario.net)}</span> / thÃ¡ng</strong></li>
            </ul>
        </div>
    `;
}

// ======================================================================
// Smart F&B Business Advisor & Financial Health Score (FHI)
// ======================================================================
function renderSmartAdvisor(base, breakeven, volBase, setupCosts, deposit, renovate, equipment, rawStart, decorMisc, totalEquityContributed, basePrice, baseCostPct, fixedMonthlyOpex, monthlyDebt, monthlyDepreciation) {
    const el = document.getElementById('advisor-tab');
    if (!el) return;

    const rent = parseNumber(document.getElementById('inp-rent')?.value || '0');
    const utilities = parseNumber(document.getElementById('inp-utilities')?.value || '0');
    const misc = parseNumber(document.getElementById('inp-misc')?.value || '0');
    const buffer = parseNumber(document.getElementById('inp-buffer')?.value || '0');
    const salaryObj = calculateMonthlySalary(base.rev);
    const totalSalary = salaryObj.totalSalary;
    const rev = base.rev || 1;
    const netProfit = base.net;
    const cogs = base.cogs;
    
    // 1. Calculate Core F&B Ratios
    const rentPct = (rent / rev) * 100;
    const laborPct = (totalSalary / rev) * 100;
    const cogsPct = (cogs / rev) * 100;
    const netMarginPct = (netProfit / rev) * 100;
    const marginOfSafety = volBase > 0 ? ((volBase - breakeven) / volBase) * 100 : 0;
    
    // Days of sales needed to pay 1 month rent
    const dailyRev = rev / 30;
    const rentDaysNeeded = dailyRev > 0 ? (rent / dailyRev).toFixed(1) : 0;

    // 2. Score Calculation (Total: 100)
    let score = 0;

    // Rent Ratio Score (Max 25 pts) - Standard: <= 15%
    let rentScore = 0;
    let rentStatus = 'good';
    let rentComment = '';
    if (rentPct <= 12) {
        rentScore = 25;
        rentStatus = 'excellent';
        rentComment = `Chi phÃ­ máº·t báº±ng ráº¥t tá»‘i Æ°u (${rentPct.toFixed(1)}% doanh thu). Báº¡n chá»‰ cáº§n ${rentDaysNeeded} ngÃ y doanh thu Ä‘á»ƒ tráº£ tiá»n nhÃ .`;
    } else if (rentPct <= 15) {
        rentScore = 20;
        rentStatus = 'good';
        rentComment = `Äáº¡t chuáº©n tá»· lá»‡ vÃ ng F&B (ngÆ°á»¡ng an toÃ n â‰¤ 15%). Máº¥t ${rentDaysNeeded} ngÃ y doanh thu Ä‘á»ƒ trang tráº£i tiá»n thuÃª.`;
    } else if (rentPct <= 20) {
        rentScore = 12;
        rentStatus = 'warning';
        rentComment = `HÆ¡i cao (${rentPct.toFixed(1)}%). Cáº§n Ä‘áº©y máº¡nh doanh thu hoáº·c Ä‘Ã m phÃ¡n thÃªm Æ°u Ä‘Ã£i máº·t báº±ng Ä‘á»ƒ trÃ¡nh Ã¡p lá»±c Ä‘á»‹nh phÃ­.`;
    } else {
        rentScore = 5;
        rentStatus = 'danger';
        rentComment = `VÆ°á»£t ngÆ°á»¡ng rá»§i ro (${rentPct.toFixed(1)}%). Báº¡n máº¥t tá»›i ${rentDaysNeeded} ngÃ y bÃ¡n hÃ ng chá»‰ Ä‘á»ƒ nuÃ´i chá»§ nhÃ .`;
    }
    score += rentScore;

    // Labor Cost Score (Max 25 pts) - Standard: <= 22%
    let laborScore = 0;
    let laborStatus = 'good';
    let laborComment = '';
    if (laborPct <= 18) {
        laborScore = 25;
        laborStatus = 'excellent';
        laborComment = `Tá»‘i Æ°u Ä‘á»‹nh biÃªn nhÃ¢n sá»± xuáº¥t sáº¯c (${laborPct.toFixed(1)}% DT). NÄƒng suáº¥t lao Ä‘á»™ng cao.`;
    } else if (laborPct <= 22) {
        laborScore = 20;
        laborStatus = 'good';
        laborComment = `Äáº¡t chuáº©n quáº£n trá»‹ F&B (ngÆ°á»¡ng chuáº©n 18% - 22%). CÆ¡ cáº¥u ca kÃ­p há»£p lÃ½.`;
    } else if (laborPct <= 28) {
        laborScore = 12;
        laborStatus = 'warning';
        laborComment = `Quá»¹ lÆ°Æ¡ng Ä‘ang chiáº¿m ${laborPct.toFixed(1)}% DT. NÃªn Ã¡p dá»¥ng ca gÃ£y linh hoáº¡t vÃ  tuyá»ƒn thÃªm part-time theo giá» cao Ä‘iá»ƒm.`;
    } else {
        laborScore = 5;
        laborStatus = 'danger';
        laborComment = `Chi phÃ­ nhÃ¢n sá»± quÃ¡ náº·ng (${laborPct.toFixed(1)}% DT). Nguy cÆ¡ Äƒn mÃ²n toÃ n bá»™ lá»£i nhuáº­n rÃ²ng.`;
    }
    score += laborScore;

    // COGS Score (Max 25 pts) - Standard: <= 30%
    let cogsScore = 0;
    let cogsStatus = 'good';
    let cogsComment = '';
    if (cogsPct <= 25) {
        cogsScore = 25;
        cogsStatus = 'excellent';
        cogsComment = `BiÃªn lÃ£i gá»™p cá»±c dÃ y (${(100 - cogsPct).toFixed(1)}%). Kiá»ƒm soÃ¡t hao há»¥t vÃ  giÃ¡ vá»‘n nguyÃªn váº­t liá»‡u ráº¥t tá»‘t.`;
    } else if (cogsPct <= 30) {
        cogsScore = 20;
        cogsStatus = 'good';
        cogsComment = `Äáº¡t tá»· lá»‡ vÃ ng giÃ¡ vá»‘n Ä‘á»“ uá»‘ng (${cogsPct.toFixed(1)}% DT). Menu cÃ³ cáº¥u trÃºc Ä‘á»‹nh giÃ¡ vá»¯ng cháº¯c.`;
    } else if (cogsPct <= 35) {
        cogsScore = 12;
        cogsStatus = 'warning';
        cogsComment = `GiÃ¡ vá»‘n hÆ¡i cao (${cogsPct.toFixed(1)}%). Cáº§n kiá»ƒm tra láº¡i Ä‘á»‹nh lÆ°á»£ng (recipe) vÃ  tÃ¬m nhÃ  cung cáº¥p giÃ¡ sá»‰ tá»‘t hÆ¡n.`;
    } else {
        cogsScore = 5;
        cogsStatus = 'danger';
        cogsComment = `GiÃ¡ vá»‘n chiáº¿m ${cogsPct.toFixed(1)}% DT. BiÃªn lÃ£i gá»™p bá»‹ bÃ³p ngháº¹t, rá»§i ro cao khi giÃ¡ nguyÃªn liá»‡u thá»‹ trÆ°á»ng biáº¿n Ä‘á»™ng.`;
    }
    score += cogsScore;

    // Margin of Safety & Profitability Score (Max 25 pts)
    let safetyScore = 0;
    let safetyStatus = 'good';
    let safetyComment = '';
    if (marginOfSafety >= 40 && netMarginPct >= 20) {
        safetyScore = 25;
        safetyStatus = 'excellent';
        safetyComment = `BiÃªn an toÃ n cá»±c lá»›n (${marginOfSafety.toFixed(1)}%) vÃ  tá»· suáº¥t lÃ£i rÃ²ng Ä‘áº¡t ${netMarginPct.toFixed(1)}%. Dá»± Ã¡n cÃ³ sá»©c chá»‘ng chá»‹u biáº¿n Ä‘á»™ng thá»‹ trÆ°á»ng hoÃ n háº£o.`;
    } else if (marginOfSafety >= 25 && netProfit > 0) {
        safetyScore = 20;
        safetyStatus = 'good';
        safetyComment = `BiÃªn an toÃ n tá»‘t (${marginOfSafety.toFixed(1)}%). QuÃ¡n sinh lá»i dÆ°Æ¡ng (${formatShortVND(netProfit)}/thÃ¡ng) vÃ  cÃ³ khoáº£ng Ä‘á»‡m an toÃ n trÆ°á»›c rá»§i ro váº¯ng khÃ¡ch.`;
    } else if (marginOfSafety > 0 && netProfit > 0) {
        safetyScore = 12;
        safetyStatus = 'warning';
        safetyComment = `BiÃªn an toÃ n má»ng (${marginOfSafety.toFixed(1)}%). Chá»‰ cáº§n sáº£n lÆ°á»£ng giáº£m nháº¹ lÃ  rÆ¡i vÃ o vÃ¹ng thua lá»—. Cáº§n tÄƒng tá»‘c marketing kÃ©o khÃ¡ch.`;
    } else {
        safetyScore = 0;
        safetyStatus = 'danger';
        safetyComment = `Äang hoáº¡t Ä‘á»™ng dÆ°á»›i Ä‘iá»ƒm hÃ²a vá»‘n (${volBase} ly < ${Math.ceil(breakeven)} ly). Äang bá»‹ thÃ¢m há»¥t dÃ²ng tiá»n má»—i thÃ¡ng.`;
    }
    score += safetyScore;

    // 3. Overall Rating
    let overallBadge = '';
    let overallBadgeClass = '';
    let overallDesc = '';
    let overallColor = '';

    if (score >= 85) {
        overallBadge = 'ðŸŒŸ Xuáº¥t Sáº¯c - Chuáº©n VÃ ng F&B';
        overallBadgeClass = 'badge-excellent';
        overallColor = 'var(--success)';
        overallDesc = `MÃ´ hÃ¬nh tÃ i chÃ­nh cá»§a quÃ¡n Ä‘Æ°á»£c tá»‘i Æ°u á»Ÿ má»©c <strong>cá»±c ká»³ xuáº¥t sáº¯c</strong>. Cáº£ 3 cáº¥u pháº§n chi phÃ­ lá»›n nháº¥t (Máº·t báº±ng, NhÃ¢n sá»±, GiÃ¡ vá»‘n) Ä‘á»u náº±m trá»n trong "VÃ¹ng Tá»· Lá»‡ VÃ ng" chuáº©n quá»‘c táº¿. Dá»± Ã¡n cÃ³ biÃªn an toÃ n dÃ y, kháº£ nÄƒng sinh lá»i vÃ  thu há»“i vá»‘n vÆ°á»£t trá»™i, ráº¥t dá»… thuyáº¿t phá»¥c nhÃ  Ä‘áº§u tÆ° & cá»• Ä‘Ã´ng.`;
    } else if (score >= 70) {
        overallBadge = 'âœ… Tá»‘t - Sá»©c Khá»e Vá»¯ng Cháº¯c';
        overallBadgeClass = 'badge-good';
        overallColor = 'var(--primary)';
        overallDesc = `MÃ´ hÃ¬nh tÃ i chÃ­nh Ä‘áº¡t má»©c <strong>khá»e máº¡nh vÃ  kháº£ thi cao</strong>. CÃ¡c chá»‰ sá»‘ cá»‘t lÃµi Ä‘á»u náº±m trong ngÆ°á»¡ng an toÃ n cho phÃ©p cá»§a ngÃ nh F&B. Chá»‰ cáº§n lÆ°u Ã½ kiá»ƒm soÃ¡t á»•n Ä‘á»‹nh cháº¥t lÆ°á»£ng dá»‹ch vá»¥ vÃ  quáº£n trá»‹ cháº·t cháº½ hÃ ng tá»“n kho Ä‘á»ƒ báº£o toÃ n dÃ²ng tiá»n.`;
    } else if (score >= 50) {
        overallBadge = 'âš ï¸ Cáº£nh BÃ¡o - Cáº§n Tinh Chá»‰nh';
        overallBadgeClass = 'badge-warning';
        overallColor = 'var(--warning)';
        overallDesc = `Dá»± Ã¡n cÃ³ má»™t sá»‘ chá»‰ sá»‘ tÃ i chÃ­nh <strong>Ä‘ang tiá»‡m cáº­n ngÆ°á»¡ng rá»§i ro</strong>. Ãp lá»±c tá»« chi phÃ­ cá»‘ Ä‘á»‹nh (Máº·t báº±ng hoáº·c Quá»¹ lÆ°Æ¡ng) hoáº·c giÃ¡ vá»‘n Ä‘ang lÃ m giáº£m biÃªn lá»£i nhuáº­n rÃ²ng. Báº¡n nÃªn rÃ  soÃ¡t láº¡i cÃ¡c gá»£i Ã½ chiáº¿n lÆ°á»£c bÃªn dÆ°á»›i Ä‘á»ƒ tá»‘i Æ°u trÆ°á»›c khi rÃ³t vá»‘n thá»±c táº¿.`;
    } else {
        overallBadge = 'ðŸš¨ Rá»§i Ro Cao - Cáº§n TÃ¡i Cáº¥u TrÃºc';
        overallBadgeClass = 'badge-danger';
        overallColor = 'var(--danger)';
        overallDesc = `Cáº£nh bÃ¡o rá»§i ro nghiÃªm trá»ng: Dá»± Ã¡n Ä‘ang chá»‹u Ã¡p lá»±c chi phÃ­ quÃ¡ lá»›n so vá»›i doanh thu dá»± kiáº¿n hoáº·c hoáº¡t Ä‘á»™ng dÆ°á»›i Ä‘iá»ƒm hÃ²a vá»‘n. Cáº§n giáº£m ngay chi phÃ­ thuÃª, tinh gá»n bá»™ mÃ¡y nhÃ¢n sá»± hoáº·c nÃ¢ng giÃ¡ trá»‹ Ä‘Æ¡n hÃ ng trung bÃ¬nh Ä‘á»ƒ trÃ¡nh cáº¡n kiá»‡t vá»‘n lÆ°u Ä‘á»™ng.`;
    }

    // Helper for status badge
    const getStatusPill = (status, text) => {
        const bg = status === 'excellent' ? 'rgba(16, 185, 129, 0.15)' :
                   status === 'good' ? 'rgba(56, 189, 248, 0.15)' :
                   status === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)';
        const color = status === 'excellent' ? '#34d399' :
                      status === 'good' ? '#38bdf8' :
                      status === 'warning' ? '#fbbf24' : '#f87171';
        return `<span class="ratio-status-pill" style="background:${bg}; color:${color};">${text}</span>`;
    };

    const getMeterFill = (val, max, color) => {
        const pct = Math.min(Math.max((val / max) * 100, 4), 100);
        return `<div class="ratio-meter-track"><div class="ratio-meter-fill" style="width:${pct}%; background:${color};"></div></div>`;
    };

    // Calculate Strategic Metrics
    const founderEquity = shareholders.find(s => s.role === 'operate')?.contribution || (shareholders[0]?.contribution || 0);
    const founderRatio = totalEquityContributed > 0 ? (founderEquity / totalEquityContributed) * 100 : 100;
    const payoutPct = parseFloat(document.getElementById('inp-div-payout')?.value || 80);
    const annualDividend = (netProfit > 0 ? netProfit * (payoutPct / 100) : 0) * 12;
    const dividendYield = totalEquityContributed > 0 ? (annualDividend / totalEquityContributed) * 100 : 0;
    
    // Cash Runway
    let runwayMonths = 'VÃ´ háº¡n (Äang lÃ£i)';
    if (netProfit < 0) {
        const actualLoss = Math.abs(netProfit);
        runwayMonths = actualLoss > 0 ? (buffer / actualLoss).toFixed(1) + ' thÃ¡ng' : 'N/A';
    } else {
        const worstCaseOpex = fixedMonthlyOpex + monthlyDebt;
        runwayMonths = worstCaseOpex > 0 ? (buffer / worstCaseOpex).toFixed(1) + ' thÃ¡ng (Zero DT)' : 'N/A';
    }

    // Shift metrics
    const morningStaff = parseNumber(document.getElementById('inp-shift-morning-staff')?.value || '0');
    const afternoonStaff = parseNumber(document.getElementById('inp-shift-afternoon-staff')?.value || '0');
    const eveningStaff = parseNumber(document.getElementById('inp-shift-evening-staff')?.value || '0');
    const totalShiftsPerDay = morningStaff + afternoonStaff + eveningStaff;

    el.innerHTML = `
        <!-- Hero Health Score -->
        <div class="advisor-hero-card">
            <div class="health-score-circle-wrap" style="border-color:${overallColor}; box-shadow: 0 0 20px ${overallColor}40;">
                <div class="health-score-val" style="color:${overallColor};">${score}</div>
                <div class="health-score-max">/ 100 ÄIá»‚M FHI</div>
            </div>
            <div class="advisor-hero-content">
                <div class="advisor-hero-title">
                    Chá»‰ Sá»‘ Sá»©c Khá»e TÃ i ChÃ­nh F&B (Financial Health Index)
                    <span class="advisor-hero-badge ${overallBadgeClass}">${overallBadge}</span>
                </div>
                <div class="advisor-hero-desc">
                    ${overallDesc}
                </div>
            </div>
        </div>

        <!-- 4 Golden Ratios of F&B -->
        <div>
            <div class="advice-section-title">
                <span>ðŸ†</span> Bá»™ Tá»© Tá»· Lá»‡ VÃ ng Trong Kinh Doanh QuÃ¡n CÃ  PhÃª
            </div>
            <p style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 12px; margin-top: 2px;">
                ÄÆ°á»£c tá»•ng há»£p tá»« mÃ´ hÃ¬nh chuáº©n cá»§a hÆ¡n 500+ chuá»—i vÃ  quÃ¡n cÃ  phÃª thÃ nh cÃ´ng táº¡i Viá»‡t Nam.
            </p>
            <div class="golden-ratio-grid">
                <!-- 1. Rent Ratio -->
                <div class="ratio-card">
                    <div class="ratio-header">
                        <span class="ratio-title">ðŸ¢ Máº·t Báº±ng / Doanh Thu</span>
                        <span class="ratio-benchmark-tag">Chuáº©n VÃ ng: â‰¤ 15%</span>
                    </div>
                    <div class="ratio-value-row">
                        <div class="ratio-val-num" style="color:${rentStatus === 'excellent' || rentStatus === 'good' ? 'var(--success)' : rentStatus === 'warning' ? 'var(--warning)' : 'var(--danger)'};">
                            ${rentPct.toFixed(1)}%
                        </div>
                        ${getStatusPill(rentStatus, rentStatus === 'excellent' ? 'ðŸŸ¢ Xuáº¥t sáº¯c' : rentStatus === 'good' ? 'ðŸŸ¢ Äáº¡t Chuáº©n' : rentStatus === 'warning' ? 'ðŸŸ¡ Cháº¥p nháº­n' : 'ðŸ”´ VÆ°á»£t tráº§n')}
                    </div>
                    ${getMeterFill(rentPct, 30, rentStatus === 'danger' ? 'var(--danger)' : rentStatus === 'warning' ? 'var(--warning)' : 'var(--success)')}
                    <div class="ratio-desc">${rentComment}</div>
                </div>

                <!-- 2. Labor Cost Ratio -->
                <div class="ratio-card">
                    <div class="ratio-header">
                        <span class="ratio-title">ðŸ‘¥ NhÃ¢n Sá»± / Doanh Thu</span>
                        <span class="ratio-benchmark-tag">Chuáº©n VÃ ng: â‰¤ 22%</span>
                    </div>
                    <div class="ratio-value-row">
                        <div class="ratio-val-num" style="color:${laborStatus === 'excellent' || laborStatus === 'good' ? 'var(--success)' : laborStatus === 'warning' ? 'var(--warning)' : 'var(--danger)'};">
                            ${laborPct.toFixed(1)}%
                        </div>
                        ${getStatusPill(laborStatus, laborStatus === 'excellent' ? 'ðŸŸ¢ Xuáº¥t sáº¯c' : laborStatus === 'good' ? 'ðŸŸ¢ Äáº¡t Chuáº©n' : laborStatus === 'warning' ? 'ðŸŸ¡ Cháº¥p nháº­n' : 'ðŸ”´ VÆ°á»£t tráº§n')}
                    </div>
                    ${getMeterFill(laborPct, 40, laborStatus === 'danger' ? 'var(--danger)' : laborStatus === 'warning' ? 'var(--warning)' : 'var(--success)')}
                    <div class="ratio-desc">${laborComment}</div>
                </div>

                <!-- 3. COGS Ratio -->
                <div class="ratio-card">
                    <div class="ratio-header">
                        <span class="ratio-title">â˜• GiÃ¡ Vá»‘n (COGS) / Doanh Thu</span>
                        <span class="ratio-benchmark-tag">Chuáº©n VÃ ng: â‰¤ 30%</span>
                    </div>
                    <div class="ratio-value-row">
                        <div class="ratio-val-num" style="color:${cogsStatus === 'excellent' || cogsStatus === 'good' ? 'var(--success)' : cogsStatus === 'warning' ? 'var(--warning)' : 'var(--danger)'};">
                            ${cogsPct.toFixed(1)}%
                        </div>
                        ${getStatusPill(cogsStatus, cogsStatus === 'excellent' ? 'ðŸŸ¢ Xuáº¥t sáº¯c' : cogsStatus === 'good' ? 'ðŸŸ¢ Äáº¡t Chuáº©n' : cogsStatus === 'warning' ? 'ðŸŸ¡ Cháº¥p nháº­n' : 'ðŸ”´ VÆ°á»£t tráº§n')}
                    </div>
                    ${getMeterFill(cogsPct, 50, cogsStatus === 'danger' ? 'var(--danger)' : cogsStatus === 'warning' ? 'var(--warning)' : 'var(--success)')}
                    <div class="ratio-desc">${cogsComment}</div>
                </div>

                <!-- 4. Margin of Safety -->
                <div class="ratio-card">
                    <div class="ratio-header">
                        <span class="ratio-title">ðŸ›¡ï¸ BiÃªn An ToÃ n HÃ²a Vá»‘n</span>
                        <span class="ratio-benchmark-tag">Chuáº©n VÃ ng: â‰¥ 35%</span>
                    </div>
                    <div class="ratio-value-row">
                        <div class="ratio-val-num" style="color:${safetyStatus === 'excellent' || safetyStatus === 'good' ? 'var(--success)' : safetyStatus === 'warning' ? 'var(--warning)' : 'var(--danger)'};">
                            ${marginOfSafety.toFixed(1)}%
                        </div>
                        ${getStatusPill(safetyStatus, safetyStatus === 'excellent' ? 'ðŸŸ¢ Cá»±c DÃ y' : safetyStatus === 'good' ? 'ðŸŸ¢ An ToÃ n' : safetyStatus === 'warning' ? 'ðŸŸ¡ Háº¹p' : 'ðŸ”´ Nguy Hiá»ƒm')}
                    </div>
                    ${getMeterFill(Math.max(marginOfSafety, 0), 60, safetyStatus === 'danger' ? 'var(--danger)' : safetyStatus === 'warning' ? 'var(--warning)' : 'var(--success)')}
                    <div class="ratio-desc">${safetyComment}</div>
                </div>
            </div>
        </div>

        <!-- 4 Strategic Actionable Recommendations -->
        <div>
            <div class="advice-section-title">
                <span>ðŸŽ¯</span> Khuyáº¿n Nghá»‹ Chiáº¿n LÆ°á»£c Váº­n HÃ nh & Gá»i Vá»‘n
            </div>
            <div class="advice-cards-grid" style="margin-top: 10px;">
                <!-- 1. Location Strategy -->
                <div class="advice-card">
                    <div class="advice-card-header">
                        <div class="advice-icon-wrap advice-icon-blue">ðŸ¢</div>
                        <div class="advice-card-title">Chiáº¿n LÆ°á»£c Máº·t Báº±ng & Äiá»ƒm BÃ¡n</div>
                    </div>
                    <div class="advice-card-body">
                        Máº·t báº±ng tiÃªu tá»‘n <strong>${formatVND(rent)}/thÃ¡ng</strong>. Báº¡n cáº§n Ä‘áº¡t doanh thu tá»‘i thiá»ƒu <strong>${formatShortVND(rent / 0.15)}/thÃ¡ng</strong> Ä‘á»ƒ Ä‘Æ°a tá»· lá»‡ tiá»n thuÃª vá» má»©c an toÃ n chuáº©n 15%.
                        ${rentPct > 15 ? '<br><span style="color:var(--warning);">âš ï¸ Máº¹o: HÃ£y táº­n dá»¥ng vá»‰a hÃ¨ hoáº·c má»Ÿ thÃªm quáº§y Takeaway buá»•i sÃ¡ng Ä‘á»ƒ gia tÄƒng doanh thu trÃªn cÃ¹ng 1 mÃ©t vuÃ´ng thuÃª.</span>' : '<br><span style="color:var(--success);">âœ¨ Vá»‹ tháº¿ máº·t báº±ng tá»‘t, Ã¡p lá»±c Ä‘á»‹nh phÃ­ máº·t báº±ng á»Ÿ má»©c lÃ½ tÆ°á»Ÿng.</span>'}
                    </div>
                    <div class="advice-key-stat">
                        <span class="advice-stat-label">Sá»‘ ngÃ y bÃ¡n tráº£ tiá»n nhÃ :</span>
                        <span class="advice-stat-val" style="color:${rentDaysNeeded <= 4.5 ? 'var(--success)' : 'var(--warning)'};">${rentDaysNeeded} ngÃ y / thÃ¡ng</span>
                    </div>
                </div>

                <!-- 2. Staffing Strategy -->
                <div class="advice-card">
                    <div class="advice-card-header">
                        <div class="advice-icon-wrap advice-icon-green">ðŸ‘¥</div>
                        <div class="advice-card-title">Chiáº¿n LÆ°á»£c Quáº£n Trá»‹ NhÃ¢n Sá»± & Ca KÃ­p</div>
                    </div>
                    <div class="advice-card-body">
                        Tá»•ng Ä‘á»‹nh biÃªn cÃ³ <strong>${totalShiftsPerDay} nhÃ¢n sá»±/ngÃ y</strong> chia 3 ca. BÃ¬nh quÃ¢n má»—i nhÃ¢n viÃªn phá»¥c vá»¥ táº¡o ra khoáº£ng <strong>${totalShiftsPerDay > 0 ? formatShortVND(dailyRev / totalShiftsPerDay) : '0'} doanh thu/ngÃ y</strong>.
                        ${laborPct > 22 ? '<br><span style="color:var(--warning);">âš ï¸ Máº¹o: NÃªn chuyá»ƒn 1 pháº§n nhÃ¢n viÃªn full-time sang part-time theo giá» (18k - 22k/h) Ä‘á»ƒ chá»‰ tÄƒng cÆ°á»ng vÃ o khung giá» cao Ä‘iá»ƒm (7h-9h sÃ¡ng & 19h-21h tá»‘i).</span>' : '<br><span style="color:var(--success);">âœ¨ CÆ¡ cáº¥u lÆ°Æ¡ng vÃ  phÃ¢n ca Ä‘ang váº­n hÃ nh ráº¥t hiá»‡u quáº£.</span>'}
                    </div>
                    <div class="advice-key-stat">
                        <span class="advice-stat-label">Quá»¹ lÆ°Æ¡ng trung bÃ¬nh/ngÃ y:</span>
                        <span class="advice-stat-val">${formatShortVND(totalSalary / 30)}/ngÃ y</span>
                    </div>
                </div>

                <!-- 3. Pitching Strategy -->
                <div class="advice-card">
                    <div class="advice-card-header">
                        <div class="advice-icon-wrap advice-icon-purple">ðŸ¤</div>
                        <div class="advice-card-title">Chiáº¿n LÆ°á»£c Cá»• ÄÃ´ng & Gá»i Vá»‘n (Pitching)</div>
                    </div>
                    <div class="advice-card-body">
                        Vá»›i má»©c chi tráº£ cá»• tá»©c ${payoutPct}%, tá»· suáº¥t cá»• tá»©c thá»±c nháº­n hÃ ng nÄƒm dá»± kiáº¿n Ä‘áº¡t <strong>${dividendYield.toFixed(1)}%/nÄƒm</strong> trÃªn tá»•ng vá»‘n gÃ³p.
                        ${dividendYield > 20 ? '<br><span style="color:var(--success);">âœ¨ Tá»· suáº¥t sinh lá»i vÆ°á»£t trá»™i so vá»›i gá»­i tiáº¿t kiá»‡m ngÃ¢n hÃ ng (5-6%/nÄƒm), lÃ  luáº­n Ä‘iá»ƒm vÃ ng Ä‘á»ƒ chá»‘t deal vá»›i cá»• Ä‘Ã´ng.</span>' : '<br><span style="color:var(--warning);">âš ï¸ Tá»· suáº¥t cá»• tá»©c Ä‘ang á»Ÿ má»©c vá»«a pháº£i. CÃ¢n nháº¯c giá»¯ láº¡i thÃªm quá»¹ tÃ¡i Ä‘áº§u tÆ° Ä‘á»ƒ má»Ÿ rá»™ng quy mÃ´.</span>'}
                    </div>
                    <div class="advice-key-stat">
                        <span class="advice-stat-label">Tá»· lá»‡ sá»Ÿ há»¯u cá»§a Founder:</span>
                        <span class="advice-stat-val" style="color:var(--primary);">${founderRatio.toFixed(1)}% (${formatShortVND(founderEquity)})</span>
                    </div>
                </div>

                <!-- 4. Runway Strategy -->
                <div class="advice-card">
                    <div class="advice-card-header">
                        <div class="advice-icon-wrap advice-icon-amber">ðŸ›¡ï¸</div>
                        <div class="advice-card-title">Kháº£ NÄƒng PhÃ²ng Vá»‡ & Quá»¹ Dá»± PhÃ²ng</div>
                    </div>
                    <div class="advice-card-body">
                        Quá»¹ dá»± phÃ²ng tiá»n máº·t hiá»‡n cÃ³ <strong>${formatVND(buffer)}</strong>. 
                        ${netProfit >= 0 ? `Náº¿u quÃ¡n khÃ´ng cÃ³ báº¥t ká»³ doanh thu nÃ o (Zero Revenue), quá»¹ nÃ y cho phÃ©p duy trÃ¬ tráº£ máº·t báº±ng vÃ  ná»£ vay trong <strong>${runwayMonths}</strong>.` : `Vá»›i má»©c thÃ¢m há»¥t hiá»‡n táº¡i, quÃ¡n cÃ³ thá»ƒ gá»“ng lá»— trong tá»‘i Ä‘a <strong>${runwayMonths}</strong> trÆ°á»›c khi cáº¡n tiá»n.`}
                        <br><span style="color:${buffer >= fixedMonthlyOpex * 3 ? 'var(--success)' : 'var(--warning)'};">${buffer >= fixedMonthlyOpex * 3 ? 'âœ¨ Quá»¹ dá»± phÃ²ng Ä‘áº¡t chuáº©n báº£o hiá»ƒm an toÃ n (â‰¥ 3 thÃ¡ng Ä‘á»‹nh phÃ­).' : 'âš ï¸ Khuyáº¿n nghá»‹: NÃªn chuáº©n bá»‹ quá»¹ dá»± phÃ²ng tá»‘i thiá»ƒu tÆ°Æ¡ng Ä‘Æ°Æ¡ng 3 thÃ¡ng tiá»n nhÃ  + ná»£ vay Ä‘á»ƒ yÃªn tÃ¢m váº­n hÃ nh.'}</span>
                    </div>
                    <div class="advice-key-stat">
                        <span class="advice-stat-label">Thá»i gian sinh tá»“n an toÃ n:</span>
                        <span class="advice-stat-val" style="color:${netProfit >= 0 ? 'var(--success)' : 'var(--danger)'};">${runwayMonths}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ======================================================================
// Common datalabels config generator
// ======================================================================
function getDataLabelConfig(isLight, type) {
    const baseConfig = {
        color: isLight ? '#334155' : '#e2e8f0',
        font: {
            family: 'Outfit',
            size: 11,
            weight: '600'
        },
        padding: 4
    };

    if (type === 'bar') {
        return {
            ...baseConfig,
            anchor: 'end',
            align: 'top',
            offset: 2,
            formatter: (value) => formatChartLabel(value)
        };
    } else if (type === 'doughnut' || type === 'pie') {
        return {
            ...baseConfig,
            anchor: 'center',
            align: 'center',
            font: { ...baseConfig.font, size: 12, weight: '700' },
            color: '#ffffff',
            textShadowBlur: 4,
            textShadowColor: 'rgba(0,0,0,0.5)',
            formatter: (value, context) => {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return pct + '%';
            }
        };
    } else if (type === 'line') {
        return {
            ...baseConfig,
            anchor: 'end',
            align: 'top',
            offset: 4,
            formatter: (value) => formatChartLabel(value),
            display: (context) => {
                // Show labels only at every 3rd point or first/last
                const idx = context.dataIndex;
                const total = context.dataset.data.length;
                return idx === 0 || idx === total - 1 || idx % 3 === 0;
            }
        };
    }
    return baseConfig;
}

// ======================================================================
// Master update function
// ======================================================================
function updateDashboard() {
    // 1. Run validations. If errors exist, stop calculation
    const isValid = validateInputs();
    if (!isValid) {
        return;
    }

    // Read inputs
    const deposit = parseNumber(document.getElementById('inp-deposit').value);
    const renovate = parseNumber(document.getElementById('inp-renovate').value);
    const equipment = parseNumber(document.getElementById('inp-equipment').value);
    const rawStart = parseNumber(document.getElementById('inp-raw-start').value);
    const decorMisc = parseNumber(document.getElementById('inp-decor-misc').value);
    const buffer = parseNumber(document.getElementById('inp-buffer').value);
    const deprYears = parseInt(document.getElementById('inp-depr-years').value) || 5;

    const loan = parseNumber(document.getElementById('inp-loan').value);
    const interest = parseFloat(document.getElementById('inp-interest').value) || 0;
    const term = parseInt(document.getElementById('inp-term').value) || 12;

    const rent = parseNumber(document.getElementById('inp-rent').value);
    const utilities = parseNumber(document.getElementById('inp-utilities').value);
    const salaryObj = calculateMonthlySalary(0);
    const salary = salaryObj.baseSalary;
    const commissionRate = parseFloat(document.getElementById('inp-commission-rate')?.value || '0');
    const misc = parseNumber(document.getElementById('inp-misc').value);

    const price = parseNumber(document.getElementById('inp-price').value);
    const costPct = parseFloat(document.getElementById('inp-cost-pct').value) || 0;

    const volWeak = parseFloat(document.getElementById('inp-vol-weak')?.value) || 55;
    const volBase = parseFloat(document.getElementById('inp-vol-base')?.value) || 85;
    const volGood = parseFloat(document.getElementById('inp-vol-good')?.value) || 130;

    // Financial arithmetic
    const setupCosts = deposit + renovate + equipment + rawStart + decorMisc;
    const totalCapitalNeeded = setupCosts + buffer;
    const leverageRatio = totalCapitalNeeded > 0 ? (loan / totalCapitalNeeded) * 100 : 0;
    
    const monthlyDebt = calculateEMI(loan, interest, term);
    const fixedMonthlyOpex = rent + utilities + salary + misc;

    // Depreciation: equipment depreciates over deprYears
    const depreciableAssets = equipment + decorMisc;
    const monthlyDepreciation = depreciableAssets / (deprYears * 12);

    const unitContributionMargin = price * (1 - costPct / 100 - commissionRate / 100);
    
    // Break-even including depreciation
    const breakEvenDailyVol = unitContributionMargin > 0 ? (fixedMonthlyOpex + monthlyDebt + monthlyDepreciation) / (30 * unitContributionMargin) : 0;

    // Display summary KPIs with animation
    const kpiCap = document.getElementById('kpi-total-capital');
    const kpiDebt = document.getElementById('kpi-monthly-debt');
    const kpiBe = document.getElementById('kpi-breakeven-vol');
    
    if (kpiCap) animateValue(kpiCap, 0, totalCapitalNeeded, 800, formatShortVND);
    if (kpiDebt) animateValue(kpiDebt, 0, monthlyDebt, 800, formatShortVND);
    if (kpiBe) animateValue(kpiBe, 0, breakEvenDailyVol, 800, (val) => Math.ceil(val) + ' ly/ngÃ y');

    const lblLeverage = document.getElementById('lbl-leverage-ratio');
    if (lblLeverage) lblLeverage.innerText = leverageRatio.toFixed(0) + '%';
    
    // Update leverage badge style
    const badge = document.getElementById('leverage-badge');
    if (badge) {
        if (leverageRatio > 50) {
            badge.style.color = 'var(--danger)';
            badge.style.borderColor = 'rgba(248, 113, 113, 0.4)';
            badge.style.backgroundColor = 'var(--danger-glow)';
        } else if (leverageRatio > 35) {
            badge.style.color = 'var(--warning)';
            badge.style.borderColor = 'rgba(251, 191, 36, 0.4)';
            badge.style.backgroundColor = 'var(--warning-glow)';
        } else {
            badge.style.color = 'var(--primary)';
            badge.style.borderColor = 'rgba(56, 189, 248, 0.3)';
            badge.style.backgroundColor = 'var(--primary-glow)';
        }
    }

    // Computing single scenario (with tax + depreciation + commission)
    function computeScenario(vol) {
        const rev = vol * 30 * price;
        const cogs = rev * (costPct / 100);
        const salaryObj = calculateMonthlySalary(rev);
        const opex = rent + utilities + salaryObj.baseSalary + misc + salaryObj.commission;
        const totalExpense = cogs + opex + monthlyDebt + monthlyDepreciation;
        const profitBeforeTax = rev - totalExpense;
        const tax = calculateTax(profitBeforeTax, rev * 12);
        const net = profitBeforeTax - tax;
        return { vol, rev, cogs, opex, totalExpense, profitBeforeTax, tax, net, commission: salaryObj.commission };
    }

    // Compute all 3 levels
    const scWeak = computeScenario(volWeak);
    const scBase = computeScenario(volBase);
    const scGood = computeScenario(volGood);

    // Update pill labels
    const pillWeakVol = document.getElementById('lbl-pill-weak-vol');
    const pillBaseVol = document.getElementById('lbl-pill-base-vol');
    const pillGoodVol = document.getElementById('lbl-pill-good-vol');
    if (pillWeakVol) pillWeakVol.innerText = volWeak;
    if (pillBaseVol) pillBaseVol.innerText = volBase;
    if (pillGoodVol) pillGoodVol.innerText = volGood;

    // Update 3 Scenario Forecast Cards
    const updateCardDOM = (level, sc) => {
        const elVol = document.getElementById(`fc-${level}-vol`);
        const elRev = document.getElementById(`fc-${level}-rev`);
        const elCost = document.getElementById(`fc-${level}-cost`);
        const elNet = document.getElementById(`fc-${level}-net`);
        const elStatus = document.getElementById(`fc-${level}-status`);

        if (elVol) elVol.innerText = sc.vol + ' ly/ngÃ y';
        if (elRev) elRev.innerText = formatShortVND(sc.rev);
        if (elCost) elCost.innerText = formatShortVND(sc.totalExpense);
        if (elNet) {
            elNet.innerText = (sc.net >= 0 ? '+' : '') + formatShortVND(sc.net);
            elNet.style.color = sc.net >= 0 ? 'var(--success)' : 'var(--danger)';
        }
        if (elStatus) {
            if (sc.net < 0) {
                elStatus.innerText = 'Cáº§n bÃ¹ lá»—: ' + formatShortVND(Math.abs(sc.net)) + '/th';
                elStatus.style.color = 'var(--danger)';
            } else if (sc.net === 0) {
                elStatus.innerText = 'HÃ²a vá»‘n kinh doanh';
                elStatus.style.color = 'var(--warning)';
            } else {
                elStatus.innerText = (level === 'good' ? 'Tá»‘i Æ°u: LÃ£i +' : 'LÃ£i +') + formatShortVND(sc.net) + '/th';
                elStatus.style.color = 'var(--success)';
            }
        }
    };

    updateCardDOM('weak', scWeak);
    updateCardDOM('base', scBase);
    updateCardDOM('good', scGood);

    // Selected active scenario drives the main dashboard
    const activeSc = activeScenario === 'weak' ? scWeak : (activeScenario === 'good' ? scGood : scBase);
    const base = activeSc;
    const selectedVol = activeSc.vol;

    // Update Sticky Summary Bar
    const stickyCap = document.getElementById('sticky-cap');
    const stickyBe = document.getElementById('sticky-be');
    const stickyBase = document.getElementById('sticky-base');
    if (stickyCap) stickyCap.innerText = formatShortVND(totalCapitalNeeded);
    if (stickyBe) stickyBe.innerText = Math.ceil(breakEvenDailyVol) + ' ly/n';
    if (stickyBase) {
        stickyBase.innerText = (base.net >= 0 ? '+' : '') + formatShortVND(base.net);
        stickyBase.className = 'sticky-val ' + (base.net >= 0 ? 'val-profit' : 'val-loss');
    }

    // Canvas Confetti Effect (Profit Margin > 20% on Base Scenario)
    if (base.rev > 0 && (base.net / base.rev) > 0.20) {
        if (typeof confetti !== 'undefined') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#34d399', '#fcd34d']
            });
        }
    }

    // Cash balance simulation (using net after tax)
    let currentBaseBuffer = buffer;
    const baseTrend = [buffer];
    
    for (let m = 1; m <= 12; m++) {
        currentBaseBuffer += base.net;
        baseTrend.push(Math.max(currentBaseBuffer, 0));
    }

    const alertContainer = document.getElementById('survival-alert-container');
    if (alertContainer) {
        const isLightAlert = document.body.classList.contains('light-theme');
        const burnRate = base.net < 0 ? Math.abs(base.net) : 0;
        const runwayMonths = burnRate > 0 ? (buffer / burnRate) : Infinity;

        alertContainer.style.display = 'flex';
        alertContainer.style.padding = '16px';
        alertContainer.style.borderRadius = '12px';
        alertContainer.style.border = '1px solid';
        
        let statusIcon = 'ðŸŸ¢';
        let statusText = 'An toÃ n';
        let badgeBg = 'rgba(16, 185, 129, 0.1)';
        let badgeColor = isLightAlert ? '#047857' : '#34d399';
        let badgeBorder = 'rgba(16, 185, 129, 0.3)';
        let borderColor = 'rgba(16, 185, 129, 0.2)';
        let textColor = isLightAlert ? '#0f172a' : '#f8fafc';
        let containerBg = isLightAlert ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.02)';
        let containerBorder = 'rgba(16, 185, 129, 0.25)';
        let warningMessage = 'Quá»¹ dá»± phÃ²ng á»Ÿ má»©c an toÃ n. Doanh sá»‘ dá»± kiáº¿n Ä‘áº£m báº£o kháº£ nÄƒng sinh lá»i hoáº·c sinh tá»“n á»•n Ä‘á»‹nh.';
        let runwayText = 'VÃ´ háº¡n (KhÃ´ng cáº¡n kiá»‡t)';

        if (runwayMonths !== Infinity) {
            runwayText = runwayMonths.toFixed(1) + ' thÃ¡ng';
        }

        if (burnRate > 0) {
            if (runwayMonths < 3) {
                statusIcon = 'ðŸ”´';
                statusText = 'Nguy hiá»ƒm';
                badgeBg = 'rgba(239, 68, 68, 0.1)';
                badgeColor = isLightAlert ? '#b91c1c' : '#f87171';
                badgeBorder = 'rgba(239, 68, 68, 0.3)';
                borderColor = 'rgba(239, 68, 68, 0.2)';
                textColor = isLightAlert ? '#b91c1c' : '#fca5a5';
                containerBg = 'var(--danger-glow)';
                containerBorder = 'rgba(239, 68, 68, 0.3)';
                warningMessage = `Vá»›i má»©c lá»— ${formatShortVND(burnRate)}/thÃ¡ng, quá»¹ dá»± phÃ²ng cá»§a báº¡n sáº½ cáº¡n kiá»‡t trong khoáº£ng ${runwayMonths.toFixed(1)} thÃ¡ng. Cáº§n cáº£i thiá»‡n doanh sá»‘ hoáº·c cáº¯t giáº£m Ä‘á»‹nh phÃ­.`;
                alertContainer.classList.add('danger-alert');
            } else if (runwayMonths <= 6) {
                statusIcon = 'ðŸŸ¡';
                statusText = 'Cáº£nh bÃ¡o';
                badgeBg = 'rgba(245, 158, 11, 0.1)';
                badgeColor = isLightAlert ? '#b45309' : '#fbbf24';
                badgeBorder = 'rgba(245, 158, 11, 0.3)';
                borderColor = 'rgba(245, 158, 11, 0.2)';
                textColor = isLightAlert ? '#92400e' : '#fde68a';
                containerBg = 'var(--warning-glow)';
                containerBorder = 'rgba(245, 158, 11, 0.3)';
                warningMessage = `Quá»¹ dá»± phÃ²ng Ä‘á»§ gÃ¡nh lá»— trong khoáº£ng ${runwayMonths.toFixed(1)} thÃ¡ng. Má»©c Ä‘á»™ an toÃ n á»Ÿ má»©c trung bÃ¬nh, cáº§n chÃº Ã½ tá»‘i Æ°u Ä‘á»‹nh phÃ­ hoáº·c tÄƒng doanh sá»‘.`;
                alertContainer.classList.remove('danger-alert');
            } else {
                alertContainer.classList.remove('danger-alert');
            }
        } else {
            alertContainer.classList.remove('danger-alert');
        }

        alertContainer.style.background = containerBg;
        alertContainer.style.borderColor = containerBorder;
        alertContainer.style.color = textColor;
        
        alertContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; width: 100%; gap: 10px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 6px; font-weight: bold; font-size: 13.5px;">
                        <span>${statusIcon}</span>
                        <span>Kháº£ NÄƒng Sinh Tá»“n TÃ i ChÃ­nh (Cash Runway)</span>
                    </div>
                    <span style="padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder};">
                        ${statusText}
                    </span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; border-top: 1px dashed ${borderColor}; padding-top: 8px; margin-top: 4px;">
                    <div>
                        <div style="font-size: 10.5px; color: var(--text-muted); font-weight: 600;">Tá»C Äá»˜ Äá»T TIá»€N (BURN RATE)</div>
                        <div style="font-size: 15px; font-weight: bold; margin-top: 2px; color: ${burnRate > 0 ? 'var(--danger)' : 'var(--success)'};">
                            ${base.net < 0 ? '-' + formatShortVND(burnRate) : '+' + formatShortVND(base.net)}/thÃ¡ng
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 10.5px; color: var(--text-muted); font-weight: 600;">THá»œI GIAN SINH Tá»’N (RUNWAY)</div>
                        <div style="font-size: 15px; font-weight: bold; margin-top: 2px;">
                            ${runwayText}
                        </div>
                    </div>
                </div>
                <div style="font-size: 12.5px; line-height: 1.4; margin-top: 4px;">
                    ${warningMessage}
                </div>
            </div>
        `;
    }

    // Render tables, disbursement schedule and pitch assistants (using net after tax)
    const totalEquityContributed = shareholders.reduce((sum, s) => sum + s.contribution, 0);
    renderShareholders(totalCapitalNeeded, loan, base.net);
    updateDisbursement(deposit, renovate, equipment, rawStart, decorMisc, buffer);
    updateInvestorPitch(totalEquityContributed, base.net, volBase, breakEvenDailyVol);

    // Draw active chart
    renderChart(base, breakEvenDailyVol, volBase, baseTrend, setupCosts, deposit, renovate, equipment, rawStart, decorMisc, totalEquityContributed, price, costPct, fixedMonthlyOpex, monthlyDebt, monthlyDepreciation);
}

// ======================================================================
// Chart Central Cleanup & Rendering with Data Labels
// ======================================================================
function destroyAllCharts() {
    ['financialChart', 'costStructureChart', 'equityStructureChart', 'cumulativeCashFlowChart', 'breakevenChart', 'longtermChart'].forEach(id => {
        const c = Chart.getChart(id);
        if (c) c.destroy();
    });
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    if (costChartInstance) { costChartInstance.destroy(); costChartInstance = null; }
    if (equityChartInstance) { equityChartInstance.destroy(); equityChartInstance = null; }
}

function renderChart(base, breakeven, volBase, baseTrend, setupCosts, deposit, renovate, equipment, rawStart, decorMisc, totalEquityContributed, basePrice, baseCostPct, fixedMonthlyOpex, monthlyDebt, monthlyDepreciation) {
    const isLight = document.body.classList.contains('light-theme');
    const textColor = isLight ? '#475569' : '#9ca3af';
    const gridColor = isLight ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.05)';

    Chart.defaults.color = textColor;
    Chart.defaults.font.family = 'Outfit';

    // Show/hide wrappers
    const mainWrapper = document.getElementById('main-chart-wrapper');
    const splitWrapper = document.getElementById('split-chart-wrapper');
    const sensitivityTab = document.getElementById('sensitivity-tab');
    const explanationTab = document.getElementById('explanation-tab');
    const investmentWrapper = document.getElementById('investment-wrapper');
    const breakevenTab = document.getElementById('breakeven-tab');
    const longtermTab = document.getElementById('longterm-tab');
    const advisorTab = document.getElementById('advisor-tab');

    if (mainWrapper) mainWrapper.style.display = 'none';
    if (splitWrapper) splitWrapper.style.display = 'none';
    if (sensitivityTab) sensitivityTab.style.display = 'none';
    if (explanationTab) explanationTab.style.display = 'none';
    if (investmentWrapper) investmentWrapper.style.display = 'none';
    if (breakevenTab) breakevenTab.style.display = 'none';
    if (longtermTab) longtermTab.style.display = 'none';
    if (advisorTab) advisorTab.style.display = 'none';

    // Always clean up any charts before rendering new tab
    destroyAllCharts();

    if (activeTab === 'structure') {
        if (splitWrapper) splitWrapper.style.display = 'grid';
    } else if (activeTab === 'advisor') {
        if (advisorTab) advisorTab.style.display = 'block';
        renderSmartAdvisor(base, breakeven, volBase, setupCosts, deposit, renovate, equipment, rawStart, decorMisc, totalEquityContributed, basePrice, baseCostPct, fixedMonthlyOpex, monthlyDebt, monthlyDepreciation);
        return;
    } else if (activeTab === 'sensitivity') {
        if (sensitivityTab) sensitivityTab.style.display = 'block';
        renderSensitivityTable(basePrice, baseCostPct, fixedMonthlyOpex, monthlyDebt, monthlyDepreciation, volBase);
        return;
    } else if (activeTab === 'explanation') {
        if (explanationTab) explanationTab.style.display = 'block';
        renderExplanation(basePrice, baseCostPct, fixedMonthlyOpex, monthlyDebt, monthlyDepreciation, volBase, setupCosts, deposit, renovate, equipment, rawStart, decorMisc, totalEquityContributed, breakeven, base);
        return;
    } else if (activeTab === 'investment') {
        if (investmentWrapper) investmentWrapper.style.display = 'block';
        renderInvestmentAnalysis();
        return;
    } else if (activeTab === 'breakeven') {
        if (breakevenTab) breakevenTab.style.display = 'block';
        renderBreakevenAnalysis(basePrice, baseCostPct, fixedMonthlyOpex, monthlyDebt, monthlyDepreciation, volBase);
        return;
    } else if (activeTab === 'longterm') {
        if (longtermTab) longtermTab.style.display = 'block';
        renderLongTermProjections(basePrice, baseCostPct, fixedMonthlyOpex, monthlyDebt, monthlyDepreciation, volBase, totalEquityContributed);
        return;
    } else {
        if (mainWrapper) mainWrapper.style.display = 'block';
    }

    if (activeTab === 'structure') {
        // Destroy main chart
        const mainChart = Chart.getChart("financialChart");
        if (mainChart) mainChart.destroy();

        // Draw 1st Donut Chart: Setup Cost Structure
        const costChart = Chart.getChart("costStructureChart");
        if (costChart) costChart.destroy();

        const costData = [
            deposit,
            renovate + decorMisc * 0.5,
            equipment + decorMisc * 0.5,
            rawStart
        ];

        const ctxCost = document.getElementById('costStructureChart').getContext('2d');
        costChartInstance = new Chart(ctxCost, {
            type: 'doughnut',
            data: {
                labels: ['Cá»c máº·t báº±ng', 'Thi cÃ´ng sá»­a chá»¯a', 'Thiáº¿t bá»‹ & BÃ n gháº¿', 'NguyÃªn liá»‡u Ä‘áº§u'],
                datasets: [{
                    data: costData,
                    backgroundColor: [
                        'rgba(56, 189, 248, 0.6)',
                        'rgba(251, 191, 36, 0.6)',
                        'rgba(129, 140, 248, 0.6)',
                        'rgba(52, 211, 153, 0.6)'
                    ],
                    borderColor: isLight ? '#ffffff' : '#1e293b',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        display: true, 
                        position: 'bottom',
                        labels: { boxWidth: 12, padding: 8, color: textColor }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ' ' + context.label + ': ' + formatVND(context.raw) + ` (${((context.raw / setupCosts)*100).toFixed(1)}%)`;
                            }
                        }
                    },
                    datalabels: getDataLabelConfig(isLight, 'doughnut')
                }
            }
        });

        // Draw 2nd Donut Chart: Shareholder split
        const equityChart = Chart.getChart("equityStructureChart");
        if (equityChart) equityChart.destroy();

        const labels = shareholders.map(s => s.name);
        const data = shareholders.map(s => s.contribution);
        const colors = [
            'rgba(56, 189, 248, 0.6)',
            'rgba(52, 211, 153, 0.6)',
            'rgba(251, 191, 36, 0.6)',
            'rgba(244, 114, 182, 0.6)',
            'rgba(167, 139, 250, 0.6)'
        ];

        const ctxEquity = document.getElementById('equityStructureChart').getContext('2d');
        equityChartInstance = new Chart(ctxEquity, {
            type: 'doughnut',
            data: {
                labels: labels.length > 0 ? labels : ['ChÆ°a gÃ³p vá»‘n'],
                datasets: [{
                    data: data.length > 0 ? data : [1],
                    backgroundColor: data.length > 0 ? colors.slice(0, data.length) : ['rgba(148, 163, 184, 0.3)'],
                    borderColor: isLight ? '#ffffff' : '#1e293b',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        display: true, 
                        position: 'bottom',
                        labels: { boxWidth: 12, padding: 8, color: textColor }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (context.label === 'ChÆ°a gÃ³p vá»‘n') return ' ChÆ°a gÃ³p vá»‘n';
                                return ' ' + context.label + ': ' + formatVND(context.raw) + ` (${((context.raw / totalEquityContributed)*100).toFixed(1)}%)`;
                            }
                        }
                    },
                    datalabels: getDataLabelConfig(isLight, 'pie')
                }
            }
        });

    } else {
        // Destroy donut charts
        const costChart = Chart.getChart("costStructureChart");
        if (costChart) costChart.destroy();
        const equityChart = Chart.getChart("equityStructureChart");
        if (equityChart) equityChart.destroy();
        const cumChart = Chart.getChart("cumulativeCashFlowChart");
        if (cumChart) cumChart.destroy();

        // Destroy main chart
        const mainChart = Chart.getChart("financialChart");
        if (mainChart) mainChart.destroy();

        const canvasEl = document.getElementById('financialChart');
        if (canvasEl && activeTab === 'cashflow') {
            const ctx = canvasEl.getContext('2d');
            const monthsLabel = ['Báº¯t Ä‘áº§u'];
            for (let i = 1; i <= 12; i++) monthsLabel.push('ThÃ¡ng ' + i);
            chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: monthsLabel,
                    datasets: [
                        {
                            label: 'Quá»¹ tiá»n máº·t dá»± kiáº¿n (VND)',
                            data: baseTrend,
                            borderColor: isLight ? '#0284c7' : '#38bdf8',
                            backgroundColor: isLight ? 'rgba(2, 132, 199, 0.08)' : 'rgba(56, 189, 248, 0.1)',
                            fill: true,
                            tension: 0.3,
                            borderWidth: 2.5,
                            pointRadius: 4,
                            pointBackgroundColor: isLight ? '#0284c7' : '#38bdf8'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true, position: 'top', labels: { color: textColor } },
                        tooltip: {
                            callbacks: {
                                label: function(context) { return 'Sá»‘ dÆ° quá»¹: ' + formatVND(context.raw); }
                            }
                        },
                        datalabels: getDataLabelConfig(isLight, 'line')
                    },
                    scales: {
                        y: {
                            grid: { color: gridColor },
                            ticks: {
                                callback: function(value) { return formatShortVND(value); },
                                color: textColor
                            }
                        },
                        x: { grid: { display: false }, ticks: { color: textColor } }
                    }
                }
            });
        }
    }
}

// ======================================================================
// Window actions registration
// ======================================================================
window.switchTab = function(tabName) {
    activeTab = tabName;

    const buttons = document.querySelectorAll('.tab-header .tab-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        const onclickAttr = btn.getAttribute('onclick') || '';
        if (onclickAttr.includes(`'${tabName}'`) || onclickAttr.includes(`"${tabName}"`)) {
            btn.classList.add('active');
        }
    });

    updateDashboard();
};

window.toggleTheme = function() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    
    const moonIcon = document.querySelector('.moon-icon');
    const sunIcon = document.querySelector('.sun-icon');
    if (isLight) {
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
    } else {
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
    }
    updateDashboard();
}

window.exportPDF = function() {
    window.print();
}

// ======================================================================
// Product Mix Logic
// ======================================================================
let menuItems = [
    { id: 1, name: "CÃ  phÃª", volumePct: 40, price: 25000, costPct: 25 },
    { id: 2, name: "TrÃ  & Sinh tá»‘", volumePct: 40, price: 35000, costPct: 30 },
    { id: 3, name: "BÃ¡nh & Äá»“ Äƒn", volumePct: 20, price: 30000, costPct: 45 }
];

function updateMenuVolumeWarning() {
    const warnEl = document.getElementById('menu-vol-warning');
    const totalVol = menuItems.reduce((sum, item) => sum + parseFloat(item.volumePct || 0), 0);
    if (warnEl) {
        if (Math.abs(totalVol - 100) > 0.1) {
            warnEl.style.display = 'block';
            warnEl.innerText = `LÆ°u Ã½: Tá»•ng tá»· trá»ng bÃ¡n = ${totalVol.toFixed(1)}%. NÃªn Ä‘iá»u chá»‰nh láº¡i cho Ä‘á»§ 100%.`;
        } else {
            warnEl.style.display = 'none';
        }
    }
}

window.renderMenuItems = function() {
    const container = document.getElementById('menu-items-container');
    if (!container) return;
    
    let html = '';
    menuItems.forEach((item) => {
        html += `
            <div class="menu-item-row" data-id="${item.id}" style="display:grid; grid-template-columns: 2fr 1fr 1.5fr 1fr 24px; gap: 8px; margin-bottom: 8px; align-items:center;">
                <input type="text" class="menu-name" value="${item.name}" oninput="updateMenuItem(${item.id}, 'name', this.value)" style="padding:6px 8px; font-size:12px;">
                <div class="input-wrapper">
                    <input type="number" class="menu-vol" value="${item.volumePct}" oninput="updateMenuItem(${item.id}, 'volumePct', this.value)" style="padding:6px 8px; font-size:12px;">
                    <span class="unit">%</span>
                </div>
                <div class="input-wrapper">
                    <input type="text" class="menu-price" value="${formatNumber(item.price)}" oninput="formatAndSetMenuPrice(this, ${item.id})" style="padding:6px 8px; font-size:12px;">
                </div>
                <div class="input-wrapper">
                    <input type="number" class="menu-cost" value="${item.costPct}" oninput="updateMenuItem(${item.id}, 'costPct', this.value)" style="padding:6px 8px; font-size:12px;">
                    <span class="unit">%</span>
                </div>
                <button onclick="removeMenuItem(${item.id})" style="background:transparent; border:none; color:var(--danger); cursor:pointer; font-size:14px; display:flex; align-items:center; justify-content:center;">Ã—</button>
            </div>
        `;
    });
    
    html += `<div id="menu-vol-warning" style="font-size:11px; color:var(--danger); margin-top: 4px; display: none;"></div>`;
    
    container.innerHTML = html;
    updateMenuVolumeWarning();
    calculateWeightedMenu();
};

window.updateMenuItem = function(id, field, value) {
    const item = menuItems.find(i => i.id === id);
    if (item) {
        if (field === 'price') {
            item[field] = parseNumber(value);
        } else if (field === 'name') {
            item[field] = value;
        } else {
            item[field] = parseFloat(value) || 0;
        }
    }
    updateMenuVolumeWarning();
    calculateWeightedMenu();
};

window.formatAndSetMenuPrice = function(inputElement, id) {
    let selectionStart = inputElement.selectionStart;
    let rawVal = inputElement.value;
    let isNegative = rawVal.startsWith('-');
    let digits = rawVal.replace(/\D/g, '');
    
    if (digits === "") {
        inputElement.value = isNegative ? "-" : "";
        const item = menuItems.find(i => i.id === id);
        if (item) item.price = 0;
        calculateWeightedMenu();
        return;
    }
    
    let dotsBeforeCursor = (inputElement.value.slice(0, selectionStart).match(/\./g) || []).length;
    let formattedValue = (isNegative ? "-" : "") + digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    inputElement.value = formattedValue;
    let newDotsBeforeCursor = (formattedValue.slice(0, selectionStart).match(/\./g) || []).length;
    let diff = newDotsBeforeCursor - dotsBeforeCursor;
    let newPos = Math.max(0, selectionStart + diff);
    inputElement.setSelectionRange(newPos, newPos);
    
    const item = menuItems.find(i => i.id === id);
    if (item) item.price = parseNumber(formattedValue);
    calculateWeightedMenu();
};

window.addMenuItem = function() {
    menuItems.push({ id: Date.now(), name: "NhÃ³m má»›i", volumePct: 0, price: 0, costPct: 0 });
    renderMenuItems();
};

window.removeMenuItem = function(id) {
    menuItems = menuItems.filter(i => i.id !== id);
    renderMenuItems();
};

window.calculateWeightedMenu = function() {
    let totalVol = 0;
    let weightedPriceSum = 0;
    let weightedCostAmountSum = 0;
    
    menuItems.forEach(item => {
        let vol = parseFloat(item.volumePct) || 0;
        let price = parseFloat(item.price) || 0;
        let costPct = parseFloat(item.costPct) || 0;
        
        totalVol += vol;
        weightedPriceSum += (price * vol);
        weightedCostAmountSum += (price * (costPct / 100) * vol);
    });
    
    let avgPrice = 0;
    let avgCostPct = 0;
    if (totalVol > 0) {
        avgPrice = weightedPriceSum / totalVol;
        if (weightedPriceSum > 0) {
            avgCostPct = (weightedCostAmountSum / weightedPriceSum) * 100;
        }
    }
    
    const lblPrice = document.getElementById('lbl-weighted-price');
    const lblCost = document.getElementById('lbl-weighted-cost');
    if (lblPrice) lblPrice.innerText = formatVND(avgPrice);
    if (lblCost) lblCost.innerText = avgCostPct.toFixed(1) + '%';
    
    const inpPrice = document.getElementById('inp-price');
    const inpCost = document.getElementById('inp-cost-pct');
    if (inpPrice) inpPrice.value = Math.round(avgPrice);
    if (inpCost) inpCost.value = avgCostPct.toFixed(2);
    
    updateDashboard();
};

// ======================================================================
// Core setup on load
// ======================================================================
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const moonIcon = document.querySelector('.moon-icon');
    const sunIcon = document.querySelector('.sun-icon');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
    } else {
        document.body.classList.remove('light-theme');
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
    }

    // Set up Dividend Payout listeners
    const divRetainedInput = document.getElementById('inp-div-retained');
    const divPayoutInput = document.getElementById('inp-div-payout');
    if (divRetainedInput && divPayoutInput) {
        divRetainedInput.addEventListener('input', () => {
            let retained = parseFloat(divRetainedInput.value);
            if (isNaN(retained) || retained < 0) retained = 0;
            if (retained > 100) retained = 100;
            divRetainedInput.value = retained;
            divPayoutInput.value = 100 - retained;
            updateDashboard();
        });
    }

    setupInputFormatting();
    setupRentDepositSync();
    renderMenuItems();
    
    // Bind change update on non-formatted fields with safe helper
    const safeAddListener = (id, event, fn) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener(event, fn);
    };

    [
        'inp-interest', 'inp-shift-morning-staff', 'inp-shift-morning-rate',
        'inp-shift-afternoon-staff', 'inp-shift-afternoon-rate',
        'inp-shift-evening-staff', 'inp-shift-evening-rate',
        'inp-ft-manager-count', 'inp-ft-manager-salary',
        'inp-weekend-multiplier', 'inp-commission-rate',
        'inp-discount-rate', 'inp-growth-rev', 'inp-growth-opex',
        'inp-term', 'inp-cost-pct', 'inp-vol-weak', 'inp-vol-base', 'inp-vol-good', 'inp-depr-years',
        'inp-tax-rate', 'inp-price', 'inp-div-payout'
    ].forEach(id => safeAddListener(id, 'input', updateDashboard));

    updateDashboard();
});

// ======================================================================
// Scenario Save & Load & Config Portability Logic
// ======================================================================

const DEFAULT_INPUTS = {
    'inp-deposit': '50000000',
    'inp-renovate': '70000000',
    'inp-equipment': '60000000',
    'inp-raw-start': '15000000',
    'inp-decor-misc': '10000000',
    'inp-buffer': '30000000',
    'inp-loan': '0',
    'inp-interest': '10',
    'inp-term': '12',
    'inp-rent': '25000000',
    'inp-utilities': '4000000',
    'inp-shift-morning-staff': '2',
    'inp-shift-morning-rate': '22000',
    'inp-shift-afternoon-staff': '2',
    'inp-shift-afternoon-rate': '22000',
    'inp-shift-evening-staff': '2',
    'inp-shift-evening-rate': '25000',
    'inp-ft-manager-count': '1',
    'inp-ft-manager-salary': '9000000',
    'inp-weekend-multiplier': '1.15',
    'inp-commission-rate': '0',
    'inp-misc': '3000000',
    'inp-price': '28000',
    'inp-cost-pct': '30',
    'inp-vol-weak': '80',
    'inp-vol-base': '120',
    'inp-vol-good': '180',
    'inp-discount-rate': '15',
    'inp-growth-rev': '5',
    'inp-growth-opex': '3',
    'inp-depr-years': '5',
    'inp-tax-rate': '20',
    'inp-div-retained': '30',
    'inp-div-payout': '70'
};

const DEFAULT_MENU_ITEMS = [
    { id: 1, name: "CÃ  phÃª", volumePct: 40, price: 25000, costPct: 25 },
    { id: 2, name: "TrÃ  & Sinh tá»‘", volumePct: 40, price: 35000, costPct: 30 },
    { id: 3, name: "BÃ¡nh & Äá»“ Äƒn", volumePct: 20, price: 30000, costPct: 45 }
];

const DEFAULT_SHAREHOLDERS = [
    { id: 1, name: "Báº¡n (Cá»• Ä‘Ã´ng sÃ¡ng láº­p)", contribution: 80000000, role: "operate" }
];

function getInputsData() {
    const inputs = [
        'inp-deposit', 'inp-renovate', 'inp-equipment', 'inp-raw-start', 'inp-decor-misc', 'inp-buffer',
        'inp-loan', 'inp-interest', 'inp-term',
        'inp-rent', 'inp-utilities',
        'inp-shift-morning-staff', 'inp-shift-morning-rate',
        'inp-shift-afternoon-staff', 'inp-shift-afternoon-rate',
        'inp-shift-evening-staff', 'inp-shift-evening-rate',
        'inp-ft-manager-count', 'inp-ft-manager-salary',
        'inp-weekend-multiplier', 'inp-commission-rate', 'inp-misc',
        'inp-price', 'inp-cost-pct',
        'inp-vol-weak', 'inp-vol-base', 'inp-vol-good', 'inp-discount-rate',
        'inp-growth-rev', 'inp-growth-opex',
        'inp-depr-years', 'inp-tax-rate', 'inp-div-retained', 'inp-div-payout'
    ];
    let data = {};
    inputs.forEach(id => {
        let el = document.getElementById(id);
        if (el) data[id] = el.value;
    });
    return data;
}

function setInputsData(data) {
    for (let id in data) {
        let el = document.getElementById(id);
        if (el) {
            el.value = data[id];
            if (el.parentElement && el.parentElement.classList.contains('input-wrapper') && el.type === 'text') {
                el.value = formatNumber(parseNumber(data[id]));
            }
        }
    }
}



document.addEventListener('DOMContentLoaded', () => {
    // Check for shared URL data
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('data');
    if (sharedData) {
        try {
            const decodedJson = decodeURIComponent(atob(sharedData).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const parsed = JSON.parse(decodedJson);
            if (parsed.currentInputs) {
                setInputsData(parsed.currentInputs);
                
                if (parsed.menuItems && Array.isArray(parsed.menuItems)) {
                    menuItems = parsed.menuItems;
                    renderMenuItems();
                }
                
                if (parsed.savedScenarios) {
                    localStorage.setItem('coffeelytics_scenarios', JSON.stringify(parsed.savedScenarios));
                }
                
                if (parsed.shareholders && Array.isArray(parsed.shareholders)) {
                    shareholders = parsed.shareholders;
                    renderShareholders();
                }
                
                // Clear the URL parameter so it doesn't re-trigger on reload
                window.history.replaceState({}, document.title, window.location.pathname);
                alert("ÄÃ£ táº£i dá»¯ liá»‡u tá»« Ä‘Æ°á»ng link chia sáº» thÃ nh cÃ´ng!");
            }
        } catch (err) {
            console.error("Lá»—i giáº£i mÃ£ liÃªn káº¿t chia sáº»:", err);
        }
    }
});

// ======================================================================
// Investment Analysis (NPV & IRR)
// ======================================================================

function renderInvestmentAnalysis() {
    const wrapper = document.getElementById('investment-wrapper');
    if (!wrapper) return;

    // Read all inputs from DOM
    const deposit = parseNumber(document.getElementById('inp-deposit').value);
    const renovate = parseNumber(document.getElementById('inp-renovate').value);
    const equipment = parseNumber(document.getElementById('inp-equipment').value);
    const rawStart = parseNumber(document.getElementById('inp-raw-start').value);
    const decorMisc = parseNumber(document.getElementById('inp-decor-misc').value);
    const buffer = parseNumber(document.getElementById('inp-buffer').value);
    const deprYears = parseInt(document.getElementById('inp-depr-years').value) || 5;

    const loan = parseNumber(document.getElementById('inp-loan').value);
    const interest = parseFloat(document.getElementById('inp-interest').value) || 0;
    const term = parseInt(document.getElementById('inp-term').value) || 12;

    const rent = parseNumber(document.getElementById('inp-rent').value);
    const utilities = parseNumber(document.getElementById('inp-utilities').value);
    const salaryObj = calculateMonthlySalary(0);
    const salary = salaryObj.baseSalary;
    const misc = parseNumber(document.getElementById('inp-misc').value);

    const price = parseNumber(document.getElementById('inp-price').value);
    const costPct = parseFloat(document.getElementById('inp-cost-pct').value) || 0;
    const vol = parseFloat(document.getElementById('inp-vol-base').value) || 0;

    const discountRatePct = parseFloat(document.getElementById('inp-discount-rate').value) || 15;
    const growthRevPct = parseFloat(document.getElementById('inp-growth-rev').value) || 0;
    const growthOpexPct = parseFloat(document.getElementById('inp-growth-opex').value) || 0;
    const commissionRate = parseFloat(document.getElementById('inp-commission-rate')?.value || '0');

    // Derived values
    const setupCosts = deposit + renovate + equipment + rawStart + decorMisc;
    const totalCapital = setupCosts + buffer;
    const fixedMonthlyOpex = rent + utilities + salary + misc;
    const monthlyDebt = calculateEMI(loan, interest, term);
    const depreciableAssets = equipment + decorMisc;
    const monthlyDepreciation = depreciableAssets / (deprYears * 12);

    // Calculations for 36 months
    let monthlyRate = Math.pow(1 + (discountRatePct / 100), 1/12) - 1;
    let npv = -totalCapital;
    let pvCashflowsIn = 0;
    let currentCumCash = -totalCapital;
    let currentCumPV = -totalCapital;
    let paybackMonth = -1;
    let discPaybackMonth = -1;
    
    let yearData = [
        { year: 0, rev: 0, opex: 0, tax: 0, net: -totalCapital, pv: -totalCapital },
        { year: 1, rev: 0, opex: 0, tax: 0, net: 0, pv: 0 },
        { year: 2, rev: 0, opex: 0, tax: 0, net: 0, pv: 0 },
        { year: 3, rev: 0, opex: 0, tax: 0, net: 0, pv: 0 }
    ];

    let monthlyData = [];
    
    for (let m = 1; m <= 36; m++) {
        let y = Math.ceil(m / 12);
        let gRev = Math.pow(1 + (growthRevPct / 100), y - 1);
        let gOpex = Math.pow(1 + (growthOpexPct / 100), y - 1);
        
        let mRev = vol * 30 * price * gRev;
        let mCogs = mRev * (costPct / 100);
        let mOpex = fixedMonthlyOpex * gOpex + (mRev * (commissionRate / 100));
        let mDebt = (m <= term) ? monthlyDebt : 0;
        let mDepr = (m <= deprYears * 12) ? monthlyDepreciation : 0;
        
        let mPBT = mRev - mCogs - mOpex - mDebt - mDepr;
        let taxRate = getSuggestedTaxRate(mRev * 12);
        let mTax = mPBT > 0 ? mPBT * (taxRate / 100) : 0;
        
        // actual cash flow
        let mCashFlow = mRev - mCogs - mOpex - mDebt - mTax;
        
        let pv = mCashFlow / Math.pow(1 + monthlyRate, m);
        npv += pv;
        if (mCashFlow > 0) {
            pvCashflowsIn += pv;
        }
        
        currentCumCash += mCashFlow;
        currentCumPV += pv;
        
        if (currentCumCash >= 0 && paybackMonth === -1) {
            let prevCumCash = currentCumCash - mCashFlow;
            paybackMonth = (m - 1) + (Math.abs(prevCumCash) / mCashFlow);
        }
        
        if (currentCumPV >= 0 && discPaybackMonth === -1) {
            let prevCumPV = currentCumPV - pv;
            discPaybackMonth = (m - 1) + (Math.abs(prevCumPV) / pv);
        }
        
        yearData[y].rev += mRev;
        yearData[y].opex += mOpex + mCogs + mDebt;
        yearData[y].tax += mTax;
        yearData[y].net += mCashFlow;
        yearData[y].pv += pv;
        
        monthlyData.push({
            month: m,
            cashflow: mCashFlow,
            cumCash: currentCumCash,
            cumPv: currentCumPV
        });
    }

    // IRR
    let irrMonthly = 0;
    let totalInflow = 0;
    for (let m = 1; m <= 36; m++) {
        totalInflow += monthlyData[m-1].cashflow;
    }
    
    if (totalInflow > totalCapital) {
        let low = -0.99;
        let high = 2.0;
        for (let i = 0; i < 100; i++) {
            let mid = (low + high) / 2;
            let val = -totalCapital;
            for (let m = 1; m <= 36; m++) {
                val += monthlyData[m-1].cashflow / Math.pow(1 + mid, m);
            }
            if (val > 0) low = mid;
            else high = mid;
        }
        irrMonthly = (low + high) / 2;
    }
    
    let irrAnnual = irrMonthly > -0.99 ? (Math.pow(1 + irrMonthly, 12) - 1) * 100 : -100;
    let roi = ((totalInflow - totalCapital) / totalCapital) * 100;
    let pi = pvCashflowsIn / totalCapital;

    let paybackText = paybackMonth > 0 ? paybackMonth.toFixed(1) + " thÃ¡ng" : "KhÃ´ng trong 3 nÄƒm";
    let discPaybackText = discPaybackMonth > 0 ? discPaybackMonth.toFixed(1) + " thÃ¡ng" : "KhÃ´ng trong 3 nÄƒm";

    let npvColor = npv >= 0 ? 'val-profit' : 'val-loss';
    let irrColor = irrAnnual >= discountRatePct ? 'val-profit' : 'val-loss';
    let piColor = pi >= 1 ? 'val-profit' : 'val-loss';
    let roiColor = roi >= 0 ? 'val-profit' : 'val-loss';

    let cumY1 = -totalCapital + yearData[1].pv;
    let cumY2 = cumY1 + yearData[2].pv;
    let cumY3 = cumY2 + yearData[3].pv;

    // Unit Contribution Margin & breakeven daily volume
    const unitContributionMargin = price * (1 - costPct / 100);
    const breakEvenDailyVol = unitContributionMargin > 0 ? (fixedMonthlyOpex + monthlyDebt + monthlyDepreciation) / (30 * unitContributionMargin) : 0;

    let html = `
        <h3 class="chart-sub-title">PhÃ¢n tÃ­ch Hiá»‡u Quáº£ Äáº§u TÆ° (Táº§m nhÃ¬n 3 nÄƒm)</h3>
        
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
            Sáº£n lÆ°á»£ng dá»± kiáº¿n: <strong>${vol} ly/ngÃ y</strong>. Tá»•ng vá»‘n: ${formatShortVND(totalCapital)}. TÄƒng trÆ°á»Ÿng DT: ${growthRevPct}%/nÄƒm | TÄƒng chi phÃ­: ${growthOpexPct}%/nÄƒm.
        </p>

        <div class="scenarios-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
            <div class="glass-card scenario-card" style="padding: 12px;">
                <div class="scenario-metric">
                    <span style="font-size:14px; font-weight:600; color: var(--text-muted);">HoÃ n vá»‘n Ä‘Æ¡n giáº£n</span>
                    <span style="font-size:16px; color:var(--primary); font-weight:bold; margin-top: 4px;">${paybackText}</span>
                </div>
            </div>
            <div class="glass-card scenario-card" style="padding: 12px;">
                <div class="scenario-metric">
                    <span style="font-size:14px; font-weight:600; color: var(--text-muted);">HoÃ n vá»‘n chiáº¿t kháº¥u</span>
                    <span style="font-size:16px; color:var(--primary); font-weight:bold; margin-top: 4px;">${discPaybackText}</span>
                </div>
            </div>
            <div class="glass-card scenario-card" style="padding: 12px;">
                <div class="scenario-metric">
                    <span style="font-size:14px; font-weight:600; color: var(--text-muted);">Sáº£n lÆ°á»£ng hÃ²a vá»‘n</span>
                    <span style="font-size:16px; color:var(--primary); font-weight:bold; margin-top: 4px;">${Math.ceil(breakEvenDailyVol)} ly/ngÃ y</span>
                </div>
            </div>
            <div class="glass-card scenario-card" style="padding: 12px;">
                <div class="scenario-metric">
                    <span style="font-size:14px; font-weight:600; color: var(--text-muted);">NPV (Hiá»‡n giÃ¡ thuáº§n)</span>
                    <span class="${npvColor}" style="font-size:16px; font-weight:bold; margin-top: 4px;">${npv >= 0 ? '+' : ''}${formatShortVND(npv)}</span>
                </div>
            </div>
            <div class="glass-card scenario-card" style="padding: 12px;">
                <div class="scenario-metric">
                    <span style="font-size:14px; font-weight:600; color: var(--text-muted);">IRR (Tá»· suáº¥t ná»™i bá»™)</span>
                    <span class="${irrColor}" style="font-size:16px; font-weight:bold; margin-top: 4px;">${totalInflow > totalCapital && irrAnnual > -100 ? irrAnnual.toFixed(1) + '%' : 'N/A'}</span>
                </div>
            </div>
            <div class="glass-card scenario-card" style="padding: 12px;">
                <div class="scenario-metric">
                    <span style="font-size:14px; font-weight:600; color: var(--text-muted);">ROI (Tá»· lá»‡ hoÃ n vá»‘n)</span>
                    <span class="${roiColor}" style="font-size:16px; font-weight:bold; margin-top: 4px;">${roi.toFixed(1)}%</span>
                </div>
            </div>
            <div class="glass-card scenario-card" style="padding: 12px;">
                <div class="scenario-metric">
                    <span style="font-size:14px; font-weight:600; color: var(--text-muted);">PI (Chá»‰ sá»‘ sinh lá»i)</span>
                    <span class="${piColor}" style="font-size:16px; font-weight:bold; margin-top: 4px;">${pi.toFixed(2)}</span>
                </div>
            </div>
        </div>

        <div class="explanation-box" style="margin-top:16px; padding: 12px 16px; background: rgba(15,23,42,0.02); border-radius: 6px; border-left: 4px solid ${npv >= 0 ? 'var(--primary)' : 'var(--danger)'};">
            <strong>Káº¿t luáº­n tÃ i chÃ­nh:</strong> 
            ${npv >= 0 ? `<span style="color:var(--val-profit)">Dá»± Ã¡n kháº£ thi vá» máº·t tÃ i chÃ­nh (NPV &gt; 0, chá»‰ sá»‘ PI Ä‘áº¡t ${pi.toFixed(2)} &gt; 1). IRR Ä‘áº¡t ${irrAnnual.toFixed(1)}% lá»›n hÆ¡n lÃ£i suáº¥t chiáº¿t kháº¥u ${discountRatePct}%.</span>` : `<span style="color:var(--val-loss)">Dá»± Ã¡n khÃ´ng hiá»‡u quáº£ vá»›i má»©c lÃ£i suáº¥t chiáº¿t kháº¥u nÃ y (NPV &lt; 0, PI Ä‘áº¡t ${pi.toFixed(2)} &lt; 1). Báº¡n nÃªn cÃ¢n nháº¯c Ä‘iá»u chá»‰nh Ä‘á»‹nh phÃ­, giÃ¡ bÃ¡n hoáº·c cáº£i thiá»‡n sáº£n lÆ°á»£ng bÃ¡n.</span>`}
        </div>

        <!-- Cumulative Cash Flow Chart -->
        <div style="margin-top: 24px;">
            <h4 class="chart-sub-title" style="margin-bottom: 8px;">Äá»“ Thá»‹ DÃ²ng Tiá»n TÃ­ch LÅ©y 36 ThÃ¡ng (HÃ²a vá»‘n khi Ä‘Æ°á»ng tÃ­ch lÅ©y vÆ°á»£t má»©c 0)</h4>
            <div class="chart-container" style="position: relative; height: 250px; width: 100%;">
                <canvas id="cumulativeCashFlowChart"></canvas>
            </div>
        </div>

        <!-- Detailed Year-by-Year Table -->
        <div style="margin-top: 24px; overflow-x: auto;">
            <h4 class="chart-sub-title" style="margin-bottom: 8px;">Báº£ng Chi Tiáº¿t DÃ²ng Tiá»n 3 NÄƒm (Ä‘Æ¡n vá»‹: Ä‘)</h4>
            <table class="sensitivity-table" style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr>
                        <th style="text-align: left; padding: 8px; border-bottom: 2px solid var(--border-color);">Khoáº£n má»¥c \\ Thá»i Ä‘iá»ƒm</th>
                        <th style="text-align: right; padding: 8px; border-bottom: 2px solid var(--border-color);">NÄƒm 0 (Hiá»‡n táº¡i)</th>
                        <th style="text-align: right; padding: 8px; border-bottom: 2px solid var(--border-color);">NÄƒm 1</th>
                        <th style="text-align: right; padding: 8px; border-bottom: 2px solid var(--border-color);">NÄƒm 2</th>
                        <th style="text-align: right; padding: 8px; border-bottom: 2px solid var(--border-color);">NÄƒm 3</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="text-align: left; padding: 8px; font-weight: 500;">Doanh thu thuáº§n</td>
                        <td style="text-align: right; padding: 8px; color: var(--text-muted);">--</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[1].rev))}Ä‘</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[2].rev))}Ä‘</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[3].rev))}Ä‘</td>
                    </tr>
                    <tr>
                        <td style="text-align: left; padding: 8px; font-weight: 500;">Tá»•ng chi phÃ­ hoáº¡t Ä‘á»™ng (gá»“m COGS & Ná»£ vay)</td>
                        <td style="text-align: right; padding: 8px; color: var(--text-muted);">--</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[1].opex))}Ä‘</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[2].opex))}Ä‘</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[3].opex))}Ä‘</td>
                    </tr>
                    <tr>
                        <td style="text-align: left; padding: 8px; font-weight: 500;">Thuáº¿ TNDN</td>
                        <td style="text-align: right; padding: 8px; color: var(--text-muted);">--</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[1].tax))}Ä‘</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[2].tax))}Ä‘</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[3].tax))}Ä‘</td>
                    </tr>
                    <tr style="border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); font-weight: 600; background: rgba(15,23,42,0.01);">
                        <td style="text-align: left; padding: 8px;">DÃ²ng tiá»n rÃ²ng (Net Cash Flow)</td>
                        <td style="text-align: right; padding: 8px; color: var(--val-loss);">${formatNumber(Math.round(-totalCapital))}Ä‘</td>
                        <td style="text-align: right; padding: 8px; color: ${yearData[1].net >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${yearData[1].net >= 0 ? '+' : ''}${formatNumber(Math.round(yearData[1].net))}Ä‘</td>
                        <td style="text-align: right; padding: 8px; color: ${yearData[2].net >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${yearData[2].net >= 0 ? '+' : ''}${formatNumber(Math.round(yearData[2].net))}Ä‘</td>
                        <td style="text-align: right; padding: 8px; color: ${yearData[3].net >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${yearData[3].net >= 0 ? '+' : ''}${formatNumber(Math.round(yearData[3].net))}Ä‘</td>
                    </tr>
                    <tr>
                        <td style="text-align: left; padding: 8px; font-weight: 500; color: var(--text-muted);">Há»‡ sá»‘ chiáº¿t kháº¥u</td>
                        <td style="text-align: right; padding: 8px; color: var(--text-muted);">1.000</td>
                        <td style="text-align: right; padding: 8px; color: var(--text-muted);">${(1 / Math.pow(1 + (discountRatePct / 100), 1)).toFixed(3)}</td>
                        <td style="text-align: right; padding: 8px; color: var(--text-muted);">${(1 / Math.pow(1 + (discountRatePct / 100), 2)).toFixed(3)}</td>
                        <td style="text-align: right; padding: 8px; color: var(--text-muted);">${(1 / Math.pow(1 + (discountRatePct / 100), 3)).toFixed(3)}</td>
                    </tr>
                    <tr style="font-weight: 600; border-top: 1px dashed var(--border-color);">
                        <td style="text-align: left; padding: 8px;">DÃ²ng tiá»n chiáº¿t kháº¥u (PV)</td>
                        <td style="text-align: right; padding: 8px; color: var(--val-loss);">${formatNumber(Math.round(-totalCapital))}Ä‘</td>
                        <td style="text-align: right; padding: 8px; color: ${yearData[1].pv >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${yearData[1].pv >= 0 ? '+' : ''}${formatNumber(Math.round(yearData[1].pv))}Ä‘</td>
                        <td style="text-align: right; padding: 8px; color: ${yearData[2].pv >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${yearData[2].pv >= 0 ? '+' : ''}${formatNumber(Math.round(yearData[2].pv))}Ä‘</td>
                        <td style="text-align: right; padding: 8px; color: ${yearData[3].pv >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${yearData[3].pv >= 0 ? '+' : ''}${formatNumber(Math.round(yearData[3].pv))}Ä‘</td>
                    </tr>
                    <tr style="background: rgba(15,23,42,0.03); font-weight: bold; border-top: 2px solid var(--border-color);">
                        <td style="text-align: left; padding: 8px;">TÃ­ch lÅ©y chiáº¿t kháº¥u (Cumulative PV)</td>
                        <td style="text-align: right; padding: 8px; color: var(--val-loss);">${formatNumber(Math.round(-totalCapital))}Ä‘</td>
                        <td style="text-align: right; padding: 8px; color: ${cumY1 >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${cumY1 >= 0 ? '+' : ''}${formatNumber(Math.round(cumY1))}Ä‘</td>
                        <td style="text-align: right; padding: 8px; color: ${cumY2 >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${cumY2 >= 0 ? '+' : ''}${formatNumber(Math.round(cumY2))}Ä‘</td>
                        <td style="text-align: right; padding: 8px; color: ${cumY3 >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${cumY3 >= 0 ? '+' : ''}${formatNumber(Math.round(cumY3))}Ä‘</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Detailed explanation of metrics -->
        <div class="glass-card" style="margin-top: 24px; padding: 16px; font-size: 13.5px; line-height: 1.6; color: var(--text-main);">
            <h4 class="chart-sub-title" style="margin-bottom: 12px; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px; color: var(--primary);">
                ðŸ’¡ Diá»…n giáº£i & CÃ´ng thá»©c tÃ­nh chi tiáº¿t (Sáº£n lÆ°á»£ng ${vol} ly/ngÃ y)
            </h4>
            <div style="display: flex; flex-direction: column; gap: 14px;">
                <div>
                    <strong>1. Tá»•ng vá»‘n Ä‘áº§u tÆ° ban Ä‘áº§u (Vá»‘n cáº§n thiáº¿t):</strong>
                    <div style="padding-left: 12px; color: var(--text-muted); margin-top: 2px;">
                        â€¢ CÃ´ng thá»©c: Cá»c máº·t báº±ng (${formatShortVND(deposit)}) + Thi cÃ´ng sá»­a chá»¯a (${formatShortVND(renovate)}) + Thiáº¿t bá»‹ mÃ¡y mÃ³c (${formatShortVND(equipment)}) + NguyÃªn liá»‡u khá»Ÿi táº¡o (${formatShortVND(rawStart)}) + Decor & KhÃ¡c (${formatShortVND(decorMisc)}) + Dá»± phÃ²ng gá»“ng lá»— (${formatShortVND(buffer)}).
                        <br>â€¢ Káº¿t quáº£: <strong>${formatNumber(totalCapital)} Ä‘</strong>.
                    </div>
                </div>
                <div>
                    <strong>2. Thá»i gian hoÃ n vá»‘n Ä‘Æ¡n giáº£n (Simple Payback):</strong>
                    <div style="padding-left: 12px; color: var(--text-muted); margin-top: 2px;">
                        â€¢ CÃ´ng thá»©c: Tá»•ng vá»‘n Ä‘áº§u tÆ° / DÃ²ng tiá»n rÃ²ng hÃ ng thÃ¡ng trung bÃ¬nh nÄƒm 1.
                        <br>â€¢ CÃ¡ch tÃ­nh: ${formatNumber(totalCapital)} Ä‘ / ${formatNumber(Math.round(yearData[1].net / 12))} Ä‘ (dÃ²ng tiá»n rÃ²ng trung bÃ¬nh/thÃ¡ng cá»§a NÄƒm 1).
                        <br>â€¢ Káº¿t quáº£: <strong>${paybackText}</strong>.
                    </div>
                </div>
                <div>
                    <strong>3. Thá»i gian hoÃ n vá»‘n chiáº¿t kháº¥u (Discounted Payback):</strong>
                    <div style="padding-left: 12px; color: var(--text-muted); margin-top: 2px;">
                        â€¢ CÃ´ng thá»©c: Thá»i Ä‘iá»ƒm mÃ  tá»•ng hiá»‡n giÃ¡ cÃ¡c dÃ²ng tiá»n tÃ­ch luá»¹ Ä‘áº¡t tráº¡ng thÃ¡i hÃ²a vá»‘n (lá»›n hÆ¡n hoáº·c báº±ng 0).
                        <br>â€¢ CÃ¡ch tÃ­nh: Quy Ä‘á»•i dÃ²ng tiá»n tá»«ng thÃ¡ng vá» hiá»‡n giÃ¡ (PV) theo tá»· lá»‡ chiáº¿t kháº¥u hÃ ng thÃ¡ng hiá»‡u dá»¥ng r_m = (1 + ${discountRatePct}%)^(1/12) - 1 â‰ˆ ${(monthlyRate*100).toFixed(3)}%/thÃ¡ng. Sau Ä‘Ã³ cá»™ng dá»“n tá»«ng thÃ¡ng Ä‘á»ƒ xem khi nÃ o thu há»“i Ä‘á»§ vá»‘n hiá»‡n giÃ¡.
                        <br>â€¢ Káº¿t quáº£: <strong>${discPaybackText}</strong>.
                    </div>
                </div>
                <div>
                    <strong>4. GiÃ¡ trá»‹ hiá»‡n táº¡i thuáº§n (NPV - Net Present Value):</strong>
                    <div style="padding-left: 12px; color: var(--text-muted); margin-top: 2px;">
                        â€¢ CÃ´ng thá»©c: -Vá»‘n Ä‘áº§u tÆ° ban Ä‘áº§u + Tá»•ng PV cá»§a dÃ²ng tiá»n 36 thÃ¡ng.
                        <br>â€¢ Ã nghÄ©a: Thá»ƒ hiá»‡n sá»‘ tiá»n lÃ£i rÃ²ng thá»±c táº¿ thu vá» (sau khi Ä‘Ã£ kháº¥u trá»« Ä‘i trÆ°á»£t giÃ¡ vÃ  chi phÃ­ cÆ¡ há»™i lÃ  lÃ£i suáº¥t chiáº¿t kháº¥u ${discountRatePct}%).
                        <br>â€¢ Káº¿t quáº£: <strong class="${npvColor}">${npv >= 0 ? '+' : ''}${formatNumber(Math.round(npv))} Ä‘</strong>.
                    </div>
                </div>
                <div>
                    <strong>5. Tá»· suáº¥t sinh lá»i ná»™i bá»™ (IRR - Internal Rate of Return):</strong>
                    <div style="padding-left: 12px; color: var(--text-muted); margin-top: 2px;">
                        â€¢ KhÃ¡i niá»‡m: Má»©c lÃ£i suáº¥t chiáº¿t kháº¥u mÃ  táº¡i Ä‘Ã³ NPV = 0.
                        <br>â€¢ Ã nghÄ©a: Tá»· suáº¥t sinh lá»i thá»±c táº¿ cá»§a quÃ¡n. Náº¿u IRR lá»›n hÆ¡n LÃ£i suáº¥t chiáº¿t kháº¥u kÃ¬ vá»ng (${discountRatePct}%) thÃ¬ dá»± Ã¡n Ä‘Ã¡ng Ä‘á»ƒ Ä‘áº§u tÆ°.
                        <br>â€¢ Káº¿t quáº£: <strong class="${irrColor}">${totalInflow > totalCapital && irrAnnual > -100 ? irrAnnual.toFixed(1) + '%' : 'N/A'}</strong>.
                    </div>
                </div>
                <div>
                    <strong>6. Tá»· lá»‡ hoÃ n vá»‘n Ä‘áº§u tÆ° (ROI - Return on Investment):</strong>
                    <div style="padding-left: 12px; color: var(--text-muted); margin-top: 2px;">
                        â€¢ CÃ´ng thá»©c: (Tá»•ng dÃ²ng tiá»n rÃ²ng 3 nÄƒm - Vá»‘n Ä‘áº§u tÆ° ban Ä‘áº§u) / Vá»‘n Ä‘áº§u tÆ° ban Ä‘áº§u Ã— 100%.
                        <br>â€¢ CÃ¡ch tÃ­nh: (${formatNumber(Math.round(totalInflow))} Ä‘ dÃ²ng tiá»n thu vá» - ${formatNumber(totalCapital)} Ä‘ vá»‘n bá» ra) / ${formatNumber(totalCapital)} Ä‘.
                        <br>â€¢ Káº¿t quáº£: <strong class="${roiColor}">${roi.toFixed(1)}%</strong> trong vÃ²ng 3 nÄƒm (tÆ°Æ¡ng Ä‘Æ°Æ¡ng trung bÃ¬nh khoáº£ng ${(roi/3).toFixed(1)}%/nÄƒm).
                    </div>
                </div>
                <div>
                    <strong>7. Chá»‰ sá»‘ sinh lá»i (PI - Profitability Index):</strong>
                    <div style="padding-left: 12px; color: var(--text-muted); margin-top: 2px;">
                        â€¢ CÃ´ng thá»©c: Tá»•ng hiá»‡n giÃ¡ dÃ²ng tiá»n vÃ o (PV) / Vá»‘n Ä‘áº§u tÆ° ban Ä‘áº§u.
                        <br>â€¢ Ã nghÄ©a: Cá»© 1 Ä‘á»“ng vá»‘n Ä‘áº§u tÆ° ban Ä‘áº§u Ä‘em láº¡i bao nhiÃªu Ä‘á»“ng giÃ¡ trá»‹ hiá»‡n táº¡i. Dá»± Ã¡n cÃ³ kháº£ thi khi PI > 1.
                        <br>â€¢ Káº¿t quáº£: <strong class="${piColor}">${pi.toFixed(2)}</strong>.
                    </div>
                </div>
            </div>
        </div>
    `;
    wrapper.innerHTML = html;

    // Draw Line Chart for Cumulative Cash Flow
    const isLight = document.body.classList.contains('light-theme');
    const textColor = isLight ? '#475569' : '#9ca3af';
    const gridColor = isLight ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.05)';

    setTimeout(() => {
        const ctx = document.getElementById('cumulativeCashFlowChart');
        if (!ctx) return;

        const oldChart = Chart.getChart('cumulativeCashFlowChart');
        if (oldChart) oldChart.destroy();

        const labels = Array.from({length: 37}, (_, i) => "Th" + i);
        const dataCumCash = [ -totalCapital, ...monthlyData.map(d => Math.round(d.cumCash)) ];
        const dataCumPv = [ -totalCapital, ...monthlyData.map(d => Math.round(d.cumPv)) ];

        new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'TÃ­ch lÅ©y thá»±c táº¿',
                        data: dataCumCash,
                        borderColor: '#38bdf8',
                        backgroundColor: 'rgba(56, 189, 248, 0.05)',
                        borderWidth: 2,
                        tension: 0.2,
                        fill: true
                    },
                    {
                        label: 'TÃ­ch lÅ©y chiáº¿t kháº¥u (PV)',
                        data: dataCumPv,
                        borderColor: '#fbbf24',
                        backgroundColor: 'rgba(251, 191, 36, 0.05)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.2,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: textColor, font: { family: 'Outfit', size: 12 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + formatNumber(context.raw) + 'Ä‘';
                            }
                        }
                    },
                    datalabels: { display: false }
                },
                scales: {
                    y: {
                        grid: { color: gridColor },
                        ticks: {
                            color: textColor,
                            callback: function(value) { return formatShortVND(value); }
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: textColor }
                    }
                }
            }
        });
    }, 50);
}

// ======================================================================
// Share URL - Encode / Decode all inputs into URL hash
// ======================================================================

// All input IDs to capture
const SHARE_INPUT_IDS = [
    'inp-deposit','inp-renovate','inp-equipment','inp-raw-start','inp-decor-misc',
    'inp-depr-years','inp-buffer','inp-loan','inp-interest','inp-term',
    'inp-rent','inp-utilities','inp-misc',
    'inp-shift-morning-staff','inp-shift-morning-rate',
    'inp-shift-afternoon-staff','inp-shift-afternoon-rate',
    'inp-shift-evening-staff','inp-shift-evening-rate',
    'inp-ft-manager-count','inp-ft-manager-salary',
    'inp-weekend-multiplier','inp-commission-rate',
    'inp-price','inp-cost-pct',
    'inp-vol-weak','inp-vol-base','inp-vol-good',
    'inp-tax-rate','inp-discount-rate','inp-growth-rev','inp-growth-opex',
    'inp-div-retained','inp-div-payout'
];

window.shareCurrentState = function() {
    // Collect all input values
    const state = {};
    SHARE_INPUT_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) state[id] = el.value;
    });

    // Include shareholders data
    state._shareholders = JSON.stringify(shareholders);

    // Encode to base64 URL-safe string
    const json = JSON.stringify(state);
    const encoded = btoa(unescape(encodeURIComponent(json)));

    // Build shareable URL
    const shareUrl = `${location.origin}${location.pathname}#state=${encoded}`;

    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
        // Show success feedback on button
        const btn = document.getElementById('share-link-btn');
        const label = document.getElementById('share-btn-label');
        if (btn && label) {
            btn.classList.add('share-success');
            label.textContent = 'âœ“ ÄÃ£ Copy!';
            setTimeout(() => {
                btn.classList.remove('share-success');
                label.textContent = 'Chia Sáº»';
            }, 2500);
        }
    }).catch(() => {
        // Fallback: prompt the user to copy manually
        prompt('Sao chÃ©p link chia sáº» bÃªn dÆ°á»›i:', shareUrl);
    });
};

// Load state from URL hash on page load
function loadStateFromURL() {
    const hash = location.hash;
    if (!hash || !hash.startsWith('#state=')) return;

    try {
        const encoded = hash.replace('#state=', '');
        const json = decodeURIComponent(escape(atob(encoded)));
        const state = JSON.parse(json);

        // Restore all inputs
        SHARE_INPUT_IDS.forEach(id => {
            if (state[id] !== undefined) {
                const el = document.getElementById(id);
                if (el) {
                    el.value = state[id];
                    // Trigger input event to reformat display
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        });

        // Restore shareholders
        if (state._shareholders) {
            try {
                const parsed = JSON.parse(state._shareholders);
                if (Array.isArray(parsed)) {
                    shareholders = parsed;
                    renderShareholderList();
                }
            } catch(e) {}
        }

        // Re-run dashboard after loading
        setTimeout(() => {
            updateDashboard();
            // Show a brief notification
            showShareLoadedNotification();
        }, 300);

    } catch(e) {
        console.warn('KhÃ´ng thá»ƒ load state tá»« URL:', e);
    }
}

function showShareLoadedNotification() {
    const notif = document.createElement('div');
    notif.className = 'share-load-notif';
    notif.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
        </svg>
        <span>ÄÃ£ táº£i sá»‘ liá»‡u Ä‘Æ°á»£c chia sáº» thÃ nh cÃ´ng!</span>
    `;
    document.body.appendChild(notif);

    requestAnimationFrame(() => notif.classList.add('show'));
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 400);
    }, 3500);
}

// Auto-load from URL on page start
document.addEventListener('DOMContentLoaded', () => {
    loadStateFromURL();
});

