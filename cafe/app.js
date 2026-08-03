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
    { id: 1, name: "Bạn (Cổ đông sáng lập)", contribution: 80000000, role: "operate" }
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
            { id: 1, name: "Chủ quán", contribution: 45000000, role: "operate" }
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
            { id: 1, name: "Nhà sáng lập (Vận hành)", contribution: 100000000, role: "operate" },
            { id: 2, name: "Cổ đông đầu tư A", contribution: 50000000, role: "invest" }
        ];
    } else {
        // standard (Quán máy lạnh chuẩn 50m2)
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
            { id: 1, name: "Bạn (Cổ đông sáng lập)", contribution: 80000000, role: "operate" }
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
        formatted = (absVal / 1000000).toFixed(1) + 'M đ';
    } else if (absVal >= 1000) {
        formatted = (absVal / 1000).toFixed(0) + 'k đ';
    } else {
        formatted = absVal + ' đ';
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
// Doanh nghiệp: Thuế TNDN tính trên lợi nhuận
//   - DT năm ≤ 1 tỷ: miễn thuế TNDN
//   - DT năm ≤ 3 tỷ: 15%
//   - DT năm ≤ 50 tỷ: 17%
//   - DT năm > 50 tỷ: 20%
// User can override with manual % in inp-tax-rate
// ======================================================================
function calculateTax(monthlyProfit, annualRevenue) {
    if (monthlyProfit <= 0) return 0;
    const dynamicTaxRate = getSuggestedTaxRate(annualRevenue);
    return monthlyProfit * (dynamicTaxRate / 100);
}

function getSuggestedTaxRate(annualRevenue) {
    if (annualRevenue <= 1000000000) return 0; // miễn thuế
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
// Rent → Deposit synchronization (3 months)
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
    if (deposit < 0) setError(depositInput, "Cọc mặt bằng không được âm.");
    if (renovate < 0) setError(renovateInput, "Sửa chữa & Decor không được âm.");
    if (equipment < 0) setError(equipmentInput, "Máy móc & Thiết bị không được âm.");
    if (rawStart < 0) setError(rawStartInput, "Nguyên liệu ban đầu không được âm.");
    if (decorMisc < 0) setError(decorMiscInput, "Decor nhỏ không được âm.");
    if (buffer < 0) setError(bufferInput, "Quỹ dự phòng không được âm.");
    
    if (loan < 0) setError(loanInput, "Số tiền vay ngân hàng không được âm.");
    if (interest < 0) setError(interestInput, "Lãi suất vay không được nhỏ hơn 0.");
    if (term <= 0) setError(termInput, "Thời hạn vay phải lớn hơn 0 tháng.");
    
    if (rent < 0) setError(rentInput, "Tiền thuê mặt bằng không được âm.");
    if (utilities < 0) setError(utilitiesInput, "Chi phí điện nước không được âm.");
    
    if (shiftMorningStaff < 0) setError(shiftMorningStaffInput, "Số NV ca sáng không được âm.");
    if (shiftMorningRate < 0) setError(shiftMorningRateInput, "Lương ca sáng không được âm.");
    if (shiftAfternoonStaff < 0) setError(shiftAfternoonStaffInput, "Số NV ca chiều không được âm.");
    if (shiftAfternoonRate < 0) setError(shiftAfternoonRateInput, "Lương ca chiều không được âm.");
    if (shiftEveningStaff < 0) setError(shiftEveningStaffInput, "Số NV ca tối không được âm.");
    if (shiftEveningRate < 0) setError(shiftEveningRateInput, "Lương ca tối không được âm.");
    if (ftManagerCount < 0) setError(ftManagerCountInput, "Số quản lý không được âm.");
    if (ftManagerSalary < 0) setError(ftManagerSalaryInput, "Lương quản lý không được âm.");
    if (weekendMultiplier < 1.0) setError(weekendMultiplierInput, "Hệ số cuối tuần không được nhỏ hơn 1.0.");
    if (commissionRate < 0 || commissionRate > 100) setError(commissionRateInput, "Tỷ lệ thưởng phải từ 0% đến 100%.");
    
    if (misc < 0) setError(miscInput, "Chi phí phát sinh không được âm.");
    if (price <= 0) setError(priceInput, "Giá bán trung bình phải lớn hơn 0 đ/ly.");
    
    if (costPct < 0 || costPct > 100) setError(costPctInput, "Tỷ lệ Cost nguyên vật liệu phải nằm từ 0% đến 100%.");
    if (volWeak < 0) setError(volWeakInput, "Sản lượng kịch bản Yếu không được âm.");
    if (volBase < 0) setError(volBaseInput, "Sản lượng kịch bản Trung bình không được âm.");
    if (volGood < 0) setError(volGoodInput, "Sản lượng kịch bản Tốt không được âm.");
    if (deprYears <= 0) setError(deprYearsInput, "Thời gian khấu hao tài sản phải lớn hơn 0 năm.");
    if (discountRate < 0 || discountRate > 100) setError(discountRateInput, "Lãi suất chiết khấu kỳ vọng phải từ 0% đến 100%.");
    
    const setupCosts = deposit + renovate + equipment + rawStart + decorMisc;
    const totalCapitalNeeded = setupCosts + buffer;
    
    if (loan > totalCapitalNeeded) {
        setError(loanInput, `Tiền vay ngân hàng (${formatVND(loan)}) đang lớn hơn Tổng vốn cần thiết (${formatVND(totalCapitalNeeded)}). Cổ đông không thể góp phần vốn âm.`);
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
        alert("Vui lòng nhập tên cổ đông!");
        return;
    }
    if (contrib <= 0) {
        alert("Vui lòng nhập số vốn góp lớn hơn 0!");
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
        document.getElementById('btn-save-shareholder').textContent = 'Thêm Cổ Đông';
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
    
    document.getElementById('btn-save-shareholder').textContent = 'Lưu Thay Đổi';
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
    document.getElementById('btn-save-shareholder').textContent = 'Thêm Cổ Đông';
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
        case 'operate': return '🔧 Góp vốn + Vận hành';
        case 'invest': return '💰 Chỉ góp vốn';
        default: return '💰 Chỉ góp vốn';
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
        container.innerHTML = `<div class="empty-state">Chưa có cổ đông nào đóng góp vốn. Hãy thêm cổ đông bằng mẫu phía trên.</div>`;
        return;
    }

    const payoutPct = parseFloat(document.getElementById('inp-div-payout').value) || 80;

    container.innerHTML = `
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>Cổ đông</th>
                        <th>Vai trò</th>
                        <th>Vốn góp (VND)</th>
                        <th>% Cổ phần</th>
                        <th>Cổ tức / tháng</th>
                        <th>Hoàn vốn (Cổ tức)</th>
                        <th class="td-actions">Hành động</th>
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

        let paybackStr = "Vô hạn (Lỗ)";
        if (shDiv > 0) {
            const months = s.contribution / shDiv;
            paybackStr = `${months.toFixed(1)} tháng`;
        }

        const roleLabel = getRoleLabel(s.role);
        const roleBadgeClass = getRoleBadgeClass(s.role);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${s.name}</strong></td>
            <td><span class="role-badge ${roleBadgeClass}">${roleLabel}</span></td>
            <td>${formatNumber(s.contribution)} đ</td>
            <td><span class="badge-leverage" style="display:inline-block">${shPct.toFixed(1)}%</span></td>
            <td class="${shDiv >= 0 ? 'val-profit' : 'val-loss'}">${shDiv >= 0 ? '+' : ''}${formatShortVND(shDiv)}</td>
            <td><em style="font-size:11px">${paybackStr}</em></td>
            <td class="td-actions">
                <button class="btn btn-edit" onclick="editShareholder(${s.id})" style="padding: 4px 8px; font-size:11px; margin-right: 4px;">Sửa</button>
                <button class="btn btn-danger" onclick="deleteShareholder(${s.id})" style="padding: 4px 8px; font-size:11px;">Xóa</button>
            </td>
        `;
        activeTbody.appendChild(tr);
    });

    // Add summary row
    const trSummary = document.createElement('tr');
    trSummary.style.fontWeight = 'bold';
    trSummary.style.background = 'rgba(255,255,255,0.02)';
    trSummary.innerHTML = `
        <td>TỔNG CỘNG CỔ TỨC</td>
        <td>-</td>
        <td>${formatNumber(totalEquityContributed)} đ</td>
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
            <span>Thiếu vốn: Tổng vốn góp hiện tại (${formatNumber(totalEquityContributed)}đ) đang thiếu <strong>${formatNumber(Math.abs(diff))}đ</strong> so với nhu cầu vốn tự có (${formatNumber(requiredEquity)}đ). Hãy góp thêm hoặc tăng khoản vay.</span>
        `;
    } else if (diff > 0) {
        statusDiv.style.background = 'rgba(52, 211, 153, 0.1)';
        statusDiv.style.border = '1px solid rgba(52, 211, 153, 0.2)';
        statusDiv.style.color = isLight ? '#047857' : 'var(--success)';
        statusDiv.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
            <span>Dư vốn: Tổng vốn góp (${formatNumber(totalEquityContributed)}đ) thừa <strong>${formatNumber(diff)}đ</strong> so với nhu cầu vốn tự có (${formatNumber(requiredEquity)}đ). Số dư này giúp gia tăng Quỹ dự phòng thực tế.</span>
        `;
    } else {
        statusDiv.style.background = 'var(--primary-glow)';
        statusDiv.style.border = '1px solid rgba(56, 189, 248, 0.2)';
        statusDiv.style.color = isLight ? '#0369a1' : 'var(--primary)';
        statusDiv.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
            <span>Cân bằng: Tổng vốn góp khớp hoàn toàn với nhu cầu vốn tự có (${formatNumber(requiredEquity)}đ).</span>
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
            safetyDescElement.innerText = "Biên an toàn rất cao. Sản lượng bán có thể sụt giảm tới 30% mà quán vẫn không bị lỗ. Đây là luận điểm cực tốt để thuyết phục cổ đông.";
        } else if (safetyMargin > 0) {
            safetyValElement.style.color = 'var(--warning)';
            safetyDescElement.innerText = "Biên an toàn dương nhưng ở mức hẹp. Cổ đông sẽ muốn thấy kế hoạch marketing rõ ràng để duy trì lượng khách ổn định.";
        } else {
            safetyValElement.style.color = 'var(--danger)';
            safetyDescElement.innerText = "Hiện tại sản lượng bán dự kiến thấp hơn điểm hòa vốn. Cần giảm bớt định phí vận hành hoặc tăng giá bán để tạo sức hút với nhà đầu tư.";
        }
    }

    // 2. Payback based on Dividend
    const paybackValElement = document.getElementById('pitch-payback-val');
    const paybackDescElement = document.getElementById('pitch-payback-desc');
    if (paybackValElement && paybackDescElement) {
        const baseDividend = baseNet * (payoutPct / 100);
        if (baseDividend > 0) {
            const paybackMonths = actualEquity / baseDividend;
            paybackValElement.innerText = `${paybackMonths.toFixed(1)} tháng`;
            paybackValElement.style.color = 'var(--success)';
            paybackDescElement.innerText = `Thời gian hoàn vốn dự kiến bằng dòng tiền cổ tức thực nhận hàng tháng là khoảng ${paybackMonths.toFixed(1)} tháng. Đây là tốc độ hoàn vốn rất tốt.`;
        } else {
            paybackValElement.innerText = "Không thể tính (Lỗ)";
            paybackValElement.style.color = 'var(--danger)';
            paybackDescElement.innerText = "Quán đang chịu lỗ hoặc không chi trả cổ tức. Cần tối ưu lại định phí hoặc tăng giá bán.";
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

    // Variations: price ±20% in steps of 10%, costPct ±10% in steps of 5%
    const priceMultipliers = [-20, -10, 0, 10, 20];
    const costVariations = [-10, -5, 0, 5, 10];

    let html = '<thead><tr><th class="sensitivity-corner">Giá bán \\ Cost %</th>';
    costVariations.forEach(cv => {
        const actualCost = baseCostPct + cv;
        html += `<th>Cost ${actualCost}%${cv !== 0 ? ' (' + (cv > 0 ? '+' : '') + cv + '%)' : ''}</th>`;
    });
    html += '</tr></thead><tbody>';

    priceMultipliers.forEach(pm => {
        const actualPrice = basePrice * (1 + pm / 100);
        html += `<tr><td class="sensitivity-row-label">${formatNumber(Math.round(actualPrice))}đ${pm !== 0 ? ' (' + (pm > 0 ? '+' : '') + pm + '%)' : ''}</td>`;
        
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
            
            const tooltipText = `Doanh thu: ${formatNumber(Math.round(rev))}đ\n- Cost NVL (${actualCost}%): ${formatNumber(Math.round(cogs))}đ\n- Định phí: ${formatNumber(Math.round(fixedMonthlyOpex))}đ\n- Khấu hao: ${formatNumber(Math.round(monthlyDepreciation))}đ\n- Lãi vay: ${formatNumber(Math.round(monthlyDebt))}đ\n- Thuế TNDN (${dynamicTaxRate}%): ${formatNumber(Math.round(tax))}đ\n------------------------\n= Lợi nhuận ròng: ${formatNumber(Math.round(netProfit))}đ`;
            
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

    // Vary price by ±10k, ±5k
    const prices = [basePrice - 10000, basePrice - 5000, basePrice, basePrice + 5000, basePrice + 10000].filter(p => p > 0);
    // Vary rent by ±5M, ±2.5M
    const rents = [rent - 5000000, rent - 2500000, rent, rent + 2500000, rent + 5000000].filter(r => r >= 0);

    let priceRowsHtml = '';
    prices.forEach(p => {
        let cellsHtml = '';
        const unitMargin = p * (1 - baseCostPct / 100 - commissionRate / 100);
        
        rents.forEach(r => {
            if (unitMargin <= 0) {
                cellsHtml += `<td style="text-align: right; padding: 8px; color: var(--danger); font-weight: 500;">Lỗ gộp/ly</td>`;
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
                <td style="text-align: left; padding: 8px; font-weight: 500;">${formatNumber(p)}đ</td>
                ${cellsHtml}
            </tr>
        `;
    });

    wrapper.innerHTML = `
        <h3 class="chart-sub-title">🎯 Ma Trận Sản Lượng Hòa Vốn (Ly/Ngày) Theo Giá Bán & Tiền Thuê</h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
            Bảng dưới đây thể hiện số ly nước quán cần bán được <strong>mỗi ngày</strong> để hòa vốn (bao gồm định phí, nợ vay ngân hàng và khấu hao) khi thay đổi giá thuê mặt bằng (cột) và giá bán lẻ (dòng). Ô tô đậm có viền xanh là mức giá & tiền thuê hiện tại của bạn.
        </p>

        <!-- Table -->
        <div style="overflow-x: auto; margin-bottom: 24px;">
            <table class="sensitivity-table" style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr>
                        <th class="sensitivity-corner" style="text-align: left; padding: 8px; background: rgba(2, 132, 199, 0.08);">Giá bán \\ Tiền thuê</th>
                        ${rents.map(r => `<th style="text-align: right; padding: 8px; background: rgba(2, 132, 199, 0.08);">${formatShortVND(r)}/tháng</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${priceRowsHtml}
                </tbody>
            </table>
        </div>

        <h3 class="chart-sub-title" style="margin-top: 24px; margin-bottom: 8px;">📈 Đồ Thị Điểm Hòa Vốn Cắt Nhau (Break-Even Point Chart)</h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
            Giao điểm giữa hai đường thẳng chính là điểm hòa vốn của dự án.
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
                        label: 'Tổng Doanh Thu (VND)',
                        data: dataRev,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.05)',
                        borderWidth: 2,
                        tension: 0,
                        pointRadius: 3
                    },
                    {
                        label: 'Tổng Chi Phí (VND)',
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

    const labels = ["Năm 1", "Năm 2", "Năm 3", "Năm 4", "Năm 5"];
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
            <div style="font-size: 14px; margin-bottom: 12px;"><strong style="color:var(--primary);">💡 Phân Tích Định Giá Doanh Nghiệp (Cuối Năm 3)</strong></div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                    <div style="font-size: 12px; color: var(--text-muted);">Lợi nhuận ròng Năm 3:</div>
                    <div style="font-size: 18px; font-weight: bold; color: ${year3Net > 0 ? 'var(--success)' : 'var(--danger)'};">${formatVND(year3Net)}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: var(--text-muted);">Định giá quán (P/E = 3):</div>
                    <div style="font-size: 18px; font-weight: bold; color: var(--primary);">${formatVND(valuation)}</div>
                </div>
            </div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 12px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 8px;">
                * Nếu quán hoạt động ổn định tới năm thứ 3 với các giả định lạm phát/tăng trưởng trên, bạn có thể chào bán/sang nhượng lại quán với mức giá tham khảo khoảng ${formatShortVND(valuation)}.
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
                        label: 'Tổng Chi Phí',
                        data: dataOpex,
                        backgroundColor: 'rgba(248, 113, 113, 0.8)',
                        borderRadius: 4
                    },
                    {
                        label: 'Lợi Nhuận Ròng',
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
            <h3 style="margin-bottom: 16px; color: var(--primary); font-size: 18px; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px;">Diễn Giải Các Con Số Đang Hiển Thị</h3>
            
            <p><strong>1. Nhu cầu vốn & Đầu tư ban đầu (Tổng: ${formatVND(totalCap)})</strong></p>
            <ul style="margin-bottom: 16px; margin-top: 4px; padding-left: 20px;">
                <li><strong>Chi phí thiết lập (${formatVND(setupCosts)})</strong>: Đây là tiền "chết" đổ vào quán trước khi mở cửa.
                    <br>Bao gồm: Cọc mặt bằng (${formatShortVND(deposit)}), Sửa chữa (${formatShortVND(renovate)}), Máy móc (${formatShortVND(equipment)}), Nguyên liệu (${formatShortVND(rawStart)}), Khác (${formatShortVND(decorMisc)}).
                </li>
                <li><strong>Quỹ dự phòng (${formatVND(buffer)})</strong>: Tiền mặt để sẵn trong ngân hàng để gồng lỗ thời gian đầu.</li>
            </ul>

            <p><strong>2. Nguồn vốn & Đòn bẩy tài chính</strong></p>
            <ul style="margin-bottom: 16px; margin-top: 4px; padding-left: 20px;">
                <li><strong>Vốn tự có (Bạn và Cổ đông góp):</strong> ${formatVND(totalEquityContributed)} (${((totalEquityContributed / totalCap) * 100).toFixed(1)}%)</li>
                <li><strong>Vốn đi vay ngân hàng:</strong> ${formatVND(loan)} (${((loan / totalCap) * 100).toFixed(1)}%)</li>
                <li><strong>Chi phí trả nợ hàng tháng:</strong> Với lãi suất ${interest}%/năm vay trong ${term} tháng, mỗi tháng phải trả cả gốc lẫn lãi là <strong>${formatVND(Math.round(monthlyDebt))}</strong>.</li>
            </ul>

            <p><strong>3. Chi phí duy trì mỗi tháng (Định phí: ${formatVND(fixedMonthlyOpex)})</strong></p>
            <ul style="margin-bottom: 16px; margin-top: 4px; padding-left: 20px;">
                <li>Thuê mặt bằng: ${formatShortVND(rent)} | Điện nước: ${formatShortVND(utilities)} | Lương: ${formatShortVND(salary)} | Khác: ${formatShortVND(misc)}. Dù không bán được ly nào, tháng nào bạn cũng gánh chừng này chi phí.</li>
                <li><strong>Khấu hao tài sản:</strong> Tính dựa trên Máy móc (${formatShortVND(equipment)}) + Decor (${formatShortVND(decorMisc)}) chia cho ${deprYears} năm = <strong>${formatVND(Math.round(monthlyDepreciation))}/tháng</strong>. (Đây không phải tiền chi ra, mà là sự hao mòn).</li>
            </ul>

            <p><strong>4. Cơ cấu Giá bán 1 ly nước</strong></p>
            <ul style="margin-bottom: 16px; margin-top: 4px; padding-left: 20px;">
                <li>Giá bán trung bình: <strong>${formatVND(basePrice)}</strong></li>
                <li>Tỷ lệ giá vốn (Cost): ${baseCostPct}% (Tương đương ${formatVND(basePrice * baseCostPct / 100)} tiền nguyên vật liệu).</li>
                <li>Lãi gộp (Tiền lời sau khi trừ nguyên liệu): <strong>${formatVND(grossMargin)}/ly</strong>.</li>
            </ul>

            <p><strong>5. Số ly cần bán để HÒA VỐN: ${Math.ceil(breakeven)} ly/ngày</strong></p>
            <ul style="margin-bottom: 16px; margin-top: 4px; padding-left: 20px;">
                <li>Mỗi tháng bạn cần gánh: Định phí (${formatShortVND(fixedMonthlyOpex)}) + Tiền nợ (${formatShortVND(monthlyDebt)}) + Khấu hao (${formatShortVND(monthlyDepreciation)}) = ${formatVND(fixedMonthlyOpex + monthlyDebt + monthlyDepreciation)}.</li>
                <li>Với mức lãi gộp ${formatVND(grossMargin)}/ly, bạn cần bán được khoảng ${Math.ceil(breakeven * 30)} ly/tháng, tương đương <strong>~${Math.ceil(breakeven)} ly/ngày</strong> thì quán mới đủ tiền bù chi phí.</li>
            </ul>

            <p><strong>6. Kết quả Dự Kiến (Bán được ${volBase} ly/ngày)</strong></p>
            <ul style="margin-top: 4px; padding-left: 20px;">
                <li><strong>Doanh thu:</strong> ${volBase} ly × 30 ngày × ${formatVND(basePrice)} = <strong>${formatVND(baseScenario.rev)}</strong></li>
                <li><strong>Trừ Nguyên liệu (${baseCostPct}%):</strong> - ${formatVND(baseScenario.cogs)}</li>
                <li><strong>Trừ Định phí hàng tháng:</strong> - ${formatVND(fixedMonthlyOpex)}</li>
                <li><strong>Trừ Tiền trả nợ ngân hàng:</strong> - ${formatVND(Math.round(monthlyDebt))}</li>
                <li><strong>Trừ Khấu hao máy móc:</strong> - ${formatVND(Math.round(monthlyDepreciation))}</li>
                <li><strong>Thuế TNDN (${taxRate}%):</strong> - ${formatVND(Math.round(baseScenario.tax))}</li>
                <li style="margin-top:8px;">=> <strong>LỢI NHUẬN RÒNG (Cất túi): <span style="color:${baseScenario.net >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatVND(baseScenario.net)}</span> / tháng</strong></li>
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
        rentComment = `Chi phí mặt bằng rất tối ưu (${rentPct.toFixed(1)}% doanh thu). Bạn chỉ cần ${rentDaysNeeded} ngày doanh thu để trả tiền nhà.`;
    } else if (rentPct <= 15) {
        rentScore = 20;
        rentStatus = 'good';
        rentComment = `Đạt chuẩn tỷ lệ vàng F&B (ngưỡng an toàn ≤ 15%). Mất ${rentDaysNeeded} ngày doanh thu để trang trải tiền thuê.`;
    } else if (rentPct <= 20) {
        rentScore = 12;
        rentStatus = 'warning';
        rentComment = `Hơi cao (${rentPct.toFixed(1)}%). Cần đẩy mạnh doanh thu hoặc đàm phán thêm ưu đãi mặt bằng để tránh áp lực định phí.`;
    } else {
        rentScore = 5;
        rentStatus = 'danger';
        rentComment = `Vượt ngưỡng rủi ro (${rentPct.toFixed(1)}%). Bạn mất tới ${rentDaysNeeded} ngày bán hàng chỉ để nuôi chủ nhà.`;
    }
    score += rentScore;

    // Labor Cost Score (Max 25 pts) - Standard: <= 22%
    let laborScore = 0;
    let laborStatus = 'good';
    let laborComment = '';
    if (laborPct <= 18) {
        laborScore = 25;
        laborStatus = 'excellent';
        laborComment = `Tối ưu định biên nhân sự xuất sắc (${laborPct.toFixed(1)}% DT). Năng suất lao động cao.`;
    } else if (laborPct <= 22) {
        laborScore = 20;
        laborStatus = 'good';
        laborComment = `Đạt chuẩn quản trị F&B (ngưỡng chuẩn 18% - 22%). Cơ cấu ca kíp hợp lý.`;
    } else if (laborPct <= 28) {
        laborScore = 12;
        laborStatus = 'warning';
        laborComment = `Quỹ lương đang chiếm ${laborPct.toFixed(1)}% DT. Nên áp dụng ca gãy linh hoạt và tuyển thêm part-time theo giờ cao điểm.`;
    } else {
        laborScore = 5;
        laborStatus = 'danger';
        laborComment = `Chi phí nhân sự quá nặng (${laborPct.toFixed(1)}% DT). Nguy cơ ăn mòn toàn bộ lợi nhuận ròng.`;
    }
    score += laborScore;

    // COGS Score (Max 25 pts) - Standard: <= 30%
    let cogsScore = 0;
    let cogsStatus = 'good';
    let cogsComment = '';
    if (cogsPct <= 25) {
        cogsScore = 25;
        cogsStatus = 'excellent';
        cogsComment = `Biên lãi gộp cực dày (${(100 - cogsPct).toFixed(1)}%). Kiểm soát hao hụt và giá vốn nguyên vật liệu rất tốt.`;
    } else if (cogsPct <= 30) {
        cogsScore = 20;
        cogsStatus = 'good';
        cogsComment = `Đạt tỷ lệ vàng giá vốn đồ uống (${cogsPct.toFixed(1)}% DT). Menu có cấu trúc định giá vững chắc.`;
    } else if (cogsPct <= 35) {
        cogsScore = 12;
        cogsStatus = 'warning';
        cogsComment = `Giá vốn hơi cao (${cogsPct.toFixed(1)}%). Cần kiểm tra lại định lượng (recipe) và tìm nhà cung cấp giá sỉ tốt hơn.`;
    } else {
        cogsScore = 5;
        cogsStatus = 'danger';
        cogsComment = `Giá vốn chiếm ${cogsPct.toFixed(1)}% DT. Biên lãi gộp bị bóp nghẹt, rủi ro cao khi giá nguyên liệu thị trường biến động.`;
    }
    score += cogsScore;

    // Margin of Safety & Profitability Score (Max 25 pts)
    let safetyScore = 0;
    let safetyStatus = 'good';
    let safetyComment = '';
    if (marginOfSafety >= 40 && netMarginPct >= 20) {
        safetyScore = 25;
        safetyStatus = 'excellent';
        safetyComment = `Biên an toàn cực lớn (${marginOfSafety.toFixed(1)}%) và tỷ suất lãi ròng đạt ${netMarginPct.toFixed(1)}%. Dự án có sức chống chịu biến động thị trường hoàn hảo.`;
    } else if (marginOfSafety >= 25 && netProfit > 0) {
        safetyScore = 20;
        safetyStatus = 'good';
        safetyComment = `Biên an toàn tốt (${marginOfSafety.toFixed(1)}%). Quán sinh lời dương (${formatShortVND(netProfit)}/tháng) và có khoảng đệm an toàn trước rủi ro vắng khách.`;
    } else if (marginOfSafety > 0 && netProfit > 0) {
        safetyScore = 12;
        safetyStatus = 'warning';
        safetyComment = `Biên an toàn mỏng (${marginOfSafety.toFixed(1)}%). Chỉ cần sản lượng giảm nhẹ là rơi vào vùng thua lỗ. Cần tăng tốc marketing kéo khách.`;
    } else {
        safetyScore = 0;
        safetyStatus = 'danger';
        safetyComment = `Đang hoạt động dưới điểm hòa vốn (${volBase} ly < ${Math.ceil(breakeven)} ly). Đang bị thâm hụt dòng tiền mỗi tháng.`;
    }
    score += safetyScore;

    // 3. Overall Rating
    let overallBadge = '';
    let overallBadgeClass = '';
    let overallDesc = '';
    let overallColor = '';

    if (score >= 85) {
        overallBadge = '🌟 Xuất Sắc - Chuẩn Vàng F&B';
        overallBadgeClass = 'badge-excellent';
        overallColor = 'var(--success)';
        overallDesc = `Mô hình tài chính của quán được tối ưu ở mức <strong>cực kỳ xuất sắc</strong>. Cả 3 cấu phần chi phí lớn nhất (Mặt bằng, Nhân sự, Giá vốn) đều nằm trọn trong "Vùng Tỷ Lệ Vàng" chuẩn quốc tế. Dự án có biên an toàn dày, khả năng sinh lời và thu hồi vốn vượt trội, rất dễ thuyết phục nhà đầu tư & cổ đông.`;
    } else if (score >= 70) {
        overallBadge = '✅ Tốt - Sức Khỏe Vững Chắc';
        overallBadgeClass = 'badge-good';
        overallColor = 'var(--primary)';
        overallDesc = `Mô hình tài chính đạt mức <strong>khỏe mạnh và khả thi cao</strong>. Các chỉ số cốt lõi đều nằm trong ngưỡng an toàn cho phép của ngành F&B. Chỉ cần lưu ý kiểm soát ổn định chất lượng dịch vụ và quản trị chặt chẽ hàng tồn kho để bảo toàn dòng tiền.`;
    } else if (score >= 50) {
        overallBadge = '⚠️ Cảnh Báo - Cần Tinh Chỉnh';
        overallBadgeClass = 'badge-warning';
        overallColor = 'var(--warning)';
        overallDesc = `Dự án có một số chỉ số tài chính <strong>đang tiệm cận ngưỡng rủi ro</strong>. Áp lực từ chi phí cố định (Mặt bằng hoặc Quỹ lương) hoặc giá vốn đang làm giảm biên lợi nhuận ròng. Bạn nên rà soát lại các gợi ý chiến lược bên dưới để tối ưu trước khi rót vốn thực tế.`;
    } else {
        overallBadge = '🚨 Rủi Ro Cao - Cần Tái Cấu Trúc';
        overallBadgeClass = 'badge-danger';
        overallColor = 'var(--danger)';
        overallDesc = `Cảnh báo rủi ro nghiêm trọng: Dự án đang chịu áp lực chi phí quá lớn so với doanh thu dự kiến hoặc hoạt động dưới điểm hòa vốn. Cần giảm ngay chi phí thuê, tinh gọn bộ máy nhân sự hoặc nâng giá trị đơn hàng trung bình để tránh cạn kiệt vốn lưu động.`;
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
    let runwayMonths = 'Vô hạn (Đang lãi)';
    if (netProfit < 0) {
        const actualLoss = Math.abs(netProfit);
        runwayMonths = actualLoss > 0 ? (buffer / actualLoss).toFixed(1) + ' tháng' : 'N/A';
    } else {
        const worstCaseOpex = fixedMonthlyOpex + monthlyDebt;
        runwayMonths = worstCaseOpex > 0 ? (buffer / worstCaseOpex).toFixed(1) + ' tháng (Zero DT)' : 'N/A';
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
                <div class="health-score-max">/ 100 ĐIỂM FHI</div>
            </div>
            <div class="advisor-hero-content">
                <div class="advisor-hero-title">
                    Chỉ Số Sức Khỏe Tài Chính F&B (Financial Health Index)
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
                <span>🏆</span> Bộ Tứ Tỷ Lệ Vàng Trong Kinh Doanh Quán Cà Phê
            </div>
            <p style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 12px; margin-top: 2px;">
                Được tổng hợp từ mô hình chuẩn của hơn 500+ chuỗi và quán cà phê thành công tại Việt Nam.
            </p>
            <div class="golden-ratio-grid">
                <!-- 1. Rent Ratio -->
                <div class="ratio-card">
                    <div class="ratio-header">
                        <span class="ratio-title">🏢 Mặt Bằng / Doanh Thu</span>
                        <span class="ratio-benchmark-tag">Chuẩn Vàng: ≤ 15%</span>
                    </div>
                    <div class="ratio-value-row">
                        <div class="ratio-val-num" style="color:${rentStatus === 'excellent' || rentStatus === 'good' ? 'var(--success)' : rentStatus === 'warning' ? 'var(--warning)' : 'var(--danger)'};">
                            ${rentPct.toFixed(1)}%
                        </div>
                        ${getStatusPill(rentStatus, rentStatus === 'excellent' ? '🟢 Xuất sắc' : rentStatus === 'good' ? '🟢 Đạt Chuẩn' : rentStatus === 'warning' ? '🟡 Chấp nhận' : '🔴 Vượt trần')}
                    </div>
                    ${getMeterFill(rentPct, 30, rentStatus === 'danger' ? 'var(--danger)' : rentStatus === 'warning' ? 'var(--warning)' : 'var(--success)')}
                    <div class="ratio-desc">${rentComment}</div>
                </div>

                <!-- 2. Labor Cost Ratio -->
                <div class="ratio-card">
                    <div class="ratio-header">
                        <span class="ratio-title">👥 Nhân Sự / Doanh Thu</span>
                        <span class="ratio-benchmark-tag">Chuẩn Vàng: ≤ 22%</span>
                    </div>
                    <div class="ratio-value-row">
                        <div class="ratio-val-num" style="color:${laborStatus === 'excellent' || laborStatus === 'good' ? 'var(--success)' : laborStatus === 'warning' ? 'var(--warning)' : 'var(--danger)'};">
                            ${laborPct.toFixed(1)}%
                        </div>
                        ${getStatusPill(laborStatus, laborStatus === 'excellent' ? '🟢 Xuất sắc' : laborStatus === 'good' ? '🟢 Đạt Chuẩn' : laborStatus === 'warning' ? '🟡 Chấp nhận' : '🔴 Vượt trần')}
                    </div>
                    ${getMeterFill(laborPct, 40, laborStatus === 'danger' ? 'var(--danger)' : laborStatus === 'warning' ? 'var(--warning)' : 'var(--success)')}
                    <div class="ratio-desc">${laborComment}</div>
                </div>

                <!-- 3. COGS Ratio -->
                <div class="ratio-card">
                    <div class="ratio-header">
                        <span class="ratio-title">☕ Giá Vốn (COGS) / Doanh Thu</span>
                        <span class="ratio-benchmark-tag">Chuẩn Vàng: ≤ 30%</span>
                    </div>
                    <div class="ratio-value-row">
                        <div class="ratio-val-num" style="color:${cogsStatus === 'excellent' || cogsStatus === 'good' ? 'var(--success)' : cogsStatus === 'warning' ? 'var(--warning)' : 'var(--danger)'};">
                            ${cogsPct.toFixed(1)}%
                        </div>
                        ${getStatusPill(cogsStatus, cogsStatus === 'excellent' ? '🟢 Xuất sắc' : cogsStatus === 'good' ? '🟢 Đạt Chuẩn' : cogsStatus === 'warning' ? '🟡 Chấp nhận' : '🔴 Vượt trần')}
                    </div>
                    ${getMeterFill(cogsPct, 50, cogsStatus === 'danger' ? 'var(--danger)' : cogsStatus === 'warning' ? 'var(--warning)' : 'var(--success)')}
                    <div class="ratio-desc">${cogsComment}</div>
                </div>

                <!-- 4. Margin of Safety -->
                <div class="ratio-card">
                    <div class="ratio-header">
                        <span class="ratio-title">🛡️ Biên An Toàn Hòa Vốn</span>
                        <span class="ratio-benchmark-tag">Chuẩn Vàng: ≥ 35%</span>
                    </div>
                    <div class="ratio-value-row">
                        <div class="ratio-val-num" style="color:${safetyStatus === 'excellent' || safetyStatus === 'good' ? 'var(--success)' : safetyStatus === 'warning' ? 'var(--warning)' : 'var(--danger)'};">
                            ${marginOfSafety.toFixed(1)}%
                        </div>
                        ${getStatusPill(safetyStatus, safetyStatus === 'excellent' ? '🟢 Cực Dày' : safetyStatus === 'good' ? '🟢 An Toàn' : safetyStatus === 'warning' ? '🟡 Hẹp' : '🔴 Nguy Hiểm')}
                    </div>
                    ${getMeterFill(Math.max(marginOfSafety, 0), 60, safetyStatus === 'danger' ? 'var(--danger)' : safetyStatus === 'warning' ? 'var(--warning)' : 'var(--success)')}
                    <div class="ratio-desc">${safetyComment}</div>
                </div>
            </div>
        </div>

        <!-- 4 Strategic Actionable Recommendations -->
        <div>
            <div class="advice-section-title">
                <span>🎯</span> Khuyến Nghị Chiến Lược Vận Hành & Gọi Vốn
            </div>
            <div class="advice-cards-grid" style="margin-top: 10px;">
                <!-- 1. Location Strategy -->
                <div class="advice-card">
                    <div class="advice-card-header">
                        <div class="advice-icon-wrap advice-icon-blue">🏢</div>
                        <div class="advice-card-title">Chiến Lược Mặt Bằng & Điểm Bán</div>
                    </div>
                    <div class="advice-card-body">
                        Mặt bằng tiêu tốn <strong>${formatVND(rent)}/tháng</strong>. Bạn cần đạt doanh thu tối thiểu <strong>${formatShortVND(rent / 0.15)}/tháng</strong> để đưa tỷ lệ tiền thuê về mức an toàn chuẩn 15%.
                        ${rentPct > 15 ? '<br><span style="color:var(--warning);">⚠️ Mẹo: Hãy tận dụng vỉa hè hoặc mở thêm quầy Takeaway buổi sáng để gia tăng doanh thu trên cùng 1 mét vuông thuê.</span>' : '<br><span style="color:var(--success);">✨ Vị thế mặt bằng tốt, áp lực định phí mặt bằng ở mức lý tưởng.</span>'}
                    </div>
                    <div class="advice-key-stat">
                        <span class="advice-stat-label">Số ngày bán trả tiền nhà:</span>
                        <span class="advice-stat-val" style="color:${rentDaysNeeded <= 4.5 ? 'var(--success)' : 'var(--warning)'};">${rentDaysNeeded} ngày / tháng</span>
                    </div>
                </div>

                <!-- 2. Staffing Strategy -->
                <div class="advice-card">
                    <div class="advice-card-header">
                        <div class="advice-icon-wrap advice-icon-green">👥</div>
                        <div class="advice-card-title">Chiến Lược Quản Trị Nhân Sự & Ca Kíp</div>
                    </div>
                    <div class="advice-card-body">
                        Tổng định biên có <strong>${totalShiftsPerDay} nhân sự/ngày</strong> chia 3 ca. Bình quân mỗi nhân viên phục vụ tạo ra khoảng <strong>${totalShiftsPerDay > 0 ? formatShortVND(dailyRev / totalShiftsPerDay) : '0'} doanh thu/ngày</strong>.
                        ${laborPct > 22 ? '<br><span style="color:var(--warning);">⚠️ Mẹo: Nên chuyển 1 phần nhân viên full-time sang part-time theo giờ (18k - 22k/h) để chỉ tăng cường vào khung giờ cao điểm (7h-9h sáng & 19h-21h tối).</span>' : '<br><span style="color:var(--success);">✨ Cơ cấu lương và phân ca đang vận hành rất hiệu quả.</span>'}
                    </div>
                    <div class="advice-key-stat">
                        <span class="advice-stat-label">Quỹ lương trung bình/ngày:</span>
                        <span class="advice-stat-val">${formatShortVND(totalSalary / 30)}/ngày</span>
                    </div>
                </div>

                <!-- 3. Pitching Strategy -->
                <div class="advice-card">
                    <div class="advice-card-header">
                        <div class="advice-icon-wrap advice-icon-purple">🤝</div>
                        <div class="advice-card-title">Chiến Lược Cổ Đông & Gọi Vốn (Pitching)</div>
                    </div>
                    <div class="advice-card-body">
                        Với mức chi trả cổ tức ${payoutPct}%, tỷ suất cổ tức thực nhận hàng năm dự kiến đạt <strong>${dividendYield.toFixed(1)}%/năm</strong> trên tổng vốn góp.
                        ${dividendYield > 20 ? '<br><span style="color:var(--success);">✨ Tỷ suất sinh lời vượt trội so với gửi tiết kiệm ngân hàng (5-6%/năm), là luận điểm vàng để chốt deal với cổ đông.</span>' : '<br><span style="color:var(--warning);">⚠️ Tỷ suất cổ tức đang ở mức vừa phải. Cân nhắc giữ lại thêm quỹ tái đầu tư để mở rộng quy mô.</span>'}
                    </div>
                    <div class="advice-key-stat">
                        <span class="advice-stat-label">Tỷ lệ sở hữu của Founder:</span>
                        <span class="advice-stat-val" style="color:var(--primary);">${founderRatio.toFixed(1)}% (${formatShortVND(founderEquity)})</span>
                    </div>
                </div>

                <!-- 4. Runway Strategy -->
                <div class="advice-card">
                    <div class="advice-card-header">
                        <div class="advice-icon-wrap advice-icon-amber">🛡️</div>
                        <div class="advice-card-title">Khả Năng Phòng Vệ & Quỹ Dự Phòng</div>
                    </div>
                    <div class="advice-card-body">
                        Quỹ dự phòng tiền mặt hiện có <strong>${formatVND(buffer)}</strong>. 
                        ${netProfit >= 0 ? `Nếu quán không có bất kỳ doanh thu nào (Zero Revenue), quỹ này cho phép duy trì trả mặt bằng và nợ vay trong <strong>${runwayMonths}</strong>.` : `Với mức thâm hụt hiện tại, quán có thể gồng lỗ trong tối đa <strong>${runwayMonths}</strong> trước khi cạn tiền.`}
                        <br><span style="color:${buffer >= fixedMonthlyOpex * 3 ? 'var(--success)' : 'var(--warning)'};">${buffer >= fixedMonthlyOpex * 3 ? '✨ Quỹ dự phòng đạt chuẩn bảo hiểm an toàn (≥ 3 tháng định phí).' : '⚠️ Khuyến nghị: Nên chuẩn bị quỹ dự phòng tối thiểu tương đương 3 tháng tiền nhà + nợ vay để yên tâm vận hành.'}</span>
                    </div>
                    <div class="advice-key-stat">
                        <span class="advice-stat-label">Thời gian sinh tồn an toàn:</span>
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
    if (kpiBe) animateValue(kpiBe, 0, breakEvenDailyVol, 800, (val) => Math.ceil(val) + ' ly/ngày');

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

        if (elVol) elVol.innerText = sc.vol + ' ly/ngày';
        if (elRev) elRev.innerText = formatShortVND(sc.rev);
        if (elCost) elCost.innerText = formatShortVND(sc.totalExpense);
        if (elNet) {
            elNet.innerText = (sc.net >= 0 ? '+' : '') + formatShortVND(sc.net);
            elNet.style.color = sc.net >= 0 ? 'var(--success)' : 'var(--danger)';
        }
        if (elStatus) {
            if (sc.net < 0) {
                elStatus.innerText = 'Cần bù lỗ: ' + formatShortVND(Math.abs(sc.net)) + '/th';
                elStatus.style.color = 'var(--danger)';
            } else if (sc.net === 0) {
                elStatus.innerText = 'Hòa vốn kinh doanh';
                elStatus.style.color = 'var(--warning)';
            } else {
                elStatus.innerText = (level === 'good' ? 'Tối ưu: Lãi +' : 'Lãi +') + formatShortVND(sc.net) + '/th';
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
        
        let statusIcon = '🟢';
        let statusText = 'An toàn';
        let badgeBg = 'rgba(16, 185, 129, 0.1)';
        let badgeColor = isLightAlert ? '#047857' : '#34d399';
        let badgeBorder = 'rgba(16, 185, 129, 0.3)';
        let borderColor = 'rgba(16, 185, 129, 0.2)';
        let textColor = isLightAlert ? '#0f172a' : '#f8fafc';
        let containerBg = isLightAlert ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.02)';
        let containerBorder = 'rgba(16, 185, 129, 0.25)';
        let warningMessage = 'Quỹ dự phòng ở mức an toàn. Doanh số dự kiến đảm bảo khả năng sinh lời hoặc sinh tồn ổn định.';
        let runwayText = 'Vô hạn (Không cạn kiệt)';

        if (runwayMonths !== Infinity) {
            runwayText = runwayMonths.toFixed(1) + ' tháng';
        }

        if (burnRate > 0) {
            if (runwayMonths < 3) {
                statusIcon = '🔴';
                statusText = 'Nguy hiểm';
                badgeBg = 'rgba(239, 68, 68, 0.1)';
                badgeColor = isLightAlert ? '#b91c1c' : '#f87171';
                badgeBorder = 'rgba(239, 68, 68, 0.3)';
                borderColor = 'rgba(239, 68, 68, 0.2)';
                textColor = isLightAlert ? '#b91c1c' : '#fca5a5';
                containerBg = 'var(--danger-glow)';
                containerBorder = 'rgba(239, 68, 68, 0.3)';
                warningMessage = `Với mức lỗ ${formatShortVND(burnRate)}/tháng, quỹ dự phòng của bạn sẽ cạn kiệt trong khoảng ${runwayMonths.toFixed(1)} tháng. Cần cải thiện doanh số hoặc cắt giảm định phí.`;
                alertContainer.classList.add('danger-alert');
            } else if (runwayMonths <= 6) {
                statusIcon = '🟡';
                statusText = 'Cảnh báo';
                badgeBg = 'rgba(245, 158, 11, 0.1)';
                badgeColor = isLightAlert ? '#b45309' : '#fbbf24';
                badgeBorder = 'rgba(245, 158, 11, 0.3)';
                borderColor = 'rgba(245, 158, 11, 0.2)';
                textColor = isLightAlert ? '#92400e' : '#fde68a';
                containerBg = 'var(--warning-glow)';
                containerBorder = 'rgba(245, 158, 11, 0.3)';
                warningMessage = `Quỹ dự phòng đủ gánh lỗ trong khoảng ${runwayMonths.toFixed(1)} tháng. Mức độ an toàn ở mức trung bình, cần chú ý tối ưu định phí hoặc tăng doanh số.`;
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
                        <span>Khả Năng Sinh Tồn Tài Chính (Cash Runway)</span>
                    </div>
                    <span style="padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder};">
                        ${statusText}
                    </span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; border-top: 1px dashed ${borderColor}; padding-top: 8px; margin-top: 4px;">
                    <div>
                        <div style="font-size: 10.5px; color: var(--text-muted); font-weight: 600;">TỐC ĐỘ ĐỐT TIỀN (BURN RATE)</div>
                        <div style="font-size: 15px; font-weight: bold; margin-top: 2px; color: ${burnRate > 0 ? 'var(--danger)' : 'var(--success)'};">
                            ${base.net < 0 ? '-' + formatShortVND(burnRate) : '+' + formatShortVND(base.net)}/tháng
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 10.5px; color: var(--text-muted); font-weight: 600;">THỜI GIAN SINH TỒN (RUNWAY)</div>
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
                labels: ['Cọc mặt bằng', 'Thi công sửa chữa', 'Thiết bị & Bàn ghế', 'Nguyên liệu đầu'],
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
                labels: labels.length > 0 ? labels : ['Chưa góp vốn'],
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
                                if (context.label === 'Chưa góp vốn') return ' Chưa góp vốn';
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
            const monthsLabel = ['Bắt đầu'];
            for (let i = 1; i <= 12; i++) monthsLabel.push('Tháng ' + i);
            chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: monthsLabel,
                    datasets: [
                        {
                            label: 'Quỹ tiền mặt dự kiến (VND)',
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
                                label: function(context) { return 'Số dư quỹ: ' + formatVND(context.raw); }
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
    { id: 1, name: "Cà phê", volumePct: 40, price: 25000, costPct: 25 },
    { id: 2, name: "Trà & Sinh tố", volumePct: 40, price: 35000, costPct: 30 },
    { id: 3, name: "Bánh & Đồ ăn", volumePct: 20, price: 30000, costPct: 45 }
];

function updateMenuVolumeWarning() {
    const warnEl = document.getElementById('menu-vol-warning');
    const totalVol = menuItems.reduce((sum, item) => sum + parseFloat(item.volumePct || 0), 0);
    if (warnEl) {
        if (Math.abs(totalVol - 100) > 0.1) {
            warnEl.style.display = 'block';
            warnEl.innerText = `Lưu ý: Tổng tỷ trọng bán = ${totalVol.toFixed(1)}%. Nên điều chỉnh lại cho đủ 100%.`;
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
                <button onclick="removeMenuItem(${item.id})" style="background:transparent; border:none; color:var(--danger); cursor:pointer; font-size:14px; display:flex; align-items:center; justify-content:center;">×</button>
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
    menuItems.push({ id: Date.now(), name: "Nhóm mới", volumePct: 0, price: 0, costPct: 0 });
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
    { id: 1, name: "Cà phê", volumePct: 40, price: 25000, costPct: 25 },
    { id: 2, name: "Trà & Sinh tố", volumePct: 40, price: 35000, costPct: 30 },
    { id: 3, name: "Bánh & Đồ ăn", volumePct: 20, price: 30000, costPct: 45 }
];

const DEFAULT_SHAREHOLDERS = [
    { id: 1, name: "Bạn (Cổ đông sáng lập)", contribution: 80000000, role: "operate" }
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
                alert("Đã tải dữ liệu từ đường link chia sẻ thành công!");
            }
        } catch (err) {
            console.error("Lỗi giải mã liên kết chia sẻ:", err);
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

    let paybackText = paybackMonth > 0 ? paybackMonth.toFixed(1) + " tháng" : "Không trong 3 năm";
    let discPaybackText = discPaybackMonth > 0 ? discPaybackMonth.toFixed(1) + " tháng" : "Không trong 3 năm";

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
        <h3 class="chart-sub-title">Phân tích Hiệu Quả Đầu Tư (Tầm nhìn 3 năm)</h3>
        
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
            Sản lượng dự kiến: <strong>${vol} ly/ngày</strong>. Tổng vốn: ${formatShortVND(totalCapital)}. Tăng trưởng DT: ${growthRevPct}%/năm | Tăng chi phí: ${growthOpexPct}%/năm.
        </p>

        <div class="scenarios-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
            <div class="glass-card scenario-card" style="padding: 12px;">
                <div class="scenario-metric">
                    <span style="font-size:14px; font-weight:600; color: var(--text-muted);">Hoàn vốn đơn giản</span>
                    <span style="font-size:16px; color:var(--primary); font-weight:bold; margin-top: 4px;">${paybackText}</span>
                </div>
            </div>
            <div class="glass-card scenario-card" style="padding: 12px;">
                <div class="scenario-metric">
                    <span style="font-size:14px; font-weight:600; color: var(--text-muted);">Hoàn vốn chiết khấu</span>
                    <span style="font-size:16px; color:var(--primary); font-weight:bold; margin-top: 4px;">${discPaybackText}</span>
                </div>
            </div>
            <div class="glass-card scenario-card" style="padding: 12px;">
                <div class="scenario-metric">
                    <span style="font-size:14px; font-weight:600; color: var(--text-muted);">Sản lượng hòa vốn</span>
                    <span style="font-size:16px; color:var(--primary); font-weight:bold; margin-top: 4px;">${Math.ceil(breakEvenDailyVol)} ly/ngày</span>
                </div>
            </div>
            <div class="glass-card scenario-card" style="padding: 12px;">
                <div class="scenario-metric">
                    <span style="font-size:14px; font-weight:600; color: var(--text-muted);">NPV (Hiện giá thuần)</span>
                    <span class="${npvColor}" style="font-size:16px; font-weight:bold; margin-top: 4px;">${npv >= 0 ? '+' : ''}${formatShortVND(npv)}</span>
                </div>
            </div>
            <div class="glass-card scenario-card" style="padding: 12px;">
                <div class="scenario-metric">
                    <span style="font-size:14px; font-weight:600; color: var(--text-muted);">IRR (Tỷ suất nội bộ)</span>
                    <span class="${irrColor}" style="font-size:16px; font-weight:bold; margin-top: 4px;">${totalInflow > totalCapital && irrAnnual > -100 ? irrAnnual.toFixed(1) + '%' : 'N/A'}</span>
                </div>
            </div>
            <div class="glass-card scenario-card" style="padding: 12px;">
                <div class="scenario-metric">
                    <span style="font-size:14px; font-weight:600; color: var(--text-muted);">ROI (Tỷ lệ hoàn vốn)</span>
                    <span class="${roiColor}" style="font-size:16px; font-weight:bold; margin-top: 4px;">${roi.toFixed(1)}%</span>
                </div>
            </div>
            <div class="glass-card scenario-card" style="padding: 12px;">
                <div class="scenario-metric">
                    <span style="font-size:14px; font-weight:600; color: var(--text-muted);">PI (Chỉ số sinh lời)</span>
                    <span class="${piColor}" style="font-size:16px; font-weight:bold; margin-top: 4px;">${pi.toFixed(2)}</span>
                </div>
            </div>
        </div>

        <div class="explanation-box" style="margin-top:16px; padding: 12px 16px; background: rgba(15,23,42,0.02); border-radius: 6px; border-left: 4px solid ${npv >= 0 ? 'var(--primary)' : 'var(--danger)'};">
            <strong>Kết luận tài chính:</strong> 
            ${npv >= 0 ? `<span style="color:var(--val-profit)">Dự án khả thi về mặt tài chính (NPV &gt; 0, chỉ số PI đạt ${pi.toFixed(2)} &gt; 1). IRR đạt ${irrAnnual.toFixed(1)}% lớn hơn lãi suất chiết khấu ${discountRatePct}%.</span>` : `<span style="color:var(--val-loss)">Dự án không hiệu quả với mức lãi suất chiết khấu này (NPV &lt; 0, PI đạt ${pi.toFixed(2)} &lt; 1). Bạn nên cân nhắc điều chỉnh định phí, giá bán hoặc cải thiện sản lượng bán.</span>`}
        </div>

        <!-- Cumulative Cash Flow Chart -->
        <div style="margin-top: 24px;">
            <h4 class="chart-sub-title" style="margin-bottom: 8px;">Đồ Thị Dòng Tiền Tích Lũy 36 Tháng (Hòa vốn khi đường tích lũy vượt mức 0)</h4>
            <div class="chart-container" style="position: relative; height: 250px; width: 100%;">
                <canvas id="cumulativeCashFlowChart"></canvas>
            </div>
        </div>

        <!-- Detailed Year-by-Year Table -->
        <div style="margin-top: 24px; overflow-x: auto;">
            <h4 class="chart-sub-title" style="margin-bottom: 8px;">Bảng Chi Tiết Dòng Tiền 3 Năm (đơn vị: đ)</h4>
            <table class="sensitivity-table" style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr>
                        <th style="text-align: left; padding: 8px; border-bottom: 2px solid var(--border-color);">Khoản mục \\ Thời điểm</th>
                        <th style="text-align: right; padding: 8px; border-bottom: 2px solid var(--border-color);">Năm 0 (Hiện tại)</th>
                        <th style="text-align: right; padding: 8px; border-bottom: 2px solid var(--border-color);">Năm 1</th>
                        <th style="text-align: right; padding: 8px; border-bottom: 2px solid var(--border-color);">Năm 2</th>
                        <th style="text-align: right; padding: 8px; border-bottom: 2px solid var(--border-color);">Năm 3</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="text-align: left; padding: 8px; font-weight: 500;">Doanh thu thuần</td>
                        <td style="text-align: right; padding: 8px; color: var(--text-muted);">--</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[1].rev))}đ</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[2].rev))}đ</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[3].rev))}đ</td>
                    </tr>
                    <tr>
                        <td style="text-align: left; padding: 8px; font-weight: 500;">Tổng chi phí hoạt động (gồm COGS & Nợ vay)</td>
                        <td style="text-align: right; padding: 8px; color: var(--text-muted);">--</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[1].opex))}đ</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[2].opex))}đ</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[3].opex))}đ</td>
                    </tr>
                    <tr>
                        <td style="text-align: left; padding: 8px; font-weight: 500;">Thuế TNDN</td>
                        <td style="text-align: right; padding: 8px; color: var(--text-muted);">--</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[1].tax))}đ</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[2].tax))}đ</td>
                        <td style="text-align: right; padding: 8px;">${formatNumber(Math.round(yearData[3].tax))}đ</td>
                    </tr>
                    <tr style="border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); font-weight: 600; background: rgba(15,23,42,0.01);">
                        <td style="text-align: left; padding: 8px;">Dòng tiền ròng (Net Cash Flow)</td>
                        <td style="text-align: right; padding: 8px; color: var(--val-loss);">${formatNumber(Math.round(-totalCapital))}đ</td>
                        <td style="text-align: right; padding: 8px; color: ${yearData[1].net >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${yearData[1].net >= 0 ? '+' : ''}${formatNumber(Math.round(yearData[1].net))}đ</td>
                        <td style="text-align: right; padding: 8px; color: ${yearData[2].net >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${yearData[2].net >= 0 ? '+' : ''}${formatNumber(Math.round(yearData[2].net))}đ</td>
                        <td style="text-align: right; padding: 8px; color: ${yearData[3].net >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${yearData[3].net >= 0 ? '+' : ''}${formatNumber(Math.round(yearData[3].net))}đ</td>
                    </tr>
                    <tr>
                        <td style="text-align: left; padding: 8px; font-weight: 500; color: var(--text-muted);">Hệ số chiết khấu</td>
                        <td style="text-align: right; padding: 8px; color: var(--text-muted);">1.000</td>
                        <td style="text-align: right; padding: 8px; color: var(--text-muted);">${(1 / Math.pow(1 + (discountRatePct / 100), 1)).toFixed(3)}</td>
                        <td style="text-align: right; padding: 8px; color: var(--text-muted);">${(1 / Math.pow(1 + (discountRatePct / 100), 2)).toFixed(3)}</td>
                        <td style="text-align: right; padding: 8px; color: var(--text-muted);">${(1 / Math.pow(1 + (discountRatePct / 100), 3)).toFixed(3)}</td>
                    </tr>
                    <tr style="font-weight: 600; border-top: 1px dashed var(--border-color);">
                        <td style="text-align: left; padding: 8px;">Dòng tiền chiết khấu (PV)</td>
                        <td style="text-align: right; padding: 8px; color: var(--val-loss);">${formatNumber(Math.round(-totalCapital))}đ</td>
                        <td style="text-align: right; padding: 8px; color: ${yearData[1].pv >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${yearData[1].pv >= 0 ? '+' : ''}${formatNumber(Math.round(yearData[1].pv))}đ</td>
                        <td style="text-align: right; padding: 8px; color: ${yearData[2].pv >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${yearData[2].pv >= 0 ? '+' : ''}${formatNumber(Math.round(yearData[2].pv))}đ</td>
                        <td style="text-align: right; padding: 8px; color: ${yearData[3].pv >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${yearData[3].pv >= 0 ? '+' : ''}${formatNumber(Math.round(yearData[3].pv))}đ</td>
                    </tr>
                    <tr style="background: rgba(15,23,42,0.03); font-weight: bold; border-top: 2px solid var(--border-color);">
                        <td style="text-align: left; padding: 8px;">Tích lũy chiết khấu (Cumulative PV)</td>
                        <td style="text-align: right; padding: 8px; color: var(--val-loss);">${formatNumber(Math.round(-totalCapital))}đ</td>
                        <td style="text-align: right; padding: 8px; color: ${cumY1 >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${cumY1 >= 0 ? '+' : ''}${formatNumber(Math.round(cumY1))}đ</td>
                        <td style="text-align: right; padding: 8px; color: ${cumY2 >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${cumY2 >= 0 ? '+' : ''}${formatNumber(Math.round(cumY2))}đ</td>
                        <td style="text-align: right; padding: 8px; color: ${cumY3 >= 0 ? 'var(--val-profit)' : 'var(--val-loss)'};">${cumY3 >= 0 ? '+' : ''}${formatNumber(Math.round(cumY3))}đ</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Detailed explanation of metrics -->
        <div class="glass-card" style="margin-top: 24px; padding: 16px; font-size: 13.5px; line-height: 1.6; color: var(--text-main);">
            <h4 class="chart-sub-title" style="margin-bottom: 12px; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px; color: var(--primary);">
                💡 Diễn giải & Công thức tính chi tiết (Sản lượng ${vol} ly/ngày)
            </h4>
            <div style="display: flex; flex-direction: column; gap: 14px;">
                <div>
                    <strong>1. Tổng vốn đầu tư ban đầu (Vốn cần thiết):</strong>
                    <div style="padding-left: 12px; color: var(--text-muted); margin-top: 2px;">
                        • Công thức: Cọc mặt bằng (${formatShortVND(deposit)}) + Thi công sửa chữa (${formatShortVND(renovate)}) + Thiết bị máy móc (${formatShortVND(equipment)}) + Nguyên liệu khởi tạo (${formatShortVND(rawStart)}) + Decor & Khác (${formatShortVND(decorMisc)}) + Dự phòng gồng lỗ (${formatShortVND(buffer)}).
                        <br>• Kết quả: <strong>${formatNumber(totalCapital)} đ</strong>.
                    </div>
                </div>
                <div>
                    <strong>2. Thời gian hoàn vốn đơn giản (Simple Payback):</strong>
                    <div style="padding-left: 12px; color: var(--text-muted); margin-top: 2px;">
                        • Công thức: Tổng vốn đầu tư / Dòng tiền ròng hàng tháng trung bình năm 1.
                        <br>• Cách tính: ${formatNumber(totalCapital)} đ / ${formatNumber(Math.round(yearData[1].net / 12))} đ (dòng tiền ròng trung bình/tháng của Năm 1).
                        <br>• Kết quả: <strong>${paybackText}</strong>.
                    </div>
                </div>
                <div>
                    <strong>3. Thời gian hoàn vốn chiết khấu (Discounted Payback):</strong>
                    <div style="padding-left: 12px; color: var(--text-muted); margin-top: 2px;">
                        • Công thức: Thời điểm mà tổng hiện giá các dòng tiền tích luỹ đạt trạng thái hòa vốn (lớn hơn hoặc bằng 0).
                        <br>• Cách tính: Quy đổi dòng tiền từng tháng về hiện giá (PV) theo tỷ lệ chiết khấu hàng tháng hiệu dụng r_m = (1 + ${discountRatePct}%)^(1/12) - 1 ≈ ${(monthlyRate*100).toFixed(3)}%/tháng. Sau đó cộng dồn từng tháng để xem khi nào thu hồi đủ vốn hiện giá.
                        <br>• Kết quả: <strong>${discPaybackText}</strong>.
                    </div>
                </div>
                <div>
                    <strong>4. Giá trị hiện tại thuần (NPV - Net Present Value):</strong>
                    <div style="padding-left: 12px; color: var(--text-muted); margin-top: 2px;">
                        • Công thức: -Vốn đầu tư ban đầu + Tổng PV của dòng tiền 36 tháng.
                        <br>• Ý nghĩa: Thể hiện số tiền lãi ròng thực tế thu về (sau khi đã khấu trừ đi trượt giá và chi phí cơ hội là lãi suất chiết khấu ${discountRatePct}%).
                        <br>• Kết quả: <strong class="${npvColor}">${npv >= 0 ? '+' : ''}${formatNumber(Math.round(npv))} đ</strong>.
                    </div>
                </div>
                <div>
                    <strong>5. Tỷ suất sinh lời nội bộ (IRR - Internal Rate of Return):</strong>
                    <div style="padding-left: 12px; color: var(--text-muted); margin-top: 2px;">
                        • Khái niệm: Mức lãi suất chiết khấu mà tại đó NPV = 0.
                        <br>• Ý nghĩa: Tỷ suất sinh lời thực tế của quán. Nếu IRR lớn hơn Lãi suất chiết khấu kì vọng (${discountRatePct}%) thì dự án đáng để đầu tư.
                        <br>• Kết quả: <strong class="${irrColor}">${totalInflow > totalCapital && irrAnnual > -100 ? irrAnnual.toFixed(1) + '%' : 'N/A'}</strong>.
                    </div>
                </div>
                <div>
                    <strong>6. Tỷ lệ hoàn vốn đầu tư (ROI - Return on Investment):</strong>
                    <div style="padding-left: 12px; color: var(--text-muted); margin-top: 2px;">
                        • Công thức: (Tổng dòng tiền ròng 3 năm - Vốn đầu tư ban đầu) / Vốn đầu tư ban đầu × 100%.
                        <br>• Cách tính: (${formatNumber(Math.round(totalInflow))} đ dòng tiền thu về - ${formatNumber(totalCapital)} đ vốn bỏ ra) / ${formatNumber(totalCapital)} đ.
                        <br>• Kết quả: <strong class="${roiColor}">${roi.toFixed(1)}%</strong> trong vòng 3 năm (tương đương trung bình khoảng ${(roi/3).toFixed(1)}%/năm).
                    </div>
                </div>
                <div>
                    <strong>7. Chỉ số sinh lời (PI - Profitability Index):</strong>
                    <div style="padding-left: 12px; color: var(--text-muted); margin-top: 2px;">
                        • Công thức: Tổng hiện giá dòng tiền vào (PV) / Vốn đầu tư ban đầu.
                        <br>• Ý nghĩa: Cứ 1 đồng vốn đầu tư ban đầu đem lại bao nhiêu đồng giá trị hiện tại. Dự án có khả thi khi PI > 1.
                        <br>• Kết quả: <strong class="${piColor}">${pi.toFixed(2)}</strong>.
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
                        label: 'Tích lũy thực tế',
                        data: dataCumCash,
                        borderColor: '#38bdf8',
                        backgroundColor: 'rgba(56, 189, 248, 0.05)',
                        borderWidth: 2,
                        tension: 0.2,
                        fill: true
                    },
                    {
                        label: 'Tích lũy chiết khấu (PV)',
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
                                return context.dataset.label + ': ' + formatNumber(context.raw) + 'đ';
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


