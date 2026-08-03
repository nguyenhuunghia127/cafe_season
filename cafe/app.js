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
    { id: 1, name: "Bß║ín (Cß╗ò ─æ├┤ng s├íng lß║¡p)", contribution: 80000000, role: "operate" }
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
            { id: 1, name: "Chß╗º qu├ín", contribution: 45000000, role: "operate" }
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
            { id: 1, name: "Nh├á s├íng lß║¡p (Vß║¡n h├ánh)", contribution: 100000000, role: "operate" },
            { id: 2, name: "Cß╗ò ─æ├┤ng ─æß║ºu t╞░ A", contribution: 50000000, role: "invest" }
        ];
    } else {
        // standard (Qu├ín m├íy lß║ính chuß║⌐n 50m2)
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
            { id: 1, name: "Bß║ín (Cß╗ò ─æ├┤ng s├íng lß║¡p)", contribution: 80000000, role: "operate" }
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
        formatted = (absVal / 1000000).toFixed(1) + 'M ─æ';
    } else if (absVal >= 1000) {
        formatted = (absVal / 1000).toFixed(0) + 'k ─æ';
    } else {
        formatted = absVal + ' ─æ';
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
// Doanh nghiß╗çp: Thuß║┐ TNDN t├¡nh tr├¬n lß╗úi nhuß║¡n
//   - DT n─âm Γëñ 1 tß╗╖: miß╗àn thuß║┐ TNDN
//   - DT n─âm Γëñ 3 tß╗╖: 15%
//   - DT n─âm Γëñ 50 tß╗╖: 17%
//   - DT n─âm > 50 tß╗╖: 20%
// User can override with manual % in inp-tax-rate
// ======================================================================
function calculateTax(monthlyProfit, annualRevenue) {
    if (monthlyProfit <= 0) return 0;
    const dynamicTaxRate = getSuggestedTaxRate(annualRevenue);
    return monthlyProfit * (dynamicTaxRate / 100);
}

function getSuggestedTaxRate(annualRevenue) {
    if (annualRevenue <= 1000000000) return 0; // miß╗àn thuß║┐
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
// Rent ΓåÆ Deposit synchronization (3 months)
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
    if (deposit < 0) setError(depositInput, "Cß╗ìc mß║╖t bß║▒ng kh├┤ng ─æ╞░ß╗úc ├óm.");
    if (renovate < 0) setError(renovateInput, "Sß╗¡a chß╗»a & Decor kh├┤ng ─æ╞░ß╗úc ├óm.");
    if (equipment < 0) setError(equipmentInput, "M├íy m├│c & Thiß║┐t bß╗ï kh├┤ng ─æ╞░ß╗úc ├óm.");
    if (rawStart < 0) setError(rawStartInput, "Nguy├¬n liß╗çu ban ─æß║ºu kh├┤ng ─æ╞░ß╗úc ├óm.");
    if (decorMisc < 0) setError(decorMiscInput, "Decor nhß╗Å kh├┤ng ─æ╞░ß╗úc ├óm.");
    if (buffer < 0) setError(bufferInput, "Quß╗╣ dß╗▒ ph├▓ng kh├┤ng ─æ╞░ß╗úc ├óm.");
    
    if (loan < 0) setError(loanInput, "Sß╗æ tiß╗ün vay ng├ón h├áng kh├┤ng ─æ╞░ß╗úc ├óm.");
    if (interest < 0) setError(interestInput, "L├úi suß║Ñt vay kh├┤ng ─æ╞░ß╗úc nhß╗Å h╞ín 0.");
    if (term <= 0) setError(termInput, "Thß╗¥i hß║ín vay phß║úi lß╗¢n h╞ín 0 th├íng.");
    
    if (rent < 0) setError(rentInput, "Tiß╗ün thu├¬ mß║╖t bß║▒ng kh├┤ng ─æ╞░ß╗úc ├óm.");
    if (utilities < 0) setError(utilitiesInput, "Chi ph├¡ ─æiß╗çn n╞░ß╗¢c kh├┤ng ─æ╞░ß╗úc ├óm.");
    
    if (shiftMorningStaff < 0) setError(shiftMorningStaffInput, "Sß╗æ NV ca s├íng kh├┤ng ─æ╞░ß╗úc ├óm.");
    if (shiftMorningRate < 0) setError(shiftMorningRateInput, "L╞░╞íng ca s├íng kh├┤ng ─æ╞░ß╗úc ├óm.");
    if (shiftAfternoonStaff < 0) setError(shiftAfternoonStaffInput, "Sß╗æ NV ca chiß╗üu kh├┤ng ─æ╞░ß╗úc ├óm.");
    if (shiftAfternoonRate < 0) setError(shiftAfternoonRateInput, "L╞░╞íng ca chiß╗üu kh├┤ng ─æ╞░ß╗úc ├óm.");
    if (shiftEveningStaff < 0) setError(shiftEveningStaffInput, "Sß╗æ NV ca tß╗æi kh├┤ng ─æ╞░ß╗úc ├óm.");
    if (shiftEveningRate < 0) setError(shiftEveningRateInput, "L╞░╞íng ca tß╗æi kh├┤ng ─æ╞░ß╗úc ├óm.");
    if (ftManagerCount < 0) setError(ftManagerCountInput, "Sß╗æ quß║ún l├╜ kh├┤ng ─æ╞░ß╗úc ├óm.");
    if (ftManagerSalary < 0) setError(ftManagerSalaryInput, "L╞░╞íng quß║ún l├╜ kh├┤ng ─æ╞░ß╗úc ├óm.");
    if (weekendMultiplier < 1.0) setError(weekendMultiplierInput, "Hß╗ç sß╗æ cuß╗æi tuß║ºn kh├┤ng ─æ╞░ß╗úc nhß╗Å h╞ín 1.0.");
    if (commissionRate < 0 || commissionRate > 100) setError(commissionRateInput, "Tß╗╖ lß╗ç th╞░ß╗ƒng phß║úi tß╗½ 0% ─æß║┐n 100%.");
    
    if (misc < 0) setError(miscInput, "Chi ph├¡ ph├ít sinh kh├┤ng ─æ╞░ß╗úc ├óm.");
    if (price <= 0) setError(priceInput, "Gi├í b├ín trung b├¼nh phß║úi lß╗¢n h╞ín 0 ─æ/ly.");
    
    if (costPct < 0 || costPct > 100) setError(costPctInput, "Tß╗╖ lß╗ç Cost nguy├¬n vß║¡t liß╗çu phß║úi nß║▒m tß╗½ 0% ─æß║┐n 100%.");
    if (volWeak < 0) setError(volWeakInput, "Sß║ún l╞░ß╗úng kß╗ïch bß║ún Yß║┐u kh├┤ng ─æ╞░ß╗úc ├óm.");
    if (volBase < 0) setError(volBaseInput, "Sß║ún l╞░ß╗úng kß╗ïch bß║ún Trung b├¼nh kh├┤ng ─æ╞░ß╗úc ├óm.");
    if (volGood < 0) setError(volGoodInput, "Sß║ún l╞░ß╗úng kß╗ïch bß║ún Tß╗æt kh├┤ng ─æ╞░ß╗úc ├óm.");
    if (deprYears <= 0) setError(deprYearsInput, "Thß╗¥i gian khß║Ñu hao t├ái sß║ún phß║úi lß╗¢n h╞ín 0 n─âm.");
    if (discountRate < 0 || discountRate > 100) setError(discountRateInput, "L├úi suß║Ñt chiß║┐t khß║Ñu kß╗│ vß╗ìng phß║úi tß╗½ 0% ─æß║┐n 100%.");
    
    const setupCosts = deposit + renovate + equipment + rawStart + decorMisc;
    const totalCapitalNeeded = setupCosts + buffer;
    
    if (loan > totalCapitalNeeded) {
        setError(loanInput, `Tiß╗ün vay ng├ón h├áng (${formatVND(loan)}) ─æang lß╗¢n h╞ín Tß╗òng vß╗æn cß║ºn thiß║┐t (${formatVND(totalCapitalNeeded)}). Cß╗ò ─æ├┤ng kh├┤ng thß╗â g├│p phß║ºn vß╗æn ├óm.`);
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
        alert("Vui l├▓ng nhß║¡p t├¬n cß╗ò ─æ├┤ng!");
        return;
    }
    if (contrib <= 0) {
        alert("Vui l├▓ng nhß║¡p sß╗æ vß╗æn g├│p lß╗¢n h╞ín 0!");
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
        document.getElementById('btn-save-shareholder').textContent = 'Th├¬m Cß╗ò ─É├┤ng';
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
    
    document.getElementById('btn-save-shareholder').textContent = 'L╞░u Thay ─Éß╗òi';
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
    document.getElementById('btn-save-shareholder').textContent = 'Th├¬m Cß╗ò ─É├┤ng';
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
        case 'operate': return '≡ƒöº G├│p vß╗æn + Vß║¡n h├ánh';
        case 'invest': return '≡ƒÆ░ Chß╗ë g├│p vß╗æn';
        default: return '≡ƒÆ░ Chß╗ë g├│p vß╗æn';
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
        container.innerHTML = `<div class="empty-state">Ch╞░a c├│ cß╗ò ─æ├┤ng n├áo ─æ├│ng g├│p vß╗æn. H├úy th├¬m cß╗ò ─æ├┤ng bß║▒ng mß║½u ph├¡a tr├¬n.</div>`;
        return;
    }

    const payoutPct = parseFloat(document.getElementById('inp-div-payout').value) || 80;

    container.innerHTML = `
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>Cß╗ò ─æ├┤ng</th>
                        <th>Vai tr├▓</th>
                        <th>Vß╗æn g├│p (VND)</th>
                        <th>% Cß╗ò phß║ºn</th>
                        <th>Cß╗ò tß╗⌐c / th├íng</th>
                        <th>Ho├án vß╗æn (Cß╗ò tß╗⌐c)</th>
                        <th class="td-actions">H├ánh ─æß╗Öng</th>
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

        let paybackStr = "V├┤ hß║ín (Lß╗ù)";
        if (shDiv > 0) {
            const months = s.contribution / shDiv;
            paybackStr = `${months.toFixed(1)} th├íng`;
        }

        const roleLabel = getRoleLabel(s.role);
        const roleBadgeClass = getRoleBadgeClass(s.role);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${s.name}</strong></td>
            <td><span class="role-badge ${roleBadgeClass}">${roleLabel}</span></td>
            <td>${formatNumber(s.contribution)} ─æ</td>
            <td><span class="badge-leverage" style="display:inline-block">${shPct.toFixed(1)}%</span></td>
            <td class="${shDiv >= 0 ? 'val-profit' : 'val-loss'}">${shDiv >= 0 ? '+' : ''}${formatShortVND(shDiv)}</td>
            <td><em style="font-size:11px">${paybackStr}</em></td>
            <td class="td-actions">
                <button class="btn btn-edit" onclick="editShareholder(${s.id})" style="padding: 4px 8px; font-size:11px; margin-right: 4px;">Sß╗¡a</button>
                <button class="btn btn-danger" onclick="deleteShareholder(${s.id})" style="padding: 4px 8px; font-size:11px;">X├│a</button>
            </td>
        `;
        activeTbody.appendChild(tr);
    });

    // Add summary row
    const trSummary = document.createElement('tr');
    trSummary.style.fontWeight = 'bold';
    trSummary.style.background = 'rgba(255,255,255,0.02)';
    trSummary.innerHTML = `
        <td>Tß╗öNG Cß╗ÿNG Cß╗ö Tß╗¿C</td>
        <td>-</td>
        <td>${formatNumber(totalEquityContributed)} ─æ</td>
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
            <span>Thiß║┐u vß╗æn: Tß╗òng vß╗æn g├│p hiß╗çn tß║íi (${formatNumber(totalEquityContributed)}─æ) ─æang thiß║┐u <strong>${formatNumber(Math.abs(diff))}─æ</strong> so vß╗¢i nhu cß║ºu vß╗æn tß╗▒ c├│ (${formatNumber(requiredEquity)}─æ). H├úy g├│p th├¬m hoß║╖c t─âng khoß║ún vay.</span>
        `;
    } else if (diff > 0) {
        statusDiv.style.background = 'rgba(52, 211, 153, 0.1)';
        statusDiv.style.border = '1px solid rgba(52, 211, 153, 0.2)';
        statusDiv.style.color = isLight ? '#047857' : 'var(--success)';
        statusDiv.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
            <span>D╞░ vß╗æn: Tß╗òng vß╗æn g├│p (${formatNumber(totalEquityContributed)}─æ) thß╗½a <strong>${formatNumber(diff)}─æ</strong> so vß╗¢i nhu cß║ºu vß╗æn tß╗▒ c├│ (${formatNumber(requiredEquity)}─æ). Sß╗æ d╞░ n├áy gi├║p gia t─âng Quß╗╣ dß╗▒ ph├▓ng thß╗▒c tß║┐.</span>
        `;
    } else {
        statusDiv.style.background = 'var(--primary-glow)';
        statusDiv.style.border = '1px solid rgba(56, 189, 248, 0.2)';
        statusDiv.style.color = isLight ? '#0369a1' : 'var(--primary)';
        statusDiv.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
            <span>C├ón bß║▒ng: Tß╗òng vß╗æn g├│p khß╗¢p ho├án to├án vß╗¢i nhu cß║ºu vß╗æn tß╗▒ c├│ (${formatNumber(requiredEquity)}─æ).</span>
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
            safetyDescElement.innerText = "Bi├¬n an to├án rß║Ñt cao. Sß║ún l╞░ß╗úng b├ín c├│ thß╗â sß╗Ñt giß║úm tß╗¢i 30% m├á qu├ín vß║½n kh├┤ng bß╗ï lß╗ù. ─É├óy l├á luß║¡n ─æiß╗âm cß╗▒c tß╗æt ─æß╗â thuyß║┐t phß╗Ñc cß╗ò ─æ├┤ng.";
        } else if (safetyMargin > 0) {
            safetyValElement.style.color = 'var(--warning)';
            safetyDescElement.innerText = "Bi├¬n an to├án d╞░╞íng nh╞░ng ß╗ƒ mß╗⌐c hß║╣p. Cß╗ò ─æ├┤ng sß║╜ muß╗æn thß║Ñy kß║┐ hoß║ích marketing r├╡ r├áng ─æß╗â duy tr├¼ l╞░ß╗úng kh├ích ß╗òn ─æß╗ïnh.";
        } else {
            safetyValElement.style.color = 'var(--danger)';
            safetyDescElement.innerText = "Hiß╗çn tß║íi sß║ún l╞░ß╗úng b├ín dß╗▒ kiß║┐n thß║Ñp h╞ín ─æiß╗âm h├▓a vß╗æn. Cß║ºn giß║úm bß╗¢t ─æß╗ïnh ph├¡ vß║¡n h├ánh hoß║╖c t─âng gi├í b├ín ─æß╗â tß║ío sß╗⌐c h├║t vß╗¢i nh├á ─æß║ºu t╞░.";
        }
    }

    // 2. Payback based on Dividend
    const paybackValElement = document.getElementById('pitch-payback-val');
    const paybackDescElement = document.getElementById('pitch-payback-desc');
    if (paybackValElement && paybackDescElement) {
        const baseDividend = baseNet * (payoutPct / 100);
        if (baseDividend > 0) {
            const paybackMonths = actualEquity / baseDividend;
            paybackValElement.innerText = `${paybackMonths.toFixed(1)} th├íng`;
            paybackValElement.style.color = 'var(--success)';
            paybackDescElement.innerText = `Thß╗¥i gian ho├án vß╗æn dß╗▒ kiß║┐n bß║▒ng d├▓ng tiß╗ün cß╗ò tß╗⌐c thß╗▒c nhß║¡n h├áng th├íng l├á khoß║úng ${paybackMonths.toFixed(1)} th├íng. ─É├óy l├á tß╗æc ─æß╗Ö ho├án vß╗æn rß║Ñt tß╗æt.`;
        } else {
            paybackValElement.innerText = "Kh├┤ng thß╗â t├¡nh (Lß╗ù)";
            paybackValElement.style.color = 'var(--danger)';
            paybackDescElement.innerText = "Qu├ín ─æang chß╗ïu lß╗ù hoß║╖c kh├┤ng chi trß║ú cß╗ò tß╗⌐c. Cß║ºn tß╗æi ╞░u lß║íi ─æß╗ïnh ph├¡ hoß║╖c t─âng gi├í b├ín.";
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

    // Variations: price ┬▒20% in steps of 10%, costPct ┬▒10% in steps of 5%
    const priceMultipliers = [-20, -10, 0, 10, 20];
    const costVariations = [-10, -5, 0, 5, 10];

    let html = '<thead><tr><th class="sensitivity-corner">Gi├í b├ín \\ Cost %</th>';
    costVariations.forEach(cv => {
        const actualCost = baseCostPct + cv;
        html += `<th>Cost ${actualCost}%${cv !== 0 ? ' (' + (cv > 0 ? '+' : '') + cv + '%)' : ''}</th>`;
    });
    html += '</tr></thead><tbody>';

    priceMultipliers.forEach(pm => {
        const actualPrice = basePrice * (1 + pm / 100);
        html += `<tr><td class="sensitivity-row-label">${formatNumber(Math.round(actualPrice))}─æ${pm !== 0 ? ' (' + (pm > 0 ? '+' : '') + pm + '%)' : ''}</td>`;
        
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
            
            const tooltipText = `Doanh thu: ${formatNumber(Math.round(rev))}─æ\n- Cost NVL (${actualCost}%): ${formatNumber(Math.round(cogs))}─æ\n- ─Éß╗ïnh ph├¡: ${formatNumber(Math.round(fixedMonthlyOpex))}─æ\n- Khß║Ñu hao: ${formatNumber(Math.round(monthlyDepreciation))}─æ\n- L├úi vay: ${formatNumber(Math.round(monthlyDebt))}─æ\n- Thuß║┐ TNDN (${dynamicTaxRate}%): ${formatNumber(Math.round(tax))}─æ\n------------------------\n= Lß╗úi nhuß║¡n r├▓ng: ${formatNumber(Math.round(netProfit))}─æ`;
            
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

    // Vary price by ┬▒10k, ┬▒5k
    const prices = [basePrice - 10000, basePrice - 5000, basePrice, basePrice + 5000, basePrice + 10000].filter(p => p > 0);
    // Vary rent by ┬▒5M, ┬▒2.5M
    const rents = [rent - 5000000, rent - 2500000, rent, rent + 2500000, rent + 5000000].filter(r => r >= 0);

    let priceRowsHtml = '';
    prices.forEach(p => {
        let cellsHtml = '';
        const unitMargin = p * (1 - baseCostPct / 100 - commissionRate / 100);
        
        rents.forEach(r => {
            if (unitMargin <= 0) {
                cellsHtml += `<td style="text-align: right; padding: 8px; color: var(--danger); font-weight: 500;">Lß╗ù gß╗Öp/ly</td>`;
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
                <td style="text-align: left; padding: 8px; font-weight: 500;">${formatNumber(p)}─æ</td>
                ${cellsHtml}
            </tr>
        `;
    });

    wrapper.innerHTML = `
        <h3 class="chart-sub-title">≡ƒÄ» Ma Trß║¡n Sß║ún L╞░ß╗úng H├▓a Vß╗æn (Ly/Ng├áy) Theo Gi├í B├ín & Tiß╗ün Thu├¬</h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
            Bß║úng d╞░ß╗¢i ─æ├óy thß╗â hiß╗çn sß╗æ ly n╞░ß╗¢c qu├ín cß║ºn b├ín ─æ╞░ß╗úc <strong>mß╗ùi ng├áy</strong> ─æß╗â h├▓a vß╗æn (bao gß╗ôm ─æß╗ïnh ph├¡, nß╗ú vay ng├ón h├áng v├á khß║Ñu hao) khi thay ─æß╗òi gi├í thu├¬ mß║╖t bß║▒ng (cß╗Öt) v├á gi├í b├ín lß║╗ (d├▓ng). ├ö t├┤ ─æß║¡m c├│ viß╗ün xanh l├á mß╗⌐c gi├í & tiß╗ün thu├¬ hiß╗çn tß║íi cß╗ºa bß║ín.
        </p>

        <!-- Table -->
        <div style="overflow-x: auto; margin-bottom: 24px;">
            <table class="sensitivity-table" style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr>
                        <th class="sensitivity-corner" style="text-align: left; padding: 8px; background: rgba(2, 132, 199, 0.08);">Gi├í b├ín \\ Tiß╗ün thu├¬</th>
                        ${rents.map(r => `<th style="text-align: right; padding: 8px; background: rgba(2, 132, 199, 0.08);">${formatShortVND(r)}/th├íng</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${priceRowsHtml}
                </tbody>
            </table>
        </div>

        <h3 class="chart-sub-title" style="margin-top: 24px; margin-bottom: 8px;">≡ƒôê ─Éß╗ô Thß╗ï ─Éiß╗âm H├▓a Vß╗æn Cß║»t Nhau (Break-Even Point Chart)</h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
            Giao ─æiß╗âm giß╗»a hai ─æ╞░ß╗¥ng thß║│ng ch├¡nh l├á ─æiß╗âm h├▓a vß╗æn cß╗ºa dß╗▒ ├ín.
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
                        label: 'Tß╗òng Doanh Thu (VND)',
                        data: dataRev,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.05)',
                        borderWidth: 2,
                        tension: 0,
                        pointRadius: 3
                    },
                    {
                        label: 'Tß╗òng Chi Ph├¡ (VND)',
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

    const labels = ["N─âm 1", "N─âm 2", "N─âm 3", "N─âm 4", "N─âm 5"];
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
            <div style="font-size: 14px; margin-bottom: 12px;"><strong style="color:var(--primary);">≡ƒÆí Ph├ón T├¡ch ─Éß╗ïnh Gi├í Doanh Nghiß╗çp (Cuß╗æi N─âm 3)</strong></div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                    <div style="font-size: 12px; color: var(--text-muted);">Lß╗úi nhuß║¡n r├▓ng N─âm 3:</div>
                    <div style="font-size: 18px; font-weight: bold; color: ${year3Net > 0 ? 'var(--success)' : 'var(--danger)'};">${formatVND(year3Net)}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: var(--text-muted);">─Éß╗ïnh gi├í qu├ín (P/E = 3):</div>
                    <div style="font-size: 18px; font-weight: bold; color: var(--primary);">${formatVND(valuation)}</div>
                </div>
            </div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 12px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 8px;">
                * Nß║┐u qu├ín hoß║ít ─æß╗Öng ß╗òn ─æß╗ïnh tß╗¢i n─âm thß╗⌐ 3 vß╗¢i c├íc giß║ú ─æß╗ïnh lß║ím ph├ít/t─âng tr╞░ß╗ƒng tr├¬n, bß║ín c├│ thß╗â ch├áo b├ín/sang nh╞░ß╗úng lß║íi qu├ín vß╗¢i mß╗⌐c gi├í tham khß║úo khoß║úng ${formatShortVND(valuation)}.
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
                        label: 'Tß╗òng Chi Ph├¡',
                        data: dataOpex,
                        backgroundColor: 'rgba(248, 113, 113, 0.8)',
                        borderRadius: 4
                    },
                    {
                        label: 'Lß╗úi Nhuß║¡n R├▓ng',
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
            <h3 style="margin-bottom: 16px; color: var(--primary); font-size: 18px; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px;">Diß╗àn Giß║úi C├íc Con Sß╗æ ─Éang Hiß╗ân Thß╗ï</h3>
            
            <p><strong>1. Nhu cß║ºu vß╗æn & ─Éß║ºu t╞░ ban ─æß║ºu (Tß╗òng: ${formatVND(totalCap)})</strong></p>
            <ul style="margin-bottom: 16px; margin-top: 4px; padding-left: 20px;">
                <li><strong>Chi ph├¡ thiß║┐t lß║¡p (${formatVND(setupCosts)})</strong>: ─É├óy l├á tiß╗ün "chß║┐t" ─æß╗ò v├áo qu├ín tr╞░ß╗¢c khi mß╗ƒ cß╗¡a.
                    <br>Bao gß╗ôm: Cß╗ìc mß║╖t bß║▒ng (${formatShortVND(deposit)}), Sß╗¡a chß╗»a (${formatShortVND(renovate)}), M├íy m├│c (${formatShortVND(equipment)}), Nguy├¬n liß╗çu (${formatShortVND(rawStart)}), Kh├íc (${formatShortVND(decorMisc)}).
                </li>
                <li><strong>Quß╗╣ dß╗▒ ph├▓ng (${formatVND(buffer)})</strong>: Tiß╗ün mß║╖t ─æß╗â sß║╡n trong ng├ón h├áng ─æß╗â gß╗ông lß╗ù thß╗¥i gian ─æß║ºu.</li>
            </ul>

            <p><strong>2. Nguß╗ôn vß╗æn & ─É├▓n bß║⌐y t├ái ch├¡nh</strong></p>
            <ul style="margin-bottom: 16px; margin-top: 4px; padding-left: 20px;">
                <li><strong>Vß╗æn tß╗▒ c├│ (Bß║ín v├á Cß╗ò ─æ├┤ng g├│p):</strong> ${formatVND(totalEquityContributed)} (${((totalEquityContributed / totalCap) * 100).toFixed(1)}%)</li>
                <li><strong>Vß╗æn ─æi vay ng├ón h├áng:</strong> ${formatVND(loan)} (${((loan / totalCap) * 100).toFixed(1)}%)</li>
                <li><strong>Chi ph├¡ trß║ú nß╗ú h├áng th├íng:</strong> Vß╗¢i l├úi suß║Ñt ${interest}%/n─âm vay trong ${term} th├íng, mß╗ùi th├íng phß║úi trß║ú cß║ú gß╗æc lß║½n l├úi l├á <strong>${formatVND(Math.round(monthlyDebt))}</strong>.</li>
            </ul>

            <p><strong>3. Chi ph├¡ duy tr├¼ mß╗ùi th├íng (─Éß╗ïnh ph├¡: ${formatVND(fixedMonthlyOpex)})</strong></p>
            <ul style="margin-bottom: 16px; margin-top: 4px; padding-left: 20px;">
                <li>Thu├¬ mß║╖t bß║▒ng: ${formatShortVND(rent)} | ─Éiß╗çn n╞░ß╗¢c: ${formatShortVND(utilities)} | L╞░╞íng: ${formatShortVND(salary)} | Kh├íc: ${formatShortVND(misc)}. D├╣ kh├┤ng b├ín ─æ╞░ß╗úc ly n├áo, th├íng n├áo bß║ín c┼⌐ng g├ính chß╗½ng n├áy chi ph├¡.</li>
                <li><strong>Khß║Ñu hao t├ái sß║ún:</strong> T├¡nh dß╗▒a tr├¬n M├íy m├│c (${formatShortVND(equipment)}) + Decor (${formatShortVND(decorMisc)}) chia cho ${deprYears} n─âm = <strong>${formatVND(Math.round(monthlyDepreciation))}/th├íng</strong>. (─É├óy kh├┤ng phß║úi tiß╗ün chi ra, m├á l├á sß╗▒ hao m├▓n).</li>
            </ul>

            <p><strong>4. C╞í cß║Ñu Gi├í b├ín 1 ly n╞░ß╗¢c</strong></p>
            <ul style="margin-bottom: 16px; margin-top: 4px; padding-left: 20px;">
                <li>Gi├í b├ín trung b├¼nh: <strong>${formatVND(basePrice)}</strong></li>
                <li>Tß╗╖ lß╗ç gi├í vß╗æn (Cost): ${baseCostPct}% (T╞░╞íng ─æ╞░╞íng ${formatVND(basePrice * baseCostPct / 100)} tiß╗ün nguy├¬n vß║¡t liß╗çu).</li>
                <li>L├úi gß╗Öp (Tiß╗ün lß╗¥i sau khi trß╗½ nguy├¬n liß╗çu): <strong>${formatVND(grossMargin)}/ly</strong>.</li>
            </ul>

            <p><strong>5. Sß╗æ ly cß║ºn b├ín ─æß╗â H├ÆA Vß╗ÉN: ${Math.ceil(breakeven)} ly/ng├áy</strong></p>
            <ul style="margin-bottom: 16px; margin-top: 4px; padding-left: 20px;">
                <li>Mß╗ùi th├íng bß║ín cß║ºn g├ính: ─Éß╗ïnh ph├¡ (${formatShortVND(fixedMonthlyOpex)}) + Tiß╗ün nß╗ú (${formatShortVND(monthlyDebt)}) + Khß║Ñu hao (${formatShortVND(monthlyDepreciation)}) = ${formatVND(fixedMonthlyOpex + monthlyDebt + monthlyDepreciation)}.</li>
                <li>Vß╗¢i mß╗⌐c l├úi gß╗Öp ${formatVND(grossMargin)}/ly, bß║ín cß║ºn b├ín ─æ╞░ß╗úc khoß║úng ${Math.ceil(breakeven * 30)} ly/th├íng, t╞░╞íng ─æ╞░╞íng <strong>~${Math.ceil(breakeven)} ly/ng├áy</strong> th├¼ qu├ín mß╗¢i ─æß╗º tiß╗ün b├╣ chi ph├¡.</li>
            </ul>

            <p><strong>6. Kß║┐t quß║ú Dß╗▒ Kiß║┐n (B├ín ─æ╞░ß╗úc ${volBase} ly/ng├áy)</strong></p>
            <ul style="margin-top: 4px; padding-left: 20px;">
                <li><strong>Doanh thu:</strong> ${volBase} ly ├ù 30 ng├áy ├ù ${formatVND(basePrice)} = <strong>${formatVND(baseScenario.rev)}</strong></li>
                <li><strong>Trß╗½ Nguy├¬n liß╗çu (${baseCostPct}%):</strong> - ${formatVND(baseScenario.cogs)}</li>
                <li><strong>Trß╗½ ─Éß╗ïnh ph├¡ h├áng th├íng:</strong> - ${formatVND(fixedMonthlyOpex)}</li>
                <li><strong>Trß╗½ Tiß╗ün trß║ú nß╗ú ng├ón h├áng:</strong> - ${formatVND(Math.round(monthlyDebt))}</li>
                <li><strong>Trß╗½ Khß║Ñu hao m├íy m├│c:</strong> - ${formatVND(Math.round(monthlyDepreciation))}</li>
                <li><strong>Thuß║┐ TNDN (${taxRate}%):</strong> - ${formatVND(Math.round(baseScenario.tax))}</li>
                <li style="margin-top:8px;">=> <strong>Lß╗óI NHUß║¼N R├ÆNG (Cß║Ñt t├║i): <span style="color:${baseScenario.net >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatVND(baseScenario.net)}</span> / th├íng</strong></li>
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
        rentComment = `Chi ph├¡ mß║╖t bß║▒ng rß║Ñt tß╗æi ╞░u (${rentPct.toFixed(1)}% doanh thu). Bß║ín chß╗ë cß║ºn ${rentDaysNeeded} ng├áy doanh thu ─æß╗â trß║ú tiß╗ün nh├á.`;
    } else if (rentPct <= 15) {
        rentScore = 20;
        rentStatus = 'good';
        rentComment = `─Éß║ít chuß║⌐n tß╗╖ lß╗ç v├áng F&B (ng╞░ß╗íng an to├án Γëñ 15%). Mß║Ñt ${rentDaysNeeded} ng├áy doanh thu ─æß╗â trang trß║úi tiß╗ün thu├¬.`;
    } else if (rentPct <= 20) {
        rentScore = 12;
        rentStatus = 'warning';
        rentComment = `H╞íi cao (${rentPct.toFixed(1)}%). Cß║ºn ─æß║⌐y mß║ính doanh thu hoß║╖c ─æ├ám ph├ín th├¬m ╞░u ─æ├úi mß║╖t bß║▒ng ─æß╗â tr├ính ├íp lß╗▒c ─æß╗ïnh ph├¡.`;
    } else {
        rentScore = 5;
        rentStatus = 'danger';
        rentComment = `V╞░ß╗út ng╞░ß╗íng rß╗ºi ro (${rentPct.toFixed(1)}%). Bß║ín mß║Ñt tß╗¢i ${rentDaysNeeded} ng├áy b├ín h├áng chß╗ë ─æß╗â nu├┤i chß╗º nh├á.`;
    }
    score += rentScore;

    // Labor Cost Score (Max 25 pts) - Standard: <= 22%
    let laborScore = 0;
    let laborStatus = 'good';
    let laborComment = '';
    if (laborPct <= 18) {
        laborScore = 25;
        laborStatus = 'excellent';
        laborComment = `Tß╗æi ╞░u ─æß╗ïnh bi├¬n nh├ón sß╗▒ xuß║Ñt sß║»c (${laborPct.toFixed(1)}% DT). N─âng suß║Ñt lao ─æß╗Öng cao.`;
    } else if (laborPct <= 22) {
        laborScore = 20;
        laborStatus = 'good';
        laborComment = `─Éß║ít chuß║⌐n quß║ún trß╗ï F&B (ng╞░ß╗íng chuß║⌐n 18% - 22%). C╞í cß║Ñu ca k├¡p hß╗úp l├╜.`;
    } else if (laborPct <= 28) {
        laborScore = 12;
        laborStatus = 'warning';
        laborComment = `Quß╗╣ l╞░╞íng ─æang chiß║┐m ${laborPct.toFixed(1)}% DT. N├¬n ├íp dß╗Ñng ca g├úy linh hoß║ít v├á tuyß╗ân th├¬m part-time theo giß╗¥ cao ─æiß╗âm.`;
    } else {
        laborScore = 5;
        laborStatus = 'danger';
        laborComment = `Chi ph├¡ nh├ón sß╗▒ qu├í nß║╖ng (${laborPct.toFixed(1)}% DT). Nguy c╞í ─ân m├▓n to├án bß╗Ö lß╗úi nhuß║¡n r├▓ng.`;
    }
    score += laborScore;

    // COGS Score (Max 25 pts) - Standard: <= 30%
    let cogsScore = 0;
    let cogsStatus = 'good';
    let cogsComment = '';
    if (cogsPct <= 25) {
        cogsScore = 25;
        cogsStatus = 'excellent';
        cogsComment = `Bi├¬n l├úi gß╗Öp cß╗▒c d├áy (${(100 - cogsPct).toFixed(1)}%). Kiß╗âm so├ít hao hß╗Ñt v├á gi├í vß╗æn nguy├¬n vß║¡t liß╗çu rß║Ñt tß╗æt.`;
    } else if (cogsPct <= 30) {
        cogsScore = 20;
        cogsStatus = 'good';
        cogsComment = `─Éß║ít tß╗╖ lß╗ç v├áng gi├í vß╗æn ─æß╗ô uß╗æng (${cogsPct.toFixed(1)}% DT). Menu c├│ cß║Ñu tr├║c ─æß╗ïnh gi├í vß╗»ng chß║»c.`;
    } else if (cogsPct <= 35) {
        cogsScore = 12;
        cogsStatus = 'warning';
        cogsComment = `Gi├í vß╗æn h╞íi cao (${cogsPct.toFixed(1)}%). Cß║ºn kiß╗âm tra lß║íi ─æß╗ïnh l╞░ß╗úng (recipe) v├á t├¼m nh├á cung cß║Ñp gi├í sß╗ë tß╗æt h╞ín.`;
    } else {
        cogsScore = 5;
        cogsStatus = 'danger';
        cogsComment = `Gi├í vß╗æn chiß║┐m ${cogsPct.toFixed(1)}% DT. Bi├¬n l├úi gß╗Öp bß╗ï b├│p nghß║╣t, rß╗ºi ro cao khi gi├í nguy├¬n liß╗çu thß╗ï tr╞░ß╗¥ng biß║┐n ─æß╗Öng.`;
    }
    score += cogsScore;

    // Margin of Safety & Profitability Score (Max 25 pts)
    let safetyScore = 0;
    let safetyStatus = 'good';
    let safetyComment = '';
    if (marginOfSafety >= 40 && netMarginPct >= 20) {
        safetyScore = 25;
        safetyStatus = 'excellent';
        safetyComment = `Bi├¬n an to├án cß╗▒c lß╗¢n (${marginOfSafety.toFixed(1)}%) v├á tß╗╖ suß║Ñt l├úi r├▓ng ─æß║ít ${netMarginPct.toFixed(1)}%. Dß╗▒ ├ín c├│ sß╗⌐c chß╗æng chß╗ïu biß║┐n ─æß╗Öng thß╗ï tr╞░ß╗¥ng ho├án hß║úo.`;
    } else if (marginOfSafety >= 25 && netProfit > 0) {
        safetyScore = 20;
        safetyStatus = 'good';
        safetyComment = `Bi├¬n an to├án tß╗æt (${marginOfSafety.toFixed(1)}%). Qu├ín sinh lß╗¥i d╞░╞íng (${formatShortVND(netProfit)}/th├íng) v├á c├│ khoß║úng ─æß╗çm an to├án tr╞░ß╗¢c rß╗ºi ro vß║»ng kh├ích.`;
    } else if (marginOfSafety > 0 && netProfit > 0) {
        safetyScore = 12;
        safetyStatus = 'warning';
        safetyComment = `Bi├¬n an to├án mß╗Ång (${marginOfSafety.toFixed(1)}%). Chß╗ë cß║ºn sß║ún l╞░ß╗úng giß║úm nhß║╣ l├á r╞íi v├áo v├╣ng thua lß╗ù. Cß║ºn t─âng tß╗æc marketing k├⌐o kh├ích.`;
    } else {
        safetyScore = 0;
        safetyStatus = 'danger';
        safetyComment = `─Éang hoß║ít ─æß╗Öng d╞░ß╗¢i ─æiß╗âm h├▓a vß╗æn (${volBase} ly < ${Math.ceil(breakeven)} ly). ─Éang bß╗ï th├óm hß╗Ñt d├▓ng tiß╗ün mß╗ùi th├íng.`;
    }
    score += safetyScore;

    // 3. Overall Rating
    let overallBadge = '';
    let overallBadgeClass = '';
    let overallDesc = '';
    let overallColor = '';

    if (score >= 85) {
        overallBadge = '≡ƒîƒ Xuß║Ñt Sß║»c - Chuß║⌐n V├áng F&B';
        overallBadgeClass = 'badge-excellent';
        overallColor = 'var(--success)';
        overallDesc = `M├┤ h├¼nh t├ái ch├¡nh cß╗ºa qu├ín ─æ╞░ß╗úc tß╗æi ╞░u ß╗ƒ mß╗⌐c <strong>cß╗▒c kß╗│ xuß║Ñt sß║»c</strong>. Cß║ú 3 cß║Ñu phß║ºn chi ph├¡ lß╗¢n nhß║Ñt (Mß║╖t bß║▒ng, Nh├ón sß╗▒, Gi├í vß╗æn) ─æß╗üu nß║▒m trß╗ìn trong "V├╣ng Tß╗╖ Lß╗ç V├áng" chuß║⌐n quß╗æc tß║┐. Dß╗▒ ├ín c├│ bi├¬n an to├án d├áy, khß║ú n─âng sinh lß╗¥i v├á thu hß╗ôi vß╗æn v╞░ß╗út trß╗Öi, rß║Ñt dß╗à thuyß║┐t phß╗Ñc nh├á ─æß║ºu t╞░ & cß╗ò ─æ├┤ng.`;
    } else if (score >= 70) {
        overallBadge = 'Γ£à Tß╗æt - Sß╗⌐c Khß╗Åe Vß╗»ng Chß║»c';
        overallBadgeClass = 'badge-good';
        overallColor = 'var(--primary)';
        overallDesc = `M├┤ h├¼nh t├ái ch├¡nh ─æß║ít mß╗⌐c <strong>khß╗Åe mß║ính v├á khß║ú thi cao</strong>. C├íc chß╗ë sß╗æ cß╗æt l├╡i ─æß╗üu nß║▒m trong ng╞░ß╗íng an to├án cho ph├⌐p cß╗ºa ng├ánh F&B. Chß╗ë cß║ºn l╞░u ├╜ kiß╗âm so├ít ß╗òn ─æß╗ïnh chß║Ñt l╞░ß╗úng dß╗ïch vß╗Ñ v├á quß║ún trß╗ï chß║╖t chß║╜ h├áng tß╗ôn kho ─æß╗â bß║úo to├án d├▓ng tiß╗ün.`;
    } else if (score >= 50) {
        overallBadge = 'ΓÜá∩╕Å Cß║únh B├ío - Cß║ºn Tinh Chß╗ënh';
        overallBadgeClass = 'badge-warning';
        overallColor = 'var(--warning)';
        overallDesc = `Dß╗▒ ├ín c├│ mß╗Öt sß╗æ chß╗ë sß╗æ t├ái ch├¡nh <strong>─æang tiß╗çm cß║¡n ng╞░ß╗íng rß╗ºi ro</strong>. ├üp lß╗▒c tß╗½ chi ph├¡ cß╗æ ─æß╗ïnh (Mß║╖t bß║▒ng hoß║╖c Quß╗╣ l╞░╞íng) hoß║╖c gi├í vß╗æn ─æang l├ám giß║úm bi├¬n lß╗úi nhuß║¡n r├▓ng. Bß║ín n├¬n r├á so├ít lß║íi c├íc gß╗úi ├╜ chiß║┐n l╞░ß╗úc b├¬n d╞░ß╗¢i ─æß╗â tß╗æi ╞░u tr╞░ß╗¢c khi r├│t vß╗æn thß╗▒c tß║┐.`;
    } else {
        overallBadge = '≡ƒÜ¿ Rß╗ºi Ro Cao - Cß║ºn T├íi Cß║Ñu Tr├║c';
        overallBadgeClass = 'badge-danger';
        overallColor = 'var(--danger)';
        overallDesc = `Cß║únh b├ío rß╗ºi ro nghi├¬m trß╗ìng: Dß╗▒ ├ín ─æang chß╗ïu ├íp lß╗▒c chi ph├¡ qu├í lß╗¢n so vß╗¢i doanh thu dß╗▒ kiß║┐n hoß║╖c hoß║ít ─æß╗Öng d╞░ß╗¢i ─æiß╗âm h├▓a vß╗æn. Cß║ºn giß║úm ngay chi ph├¡ thu├¬, tinh gß╗ìn bß╗Ö m├íy nh├ón sß╗▒ hoß║╖c n├óng gi├í trß╗ï ─æ╞ín h├áng trung b├¼nh ─æß╗â tr├ính cß║ín kiß╗çt vß╗æn l╞░u ─æß╗Öng.`;
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
    let runwayMonths = 'V├┤ hß║ín (─Éang l├úi)';
    if (netProfit < 0) {
        const actualLoss = Math.abs(netProfit);
        runwayMonths = actualLoss > 0 ? (buffer / actualLoss).toFixed(1) + ' th├íng' : 'N/A';
    } else {
        const worstCaseOpex = fixedMonthlyOpex + monthlyDebt;
        runwayMonths = worstCaseOpex > 0 ? (buffer / worstCaseOpex).toFixed(1) + ' th├íng (Zero DT)' : 'N/A';
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
                <div class="health-score-max">/ 100 ─ÉIß╗éM FHI</div>
            </div>
            <div class="advisor-hero-content">
                <div class="advisor-hero-title">
                    Chß╗ë Sß╗æ Sß╗⌐c Khß╗Åe T├ái Ch├¡nh F&B (Financial Health Index)
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
                <span>≡ƒÅå</span> Bß╗Ö Tß╗⌐ Tß╗╖ Lß╗ç V├áng Trong Kinh Doanh Qu├ín C├á Ph├¬
            </div>
            <p style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 12px; margin-top: 2px;">
                ─É╞░ß╗úc tß╗òng hß╗úp tß╗½ m├┤ h├¼nh chuß║⌐n cß╗ºa h╞ín 500+ chuß╗ùi v├á qu├ín c├á ph├¬ th├ánh c├┤ng tß║íi Viß╗çt Nam.
            </p>
            <div class="golden-ratio-grid">
                <!-- 1. Rent Ratio -->
                <div class="ratio-card">
                    <div class="ratio-header">
                        <span class="ratio-title">≡ƒÅó Mß║╖t Bß║▒ng / Doanh Thu</span>
                        <span class="ratio-benchmark-tag">Chuß║⌐n V├áng: Γëñ 15%</span>
                    </div>
                    <div class="ratio-value-row">
                        <div class="ratio-val-num" style="color:${rentStatus === 'excellent' || rentStatus === 'good' ? 'var(--success)' : rentStatus === 'warning' ? 'var(--warning)' : 'var(--danger)'};">
                            ${rentPct.toFixed(1)}%
                        </div>
                        ${getStatusPill(rentStatus, rentStatus === 'excellent' ? '≡ƒƒó Xuß║Ñt sß║»c' : rentStatus === 'good' ? '≡ƒƒó ─Éß║ít Chuß║⌐n' : rentStatus === 'warning' ? '≡ƒƒí Chß║Ñp nhß║¡n' : '≡ƒö┤ V╞░ß╗út trß║ºn')}
                    </div>
                    ${getMeterFill(rentPct, 30, rentStatus === 'danger' ? 'var(--danger)' : rentStatus === 'warning' ? 'var(--warning)' : 'var(--success)')}
                    <div class="ratio-desc">${rentComment}</div>
                </div>

                <!-- 2. Labor Cost Ratio -->
                <div class="ratio-card">
                    <div class="ratio-header">
                        <span class="ratio-title">≡ƒæÑ Nh├ón Sß╗▒ / Doanh Thu</span>
                        <span class="ratio-benchmark-tag">Chuß║⌐n V├áng: Γëñ 22%</span>
                    </div>
                    <div class="ratio-value-row">
                        <div class="ratio-val-num" style="color:${laborStatus === 'excellent' || laborStatus === 'good' ? 'var(--success)' : laborStatus === 'warning' ? 'var(--warning)' : 'var(--danger)'};">
                            ${laborPct.toFixed(1)}%
                        </div>
                        ${getStatusPill(laborStatus, laborStatus === 'excellent' ? '≡ƒƒó Xuß║Ñt sß║»c' : laborStatus === 'good' ? '≡ƒƒó ─Éß║ít Chuß║⌐n' : laborStatus === 'warning' ? '≡ƒƒí Chß║Ñp nhß║¡n' : '≡ƒö┤ V╞░ß╗út trß║ºn')}
                    </div>
                    ${getMeterFill(laborPct, 40, laborStatus === 'danger' ? 'var(--danger)' : laborStatus === 'warning' ? 'var(--warning)' : 'var(--success)')}
                    <div class="ratio-desc">${laborComment}</div>
                </div>

                <!-- 3. COGS Ratio -->
                <div class="ratio-card">
                    <div class="ratio-header">
                        <span class="ratio-title">Γÿò Gi├í Vß╗æn (COGS) / Doanh Thu</span>
                        <span class="ratio-benchmark-tag">Chuß║⌐n V├áng: Γëñ 30%</span>
                    </div>
                    <div class="ratio-value-row">
                        <div class="ratio-val-num" style="color:${cogsStatus === 'excellent' || cogsStatus === 'good' ? 'var(--success)' : cogsStatus === 'warning' ? 'var(--warning)' : 'var(--danger)'};">
                            ${cogsPct.toFixed(1)}%
                        </div>
                        ${getStatusPill(cogsStatus, cogsStatus === 'excellent' ? '≡ƒƒó Xuß║Ñt sß║»c' : cogsStatus === 'good' ? '≡ƒƒó ─Éß║ít Chuß║⌐n' : cogsStatus === 'warning' ? '≡ƒƒí Chß║Ñp nhß║¡n' : '≡ƒö┤ V╞░ß╗út trß║ºn')}
                    </div>
                    ${getMeterFill(cogsPct, 50, cogsStatus === 'danger' ? 'var(--danger)' : cogsStatus === 'warning' ? 'var(--warning)' : 'var(--success)')}
                    <div class="ratio-desc">${cogsComment}</div>
                </div>

                <!-- 4. Margin of Safety -->
                <div class="ratio-card">
                    <div class="ratio-header">
                        <span class="ratio-title">≡ƒ¢í∩╕Å Bi├¬n An To├án H├▓a Vß╗æn</span>
                        <span class="ratio-benchmark-tag">Chuß║⌐n V├áng: ΓëÑ 35%</span>
                    </div>
                    <div class="ratio-value-row">
                        <div class="ratio-val-num" style="color:${safetyStatus === 'excellent' || safetyStatus === 'good' ? 'var(--success)' : safetyStatus === 'warning' ? 'var(--warning)' : 'var(--danger)'};">
                            ${marginOfSafety.toFixed(1)}%
                        </div>
                        ${getStatusPill(safetyStatus, safetyStatus === 'excellent' ? '≡ƒƒó Cß╗▒c D├áy' : safetyStatus === 'good' ? '≡ƒƒó An To├án' : safetyStatus === 'warning' ? '≡ƒƒí Hß║╣p' : '≡ƒö┤ Nguy Hiß╗âm')}
                    </div>
                    ${getMeterFill(Math.max(marginOfSafety, 0), 60, safetyStatus === 'danger' ? 'var(--danger)' : safetyStatus === 'warning' ? 'var(--warning)' : 'var(--success)')}
                    <div class="ratio-desc">${safetyComment}</div>
                </div>
            </div>
        </div>

        <!-- 4 Strategic Actionable Recommendations -->
        <div>
            <div class="advice-section-title">
                <span>≡ƒÄ»</span> Khuyß║┐n Nghß╗ï Chiß║┐n L╞░ß╗úc Vß║¡n H├ánh & Gß╗ìi Vß╗æn
            </div>
            <div class="advice-cards-grid" style="margin-top: 10px;">
                <!-- 1. Location Strategy -->
                <div class="advice-card">
                    <div class="advice-card-header">
                        <div class="advice-icon-wrap advice-icon-blue">≡ƒÅó</div>
                        <div class="advice-card-title">Chiß║┐n L╞░ß╗úc Mß║╖t Bß║▒ng & ─Éiß╗âm B├ín</div>
                    </div>
                    <div class="advice-card-body">
                        Mß║╖t bß║▒ng ti├¬u tß╗æn <strong>${formatVND(rent)}/th├íng</strong>. Bß║ín cß║ºn ─æß║ít doanh thu tß╗æi thiß╗âu <strong>${formatShortVND(rent / 0.15)}/th├íng</strong> ─æß╗â ─æ╞░a tß╗╖ lß╗ç tiß╗ün thu├¬ vß╗ü mß╗⌐c an to├án chuß║⌐n 15%.
                        ${rentPct > 15 ? '<br><span style="color:var(--warning);">ΓÜá∩╕Å Mß║╣o: H├úy tß║¡n dß╗Ñng vß╗ëa h├¿ hoß║╖c mß╗ƒ th├¬m quß║ºy Takeaway buß╗òi s├íng ─æß╗â gia t─âng doanh thu tr├¬n c├╣ng 1 m├⌐t vu├┤ng thu├¬.</span>' : '<br><span style="color:var(--success);">Γ£¿ Vß╗ï thß║┐ mß║╖t bß║▒ng tß╗æt, ├íp lß╗▒c ─æß╗ïnh ph├¡ mß║╖t bß║▒ng ß╗ƒ mß╗⌐c l├╜ t╞░ß╗ƒng.</span>'}
                    </div>
                    <div class="advice-key-stat">
                        <span class="advice-stat-label">Sß╗æ ng├áy b├ín trß║ú tiß╗ün nh├á:</span>
                        <span class="advice-stat-val" style="color:${rentDaysNeeded <= 4.5 ? 'var(--success)' : 'var(--warning)'};">${rentDaysNeeded} ng├áy / th├íng</span>
                    </div>
                </div>

                <!-- 2. Staffing Strategy -->
                <div class="advice-card">
                    <div class="advice-card-header">
                        <div class="advice-icon-wrap advice-icon-green">≡ƒæÑ</div>
                        <div class="advice-card-title">Chiß║┐n L╞░ß╗úc Quß║ún Trß╗ï Nh├ón Sß╗▒ & Ca K├¡p</div>
                    </div>
                    <div class="advice-card-body">
                        Tß╗òng ─æß╗ïnh bi├¬n c├│ <strong>${totalShiftsPerDay} nh├ón sß╗▒/ng├áy</strong> chia 3 ca. B├¼nh qu├ón mß╗ùi nh├ón vi├¬n phß╗Ñc vß╗Ñ tß║ío ra khoß║úng <strong>${totalShiftsPerDay > 0 ? formatShortVND(dailyRev / totalShiftsPerDay) : '0'} doanh thu/ng├áy</strong>.
                        ${laborPct > 22 ? '<br><span style="color:var(--warning);">ΓÜá∩╕Å Mß║╣o: N├¬n chuyß╗ân 1 phß║ºn nh├ón vi├¬n full-time sang part-time theo giß╗¥ (18k - 22k/h) ─æß╗â chß╗ë t─âng c╞░ß╗¥ng v├áo khung giß╗¥ cao ─æiß╗âm (7h-9h s├íng & 19h-21h tß╗æi).</span>' : '<br><span style="color:var(--success);">Γ£¿ C╞í cß║Ñu l╞░╞íng v├á ph├ón ca ─æang vß║¡n h├ánh rß║Ñt hiß╗çu quß║ú.</span>'}
                    </div>
                    <div class="advice-key-stat">
                        <span class="advice-stat-label">Quß╗╣ l╞░╞íng trung b├¼nh/ng├áy:</span>
                        <span class="advice-stat-val">${formatShortVND(totalSalary / 30)}/ng├áy</span>
                    </div>
                </div>

                <!-- 3. Pitching Strategy -->
                <div class="advice-card">
                    <div class="advice-card-header">
                        <div class="advice-icon-wrap advice-icon-purple">≡ƒñ¥</div>
                        <div class="advice-card-title">Chiß║┐n L╞░ß╗úc Cß╗ò ─É├┤ng & Gß╗ìi Vß╗æn (Pitching)</div>
                    </div>
                    <div class="advice-card-body">
                        Vß╗¢i mß╗⌐c chi trß║ú cß╗ò tß╗⌐c ${payoutPct}%, tß╗╖ suß║Ñt cß╗ò tß╗⌐c thß╗▒c nhß║¡n h├áng n─âm dß╗▒ kiß║┐n ─æß║ít <strong>${dividendYield.toFixed(1)}%/n─âm</strong> tr├¬n tß╗òng vß╗æn g├│p.
                        ${dividendYield > 20 ? '<br><span style="color:var(--success);">Γ£¿ Tß╗╖ suß║Ñt sinh lß╗¥i v╞░ß╗út trß╗Öi so vß╗¢i gß╗¡i tiß║┐t kiß╗çm ng├ón h├áng (5-6%/n─âm), l├á luß║¡n ─æiß╗âm v├áng ─æß╗â chß╗æt deal vß╗¢i cß╗ò ─æ├┤ng.</span>' : '<br><span style="color:var(--warning);">ΓÜá∩╕Å Tß╗╖ suß║Ñt cß╗ò tß╗⌐c ─æang ß╗ƒ mß╗⌐c vß╗½a phß║úi. C├ón nhß║»c giß╗» lß║íi th├¬m quß╗╣ t├íi ─æß║ºu t╞░ ─æß╗â mß╗ƒ rß╗Öng quy m├┤.</span>'}
                    </div>
                    <div class="advice-key-stat">
                        <span class="advice-stat-label">Tß╗╖ lß╗ç sß╗ƒ hß╗»u cß╗ºa Founder:</span>
                        <span class="advice-stat-val" style="color:var(--primary);">${founderRatio.toFixed(1)}% (${formatShortVND(founderEquity)})</span>
                    </div>
                </div>

                <!-- 4. Runway Strategy -->
                <div class="advice-card">
                    <div class="advice-card-header">
                        <div class="advice-icon-wrap advice-icon-amber">≡ƒ¢í∩╕Å</div>
                        <div class="advice-card-title">Khß║ú N─âng Ph├▓ng Vß╗ç & Quß╗╣ Dß╗▒ Ph├▓ng</div>
                    </div>
                    <div class="advice-card-body">
                        Quß╗╣ dß╗▒ ph├▓ng tiß╗ün mß║╖t hiß╗çn c├│ <strong>${formatVND(buffer)}</strong>. 
                        ${netProfit >= 0 ? `Nß║┐u qu├ín kh├┤ng c├│ bß║Ñt kß╗│ doanh thu n├áo (Zero Revenue), quß╗╣ n├áy cho ph├⌐p duy tr├¼ trß║ú mß║╖t bß║▒ng v├á nß╗ú vay trong <strong>${runwayMonths}</strong>.` : `Vß╗¢i mß╗⌐c th├óm hß╗Ñt hiß╗çn tß║íi, qu├ín c├│ thß╗â gß╗ông lß╗ù trong tß╗æi ─æa <strong>${runwayMonths}</strong> tr╞░ß╗¢c khi cß║ín tiß╗ün.`}
                        <br><span style="color:${buffer >= fixedMonthlyOpex * 3 ? 'var(--success)' : 'var(--warning)'};">${buffer >= fixedMonthlyOpex * 3 ? 'Γ£¿ Quß╗╣ dß╗▒ ph├▓ng ─æß║ít chuß║⌐n bß║úo hiß╗âm an to├án (ΓëÑ 3 th├íng ─æß╗ïnh ph├¡).' : 'ΓÜá∩╕Å Khuyß║┐n nghß╗ï: N├¬n chuß║⌐n bß╗ï quß╗╣ dß╗▒ ph├▓ng tß╗æi thiß╗âu t╞░╞íng ─æ╞░╞íng 3 th├íng tiß╗ün nh├á + nß╗ú vay ─æß╗â y├¬n t├óm vß║¡n h├ánh.'}</span>
                    </div>
                    <div class="advice-key-stat">
                        <span class="advice-stat-label">Thß╗¥i gian sinh tß╗ôn an to├án:</span>
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
    if (kpiBe) animateValue(kpiBe, 0, breakEvenDailyVol, 800, (val) => Math.ceil(val) + ' ly/ng├áy');

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

        if (elVol) elVol.innerText = sc.vol + ' ly/ng├áy';
        if (elRev) elRev.innerText = formatShortVND(sc.rev);
        if (elCost) elCost.innerText = formatShortVND(sc.totalExpense);
        if (elNet) {
            elNet.innerText = (sc.net >= 0 ? '+' : '') + formatShortVND(sc.net);
            elNet.style.color = sc.net >= 0 ? 'var(--success)' : 'var(--danger)';
        }
        if (elStatus) {
            if (sc.net < 0) {
                elStatus.innerText = 'Cß║ºn b├╣ lß╗ù: ' + formatShortVND(Math.abs(sc.net)) + '/th';
                elStatus.style.color = 'var(--danger)';
            } else if (sc.net === 0) {
                elStatus.innerText = 'H├▓a vß╗æn kinh doanh';
                elStatus.style.color = 'var(--warning)';
            } else {
                elStatus.innerText = (level === 'good' ? 'Tß╗æi ╞░u: L├úi +' : 'L├úi +') + formatShortVND(sc.net) + '/th';
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
        
        let statusIcon = '≡ƒƒó';
        let statusText = 'An to├án';
        let badgeBg = 'rgba(16, 185, 129, 0.1)';
        let badgeColor = isLightAlert ? '#047857' : '#34d399';
        let badgeBorder = 'rgba(16, 185, 129, 0.3)';
        let borderColor = 'rgba(16, 185, 129, 0.2)';
        let textColor = isLightAlert ? '#0f172a' : '#f8fafc';
        let containerBg = isLightAlert ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.02)';
        let containerBorder = 'rgba(16, 185, 129, 0.25)';
        let warningMessage = 'Quß╗╣ dß╗▒ ph├▓ng ß╗ƒ mß╗⌐c an to├án. Doanh sß╗æ dß╗▒ kiß║┐n ─æß║úm bß║úo khß║ú n─âng sinh lß╗¥i hoß║╖c sinh tß╗ôn ß╗òn ─æß╗ïnh.';
        let runwayText = 'V├┤ hß║ín (Kh├┤ng cß║ín kiß╗çt)';

        if (runwayMonths !== Infinity) {
            runwayText = runwayMonths.toFixed(1) + ' th├íng';
        }

        if (burnRate > 0) {
            if (runwayMonths < 3) {
                statusIcon = '≡ƒö┤';
                statusText = 'Nguy hiß╗âm';
                badgeBg = 'rgba(239, 68, 68, 0.1)';
                badgeColor = isLightAlert ? '#b91c1c' : '#f87171';
                badgeBorder = 'rgba(239, 68, 68, 0.3)';
                borderColor = 'rgba(239, 68, 68, 0.2)';
                textColor = isLightAlert ? '#b91c1c' : '#fca5a5';
                containerBg = 'var(--danger-glow)';
                containerBorder = 'rgba(239, 68, 68, 0.3)';
                warningMessage = `Vß╗¢i mß╗⌐c lß╗ù ${formatShortVND(burnRate)}/th├íng, quß╗╣ dß╗▒ ph├▓ng cß╗ºa bß║ín sß║╜ cß║ín kiß╗çt trong khoß║úng ${runwayMonths.toFixed(1)} th├íng. Cß║ºn cß║úi thiß╗çn doanh sß╗æ hoß║╖c cß║»t giß║úm ─æß╗ïnh ph├¡.`;
                alertContainer.classList.add('danger-alert');
            } else if (runwayMonths <= 6) {
                statusIcon = '≡ƒƒí';
                statusText = 'Cß║únh b├ío';
                badgeBg = 'rgba(245, 158, 11, 0.1)';
                badgeColor = isLightAlert ? '#b45309' : '#fbbf24';
                badgeBorder = 'rgba(245, 158, 11, 0.3)';
                borderColor = 'rgba(245, 158, 11, 0.2)';
                textColor = isLightAlert ? '#92400e' : '#fde68a';
                containerBg = 'var(--warning-glow)';
                containerBorder = 'rgba(245, 158, 11, 0.3)';
                warningMessage = `Quß╗╣ dß╗▒ ph├▓ng ─æß╗º g├ính lß╗ù trong khoß║úng ${runwayMonths.toFixed(1)} th├íng. Mß╗⌐c ─æß╗Ö an to├án ß╗ƒ mß╗⌐c trung b├¼nh, cß║ºn ch├║ ├╜ tß╗æi ╞░u ─æß╗ïnh ph├¡ hoß║╖c t─âng doanh sß╗æ.`;
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
                        <span>Khß║ú N─âng Sinh Tß╗ôn T├ái Ch├¡nh (Cash Runway)</span>
                    </div>
                    <span style="padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder};">
                        ${statusText}
                    </span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; border-top: 1px dashed ${borderColor}; padding-top: 8px; margin-top: 4px;">
                    <div>
                        <div style="font-size: 10.5px; color: var(--text-muted); font-weight: 600;">Tß╗ÉC ─Éß╗ÿ ─Éß╗ÉT TIß╗ÇN (BURN RATE)</div>
                        <div style="font-size: 15px; font-weight: bold; margin-top: 2px; color: ${burnRate > 0 ? 'var(--danger)' : 'var(--success)'};">
                            ${base.net < 0 ? '-' + formatShortVND(burnRate) : '+' + formatShortVND(base.net)}/th├íng
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 10.5px; color: var(--text-muted); font-weight: 600;">THß╗£I GIAN SINH Tß╗ÆN (RUNWAY)</div>
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
                labels: ['Cß╗ìc mß║╖t bß║▒ng', 'Thi c├┤ng sß╗¡a chß╗»a', 'Thiß║┐t bß╗ï & B├án ghß║┐', 'Nguy├¬n liß╗çu ─æß║ºu'],
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
                labels: labels.length > 0 ? labels : ['Ch╞░a g├│p vß╗æn'],
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
                                if (context.label === 'Ch╞░a g├│p vß╗æn') return ' Ch╞░a g├│p vß╗æn';
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
            const monthsLabel = ['Bß║»t ─æß║ºu'];
            for (let i = 1; i <= 12; i++) monthsLabel.push('Th├íng ' + i);
            chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: monthsLabel,
                    datasets: [
                        {
                            label: 'Quß╗╣ tiß╗ün mß║╖t dß╗▒ kiß║┐n (VND)',
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
                                label: function(context) { return 'Sß╗æ d╞░ quß╗╣: ' + formatVND(context.raw); }
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
    { id: 1, name: "C├á ph├¬", volumePct: 40, price: 25000, costPct: 25 },
    { id: 2, name: "Tr├á & Sinh tß╗æ", volumePct: 40, price: 35000, costPct: 30 },
    { id: 3, name: "B├ính & ─Éß╗ô ─ân", volumePct: 20, price: 30000, costPct: 45 }
];

function updateMenuVolumeWarning() {
    const warnEl = document.getElementById('menu-vol-warning');
    const totalVol = menuItems.reduce((sum, item) => sum + parseFloat(item.volumePct || 0), 0);
    if (warnEl) {
        if (Math.abs(totalVol - 100) > 0.1) {
            warnEl.style.display = 'block';
            warnEl.innerText = `L╞░u ├╜: Tß╗òng tß╗╖ trß╗ìng b├ín = ${totalVol.toFixed(1)}%. N├¬n ─æiß╗üu chß╗ënh lß║íi cho ─æß╗º 100%.`;
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
                <button onclick="removeMenuItem(${item.id})" style="background:transparent; border:none; color:var(--danger); cursor:pointer; font-size:14px; display:flex; align-items:center; justify-content:center;">├ù</button>
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
    menuItems.push({ id: Date.now(), name: "Nh├│m mß╗¢i", volumePct: 0, price: 0, costPct: 0 });
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
        'inp-term', 'inp-cost-pct', 'inp-vol-weak', 'inp-vol-base', 'inp-vol-good', 'inp-depr-years'
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
    { id: 1, name: "C├á ph├¬", volumePct: 40, price: 25000, costPct: 25 },
    { id: 2, name: "Tr├á & Sinh tß╗æ", volumePct: 40, price: 35000, costPct: 30 },
    { id: 3, name: "B├ính & ─Éß╗ô ─ân", volumePct: 20, price: 30000, costPct: 45 }
];

const DEFAULT_SHAREHOLDERS = [
    { id: 1, name: "Bß║ín (Cß╗ò ─æ├┤ng s├íng lß║¡p)", contribution: 80000000, role: "operate" }
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
                alert("─É├ú tß║úi dß╗» liß╗çu tß╗½ ─æ╞░ß╗¥ng link chia sß║╗ th├ánh c├┤ng!");
            }
        } catch (err) {
            console.error("Lß╗ùi giß║úi m├ú li├¬n kß║┐t chia sß║╗:", err);
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

    let paybackText = paybackMonth > 0 ? paybackMonth.toFixed(1) + " th├íng" : "Kh├┤ng trong 3 n─âm";
    let discPaybackText = discPaybackMonth > 0 ? discPaybackMonth.toFixed(1) + " th├íng" : "Kh├┤ng trong 3 n─âm";

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
        <h3 class="chart-sub-title">Ph├ón t├¡ch Hiß╗çu Quß║ú ─Éß║ºu T╞░ (Tß║ºm nh├¼n 3 n─âm)</h3>
        
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
            Sß║ún l╞░ß╗úng dß╗▒ kiß║┐n: <strong>${vol} ly/ng├áy</strong>. Tß╗òng vß╗æn: ${formatShortVND(totalCapital)}. T─âng tr╞░ß╗ƒng DT: ${growthRevPct}%/n─âm | T─âng chi ph├¡: ${growthOpexPct}%/n─âm.
        </p>

        <div class="scenarios-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
            <div class="glass-card scenario-card" style="padding: 12px;">
                <div class="scenario-metric">
                    <span style="font-size:14px; font-weight:600; color: var(--text-muted);">Ho├án vß╗æn ─æ╞ín giß║ún</span>
                    <span style="font-size:16px; color:var(--primary); font-weight:bold; margin-top: 4px;">${paybackText}</span>
                </div>
            </div>
            <div class="glass-card scenario-card" style="padding: 12px;">
                <div class="scenario-metric">
                    <span style="font-size:14px; font-weight:600; color: var(--text-muted);">Ho├án vß╗æn chiß║┐t khß║Ñu</span>
                    <span style="font-size:16px; color:var(--primary); font-weight:bold; margin-top: 4px;">${discPaybackText}</span>
                </div>
            </div>
            <div class="glass-card scenario-card" style="padding: 12px;">
                <div class="scenario-metric">
                    <span style="font-size:14px; font-weight:600; color: var(--text-muted);">Sß║ún l╞░ß╗úng h├▓a vß╗æn</span>
                    <span style="font-size:16px; color:var(--primary); font-weight:bold; margin-top: 4px;">${Math.ceil(breakEvenDailyVol)} ly/ng├áy</span>
                </div>
            </div>
            <div class="glass-card scenario-card" style="padding: 12px;">
                <div class="scenario-metric">
                    <span style="font-size:14px; font-weight:600; color: var(--text-muted);">NPV (Hiß╗çn gi├í thuß║ºn)</span>
                    <span class="${npvColor}" style="font-size:16px; font-weight:bold; margin-top: 4px;">${npv >= 0 ? '+' : ''}${formatShortVND(npv)}</span>
                </div>
            </div>
            <div class="glass-card scenario-card" style="padding: 12px;">
                <div class="scenario-metric">
                    <span style="font-size:14px; font-weight:600; color: var(--text-muted);">IRR (Tß╗╖ suß║Ñt nß╗Öi bß╗Ö)</span>
                    <span class="${irrColor}" style="font-size:16px; font-weight:bold; margin-top: 4px;">${totalInflow > totalCapital && irrAnnual > -100 ? irrAnnual.toFixed(1) + '%' : 'N/A'}</span>
                </div>
            </div>
            <div class="glass-card scenario-card" style="padding: 12px;">
                <div class="scenario-metric">
                    <span style="font-size:14px; font-weight:600; color: var(--text-muted);">ROI (Tß╗╖ lß╗ç ho├án vß╗æn)</span>
                    <span class="${roiColor}" style="font-size:16px; font-weight:bold; margin-top: 4px;">${roi.toFixed(1)}%</span>
                </div>
            </div>
            <div class="glass-card scenario-card" style="padding: 12px;">
                <div class="scenario-metric">
                    <span style="font-size:14px; font-weight:600; color: var(--text-muted);">PI (Chß╗ë sß╗æ sinh lß╗¥i)</span>
                    <span class="${piColor}" style="font-size:16px; font-weight:bold; margin-top: 4px;">${pi.toFixed(2)}</span>
                </div>
            </div>
        </div>

        <div class="explanation-box" style="margin-top:16px; padding: 12px 16px; background: rgba(15,23,42,0.02); border-radius: 6px; border-left: 4px solid ${npv >= 0 ? 'var(--primary)' : 'var(--danger)'};">
            <strong>Kß║┐t luß║¡n t├ái ch├¡nh:</strong> 
            ${npv >= 0 ? `<span style="color:var(--val-profit)">Dß╗▒ ├ín khß║ú thi vß╗ü mß║╖t t├ái ch├¡nh (NPV &gt; 0, chß╗ë sß╗æ PI ─æß║ít ${pi.toFixed(2)} &gt; 1). IRR ─æß║ít ${irrAnnual.toFixed(1)}% lß╗¢n h╞ín l├úi suß║Ñt chiß║┐t khß║Ñu ${discountRatePct}%.</span>` : `<span style="color:var(--val-loss)">Dß╗▒ ├ín kh├┤ng hiß╗çu quß║ú vß╗¢i mß╗⌐c l├úi suß║Ñt chiß║┐t khß║Ñu n├áy (NPV &lt; 0, PI ─æß║ít ${pi.toFixed(2)} &lt; 1). Bß║ín n├¬n c├ón nhß║»c ─æiß╗üu chß╗ënh ─æß╗ïnh ph├¡, gi├í b├ín hoß║╖c cß║úi thiß╗çn sß║ún l╞░ß╗úng b├ín.</span>`}
        </div>

        <!-- Cumulative Cash Flow Chart -->
        <div style="margin-top: 24px;">
            <h4 class="chart-sub-title" style="margin-bottom: 8px;">─Éß╗ô Thß╗ï D├▓ng Tiß╗ün T├¡ch L┼⌐y 36 Th├íng (H├▓a vß╗æn khi ─æ╞░ß╗¥ng t├¡ch l┼⌐y v╞░ß╗út mß╗⌐c 0)</h4>
            <div class="chart-container" style="position: relative; height: 250px; width: 100%;">
                <canvas id="cumulativeCashFlowChart"></canvas>
            </div>
        </div>

        <!-- Detailed Year-by-Year Table -->
        <div style="margin-top: 24px; overflow-x: auto;">
            <h4 class="chart-sub-title" style="margin-bottom: 8px;">Bß║úng Chi Tiß║┐t D├▓ng Tiß╗ün 3 N─âm (─æ╞ín vß╗ï: ─æ)</h4>
            <table class="sensitivity-table" style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr>
                        <th style="text-align: left; padding: 8px; border-bottom: 2px solid var(--border-color);">Khoß║ún mß╗Ñc \\ Thß╗¥i ─æiß╗âm</th>
                        <th style="text-align: right; padding: 8px; border-bottom: 2px solid var(--border-color);">N─âm 0 (Hiß╗çn tß║íi)</th>
                        <th style="text-align: right; padding: 8px; border-bottom: 2px solid var(--border-color);">N─âm 1</th>
                        <th style="text-align: right; padding: 8px; border-bottom: 2px solid var(--border-color);">N─âm 2</th>
                        <th style="text-align: right; padding: 8px; border-bottom: 2px solid var(--border-color);">N─âm 3</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="text-align: left; padding: 8px; font-weight: 500;">Doanh thu thuß║ºn</td>
                        <td style="text-align: right; padding: 8px; color: var(--text-muted);">--</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[1].rev))}─æ</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[2].rev))}─æ</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[3].rev))}─æ</td>
                    </tr>
                    <tr>
                        <td style="text-align: left; padding: 8px; font-weight: 500;">Tß╗òng chi ph├¡ hoß║ít ─æß╗Öng (gß╗ôm COGS & Nß╗ú vay)</td>
                        <td style="text-align: right; padding: 8px; color: var(--text-muted);">--</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[1].opex))}─æ</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[2].opex))}─æ</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[3].opex))}─æ</td>
                    </tr>
                    <tr>
                        <td style="text-align: left; padding: 8px; font-weight: 500;">Thuß║┐ TNDN</td>
                        <td style="text-align: right; padding: 8px; color: var(--text-muted);">--</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[1].tax))}─æ</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[2].tax))}─æ</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[3].tax))}─æ</td>
                    </tr>
                    <tr style="border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); font-weight: 600; background: rgba(15,23,42,0.01);">
                        <td style="text-align: left; padding: 8px;">D├▓ng tiß╗ün r├▓ng (Net Cash Flow)</td>
                        <td style="text-align: right; padding: 8px; color: var(--val-loss);">${formatNumber(Math.round(-totalCapital))}─æ</td>
                        <td style="text-align: right; padding: 8px; color: ${yearData[1].net >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${yearData[1].net >= 0 ? '+' : ''}${formatNumber(Math.round(yearData[1].net))}─æ</td>
                        <td style="text-align: right; padding: 8px; color: ${yearData[2].net >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${yearData[2].net >= 0 ? '+' : ''}${formatNumber(Math.round(yearData[2].net))}─æ</td>
                        <td style="text-align: right; padding: 8px; color: ${yearData[3].net >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${yearData[3].net >= 0 ? '+' : ''}${formatNumber(Math.round(yearData[3].net))}─æ</td>
                    </tr>
                    <tr>
                        <td style="text-align: left; padding: 8px; font-weight: 500; color: var(--text-muted);">Hß╗ç sß╗æ chiß║┐t khß║Ñu</td>
                        <td style="text-align: right; padding: 8px; color: var(--text-muted);">1.000</td>
                        <td style="text-align: right; padding: 8px; color: var(--text-muted);">${(1 / Math.pow(1 + (discountRatePct / 100), 1)).toFixed(3)}</td>
                        <td style="text-align: right; padding: 8px; color: var(--text-muted);">${(1 / Math.pow(1 + (discountRatePct / 100), 2)).toFixed(3)}</td>
                        <td style="text-align: right; padding: 8px; color: var(--text-muted);">${(1 / Math.pow(1 + (discountRatePct / 100), 3)).toFixed(3)}</td>
                    </tr>
                    <tr style="font-weight: 600; border-top: 1px dashed var(--border-color);">
                        <td style="text-align: left; padding: 8px;">D├▓ng tiß╗ün chiß║┐t khß║Ñu (PV)</td>
                        <td style="text-align: right; padding: 8px; color: var(--val-loss);">${formatNumber(Math.round(-totalCapital))}─æ</td>
                        <td style="text-align: right; padding: 8px; color: ${yearData[1].pv >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${yearData[1].pv >= 0 ? '+' : ''}${formatNumber(Math.round(yearData[1].pv))}─æ</td>
                        <td style="text-align: right; padding: 8px; color: ${yearData[2].pv >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${yearData[2].pv >= 0 ? '+' : ''}${formatNumber(Math.round(yearData[2].pv))}─æ</td>
                        <td style="text-align: right; padding: 8px; color: ${yearData[3].pv >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${yearData[3].pv >= 0 ? '+' : ''}${formatNumber(Math.round(yearData[3].pv))}─æ</td>
                    </tr>
                    <tr style="background: rgba(15,23,42,0.03); font-weight: bold; border-top: 2px solid var(--border-color);">
                        <td style="text-align: left; padding: 8px;">T├¡ch l┼⌐y chiß║┐t khß║Ñu (Cumulative PV)</td>
                        <td style="text-align: right; padding: 8px; color: var(--val-loss);">${formatNumber(Math.round(-totalCapital))}─æ</td>
                        <td style="text-align: right; padding: 8px; color: ${cumY1 >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${cumY1 >= 0 ? '+' : ''}${formatNumber(Math.round(cumY1))}─æ</td>
                        <td style="text-align: right; padding: 8px; color: ${cumY2 >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${cumY2 >= 0 ? '+' : ''}${formatNumber(Math.round(cumY2))}─æ</td>
                        <td style="text-align: right; padding: 8px; color: ${cumY3 >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${cumY3 >= 0 ? '+' : ''}${formatNumber(Math.round(cumY3))}─æ</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Detailed explanation of metrics -->
        <div class="glass-card" style="margin-top: 24px; padding: 16px; font-size: 13.5px; line-height: 1.6; color: var(--text-main);">
            <h4 class="chart-sub-title" style="margin-bottom: 12px; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px; color: var(--primary);">
                ≡ƒÆí Diß╗àn giß║úi & C├┤ng thß╗⌐c t├¡nh chi tiß║┐t (Sß║ún l╞░ß╗úng ${vol} ly/ng├áy)
            </h4>
            <div style="display: flex; flex-direction: column; gap: 14px;">
                <div>
                    <strong>1. Tß╗òng vß╗æn ─æß║ºu t╞░ ban ─æß║ºu (Vß╗æn cß║ºn thiß║┐t):</strong>
                    <div style="padding-left: 12px; color: var(--text-muted); margin-top: 2px;">
                        ΓÇó C├┤ng thß╗⌐c: Cß╗ìc mß║╖t bß║▒ng (${formatShortVND(deposit)}) + Thi c├┤ng sß╗¡a chß╗»a (${formatShortVND(renovate)}) + Thiß║┐t bß╗ï m├íy m├│c (${formatShortVND(equipment)}) + Nguy├¬n liß╗çu khß╗ƒi tß║ío (${formatShortVND(rawStart)}) + Decor & Kh├íc (${formatShortVND(decorMisc)}) + Dß╗▒ ph├▓ng gß╗ông lß╗ù (${formatShortVND(buffer)}).
                        <br>ΓÇó Kß║┐t quß║ú: <strong>${formatNumber(totalCapital)} ─æ</strong>.
                    </div>
                </div>
                <div>
                    <strong>2. Thß╗¥i gian ho├án vß╗æn ─æ╞ín giß║ún (Simple Payback):</strong>
                    <div style="padding-left: 12px; color: var(--text-muted); margin-top: 2px;">
                        ΓÇó C├┤ng thß╗⌐c: Tß╗òng vß╗æn ─æß║ºu t╞░ / D├▓ng tiß╗ün r├▓ng h├áng th├íng trung b├¼nh n─âm 1.
                        <br>ΓÇó C├ích t├¡nh: ${formatNumber(totalCapital)} ─æ / ${formatNumber(Math.round(yearData[1].net / 12))} ─æ (d├▓ng tiß╗ün r├▓ng trung b├¼nh/th├íng cß╗ºa N─âm 1).
                        <br>ΓÇó Kß║┐t quß║ú: <strong>${paybackText}</strong>.
                    </div>
                </div>
                <div>
                    <strong>3. Thß╗¥i gian ho├án vß╗æn chiß║┐t khß║Ñu (Discounted Payback):</strong>
                    <div style="padding-left: 12px; color: var(--text-muted); margin-top: 2px;">
                        ΓÇó C├┤ng thß╗⌐c: Thß╗¥i ─æiß╗âm m├á tß╗òng hiß╗çn gi├í c├íc d├▓ng tiß╗ün t├¡ch luß╗╣ ─æß║ít trß║íng th├íi h├▓a vß╗æn (lß╗¢n h╞ín hoß║╖c bß║▒ng 0).
                        <br>ΓÇó C├ích t├¡nh: Quy ─æß╗òi d├▓ng tiß╗ün tß╗½ng th├íng vß╗ü hiß╗çn gi├í (PV) theo tß╗╖ lß╗ç chiß║┐t khß║Ñu h├áng th├íng hiß╗çu dß╗Ñng r_m = (1 + ${discountRatePct}%)^(1/12) - 1 Γëê ${(monthlyRate*100).toFixed(3)}%/th├íng. Sau ─æ├│ cß╗Öng dß╗ôn tß╗½ng th├íng ─æß╗â xem khi n├áo thu hß╗ôi ─æß╗º vß╗æn hiß╗çn gi├í.
                        <br>ΓÇó Kß║┐t quß║ú: <strong>${discPaybackText}</strong>.
                    </div>
                </div>
                <div>
                    <strong>4. Gi├í trß╗ï hiß╗çn tß║íi thuß║ºn (NPV - Net Present Value):</strong>
                    <div style="padding-left: 12px; color: var(--text-muted); margin-top: 2px;">
                        ΓÇó C├┤ng thß╗⌐c: -Vß╗æn ─æß║ºu t╞░ ban ─æß║ºu + Tß╗òng PV cß╗ºa d├▓ng tiß╗ün 36 th├íng.
                        <br>ΓÇó ├¥ ngh─⌐a: Thß╗â hiß╗çn sß╗æ tiß╗ün l├úi r├▓ng thß╗▒c tß║┐ thu vß╗ü (sau khi ─æ├ú khß║Ñu trß╗½ ─æi tr╞░ß╗út gi├í v├á chi ph├¡ c╞í hß╗Öi l├á l├úi suß║Ñt chiß║┐t khß║Ñu ${discountRatePct}%).
                        <br>ΓÇó Kß║┐t quß║ú: <strong class="${npvColor}">${npv >= 0 ? '+' : ''}${formatNumber(Math.round(npv))} ─æ</strong>.
                    </div>
                </div>
                <div>
                    <strong>5. Tß╗╖ suß║Ñt sinh lß╗¥i nß╗Öi bß╗Ö (IRR - Internal Rate of Return):</strong>
                    <div style="padding-left: 12px; color: var(--text-muted); margin-top: 2px;">
                        ΓÇó Kh├íi niß╗çm: Mß╗⌐c l├úi suß║Ñt chiß║┐t khß║Ñu m├á tß║íi ─æ├│ NPV = 0.
                        <br>ΓÇó ├¥ ngh─⌐a: Tß╗╖ suß║Ñt sinh lß╗¥i thß╗▒c tß║┐ cß╗ºa qu├ín. Nß║┐u IRR lß╗¢n h╞ín L├úi suß║Ñt chiß║┐t khß║Ñu k├¼ vß╗ìng (${discountRatePct}%) th├¼ dß╗▒ ├ín ─æ├íng ─æß╗â ─æß║ºu t╞░.
                        <br>ΓÇó Kß║┐t quß║ú: <strong class="${irrColor}">${totalInflow > totalCapital && irrAnnual > -100 ? irrAnnual.toFixed(1) + '%' : 'N/A'}</strong>.
                    </div>
                </div>
                <div>
                    <strong>6. Tß╗╖ lß╗ç ho├án vß╗æn ─æß║ºu t╞░ (ROI - Return on Investment):</strong>
                    <div style="padding-left: 12px; color: var(--text-muted); margin-top: 2px;">
                        ΓÇó C├┤ng thß╗⌐c: (Tß╗òng d├▓ng tiß╗ün r├▓ng 3 n─âm - Vß╗æn ─æß║ºu t╞░ ban ─æß║ºu) / Vß╗æn ─æß║ºu t╞░ ban ─æß║ºu ├ù 100%.
                        <br>ΓÇó C├ích t├¡nh: (${formatNumber(Math.round(totalInflow))} ─æ d├▓ng tiß╗ün thu vß╗ü - ${formatNumber(totalCapital)} ─æ vß╗æn bß╗Å ra) / ${formatNumber(totalCapital)} ─æ.
                        <br>ΓÇó Kß║┐t quß║ú: <strong class="${roiColor}">${roi.toFixed(1)}%</strong> trong v├▓ng 3 n─âm (t╞░╞íng ─æ╞░╞íng trung b├¼nh khoß║úng ${(roi/3).toFixed(1)}%/n─âm).
                    </div>
                </div>
                <div>
                    <strong>7. Chß╗ë sß╗æ sinh lß╗¥i (PI - Profitability Index):</strong>
                    <div style="padding-left: 12px; color: var(--text-muted); margin-top: 2px;">
                        ΓÇó C├┤ng thß╗⌐c: Tß╗òng hiß╗çn gi├í d├▓ng tiß╗ün v├áo (PV) / Vß╗æn ─æß║ºu t╞░ ban ─æß║ºu.
                        <br>ΓÇó ├¥ ngh─⌐a: Cß╗⌐ 1 ─æß╗ông vß╗æn ─æß║ºu t╞░ ban ─æß║ºu ─æem lß║íi bao nhi├¬u ─æß╗ông gi├í trß╗ï hiß╗çn tß║íi. Dß╗▒ ├ín c├│ khß║ú thi khi PI > 1.
                        <br>ΓÇó Kß║┐t quß║ú: <strong class="${piColor}">${pi.toFixed(2)}</strong>.
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
                        label: 'T├¡ch l┼⌐y thß╗▒c tß║┐',
                        data: dataCumCash,
                        borderColor: '#38bdf8',
                        backgroundColor: 'rgba(56, 189, 248, 0.05)',
                        borderWidth: 2,
                        tension: 0.2,
                        fill: true
                    },
                    {
                        label: 'T├¡ch l┼⌐y chiß║┐t khß║Ñu (PV)',
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
                                return context.dataset.label + ': ' + formatNumber(context.raw) + '─æ';
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
            label.textContent = 'Γ£ô ─É├ú Copy!';
            setTimeout(() => {
                btn.classList.remove('share-success');
                label.textContent = 'Chia Sß║╗';
            }, 2500);
        }
    }).catch(() => {
        // Fallback: prompt the user to copy manually
        prompt('Sao ch├⌐p link chia sß║╗ b├¬n d╞░ß╗¢i:', shareUrl);
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
        console.warn('Kh├┤ng thß╗â load state tß╗½ URL:', e);
    }
}

function showShareLoadedNotification() {
    const notif = document.createElement('div');
    notif.className = 'share-load-notif';
    notif.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
        </svg>
        <span>─É├ú tß║úi sß╗æ liß╗çu ─æ╞░ß╗úc chia sß║╗ th├ánh c├┤ng!</span>
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
