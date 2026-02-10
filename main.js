// --- CẤU HÌNH & STATE ---
const CONFIG_KEY = 'petro_slip_20260210';
const CONFIG_VERSION = 'v1.4.1-2026-02-10';
const MAX_LIMIT = 500;

// Lấy tất cả settings hiện tại từ form
function getSettings() {
    return {
        unitNameSize: parseFloat(document.getElementById('unitNameSize').value),
        addressSize: parseFloat(document.getElementById('addressSize').value),
        headerLineHeight: parseFloat(document.getElementById('headerLineHeight').value),
        bodySize: parseFloat(document.getElementById('bodySize').value),
        lineHeight: parseFloat(document.getElementById('lineHeight').value),
    };
}

// Template HTML cho 1 tờ phiếu (2 liên)
const getVoucherTemplate = (data, serialNum, paperSize = 'A5', settings = {}, orientation = 'portrait') => {
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const fullSerial = `${yy}${mm}/${serialNum.toString().padStart(4, '0')}`;
    const pageClass = (paperSize === 'A6' ? 'page-a6' : 'page-a5') + (orientation === 'portrait' ? ' page-portrait' : '');

    const orgNameStyle = settings.unitNameSize ? `font-size: ${settings.unitNameSize}pt` : '';
    const addressStyle = settings.addressSize ? `font-size: ${settings.addressSize}pt` : '';
    const headerStyle = settings.headerLineHeight ? `line-height: ${settings.headerLineHeight}` : '';
    const bodyStyle = [
        settings.bodySize ? `font-size: ${settings.bodySize}pt` : '',
        settings.lineHeight ? `line-height: ${settings.lineHeight}` : '',
    ].filter(Boolean).join('; ');

    // MST: chỉ hiển thị nếu người dùng có nhập
    const mstHtml = data.taxId && data.taxId.trim() !== ''
        ? `<div class="mst">MST: ${data.taxId}</div>`
        : '';

    // Địa điểm nhận: nếu có giá trị thì in sẵn, không thì để dấu chấm
    const locationValue = data.receiveLocation && data.receiveLocation.trim() !== '';
    const locStyle = [
        data.locationBold ? 'font-weight: bold' : '',
        data.locationItalic ? 'font-style: italic' : '',
    ].filter(Boolean).join('; ');
    const locationHtml = locationValue
        ? `<span class=""${locStyle ? ` style="${locStyle}"` : ''}>${data.receiveLocation}</span>`
        : `<div class="dots"></div>`;

    // Helper: render giá trị hoặc dấu chấm
    const valueOrDots = (val) => val && val.trim() !== ''
        ? `<span class="">${val}</span>`
        : `<div class="dots"></div>`;

    // Hàm render 1 nửa tờ giấy (1 liên)
    const renderHalf = (lienText) => `
        <div class="voucher-half">
            <div class="header" style="${headerStyle}">
                <div class="org-name" style="${orgNameStyle}">${data.unitName}</div>
                <div class="org-info" style="${addressStyle}">${data.address}</div>
                ${mstHtml}
            </div>

            <div class="title-block">
                <div class="voucher-title">${data.voucherTitle}</div>
                <div class="lien-serial-row">
                    <div class="lien-so">${lienText}</div>
                    <div class="serial-number">Số: ${fullSerial}</div>
                </div>
            </div>

            <div class="body-content" style="${bodyStyle}">
                <div class="line">
                    <span class="label">${data.locationLabel}:</span>
                    ${locationHtml}
                </div>
                <div class="line">
                    <span class="label">${data.field1Label}:</span>
                    ${valueOrDots(data.field1Value)}
                    <span class="label" style="margin-left: 8px;">${data.field2Label}:</span>
                    ${valueOrDots(data.field2Value)}
                </div>
                <div class="fuel-section-gap">
                    <span class="section-label">${data.fuelSectionLabel}</span>
                </div>
                <div class="fuel-row">
                    <span class="label">${data.moneyLabel}:</span>
                    ${valueOrDots(data.moneyValue)}
                    ${data.moneyUnit ? `<span class="label">${data.moneyUnit}</span>` : ''}
                </div>
                <div class="fuel-row">
                    <span class="label">${data.textAmountLabel}:</span>
                    ${valueOrDots(data.textAmountValue)}
                </div>
            </div>

            <div class="footer">
                <div class="sign-box">
                    <div class="sign-title">Người nhận</div>
                    <div class="sign-note">(Ký, ghi rõ họ tên)</div>
                    <div class="sign-space"></div>
                </div>
                <div class="sign-box">
                    <div class="date-line">Ngày ...... tháng ...... năm 20......</div>
                    <div class="sign-title">Người lập phiếu</div>
                    <div class="sign-note">(Ký, ghi rõ họ tên)</div>
                    <div class="sign-space"></div>
                </div>
            </div>
        </div>
    `;

    return `
        <div class="page ${pageClass}">
            ${renderHalf(data.lien1Text)}
            <div class="perforation"></div>
            ${renderHalf(data.lien2Text)}
        </div>
    `;
};

// --- LOGIC CHÍNH ---

function loadConfig() {
    const saved = localStorage.getItem(CONFIG_KEY);

    // Kiểm tra version token — nếu khác thì reset về mặc định
    if (saved) {
        const config = JSON.parse(saved);
        if (config._version !== CONFIG_VERSION) {
            localStorage.removeItem(CONFIG_KEY);
            applyDefaults();
            updatePreview();
            return;
        }
    }

    if (saved) {
        const config = JSON.parse(saved);
        document.getElementById('unitName').value = config.unitName || '';
        document.getElementById('address').value = config.address || '';
        document.getElementById('taxId').value = config.taxId || '';
        document.getElementById('voucherTitle').value = config.voucherTitle || 'PHIẾU CẤP XĂNG DẦU';
        document.getElementById('lien1Text').value = config.lien1Text || '(Liên 1: Lưu)';
        document.getElementById('lien2Text').value = config.lien2Text || '(Liên 2: Giao cửa hàng xăng dầu)';
        document.getElementById('locationLabel').value = config.locationLabel || 'Địa điểm nhận';
        document.getElementById('receiveLocation').value = config.receiveLocation || '';
        if (config.locationBold !== undefined) {
            document.getElementById('locationBold').checked = config.locationBold;
        }
        if (config.locationItalic !== undefined) {
            document.getElementById('locationItalic').checked = config.locationItalic;
        }
        document.getElementById('field1Label').value = config.field1Label || 'Biển số xe';
        document.getElementById('field1Value').value = config.field1Value || '';
        document.getElementById('field2Label').value = config.field2Label || 'Tên lái xe';
        document.getElementById('field2Value').value = config.field2Value || '';
        document.getElementById('fuelSectionLabel').value = config.fuelSectionLabel || 'Số lượng xăng/dầu được cấp';
        document.getElementById('moneyLabel').value = config.moneyLabel || 'Số tiền';
        document.getElementById('moneyUnit').value = config.moneyUnit !== undefined ? config.moneyUnit : 'VNĐ';
        document.getElementById('moneyValue').value = config.moneyValue || '';
        document.getElementById('textAmountLabel').value = config.textAmountLabel || 'Bằng chữ';
        document.getElementById('textAmountValue').value = config.textAmountValue || '';

        if (config.paperSize) {
            document.getElementById('paperSize').value = config.paperSize;
        }
        if (config.paperOrientation) {
            document.getElementById('paperOrientation').value = config.paperOrientation;
        }
        if (config.lastMax) {
            const nextNum = parseInt(config.lastMax) + 1;
            document.getElementById('minNum').value = nextNum;
            document.getElementById('maxNum').value = nextNum;
        }

        // Restore typography settings
        if (config.unitNameSize !== undefined) {
            document.getElementById('unitNameSize').value = config.unitNameSize;
        }
        if (config.addressSize !== undefined) {
            document.getElementById('addressSize').value = config.addressSize;
        }
        if (config.headerLineHeight !== undefined) {
            document.getElementById('headerLineHeight').value = config.headerLineHeight;
        }
        if (config.bodySize !== undefined) {
            document.getElementById('bodySize').value = config.bodySize;
        }
        if (config.lineHeight !== undefined) {
            document.getElementById('lineHeight').value = config.lineHeight;
        }
    } else {
        applyDefaults();
    }
    updatePreview();
}

function applyDefaults() {
    document.getElementById('unitName').value = "CÔNG TY TNHH VẬN TẢI DỊCH VỤ DU LỊCH VIỆT LÀO";
    document.getElementById('address').value = "28 Huỳnh Thúc Kháng, Phường Hải Châu, TP Đà Nẵng, Việt Nam";
    document.getElementById('taxId').value = "0400467487";
    document.getElementById('voucherTitle').value = 'PHIẾU CẤP XĂNG DẦU';
    document.getElementById('lien1Text').value = '(Liên 1: Lưu)';
    document.getElementById('lien2Text').value = '(Liên 2: Giao cửa hàng xăng dầu)';
    document.getElementById('locationLabel').value = 'Địa điểm nhận';
    document.getElementById('receiveLocation').value = '';
    document.getElementById('field1Label').value = 'Biển số xe';
    document.getElementById('field1Value').value = '';
    document.getElementById('field2Label').value = 'Tên lái xe';
    document.getElementById('field2Value').value = '';
    document.getElementById('fuelSectionLabel').value = 'Số lượng xăng/dầu được cấp';
    document.getElementById('moneyLabel').value = 'Số tiền';
    document.getElementById('moneyUnit').value = 'VNĐ';
    document.getElementById('moneyValue').value = '';
    document.getElementById('textAmountLabel').value = 'Bằng chữ';
    document.getElementById('textAmountValue').value = '';
}

function saveConfig(currentMax) {
    const config = {
        _version: CONFIG_VERSION,
        unitName: document.getElementById('unitName').value,
        address: document.getElementById('address').value,
        taxId: document.getElementById('taxId').value,
        voucherTitle: document.getElementById('voucherTitle').value,
        lien1Text: document.getElementById('lien1Text').value,
        lien2Text: document.getElementById('lien2Text').value,
        locationLabel: document.getElementById('locationLabel').value,
        receiveLocation: document.getElementById('receiveLocation').value,
        locationBold: document.getElementById('locationBold').checked,
        locationItalic: document.getElementById('locationItalic').checked,
        field1Label: document.getElementById('field1Label').value,
        field1Value: document.getElementById('field1Value').value,
        field2Label: document.getElementById('field2Label').value,
        field2Value: document.getElementById('field2Value').value,
        fuelSectionLabel: document.getElementById('fuelSectionLabel').value,
        moneyLabel: document.getElementById('moneyLabel').value,
        moneyUnit: document.getElementById('moneyUnit').value,
        moneyValue: document.getElementById('moneyValue').value,
        textAmountLabel: document.getElementById('textAmountLabel').value,
        textAmountValue: document.getElementById('textAmountValue').value,
        paperSize: document.getElementById('paperSize').value,
        paperOrientation: document.getElementById('paperOrientation').value,
        lastMax: currentMax,
        unitNameSize: parseFloat(document.getElementById('unitNameSize').value),
        addressSize: parseFloat(document.getElementById('addressSize').value),
        headerLineHeight: parseFloat(document.getElementById('headerLineHeight').value),
        bodySize: parseFloat(document.getElementById('bodySize').value),
        lineHeight: parseFloat(document.getElementById('lineHeight').value),
    };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

// Auto-save config khi thay đổi bất kỳ setting nào (không ghi đè lastMax)
function autoSaveConfig() {
    const saved = localStorage.getItem(CONFIG_KEY);
    let lastMax = null;
    if (saved) {
        const old = JSON.parse(saved);
        lastMax = old.lastMax;
    }
    const config = {
        _version: CONFIG_VERSION,
        unitName: document.getElementById('unitName').value,
        address: document.getElementById('address').value,
        taxId: document.getElementById('taxId').value,
        voucherTitle: document.getElementById('voucherTitle').value,
        lien1Text: document.getElementById('lien1Text').value,
        lien2Text: document.getElementById('lien2Text').value,
        locationLabel: document.getElementById('locationLabel').value,
        receiveLocation: document.getElementById('receiveLocation').value,
        locationBold: document.getElementById('locationBold').checked,
        locationItalic: document.getElementById('locationItalic').checked,
        field1Label: document.getElementById('field1Label').value,
        field1Value: document.getElementById('field1Value').value,
        field2Label: document.getElementById('field2Label').value,
        field2Value: document.getElementById('field2Value').value,
        fuelSectionLabel: document.getElementById('fuelSectionLabel').value,
        moneyLabel: document.getElementById('moneyLabel').value,
        moneyUnit: document.getElementById('moneyUnit').value,
        moneyValue: document.getElementById('moneyValue').value,
        textAmountLabel: document.getElementById('textAmountLabel').value,
        textAmountValue: document.getElementById('textAmountValue').value,
        paperSize: document.getElementById('paperSize').value,
        paperOrientation: document.getElementById('paperOrientation').value,
        lastMax: lastMax,
        unitNameSize: parseFloat(document.getElementById('unitNameSize').value),
        addressSize: parseFloat(document.getElementById('addressSize').value),
        headerLineHeight: parseFloat(document.getElementById('headerLineHeight').value),
        bodySize: parseFloat(document.getElementById('bodySize').value),
        lineHeight: parseFloat(document.getElementById('lineHeight').value),
    };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

function getData() {
    return {
        unitName: document.getElementById('unitName').value,
        address: document.getElementById('address').value,
        taxId: document.getElementById('taxId').value,
        voucherTitle: document.getElementById('voucherTitle').value || 'PHIẾU CẤP XĂNG DẦU',
        lien1Text: document.getElementById('lien1Text').value || '(Liên 1: Lưu)',
        lien2Text: document.getElementById('lien2Text').value || '(Liên 2: Giao cửa hàng xăng dầu)',
        locationLabel: document.getElementById('locationLabel').value || 'Địa điểm nhận',
        receiveLocation: document.getElementById('receiveLocation').value,
        locationBold: document.getElementById('locationBold').checked,
        locationItalic: document.getElementById('locationItalic').checked,
        field1Label: document.getElementById('field1Label').value || 'Biển số xe',
        field1Value: document.getElementById('field1Value').value,
        field2Label: document.getElementById('field2Label').value || 'Tên lái xe',
        field2Value: document.getElementById('field2Value').value,
        fuelSectionLabel: document.getElementById('fuelSectionLabel').value || 'Số lượng xăng/dầu được cấp',
        moneyLabel: document.getElementById('moneyLabel').value || 'Số tiền',
        moneyUnit: document.getElementById('moneyUnit').value,
        moneyValue: document.getElementById('moneyValue').value,
        textAmountLabel: document.getElementById('textAmountLabel').value || 'Bằng chữ',
        textAmountValue: document.getElementById('textAmountValue').value,
    };
}

function updatePreview() {
    const data = getData();
    const minVal = document.getElementById('minNum').value || 1;
    const paperSize = document.getElementById('paperSize').value;
    const orientation = document.getElementById('paperOrientation').value;
    const settings = getSettings();
    const html = getVoucherTemplate(data, minVal, paperSize, settings, orientation);
    document.getElementById('preview-wrapper').innerHTML = html;

    // Cập nhật label hiển thị giá trị range
    document.getElementById('unitNameSizeVal').textContent = settings.unitNameSize;
    document.getElementById('addressSizeVal').textContent = settings.addressSize;
    document.getElementById('headerLineHeightVal').textContent = settings.headerLineHeight;
    document.getElementById('bodySizeVal').textContent = settings.bodySize;
    document.getElementById('lineHeightVal').textContent = settings.lineHeight;

    // Cập nhật format preview
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    document.getElementById('formatPreview').innerText = `${yy}${mm}/XXXX`;

    // Cập nhật số lượng phiếu
    const min = parseInt(document.getElementById('minNum').value) || 1;
    const max = parseInt(document.getElementById('maxNum').value) || 1;
    const total = Math.max(0, max - min + 1);
    document.getElementById('totalCount').textContent = total;

    // Auto-save mỗi khi thay đổi
    autoSaveConfig();
}

function handlePrint() {
    const min = parseInt(document.getElementById('minNum').value);
    const max = parseInt(document.getElementById('maxNum').value);
    const paperSize = document.getElementById('paperSize').value;
    const orientation = document.getElementById('paperOrientation').value;
    const settings = getSettings();

    if (isNaN(min) || isNaN(max) || min > max) {
        alert("Số bắt đầu (Min) phải nhỏ hơn hoặc bằng Đến số (Max)!");
        return;
    }

    if (min < 1) {
        alert("Số bắt đầu (Min) phải lớn hơn 0!");
        return;
    }

    const count = max - min + 1;
    if (count > MAX_LIMIT) {
        alert(`Hệ thống giới hạn in tối đa ${MAX_LIMIT} phiếu mỗi lần để đảm bảo hiệu năng.\nBạn đang yêu cầu ${count} phiếu.`);
        return;
    }

    const orientLabel = orientation === 'portrait' ? 'Dọc' : 'Ngang';
    const confirmMsg = `Bạn chuẩn bị in ${count} tờ phiếu (khổ ${paperSize} - ${orientLabel}).\nTừ số ${min} đến ${max}.\nMỗi tờ phiếu = 1 trang giấy (2 liên).\n\nNhấn OK để bắt đầu tạo lệnh in.`;
    if (!confirm(confirmMsg)) return;

    // 1. Render toàn bộ phiếu ra vùng in ẩn
    const printContainer = document.getElementById('print-container');
    printContainer.innerHTML = '';
    const data = getData();

    // Dùng DocumentFragment để tối ưu hiệu năng khi render nhiều phiếu
    const fragment = document.createDocumentFragment();
    const wrapper = document.createElement('div');

    let allPagesHTML = '';
    for (let i = min; i <= max; i++) {
        allPagesHTML += getVoucherTemplate(data, i, paperSize, settings, orientation);
    }
    wrapper.innerHTML = allPagesHTML;

    // Di chuyển các node thay vì innerHTML trực tiếp
    while (wrapper.firstChild) {
        fragment.appendChild(wrapper.firstChild);
    }
    printContainer.appendChild(fragment);

    // 2. Lưu config
    saveConfig(max);

    // 3. Inject dynamic @page CSS cho đúng khổ giấy + hướng
    const styleId = 'dynamic-print-style';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
    }

    // Kích thước @page: landscape = rộng x cao, portrait = hẹp x dài
    const pageSizes = {
        A5: { landscape: '210mm 148mm', portrait: '148mm 210mm' },
        A6: { landscape: '148mm 105mm', portrait: '105mm 148mm' },
    };
    const pageSize = pageSizes[paperSize]?.[orientation] || pageSizes.A5.portrait;
    styleEl.textContent = `@media print { @page { size: ${pageSize}; margin: 0; } }`;

    // 4. Gọi lệnh in (chờ DOM render xong)
    setTimeout(() => {
        window.print();
    }, 300);
}

function resetConfig() {
    if(confirm('Xóa toàn bộ cấu hình đã lưu và đưa về mặc định?')) {
        localStorage.removeItem(CONFIG_KEY);
        location.reload();
    }
}

function changePaperSize() {
    updatePreview();
}

// Thêm listener cho maxNum để cập nhật số lượng
document.getElementById('maxNum').addEventListener('input', function() {
    const min = parseInt(document.getElementById('minNum').value) || 1;
    const max = parseInt(this.value) || 1;
    const total = Math.max(0, max - min + 1);
    document.getElementById('totalCount').textContent = total;
    autoSaveConfig();
});

window.onload = loadConfig;
