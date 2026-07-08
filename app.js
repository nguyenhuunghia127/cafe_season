// ======================================================================
// Coffeelytics - Financial Dashboard Application
// ======================================================================

// Register Chart.js datalabels plugin globally
Chart.register(ChartDataLabels);

// Global state
let activeTab = 'scenarios';
let chartInstance = null;
let costChartInstance = null;
let equityChartInstance = null;
let editingShareholderId = null;
let shareholders = [
    { id: 1, name: "Bạn (Cổ đông sáng lập)", contribution: 80000000, role: "operate" }
];

// ======================================================================
// UI Accordion Logic
// ======================================================================
function toggleAccordion(header) {
    const item = header.parentElement;
    item.classList.toggle('active');
    const content = item.querySelector('.accordion-content');
    if (item.classList.contains('active')) {
        content.style.display = 'block';
    } else {
        content.style.display = 'none';
    }
}
// ======================================================================
// Formatting helpers
// ======================================================================
function formatVND(value) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value) {
    let str = value.toString();
    let isNegative = str.startsWith('-');
    let num = str.replace(/\D/g, '');
    if (!num) return isNegative ? "-" : "";
    let formatted = num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (isNegative ? "-" : "") + formatted;
}

function parseNumber(value) {
    if (typeof value === 'number') return value;
    let str = value.toString();
    let isNegative = str.startsWith('-');
    let num = parseInt(str.replace(/\./g, '').replace(/-/g, '')) || 0;
    return isNegative ? -num : num;
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
    if (P <= 0) return 0;
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

// ======================================================================
// Setup inputs for auto-formatting as the user types
// ======================================================================
function setupInputFormatting() {
    const idsToFormat = [
        'inp-deposit', 'inp-renovate', 'inp-equipment', 'inp-raw-start', 'inp-decor-misc', 'inp-buffer',
        'inp-loan', 'inp-rent', 'inp-utilities', 'inp-salary', 'inp-misc', 'inp-price', 'inp-sh-contrib'
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
    const salaryInput = document.getElementById('inp-salary');
    const miscInput = document.getElementById('inp-misc');
    
    const priceInput = document.getElementById('inp-price');
    const costPctInput = document.getElementById('inp-cost-pct');

    const volGoodInput = document.getElementById('inp-vol-good');
    const volBaseInput = document.getElementById('inp-vol-base');
    const volWorstInput = document.getElementById('inp-vol-worst');
    
    const clearError = (input) => {
        if (input) input.classList.remove('input-error');
    };
    
    const setError = (input, msg) => {
        if (input) input.classList.add('input-error');
        errors.push(msg);
    };
    
    // Clear borders
    [depositInput, renovateInput, equipmentInput, rawStartInput, decorMiscInput, bufferInput, 
     loanInput, interestInput, termInput, rentInput, utilitiesInput, salaryInput, miscInput, 
     priceInput, costPctInput, volGoodInput, volBaseInput, volWorstInput].forEach(clearError);
    
    const deposit = parseNumber(depositInput.value);
    const renovate = parseNumber(renovateInput.value);
    const equipment = parseNumber(equipmentInput.value);
    const rawStart = parseNumber(rawStartInput.value);
    const decorMisc = parseNumber(decorMiscInput.value);
    const buffer = parseNumber(bufferInput.value);
    const loan = parseNumber(loanInput.value);
    const rent = parseNumber(rentInput.value);
    const utilities = parseNumber(utilitiesInput.value);
    const salary = parseNumber(salaryInput.value);
    const misc = parseNumber(miscInput.value);
    const price = parseNumber(priceInput.value);
    
    const interest = parseFloat(interestInput.value) || 0;
    const term = parseInt(termInput.value) || 0;
    const costPct = parseFloat(costPctInput.value) || 0;

    const volGood = parseFloat(volGoodInput.value) || 0;
    const volBase = parseFloat(volBaseInput.value) || 0;
    const volWorst = parseFloat(volWorstInput.value) || 0;
    
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
    if (salary < 0) setError(salaryInput, "Lương nhân viên không được âm.");
    if (misc < 0) setError(miscInput, "Chi phí phát sinh không được âm.");
    if (price <= 0) setError(priceInput, "Giá bán trung bình phải lớn hơn 0 đ/ly.");
    
    if (costPct < 0 || costPct > 100) setError(costPctInput, "Tỷ lệ Cost nguyên vật liệu phải nằm từ 0% đến 100%.");
    if (volGood < 0) setError(volGoodInput, "Sản lượng kịch bản Tốt không được âm.");
    if (volBase < 0) setError(volBaseInput, "Sản lượng kịch bản Trung bình không được âm.");
    if (volWorst < 0) setError(volWorstInput, "Sản lượng kịch bản Xấu không được âm.");
    
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
function renderShareholders(totalCapitalNeeded, loan, goodNet, baseNet, worstNet) {
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
                        <th>Cổ tức Tốt / th</th>
                        <th>Cổ tức T.Bình / th</th>
                        <th>Cổ tức Xấu / th</th>
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
    let sumGoodDiv = 0;
    let sumBaseDiv = 0;
    let sumWorstDiv = 0;

    shareholders.forEach(s => {
        const shPct = totalEquityContributed > 0 ? (s.contribution / totalEquityContributed) * 100 : 0;
        totalPct += shPct;

        const shGoodDiv = goodNet * (shPct / 100) * (payoutPct / 100);
        const shBaseDiv = baseNet * (shPct / 100) * (payoutPct / 100);
        const shWorstDiv = worstNet * (shPct / 100) * (payoutPct / 100);

        sumGoodDiv += shGoodDiv;
        sumBaseDiv += shBaseDiv;
        sumWorstDiv += shWorstDiv;

        let paybackStr = "Vô hạn (Lỗ)";
        if (shBaseDiv > 0) {
            const months = s.contribution / shBaseDiv;
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
            <td class="${shGoodDiv >= 0 ? 'val-profit' : 'val-loss'}">${shGoodDiv >= 0 ? '+' : ''}${formatShortVND(shGoodDiv)}</td>
            <td class="${shBaseDiv >= 0 ? 'val-profit' : 'val-loss'}">${shBaseDiv >= 0 ? '+' : ''}${formatShortVND(shBaseDiv)}</td>
            <td class="${shWorstDiv >= 0 ? 'val-profit' : 'val-loss'}">${shWorstDiv >= 0 ? '+' : ''}${formatShortVND(shWorstDiv)}</td>
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
        <td class="${sumGoodDiv >= 0 ? 'val-profit' : 'val-loss'}">${sumGoodDiv >= 0 ? '+' : ''}${formatShortVND(sumGoodDiv)}</td>
        <td class="${sumBaseDiv >= 0 ? 'val-profit' : 'val-loss'}">${sumBaseDiv >= 0 ? '+' : ''}${formatShortVND(sumBaseDiv)}</td>
        <td class="${sumWorstDiv >= 0 ? 'val-profit' : 'val-loss'}">${sumWorstDiv >= 0 ? '+' : ''}${formatShortVND(sumWorstDiv)}</td>
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
// Update Capital Disbursement schedule DOM dynamically
// ======================================================================
function updateDisbursement(deposit, renovate, equipment, rawStart, decorMisc, buffer) {
    document.getElementById('disburse-p1').innerText = formatVND(deposit);
    document.getElementById('disburse-p2').innerText = formatVND(renovate + decorMisc * 0.5);
    document.getElementById('disburse-p3').innerText = formatVND(equipment + decorMisc * 0.5);
    document.getElementById('disburse-p4').innerText = formatVND(rawStart);
    document.getElementById('disburse-p5').innerText = formatVND(buffer);
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
            paybackDescElement.innerText = "Quán đang chịu lỗ hoặc không chi trả cổ tức ở kịch bản trung bình. Cần tối ưu lại định phí hoặc tăng giá bán.";
        }
    }
}

// ======================================================================
// Update Disbursement Timeline Breakdown
// ======================================================================
function updateDisbursement(deposit, renovate, equipment, rawStart, decorMisc, buffer) {
    const totalEquityContributed = shareholders.reduce((sum, s) => sum + s.contribution, 0);
    if (totalEquityContributed === 0) return;

    const phases = [
        { id: 'p1', amount: deposit },
        { id: 'p2', amount: renovate },
        { id: 'p3', amount: equipment },
        { id: 'p4', amount: rawStart + decorMisc },
        { id: 'p5', amount: buffer }
    ];

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
    const salary = parseNumber(document.getElementById('inp-salary').value);
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

            <p><strong>6. Kết quả Kịch bản Trung bình (Bán được ${volBase} ly/ngày)</strong></p>
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
    const salary = parseNumber(document.getElementById('inp-salary').value);
    const misc = parseNumber(document.getElementById('inp-misc').value);

    const price = parseNumber(document.getElementById('inp-price').value);
    const costPct = parseFloat(document.getElementById('inp-cost-pct').value) || 0;

    const volGood = parseFloat(document.getElementById('inp-vol-good').value) || 0;
    const volBase = parseFloat(document.getElementById('inp-vol-base').value) || 0;
    const volWorst = parseFloat(document.getElementById('inp-vol-worst').value) || 0;

    // Financial arithmetic
    const setupCosts = deposit + renovate + equipment + rawStart + decorMisc;
    const totalCapitalNeeded = setupCosts + buffer;
    const leverageRatio = totalCapitalNeeded > 0 ? (loan / totalCapitalNeeded) * 100 : 0;
    
    const monthlyDebt = calculateEMI(loan, interest, term);
    const fixedMonthlyOpex = rent + utilities + salary + misc;

    // Depreciation: equipment depreciates over deprYears
    const depreciableAssets = equipment + decorMisc; // Máy móc + Decor có thể khấu hao
    const monthlyDepreciation = depreciableAssets / (deprYears * 12);

    const unitContributionMargin = price * (1 - costPct / 100);
    
    // Break-even including depreciation
    const breakEvenDailyVol = unitContributionMargin > 0 ? (fixedMonthlyOpex + monthlyDebt + monthlyDepreciation) / (30 * unitContributionMargin) : 0;

    // Display summary KPIs
    document.getElementById('kpi-total-capital').innerText = formatShortVND(totalCapitalNeeded);
    document.getElementById('kpi-monthly-debt').innerText = formatShortVND(monthlyDebt);
    document.getElementById('kpi-breakeven-vol').innerText = Math.ceil(breakEvenDailyVol) + ' ly/ngày';
    document.getElementById('lbl-leverage-ratio').innerText = leverageRatio.toFixed(0) + '%';
    
    // Update leverage badge style
    const badge = document.getElementById('leverage-badge');
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

    // Computing 3 scenarios (with tax + depreciation)
    function computeScenario(vol) {
        const rev = vol * 30 * price;
        const cogs = rev * (costPct / 100);
        const profitBeforeTax = (rev - cogs) - fixedMonthlyOpex - monthlyDebt - monthlyDepreciation;
        const tax = calculateTax(profitBeforeTax, rev * 12);
        const net = profitBeforeTax - tax;
        return { rev, cogs, profitBeforeTax, tax, net };
    }

    const good = computeScenario(volGood);
    const base = computeScenario(volBase);
    const worst = computeScenario(volWorst);

    // Use ACTUAL fixedMonthlyOpex + monthlyDebt + depreciation for scenario detail cards
    const totalFixedDisplay = fixedMonthlyOpex;

    // Dynamic details DOM rendering
    document.getElementById('det-good-rev').innerText = formatShortVND(good.rev);
    document.getElementById('det-good-cogs').innerText = formatShortVND(good.cogs);
    document.getElementById('det-good-opex').innerText = formatShortVND(totalFixedDisplay);
    document.getElementById('det-good-debt').innerText = formatShortVND(monthlyDebt);
    document.getElementById('det-good-depr').innerText = formatShortVND(monthlyDepreciation);
    document.getElementById('det-good-tax').innerText = formatShortVND(good.tax);
    document.getElementById('det-good-net').innerText = (good.net >= 0 ? '+' : '') + formatShortVND(good.net);
    document.getElementById('det-good-net').className = good.net >= 0 ? 'val-profit' : 'val-loss';

    document.getElementById('det-base-rev').innerText = formatShortVND(base.rev);
    document.getElementById('det-base-cogs').innerText = formatShortVND(base.cogs);
    document.getElementById('det-base-opex').innerText = formatShortVND(totalFixedDisplay);
    document.getElementById('det-base-debt').innerText = formatShortVND(monthlyDebt);
    document.getElementById('det-base-depr').innerText = formatShortVND(monthlyDepreciation);
    document.getElementById('det-base-tax').innerText = formatShortVND(base.tax);
    document.getElementById('det-base-net').innerText = (base.net >= 0 ? '+' : '') + formatShortVND(base.net);
    document.getElementById('det-base-net').className = base.net >= 0 ? 'val-profit' : 'val-loss';

    document.getElementById('det-worst-rev').innerText = formatShortVND(worst.rev);
    document.getElementById('det-worst-cogs').innerText = formatShortVND(worst.cogs);
    document.getElementById('det-worst-opex').innerText = formatShortVND(totalFixedDisplay);
    document.getElementById('det-worst-debt').innerText = formatShortVND(monthlyDebt);
    document.getElementById('det-worst-depr').innerText = formatShortVND(monthlyDepreciation);
    document.getElementById('det-worst-tax').innerText = formatShortVND(worst.tax);
    document.getElementById('det-worst-net').innerText = (worst.net >= 0 ? '+' : '') + formatShortVND(worst.net);
    document.getElementById('det-worst-net').className = worst.net >= 0 ? 'val-profit' : 'val-loss';

    // Cash balance simulations (using net after tax)
    let currentWorstBuffer = buffer;
    let currentBaseBuffer = buffer;
    let currentGoodBuffer = buffer;
    let runOutMonth = -1;
    
    const worstTrend = [buffer];
    const baseTrend = [buffer];
    const goodTrend = [buffer];
    
    for (let m = 1; m <= 12; m++) {
        currentWorstBuffer += worst.net;
        worstTrend.push(Math.max(currentWorstBuffer, 0));
        if (currentWorstBuffer < 0 && runOutMonth === -1) {
            runOutMonth = m;
        }

        currentBaseBuffer += base.net;
        baseTrend.push(Math.max(currentBaseBuffer, 0));

        currentGoodBuffer += good.net;
        goodTrend.push(Math.max(currentGoodBuffer, 0));
    }

    const alertContainer = document.getElementById('survival-alert-container');
    if (worst.net < 0) {
        alertContainer.style.display = 'flex';
        if (runOutMonth !== -1) {
            // Reset to danger style
            alertContainer.style.background = 'var(--danger-glow)';
            alertContainer.style.borderColor = 'rgba(248, 113, 113, 0.3)';
            const isLightAlert = document.body.classList.contains('light-theme');
            alertContainer.style.color = isLightAlert ? '#b91c1c' : 'var(--danger)';
            alertContainer.querySelector('svg').style.fill = 'var(--danger)';
            document.getElementById('survival-alert-text').innerText = 
                `Cảnh báo: Với kịch bản xấu (lỗ ${formatShortVND(Math.abs(worst.net))}/tháng), quỹ dự phòng của bạn sẽ cạn kiệt ở tháng ${runOutMonth}.`;
        } else {
            document.getElementById('survival-alert-text').innerText = 
                `Dù kịch bản xấu (lỗ ${formatShortVND(Math.abs(worst.net))}/tháng), quỹ dự phòng ${formatShortVND(buffer)} vẫn đủ gánh chịu qua 12 tháng đầu tiên.`;
            
            const isLightAlert = document.body.classList.contains('light-theme');
            alertContainer.style.background = 'var(--warning-glow)';
            alertContainer.style.borderColor = 'rgba(251, 191, 36, 0.3)';
            alertContainer.style.color = isLightAlert ? '#92400e' : '#fde68a';
            alertContainer.querySelector('svg').style.fill = 'var(--warning)';
        }
    } else {
        alertContainer.style.display = 'none';
    }

    // Render tables, disbursement schedule and pitch assistants (using net after tax)
    const totalEquityContributed = shareholders.reduce((sum, s) => sum + s.contribution, 0);
    renderShareholders(totalCapitalNeeded, loan, good.net, base.net, worst.net);
    updateDisbursement(deposit, renovate, equipment, rawStart, decorMisc, buffer);
    updateInvestorPitch(totalEquityContributed, base.net, volBase, breakEvenDailyVol);

    // Draw active chart
    renderChart(good, base, worst, breakEvenDailyVol, volGood, volBase, volWorst, goodTrend, baseTrend, worstTrend, setupCosts, deposit, renovate, equipment, rawStart, decorMisc, totalEquityContributed, price, costPct, fixedMonthlyOpex, monthlyDebt, monthlyDepreciation);
}

// ======================================================================
// Chart rendering with Data Labels
// ======================================================================
function renderChart(good, base, worst, breakeven, volGood, volBase, volWorst, goodTrend, baseTrend, worstTrend, setupCosts, deposit, renovate, equipment, rawStart, decorMisc, totalEquityContributed, basePrice, baseCostPct, fixedMonthlyOpex, monthlyDebt, monthlyDepreciation) {
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

    if (activeTab === 'structure') {
        if (mainWrapper) mainWrapper.style.display = 'none';
        if (splitWrapper) splitWrapper.style.display = 'grid';
        if (sensitivityTab) sensitivityTab.style.display = 'none';
        if (explanationTab) explanationTab.style.display = 'none';
    } else if (activeTab === 'sensitivity') {
        if (mainWrapper) mainWrapper.style.display = 'none';
        if (splitWrapper) splitWrapper.style.display = 'none';
        if (sensitivityTab) sensitivityTab.style.display = 'block';
        if (explanationTab) explanationTab.style.display = 'none';
    } else if (activeTab === 'explanation') {
        if (mainWrapper) mainWrapper.style.display = 'none';
        if (splitWrapper) splitWrapper.style.display = 'none';
        if (sensitivityTab) sensitivityTab.style.display = 'none';
        if (explanationTab) explanationTab.style.display = 'block';
    } else {
        if (mainWrapper) mainWrapper.style.display = 'block';
        if (splitWrapper) splitWrapper.style.display = 'none';
        if (sensitivityTab) sensitivityTab.style.display = 'none';
        if (explanationTab) explanationTab.style.display = 'none';
    }

    if (activeTab === 'sensitivity') {
        // Destroy all charts
        ['financialChart', 'costStructureChart', 'equityStructureChart'].forEach(id => {
            const c = Chart.getChart(id);
            if (c) c.destroy();
        });
        renderSensitivityTable(basePrice, baseCostPct, fixedMonthlyOpex, monthlyDebt, monthlyDepreciation, volBase);
        return;
    }

    if (activeTab === 'explanation') {
        // Destroy all charts
        ['financialChart', 'costStructureChart', 'equityStructureChart'].forEach(id => {
            const c = Chart.getChart(id);
            if (c) c.destroy();
        });
        renderExplanation(basePrice, baseCostPct, fixedMonthlyOpex, monthlyDebt, monthlyDepreciation, volBase, setupCosts, deposit, renovate, equipment, rawStart, decorMisc, totalEquityContributed, breakeven, base);
        return;
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
                                return ' ' + context.label + ': ' + formatVND(context.raw);
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

        const finalLabels = labels.length > 0 ? labels : ['Chưa góp vốn'];
        const finalData = data.length > 0 ? data : [1];

        const bgColors = [
            'rgba(56, 189, 248, 0.6)',
            'rgba(16, 185, 129, 0.6)',
            'rgba(245, 158, 11, 0.6)',
            'rgba(139, 92, 246, 0.6)',
            'rgba(236, 72, 153, 0.6)',
            'rgba(20, 184, 166, 0.6)'
        ];

        const ctxEquity = document.getElementById('equityStructureChart').getContext('2d');
        equityChartInstance = new Chart(ctxEquity, {
            type: 'pie',
            data: {
                labels: finalLabels,
                datasets: [{
                    data: finalData,
                    backgroundColor: bgColors.slice(0, Math.max(finalData.length, 1)),
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

        // Destroy main chart
        const mainChart = Chart.getChart("financialChart");
        if (mainChart) mainChart.destroy();

        const ctx = document.getElementById('financialChart').getContext('2d');
        
        if (activeTab === 'scenarios') {
            // Use ACTUAL computed values for total costs
            const goodTotalCost = good.cogs + fixedMonthlyOpex + monthlyDebt + monthlyDepreciation;
            const baseTotalCost = base.cogs + fixedMonthlyOpex + monthlyDebt + monthlyDepreciation;
            const worstTotalCost = worst.cogs + fixedMonthlyOpex + monthlyDebt + monthlyDepreciation;

            chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Kịch bản Tốt', 'Kịch bản T.Bình', 'Kịch bản Xấu'],
                    datasets: [
                        {
                            label: 'Doanh thu (VND)',
                            data: [good.rev, base.rev, worst.rev],
                            backgroundColor: isLight ? 'rgba(2, 132, 199, 0.5)' : 'rgba(56, 189, 248, 0.4)',
                            borderColor: isLight ? '#0284c7' : '#38bdf8',
                            borderWidth: 1.5,
                            borderRadius: 6
                        },
                        {
                            label: 'Tổng chi phí (VND)',
                            data: [goodTotalCost, baseTotalCost, worstTotalCost],
                            backgroundColor: 'rgba(251, 191, 36, 0.25)',
                            borderColor: '#fbbf24',
                            borderWidth: 1.5,
                            borderRadius: 6
                        },
                        {
                            label: 'Lợi nhuận ròng (VND)',
                            data: [good.net, base.net, worst.net],
                            backgroundColor: [
                                good.net >= 0 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)',
                                base.net >= 0 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)',
                                worst.net >= 0 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'
                            ],
                            borderColor: [
                                good.net >= 0 ? '#10b981' : '#ef4444',
                                base.net >= 0 ? '#10b981' : '#ef4444',
                                worst.net >= 0 ? '#10b981' : '#ef4444'
                            ],
                            borderWidth: 1.5,
                            borderRadius: 6
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
                                label: function(context) { return context.dataset.label + ': ' + formatVND(context.raw); }
                            }
                        },
                        datalabels: getDataLabelConfig(isLight, 'bar')
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
        } else if (activeTab === 'breakeven') {
            chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Kịch bản Tốt', 'Kịch bản T.Bình', 'Kịch bản Xấu'],
                    datasets: [
                        {
                            label: 'Số ly nước bán ra/ngày',
                            data: [volGood, volBase, volWorst],
                            backgroundColor: isLight ? 'rgba(79, 70, 229, 0.5)' : 'rgba(129, 140, 248, 0.4)',
                            borderColor: isLight ? '#4f46e5' : '#818cf8',
                            borderWidth: 1.5,
                            borderRadius: 6
                        },
                        {
                            label: 'Mốc hòa vốn (ly/ngày)',
                            data: [breakeven, breakeven, breakeven],
                            type: 'line',
                            fill: false,
                            borderColor: isLight ? '#ef4444' : '#f87171',
                            borderDash: [5, 5],
                            borderWidth: 2,
                            pointBackgroundColor: isLight ? '#ef4444' : '#f87171',
                            pointRadius: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true, position: 'top', labels: { color: textColor } },
                        datalabels: {
                            ...getDataLabelConfig(isLight, 'bar'),
                            formatter: (value, context) => {
                                // Hide datalabels on the breakeven line to avoid duplication
                                if (context.dataset.type === 'line') {
                                    return context.dataIndex === 1 ? value.toFixed(1) : '';
                                }
                                return Math.round(value);
                            }
                        }
                    },
                    scales: {
                        y: {
                            grid: { color: gridColor },
                            title: { display: true, text: 'Số ly / ngày', color: textColor },
                            ticks: { color: textColor }
                        },
                        x: { grid: { display: false }, ticks: { color: textColor } }
                    }
                }
            });
        } else if (activeTab === 'cashflow') {
            const monthsLabel = ['Bắt đầu'];
            for (let i = 1; i <= 12; i++) monthsLabel.push('Tháng ' + i);
            chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: monthsLabel,
                    datasets: [
                        {
                            label: 'Quỹ dự phòng (VND) - Kịch bản Tốt',
                            data: goodTrend,
                            borderColor: isLight ? '#10b981' : '#34d399',
                            backgroundColor: 'transparent',
                            fill: false,
                            tension: 0.3,
                            borderWidth: 2,
                            pointRadius: 0
                        },
                        {
                            label: 'Quỹ dự phòng (VND) - Kịch bản T.Bình',
                            data: baseTrend,
                            borderColor: isLight ? '#0284c7' : '#38bdf8',
                            backgroundColor: 'transparent',
                            fill: false,
                            tension: 0.3,
                            borderWidth: 2,
                            pointRadius: 0
                        },
                        {
                            label: 'Quỹ dự phòng (VND) - Kịch bản Xấu',
                            data: worstTrend,
                            borderColor: isLight ? '#ef4444' : '#f87171',
                            backgroundColor: isLight ? 'rgba(239, 68, 68, 0.08)' : 'rgba(248, 113, 113, 0.1)',
                            fill: true,
                            tension: 0.3,
                            borderWidth: 2.5,
                            pointRadius: 4,
                            pointBackgroundColor: isLight ? '#ef4444' : '#f87171'
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

    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(`'${tabName}'`)) {
            btn.classList.add('active');
        }
    });

    updateDashboard();
}

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
    
    // Bind change update on non-formatted fields
    document.getElementById('inp-interest').addEventListener('input', updateDashboard);
    document.getElementById('inp-term').addEventListener('input', updateDashboard);
    document.getElementById('inp-cost-pct').addEventListener('input', updateDashboard);
    document.getElementById('inp-vol-good').addEventListener('input', updateDashboard);
    document.getElementById('inp-vol-base').addEventListener('input', updateDashboard);
    document.getElementById('inp-vol-worst').addEventListener('input', updateDashboard);
    document.getElementById('inp-depr-years').addEventListener('input', updateDashboard);
    document.getElementById('inp-tax-rate').addEventListener('input', updateDashboard);

    updateDashboard();
});
