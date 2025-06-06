// Utility functions and helpers

function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text);
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            textArea.remove();
        }
    } catch (err) {
        console.error('Failed to copy to clipboard:', err);
    }
}

function downloadExcelFile(headers, dataValues, studentName) {
    try {
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_');
        const cleanName = studentName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
        const filename = `stipendija_${cleanName}_${timestamp}.xlsx`;
        const wsData = [headers, dataValues];
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const colWidths = headers.map(() => ({ wch: 15 }));
        ws['!cols'] = colWidths;
        XLSX.utils.book_append_sheet(wb, ws, 'Stipendija');
        XLSX.writeFile(wb, filename);
    } catch (err) {
        console.error('Failed to create Excel file:', err);
        showNotification('Greška pri kreiranju Excel fajla!');
    }
}

function formatNumber(num, decimals = 2) {
    return Number(num).toFixed(decimals);
}

function validateInput(value, min = null, max = null) {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    if (min !== null && num < min) return false;
    if (max !== null && num > max) return false;
    return true;
}

function showNotification(message) {
    let toast = document.getElementById('copilot-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'copilot-toast';
        toast.className = 'toast align-items-center text-bg-success border-0 position-fixed top-0 start-50 translate-middle-x mt-4';
        toast.style.zIndex = 9999;
        toast.style.minWidth = '220px';
        toast.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div></div>`;
        document.body.appendChild(toast);
    } else {
        toast.querySelector('.toast-body').textContent = message;
    }
    const bsToast = bootstrap.Toast.getOrCreateInstance(toast, { delay: 4200 });
    bsToast.show();
}
