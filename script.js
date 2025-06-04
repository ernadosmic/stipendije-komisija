// Global variables to store current values
let currentValues = {
    averageGrade: 0,
    grades: [0, 0, 0, 0, 0, 0, 0],
    credits: 0,
    u4: 0,
    v4: 0,
    w4: 0,
    categories: {
        y4: false, z4: false, aa4: false, ab4: false,
        ac4: false, ad4: false, ae4: false, af4: false
    },
    ah4: 0,
    aj4: false,
    ak4: false
};

// Global array to store all entries before export
let allEntries = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    calculateAll();

    // JMBG validation
    const jmbgInput = document.getElementById('jmbg');
    if (jmbgInput) {
        jmbgInput.addEventListener('input', function () {
            const val = jmbgInput.value;
            if (/^\d{13}$/.test(val)) {
                jmbgInput.classList.remove('is-invalid', 'warning');
            } else {
                jmbgInput.classList.add('is-invalid', 'warning');
            }
        });
    }
});

function setupEventListeners() {
    // Basic information
    document.getElementById('average-grade').addEventListener('input', handleAverageGrade);
    document.getElementById('credits').addEventListener('input', handleCredits);

    // Faculty field (optional, no calculation needed)
    if (document.getElementById('faculty')) {
        document.getElementById('faculty').addEventListener('input', function () {
            // Faculty is just for display, no calculation needed
        });
    }

    // Subject grades
    for (let i = 1; i <= 7; i++) {
        document.getElementById(`grade${i}`).addEventListener('input', handleGrades);
    }

    // Additional criteria
    document.getElementById('u4').addEventListener('input', handleAdditionalCriteria);
    document.getElementById('v4').addEventListener('input', handleAdditionalCriteria);
    document.getElementById('w4').addEventListener('input', handleAdditionalCriteria);

    // Categories
    const categories = ['y4', 'z4', 'aa4', 'ab4', 'ac4', 'ad4', 'ae4', 'af4'];
    categories.forEach(cat => {
        document.getElementById(cat).addEventListener('change', handleCategories);
    });

    // Rating
    document.getElementById('ah4').addEventListener('change', handleRating);

    // Final categories
    document.getElementById('aj4').addEventListener('change', handleFinalCategories);
    document.getElementById('ak4').addEventListener('change', handleFinalCategories);
}

// I4 Function: Grade points calculation
function calculateI4(averageGrade) {
    const h4 = averageGrade;

    if (h4 >= 6 && h4 <= 10) {
        return h4 * 2;
    } else if (h4 >= 2 && h4 <= 3.12) {
        return ((10 + 4 * h4) / 3) * 2;
    } else if (h4 >= 3.122 && h4 <= 3.5) {
        return ((10 + 4 * h4) / 3) * 2;
    } else if (h4 >= 3.507 && h4 <= 3.867) {
        return ((10 + 4 * h4) / 3) * 2;
    } else if (h4 >= 3.87 && h4 <= 4.25) {
        return ((10 + 4 * h4) / 3) * 2;
    } else if (h4 >= 4.257 && h4 <= 4.617) {
        return ((10 + 4 * h4) / 3) * 2;
    } else if (h4 >= 4.62 && h4 <= 5) {
        return ((10 + 4 * h4) / 3) * 2;
    }
    return 0;
}

// R4 Function: Average calculation
function calculateR4(grades) {
    // Check if any grade is empty
    const validGrades = grades.filter(grade => grade !== null && grade !== undefined && grade !== '');
    if (validGrades.length !== grades.length) {
        return null;
    }

    const firstGroup = grades.slice(0, 3);
    const secondGroup = grades.slice(3, 6);
    const seventhGrade = grades[6];

    const avgFirst = firstGroup.reduce((sum, grade) => sum + parseFloat(grade || 0), 0) / firstGroup.length;
    const avgSecond = secondGroup.reduce((sum, grade) => sum + parseFloat(grade || 0), 0) / secondGroup.length;

    return avgFirst + avgSecond + parseFloat(seventhGrade || 0);
}

// S4 Function: Ratio calculation
function calculateS4(r4, credits) {
    if (r4 === null || r4 === '' || credits === 0) {
        return null;
    }
    return r4 / credits;
}

// T4 Function: Ratio points
function calculateT4(s4) {
    if (s4 === null || s4 === '') {
        return 0;
    }

    if (s4 >= 0 && s4 <= 100) {
        return 15;
    } else if (s4 > 100 && s4 <= 300) {
        return 10;
    } else if (s4 > 300 && s4 <= 500) {
        return 5;
    }
    return 0;
}

// X4 Function: Additional criteria points
function calculateX4(u4, v4, w4) {
    let result = 0;

    if (u4 !== '' && u4 !== null && u4 !== undefined) {
        result += parseFloat(u4) * 2;
    }

    if (v4 !== '' && v4 !== null && v4 !== undefined) {
        result += parseFloat(v4) * 2.5;
    }

    result += parseFloat(w4 || 0) * 3;

    return result;
}

// AG4 Function: Category points
function calculateAG4(categories) {
    if (categories.y4) return 50;
    if (categories.z4) return 25;
    if (categories.aa4) return 20;
    if (categories.ab4) return 15;
    if (categories.ac4) return 10;
    if (categories.ad4) return 5;
    if (categories.ae4) return 10;
    if (categories.af4) return 20;
    return 0;
}

// AI4 Function: Rating points
function calculateAI4(ah4) {
    const rating = parseInt(ah4);

    if (rating === 1) return "Greška";
    if (rating === 2) return 5;
    if (rating === 3) return 10;
    if (rating === 4) return 15;
    if (rating === 5) return 20;
    if (rating === 6) return 25;

    return 0;
}

// AL4 Function: Final category points
function calculateAL4(aj4, ak4) {
    if (aj4) return 30;
    if (ak4) return 25;
    return 0;
}

// Event handlers
function handleAverageGrade() {
    currentValues.averageGrade = parseFloat(this.value) || 0;
    calculateAll();
}

function handleCredits() {
    currentValues.credits = parseFloat(this.value) || 0;
    calculateAll();
}

function handleGrades() {
    for (let i = 0; i < 7; i++) {
        const gradeInput = document.getElementById(`grade${i + 1}`);
        currentValues.grades[i] = parseFloat(gradeInput.value) || '';
    }
    calculateAll();
}

function handleAdditionalCriteria() {
    currentValues.u4 = parseFloat(document.getElementById('u4').value) || '';
    currentValues.v4 = parseFloat(document.getElementById('v4').value) || '';
    currentValues.w4 = parseFloat(document.getElementById('w4').value) || 0;
    calculateAll();
}

function handleCategories() {
    const categories = ['y4', 'z4', 'aa4', 'ab4', 'ac4', 'ad4', 'ae4', 'af4'];
    categories.forEach(cat => {
        currentValues.categories[cat] = document.getElementById(cat).checked;
    });
    calculateAll();
}

function handleRating() {
    currentValues.ah4 = parseInt(this.value) || 0;
    calculateAll();
}

function handleFinalCategories() {
    currentValues.aj4 = document.getElementById('aj4').checked;
    currentValues.ak4 = document.getElementById('ak4').checked;
    calculateAll();
}

// Main calculation function
function calculateAll() {    // Calculate I4 (Grade points)
    const i4 = calculateI4(currentValues.averageGrade);
    document.getElementById('grade-points').textContent = `Bodovi: ${i4.toFixed(2)}`;
    document.getElementById('total-i4').textContent = i4.toFixed(2);

    // Calculate R4 (Total average)
    const r4 = calculateR4(currentValues.grades);
    const r4Display = r4 !== null ? r4.toFixed(2) : 'N/A';
    document.getElementById('total-average').textContent = `Ukupan prosjek (R4): ${r4Display}`;

    // Calculate S4 (Ratio)
    const s4 = calculateS4(r4, currentValues.credits);
    const s4Display = s4 !== null ? s4.toFixed(2) : 'N/A';
    document.getElementById('ratio').textContent = `Ratio (S4): ${s4Display}`;

    // Calculate T4 (Ratio points)
    const t4 = calculateT4(s4);
    document.getElementById('ratio-points').textContent = `Bodovi za ratio (T4): ${t4}`;
    document.getElementById('total-t4').textContent = t4.toString();

    // Calculate X4 (Additional criteria points)
    const x4 = calculateX4(currentValues.u4, currentValues.v4, currentValues.w4);
    document.getElementById('x4-points').textContent = `X4 Bodovi: ${x4.toFixed(2)}`;
    document.getElementById('total-x4').textContent = x4.toFixed(2);

    // Calculate AG4 (Category points)
    const ag4 = calculateAG4(currentValues.categories);
    document.getElementById('ag4-points').textContent = `AG4 Bodovi: ${ag4}`;
    document.getElementById('total-ag4').textContent = ag4.toString();

    // Calculate AI4 (Rating points)
    const ai4 = calculateAI4(currentValues.ah4);
    const ai4Display = ai4 === "Greška" ? ai4 : ai4.toString();
    document.getElementById('ai4-points').textContent = `AI4 Bodovi: ${ai4Display}`;
    document.getElementById('total-ai4').textContent = ai4Display;

    // Calculate AL4 (Final category points)
    const al4 = calculateAL4(currentValues.aj4, currentValues.ak4);
    document.getElementById('al4-points').textContent = `AL4 Bodovi: ${al4}`;
    document.getElementById('total-al4').textContent = al4.toString();    // Calculate AM (Final total)
    const ai4Numeric = ai4 === "Greška" ? 0 : ai4;
    const am = i4 + t4 + x4 + ag4 + ai4Numeric + al4;
    document.getElementById('final-total').textContent = am.toFixed(2);

    // Apply error styling if there's an error
    const ai4Element = document.getElementById('ai4-points');
    if (ai4 === "Greška") {
        ai4Element.classList.add('error');
    } else {
        ai4Element.classList.remove('error');
    }
}

// Excel export functionality
function exportToExcel() {
    // Collect all form values
    const data = [
        {
            'Broj predmeta': document.getElementById('subject-number').value,
            'JMBG': document.getElementById('jmbg').value,
            'Prezime': document.getElementById('surname').value,
            'Ime oca': document.getElementById('father-name').value,
            'Ime': document.getElementById('name').value,
            'Nacionalnost': document.getElementById('nationality').value,
            'Broj telefona': document.getElementById('phone').value,
            'Naziv fakulteta': document.getElementById('faculty').value,
            'Prosjek ocjena': document.getElementById('average-grade').value,
            'Mama I': document.getElementById('grade1').value,
            'Mama II': document.getElementById('grade2').value,
            'Mama III': document.getElementById('grade3').value,
            'Tata I': document.getElementById('grade4').value,
            'Tata II': document.getElementById('grade5').value,
            'Tata III': document.getElementById('grade6').value,
            'Baka/Sestra/Brat': document.getElementById('grade7').value,
            'Broj bodova/ECTS': document.getElementById('credits').value,
            'Posebna': document.getElementById('u4').value,
            'Invalida': document.getElementById('v4').value,
            'Fakultet (dodatno)': document.getElementById('w4').value,
            'Boračka': document.getElementById('y4').checked ? 'DA' : '',
            'Bez oba roditelja': document.getElementById('z4').checked ? 'DA' : '',
            'Vojnih invalida': document.getElementById('aa4').checked ? 'DA' : '',
            'Poginulih za oslobođenje': document.getElementById('ab4').checked ? 'DA' : '',
            'Mučenika': document.getElementById('ac4').checked ? 'DA' : '',
            'Ratnih vojnih invalida': document.getElementById('ad4').checked ? 'DA' : '',
            'Časnih žena i domobrana': document.getElementById('ae4').checked ? 'DA' : '',
            'Studenata koji polažu': document.getElementById('af4').checked ? 'DA' : '',
            'Godina studija': document.getElementById('ah4').value,
            'BUDŽET': document.getElementById('aj4').checked ? 'DA' : '',
            'SAMOFINANSIRANJE': document.getElementById('ak4').checked ? 'DA' : '',
            'Bodovi za Ocjene (I4)': document.getElementById('total-i4').textContent,
            'Bodovi za Ratio (T4)': document.getElementById('total-t4').textContent,
            'Dodatni Bodovi (X4)': document.getElementById('total-x4').textContent,
            'Bodovi za Kategorije (AG4)': document.getElementById('total-ag4').textContent,
            'Bodovi za Ocjenu (AI4)': document.getElementById('total-ai4').textContent,
            'Završni Bodovi (AL4)': document.getElementById('total-al4').textContent,
            'Ukupno Bodova (AM)': document.getElementById('final-total').textContent
        }
    ];

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stipendija');

    // Export to file
    XLSX.writeFile(wb, 'stipendija.xlsx');
}

// Collect form data
function collectFormData() {
    return {
        'Broj predmeta': document.getElementById('subject-number').value,
        'JMBG': document.getElementById('jmbg').value,
        'Prezime': document.getElementById('surname').value,
        'Ime oca': document.getElementById('father-name').value,
        'Ime': document.getElementById('name').value,
        'Nacionalnost': document.getElementById('nationality').value,
        'Broj telefona': document.getElementById('phone').value,
        'Naziv fakulteta': document.getElementById('faculty').value,
        'Prosjek ocjena': document.getElementById('average-grade').value,
        'Mama I': document.getElementById('grade1').value,
        'Mama II': document.getElementById('grade2').value,
        'Mama III': document.getElementById('grade3').value,
        'Tata I': document.getElementById('grade4').value,
        'Tata II': document.getElementById('grade5').value,
        'Tata III': document.getElementById('grade6').value,
        'Baka/Sestra/Brat': document.getElementById('grade7').value,
        'Broj bodova/ECTS': document.getElementById('credits').value,
        'Posebna': document.getElementById('u4').value,
        'Invalida': document.getElementById('v4').value,
        'Fakultet (dodatno)': document.getElementById('w4').value,
        'Boračka': document.getElementById('y4').checked ? 'DA' : '',
        'Bez oba roditelja': document.getElementById('z4').checked ? 'DA' : '',
        'Vojnih invalida': document.getElementById('aa4').checked ? 'DA' : '',
        'Poginulih za oslobođenje': document.getElementById('ab4').checked ? 'DA' : '',
        'Mučenika': document.getElementById('ac4').checked ? 'DA' : '',
        'Ratnih vojnih invalida': document.getElementById('ad4').checked ? 'DA' : '',
        'Časnih žena i domobrana': document.getElementById('ae4').checked ? 'DA' : '',
        'Studenata koji polažu': document.getElementById('af4').checked ? 'DA' : '',
        'Godina studija': document.getElementById('ah4').value,
        'BUDŽET': document.getElementById('aj4').checked ? 'DA' : '',
        'SAMOFINANSIRANJE': document.getElementById('ak4').checked ? 'DA' : '',
        'Bodovi za Ocjene (I4)': document.getElementById('total-i4').textContent,
        'Bodovi za Ratio (T4)': document.getElementById('total-t4').textContent,
        'Dodatni Bodovi (X4)': document.getElementById('total-x4').textContent,
        'Bodovi za Kategorije (AG4)': document.getElementById('total-ag4').textContent,
        'Bodovi za Ocjenu (AI4)': document.getElementById('total-ai4').textContent,
        'Završni Bodovi (AL4)': document.getElementById('total-al4').textContent,
        'Ukupno Bodova (AM)': document.getElementById('final-total').textContent
    };
}

function resetForm() {
    const ids = [
        'subject-number', 'jmbg', 'surname', 'father-name', 'name', 'nationality', 'phone', 'faculty', 'average-grade',
        'grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6', 'grade7', 'credits', 'u4', 'v4', 'w4'
    ];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (el.type === 'checkbox') el.checked = false;
            else el.value = '';
        }
    });
    // Reset selects
    const ah4 = document.getElementById('ah4');
    if (ah4) ah4.value = '';
    // Reset checkboxes
    ['y4', 'z4', 'aa4', 'ab4', 'ac4', 'ad4', 'ae4', 'af4', 'aj4', 'ak4'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.checked = false;
    });
    calculateAll();
}

function exportAllEntriesToExcel() {
    if (allEntries.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(allEntries);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stipendija');
    XLSX.writeFile(wb, 'stipendija.xlsx');
}

// --- TEMPORARY SAVE/LOAD SESSION ---
// Download allEntries as JSON
function saveSessionToFile() {
    if (allEntries.length === 0) return;
    const dataStr = JSON.stringify(allEntries, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
    const filename = `stipendija_sesija_${dateStr}.json`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Load session from JSON file and merge into allEntries
function loadSessionFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const loaded = JSON.parse(e.target.result);
            if (Array.isArray(loaded)) {
                allEntries = allEntries.concat(loaded);
                alert('Sesija uspješno učitana! Možete nastaviti unos.');
            } else {
                alert('Neispravan format datoteke.');
            }
        } catch (err) {
            alert('Greška pri učitavanju sesije.');
        }
        // Reset file input so same file can be loaded again if needed
        event.target.value = '';
    };
    reader.readAsText(file);
}

window.addEventListener('DOMContentLoaded', function () {
    const btnFinish = document.getElementById('export-excel-finish');
    const btnAppend = document.getElementById('export-excel-append');
    const btnLoadSession = document.getElementById('load-session');
    const inputLoadSession = document.getElementById('load-session-input');
    if (btnFinish) {
        btnFinish.addEventListener('click', function () {
            allEntries.push(collectFormData());
            exportAllEntriesToExcel();
            // Disable all inputs to end session
            document.querySelectorAll('input, select, button').forEach(el => {
                if (el.id !== 'export-excel-finish' && el.id !== 'export-excel-append') el.disabled = true;
            });
        });
    }
    if (btnAppend) {
        btnAppend.addEventListener('click', function () {
            allEntries.push(collectFormData());
            resetForm();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showNotification('Unos je sačuvan!');
            saveSessionToFile(); // Save session automatically
        });
    }
    if (btnLoadSession && inputLoadSession) {
        btnLoadSession.addEventListener('click', function () {
            inputLoadSession.click();
        });
        inputLoadSession.addEventListener('change', loadSessionFromFile);
    }
});

// Utility functions
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

// Utility: show notification
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
    const bsToast = bootstrap.Toast.getOrCreateInstance(toast, { delay: 1800 });
    bsToast.show();
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateI4,
        calculateR4,
        calculateS4,
        calculateT4,
        calculateX4,
        calculateAG4,
        calculateAI4,
        calculateAL4
    };
}
