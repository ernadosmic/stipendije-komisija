// Global variables to store current values
let currentValues = {
    averageGrade: 0,
    u4: 0,
    v4: 0,
    w4: 0,
    // Socio-economic status values
    householdMembers: 0,
    grade1: 0, grade2: 0, grade3: 0, // Mama I, II, III
    grade4: 0, grade5: 0, grade6: 0, // Tata I, II, III
    grade7: 0, // Baka/Sestra/Brat
    categories: {
        y4: false, z4: false, aa4: false, ab4: false,
        ac4: false, ad4: false, ae4: false, af4: false
    },
    ah4: 0,
    zavrsneKategorije: 'none' // Changed from aj4/ak4 to single field
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    // Store original placeholders for income fields
    ['grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6', 'grade7'].forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            field.setAttribute('data-original-placeholder', field.placeholder);
        }
    });

    setupEventListeners();

    // Initialize radio button states
    initializeRadioButtonStates();

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

// Initialize radio button states on page load
function initializeRadioButtonStates() {
    const radioGroups = [
        { group: 'mama1-radio', field: 'grade1' },
        { group: 'mama2-radio', field: 'grade2' },
        { group: 'mama3-radio', field: 'grade3' },
        { group: 'tata1-radio', field: 'grade4' },
        { group: 'tata2-radio', field: 'grade5' },
        { group: 'tata3-radio', field: 'grade6' }
    ];

    radioGroups.forEach(({ group, field }) => {
        const selectedRadio = document.querySelector(`input[name="${group}"]:checked`);
        if (selectedRadio) {
            handleRadioButtonChange(group, field);
        }
    });
}

function setupEventListeners() {
    // Basic information
    document.getElementById('average-grade').addEventListener('input', handleAverageGrade);

    // Socio-economic status inputs
    document.getElementById('household-members').addEventListener('input', handleSocioEconomic);
    ['grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6', 'grade7'].forEach(id => {
        document.getElementById(id).addEventListener('input', handleSocioEconomic);
    });

    // Radio button event listeners for income fields
    const radioGroups = [
        { group: 'mama1-radio', field: 'grade1' },
        { group: 'mama2-radio', field: 'grade2' },
        { group: 'mama3-radio', field: 'grade3' },
        { group: 'tata1-radio', field: 'grade4' },
        { group: 'tata2-radio', field: 'grade5' },
        { group: 'tata3-radio', field: 'grade6' }
    ];

    radioGroups.forEach(({ group, field }) => {
        const radios = document.querySelectorAll(`input[name="${group}"]`);
        radios.forEach(radio => {
            radio.addEventListener('change', () => handleRadioButtonChange(group, field));
        });
    });

    // Additional criteria
    document.getElementById('u4').addEventListener('input', handleAdditionalCriteria);
    document.getElementById('v4').addEventListener('input', handleAdditionalCriteria);
    document.getElementById('w4').addEventListener('input', handleAdditionalCriteria);

    // Categories - Convert to radio button group
    const categoryRadios = document.querySelectorAll('input[name="porodicne-prilike"]');
    categoryRadios.forEach(radio => {
        radio.addEventListener('change', handleCategoriesRadio);
    });

    // Rating
    document.getElementById('ah4').addEventListener('change', handleRating);

    // Final categories - Update to handle radio button group
    const zavrsneRadios = document.querySelectorAll('input[name="zavrsne-kategorije"]');
    zavrsneRadios.forEach(radio => {
        radio.addEventListener('change', handleFinalCategories);
    });

    // Add event listener for generate table row button
    document.getElementById('generate-table-row').addEventListener('click', generateTableRow);
    document.getElementById('copy-table-row').addEventListener('click', copyTableRow);
}

// Function to generate table row
function generateTableRow() {
    // Get basic form values
    const brojPredmeta = document.getElementById('subject-number')?.value || '';
    const prezime = document.getElementById('surname')?.value || '';
    const imeOca = document.getElementById('father-name')?.value || '';
    const ime = document.getElementById('name')?.value || '';
    const nacionalnostFull = document.getElementById('nationality')?.value || '';
    const nacionalnost = nacionalnostFull.charAt(0).toUpperCase(); // Get first letter and make it uppercase
    const brojTelefona = document.getElementById('phone')?.value || '';
    const nazivFakulteta = document.getElementById('faculty')?.value || '';
    const prosjekOcjena = (document.getElementById('average-grade')?.value || '').replace('.', ','); // Transform . to ,
    const gradePoints = document.getElementById('grade-points')?.textContent.replace('Bodovi: ', '') || '';

    // Get household and income data
    const brojClanova = document.getElementById('household-members')?.value || '';
    const mamaI = document.getElementById('grade1')?.value || '';
    const mamaII = document.getElementById('grade2')?.value || '';
    const mamaIII = document.getElementById('grade3')?.value || '';
    const tataI = document.getElementById('grade4')?.value || '';
    const tataII = document.getElementById('grade5')?.value || '';
    const tataIII = document.getElementById('grade6')?.value || '';
    const baka = document.getElementById('grade7')?.value || '';

    // Get R4, S4, T4 values - also transform decimals to commas
    const r4 = (document.getElementById('total-average')?.textContent.replace('Prosjek: ', '').replace('—', '') || '').replace('.', ',');
    const s4 = (document.getElementById('ratio')?.textContent.replace('Prosjek / Broj članova: ', '').replace('—', '') || '').replace('.', ',');
    const t4 = document.getElementById('total-t4')?.textContent || '';

    // Get additional criteria
    const osnovna = document.getElementById('u4')?.value || '';
    const srednja = document.getElementById('v4')?.value || '';
    const fakultet = document.getElementById('w4')?.value || '';
    const x4 = (document.getElementById('total-x4')?.textContent || '').replace('.', ',');

    // Get category selections (porodične prilike) - put 1 for selected, 0 for not selected
    const selectedCategory = document.querySelector('input[name="porodicne-prilike"]:checked');
    const categoryValue = selectedCategory ? selectedCategory.value : 'none';

    const bezObaRoditelja = categoryValue === 'y4' ? '1' : '0';
    const bezJednogRoditelja = categoryValue === 'z4' ? '1' : '0';
    const ratnihVojnihInvalida = categoryValue === 'aa4' ? '1' : '0';
    const invalidiRada = categoryValue === 'ab4' ? '1' : '0';
    const civilneZrtve = categoryValue === 'ac4' ? '1' : '0';
    const rastavljenih = categoryValue === 'ad4' ? '1' : '0';
    const bracnaZajednica = categoryValue === 'ae4' ? '1' : '0';
    const studentRoditelj = categoryValue === 'af4' ? '1' : '0';

    const ag4 = document.getElementById('total-ag4')?.textContent || '';

    // Get year of study
    const godinaStudija = document.getElementById('ah4')?.value || '';
    const ai4 = document.getElementById('total-ai4')?.textContent || '';

    // Get final categories (završne kategorije) - put 1 for selected, 0 for not selected
    const selectedZavrsne = document.querySelector('input[name="zavrsne-kategorije"]:checked');
    const zavrsneValue = selectedZavrsne ? selectedZavrsne.value : 'none';

    const budzet = zavrsneValue === 'aj4' ? '1' : '0';
    const sufinansira = zavrsneValue === 'ak4' ? '1' : '0';

    const al4 = document.getElementById('total-al4')?.textContent || '';
    const am4 = (document.getElementById('final-total')?.textContent || '').replace('.', ','); // Transform final total as well

    // Get notes
    const napomene = document.getElementById('napomena')?.value || '';

    // Format the full name as "prezime (ime oca) i ime"
    const fullName = `${prezime} (${imeOca}) ${ime}`;

    // Create table row with TAB separators for Excel compatibility
    const tableRow = [
        brojPredmeta,                    // Broj predmeta
        brojPredmeta,                    // Broj predmeta (duplicate)
        fullName,                        // prezime (ime oca) i ime
        nacionalnost,                    // nacionalnost (first letter only, uppercase)
        brojTelefona,                    // broj telefona
        nazivFakulteta,                  // Naziv fakulteta
        prosjekOcjena,                   // prosjek ocjena (with comma)
        gradePoints,                     // grade-points
        brojClanova,                     // broj članova domaćinstva
        mamaI,                           // mama i
        mamaII,                          // mama ii
        mamaIII,                         // mama iii
        tataI,                           // tata i
        tataII,                          // tata ii
        tataIII,                         // tata iii
        baka,                            // baka
        r4,                              // R4 (with comma)
        s4,                              // S4 (with comma)
        t4,                              // T4
        osnovna,                         // osnovna
        srednja,                         // srednja
        fakultet,                        // fakultet
        x4,                              // X4 (with comma)
        bezObaRoditelja,                 // bez oba roditelja
        bezJednogRoditelja,              // bez jednog roditelja
        ratnihVojnihInvalida,            // ratnih vojnih invalida
        invalidiRada,                    // invalidi rada min 50%
        civilneZrtve,                    // civilne žrtve i logoraši
        rastavljenih,                    // rastavljenih ili razvedeni
        bracnaZajednica,                 // student koji je u bračnoj zajednici
        studentRoditelj,                 // student koji je roditelj
        ag4,                             // AG4
        godinaStudija,                   // godina studija
        ai4,                             // AI4
        budzet,                          // BUDŽET
        sufinansira,                     // SUFINANSIRA
        al4,                             // AL4
        am4,                             // AM4 (with comma)
        napomene                         // Napomene
    ].join('\t');

    // Display the result
    document.getElementById('table-row-text').value = tableRow;
    document.getElementById('table-row-output').style.display = 'block';

    // Show success notification
    showNotification('Kompletan red tabele je generiran za Excel!');
}

// Function to copy table row to clipboard
function copyTableRow() {
    const textArea = document.getElementById('table-row-text');
    textArea.select();
    textArea.setSelectionRange(0, 99999); // For mobile devices

    try {
        document.execCommand('copy');
        showNotification('Red tabele je kopiran u clipboard!');
    } catch (err) {
        // Fallback for modern browsers
        navigator.clipboard.writeText(textArea.value).then(() => {
            showNotification('Red tabele je kopiran u clipboard!');
        }).catch(() => {
            showNotification('Greška pri kopiranju!');
        });
    }
}

// New handler for category radio buttons
function handleCategoriesRadio() {
    // Reset all categories to false
    const categories = ['y4', 'z4', 'aa4', 'ab4', 'ac4', 'ad4', 'ae4', 'af4'];
    categories.forEach(cat => {
        currentValues.categories[cat] = false;
    });

    // Set the selected category to true
    const selectedRadio = document.querySelector('input[name="porodicne-prilike"]:checked');
    if (selectedRadio && selectedRadio.value !== 'none') {
        currentValues.categories[selectedRadio.value] = true;
    }

    calculateAll();
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
    // Since only one category can be selected now, check in priority order
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

    if (rating === 1) return 0;
    if (rating === 2) return 5;
    if (rating === 3) return 10;
    if (rating === 4) return 15;
    if (rating === 5) return 20;
    if (rating === 6) return 25;

    return 0;
}

// AL4 Function: Final category points
function calculateAL4(zavrsneKategorije) {
    switch (zavrsneKategorije) {
        case 'aj4': return 30; // BUDŽET
        case 'ak4': return 25; // SUFINANSIRA
        case 'none':
        default: return 0; // Bez kategorije (Privatni fakultet)
    }
}

// R4 Function: Average income calculation (Prosjek)
function calculateR4(grade1, grade2, grade3, grade4, grade5, grade6, grade7) {
    // Check if any value is empty (matching Excel OR condition)
    const values = [grade1, grade2, grade3, grade4, grade5, grade6, grade7];
    const hasEmptyValue = values.some(val => val === '' || val === null || val === undefined);

    if (hasEmptyValue) {
        return null; // Return null to indicate empty result (like Excel's "")
    }

    // Convert to numbers for calculation
    const g1 = parseFloat(grade1) || 0;
    const g2 = parseFloat(grade2) || 0;
    const g3 = parseFloat(grade3) || 0;
    const g4 = parseFloat(grade4) || 0;
    const g5 = parseFloat(grade5) || 0;
    const g6 = parseFloat(grade6) || 0;
    const g7 = parseFloat(grade7) || 0;

    // Calculate AVERAGE(K4:M4) + AVERAGE(N4:P4) + Q4
    const mamaAverage = (g1 + g2 + g3) / 3;
    const tataAverage = (g4 + g5 + g6) / 3;
    const bakaValue = g7;

    return mamaAverage + tataAverage + bakaValue;
}

// S4 Function: Average per household member (Prosjek / Broj članova)
function calculateS4(r4, householdMembers) {
    if (r4 === null || !householdMembers || householdMembers === 0) {
        return null; // Return null if R4 is empty or no household members
    }
    return r4 / householdMembers;
}

// T4 Function: Economic status points (Bodovi za ekonomski status)
function calculateT4(s4) {
    if (s4 === null) {
        return 0; // Return 0 instead of null when S4 is empty (matches Excel)
    }

    if (s4 >= 0 && s4 <= 100) {
        return 15;
    } else if (s4 > 100 && s4 <= 300) {
        return 10;
    } else if (s4 > 300 && s4 <= 500) {
        return 5;
    } else {
        return 0;
    }
}

// Event handlers
function handleAverageGrade() {
    currentValues.averageGrade = parseFloat(this.value) || 0;
    calculateAll();
}

function handleAdditionalCriteria() {
    currentValues.u4 = parseFloat(document.getElementById('u4').value) || '';
    currentValues.v4 = parseFloat(document.getElementById('v4').value) || '';
    currentValues.w4 = parseFloat(document.getElementById('w4').value) || 0;
    calculateAll();
}

function handleSocioEconomic() {
    // Update current values - preserve empty strings as empty, don't convert to 0
    currentValues.householdMembers = parseInt(document.getElementById('household-members').value) || 0;

    const getValue = (id) => {
        const field = document.getElementById(id);
        const val = field.value;

        // If field is disabled and empty, preserve the empty string for calculation logic
        if (field.disabled && val === '') {
            return '';
        }

        return val === '' ? '' : parseFloat(val) || 0;
    };

    currentValues.grade1 = getValue('grade1');
    currentValues.grade2 = getValue('grade2');
    currentValues.grade3 = getValue('grade3');
    currentValues.grade4 = getValue('grade4');
    currentValues.grade5 = getValue('grade5');
    currentValues.grade6 = getValue('grade6');
    currentValues.grade7 = getValue('grade7');

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
    const selectedRadio = document.querySelector('input[name="zavrsne-kategorije"]:checked');
    currentValues.zavrsneKategorije = selectedRadio ? selectedRadio.value : 'none';
    calculateAll();
}

// Handle radio button changes for income fields
function handleRadioButtonChange(radioGroup, fieldId) {
    const selectedRadio = document.querySelector(`input[name="${radioGroup}"]:checked`);
    const inputField = document.getElementById(fieldId);

    if (!selectedRadio || !inputField) return;

    const selectedValue = selectedRadio.value;

    // Synchronize radio buttons within the same parent group
    synchronizeRadioGroups(radioGroup, selectedValue);

    switch (selectedValue) {
        case 'platne':
            // Enable field for user input
            inputField.disabled = false;
            inputField.style.backgroundColor = '';
            inputField.placeholder = inputField.getAttribute('data-original-placeholder') || inputField.placeholder;
            break;

        case '0':
            // Lock field and set to 0
            inputField.disabled = true;
            inputField.value = '0';
            inputField.style.backgroundColor = '#f8f9fa';
            inputField.placeholder = 'Automatski postavljeno na 0';
            break;

        case 'blank':
            // Lock field and set to empty
            inputField.disabled = true;
            inputField.value = '';
            inputField.style.backgroundColor = '#f8f9fa';
            inputField.placeholder = 'Polje zaključano - nedostaju dokumenti';
            break;
    }

    // Trigger recalculation
    handleSocioEconomic();
}

// New function to synchronize radio buttons within parent groups
function synchronizeRadioGroups(changedGroup, selectedValue) {
    // Define parent groups
    const mamaGroups = ['mama1-radio', 'mama2-radio', 'mama3-radio'];
    const tataGroups = ['tata1-radio', 'tata2-radio', 'tata3-radio'];
    const fieldMappings = {
        'mama1-radio': 'grade1',
        'mama2-radio': 'grade2',
        'mama3-radio': 'grade3',
        'tata1-radio': 'grade4',
        'tata2-radio': 'grade5',
        'tata3-radio': 'grade6'
    };

    let groupsToSync = [];

    // Determine which groups to synchronize
    if (mamaGroups.includes(changedGroup)) {
        groupsToSync = mamaGroups;
    } else if (tataGroups.includes(changedGroup)) {
        groupsToSync = tataGroups;
    }

    // Synchronize all groups in the same parent category
    groupsToSync.forEach(groupName => {
        if (groupName !== changedGroup) {
            // Set the radio button to the same value
            const radioToSelect = document.querySelector(`input[name="${groupName}"][value="${selectedValue}"]`);
            if (radioToSelect) {
                radioToSelect.checked = true;

                // Apply the same field changes
                const fieldId = fieldMappings[groupName];
                const inputField = document.getElementById(fieldId);

                if (inputField) {
                    switch (selectedValue) {
                        case 'platne':
                            inputField.disabled = false;
                            inputField.style.backgroundColor = '';
                            inputField.placeholder = inputField.getAttribute('data-original-placeholder') || inputField.placeholder;
                            break;
                        case '0':
                            inputField.disabled = true;
                            inputField.value = '0';
                            inputField.style.backgroundColor = '#f8f9fa';
                            inputField.placeholder = 'Automatski postavljeno na 0';
                            break;
                        case 'blank':
                            inputField.disabled = true;
                            inputField.value = '';
                            inputField.style.backgroundColor = '#f8f9fa';
                            inputField.placeholder = 'Polje zaključano - nedostaju dokumenti';
                            break;
                    }
                }
            }
        }
    });
}

// --- DOKUMENTI CHECK ---
function updateNapomena() {
    const izjava = document.getElementById('doc-izjava').checked;
    const rodniList = document.getElementById('doc-rodni-list').checked;
    let missing = [];
    if (!izjava) missing.push('Izjava o neprimanju stipendija');
    if (!rodniList) missing.push('Rodni list (ukoliko mjesto rođenja nije Brčko)');
    const napomena = document.getElementById('napomena');
    if (missing.length === 0) {
        napomena.value = '';
    } else {
        napomena.value = 'Nedostaju dokumenti: ' + missing.join(', ');
    }
}

document.getElementById('doc-izjava').addEventListener('change', updateNapomena);
document.getElementById('doc-rodni-list').addEventListener('change', updateNapomena);
window.addEventListener('DOMContentLoaded', updateNapomena);

// Main calculation function
function calculateAll() {
    // Calculate I4 (Grade points)
    const i4 = calculateI4(currentValues.averageGrade);
    document.getElementById('grade-points').textContent = `Bodovi: ${i4.toFixed(2)}`;
    document.getElementById('total-i4').textContent = i4.toFixed(2);

    // Calculate X4 (Additional criteria points)
    const x4 = calculateX4(currentValues.u4, currentValues.v4, currentValues.w4);
    document.getElementById('x4-points').textContent = `Bodovi: ${x4.toFixed(2)}`;
    document.getElementById('total-x4').textContent = x4.toFixed(2);

    // Calculate AG4 (Category points)
    const ag4 = calculateAG4(currentValues.categories);
    document.getElementById('ag4-points').textContent = `Bodovi: ${ag4}`;
    document.getElementById('total-ag4').textContent = ag4.toString();

    // Calculate AI4 (Rating points)
    const ai4 = calculateAI4(currentValues.ah4);
    const ai4Display = ai4 === "Greška" ? ai4 : ai4.toString();
    document.getElementById('ai4-points').textContent = `Bodovi: ${ai4Display}`;
    document.getElementById('total-ai4').textContent = ai4Display;

    // Calculate AL4 (Final category points) - Updated to use new structure
    const al4 = calculateAL4(currentValues.zavrsneKategorije);
    document.getElementById('al4-points').textContent = `Bodovi: ${al4}`;
    document.getElementById('total-al4').textContent = al4.toString();    // Calculate R4, S4, T4 (Socio-economic status points)
    const r4 = calculateR4(currentValues.grade1, currentValues.grade2, currentValues.grade3, currentValues.grade4, currentValues.grade5, currentValues.grade6, currentValues.grade7);
    const s4 = calculateS4(r4, currentValues.householdMembers);
    const t4 = calculateT4(s4);

    // Display R4, S4, T4 values (using correct DOM element IDs)
    document.getElementById('total-average').textContent = `Prosjek: ${r4 === null ? '—' : r4.toFixed(2)}`;
    document.getElementById('ratio').textContent = `Prosjek / Broj članova: ${s4 === null ? '—' : s4.toFixed(2)}`;
    document.getElementById('ratio-points').textContent = `Bodovi za ekonomski status: ${t4}`;

    // Update the breakdown display for T4 (T4 is always a number, never null)
    document.getElementById('total-t4').textContent = t4.toString();

    // Calculate AM (Final total) - T4 is always a number now
    const ai4Numeric = ai4 === "Greška" ? 0 : ai4;
    const am = i4 + x4 + ag4 + ai4Numeric + al4 + t4;
    document.getElementById('final-total').textContent = am.toFixed(2);

    // Apply error styling if there's an error
    const ai4Element = document.getElementById('ai4-points');
    if (ai4 === "Greška") {
        ai4Element.classList.add('error');
    } else {
        ai4Element.classList.remove('error');
    }
}

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

// Remove the duplicate export button event listener (lines 497-507) and keep only the one in the DOMContentLoaded event

// Add the missing getCategoryLabel function:
function getCategoryLabel(categoryValue) {
    const labels = {
        'y4': 'Bez oba roditelja',
        'z4': 'Bez jednog roditelja',
        'aa4': 'Ratnih vojnih invalida od 1. do 10.kategorije',
        'ab4': 'Invalidi rada min 50%',
        'ac4': 'Civilne žrtve i logoraši',
        'ad4': 'Rastavljenih ili razvedeni',
        'ae4': 'Student koji je u bračnoj zajednici',
        'af4': 'Student koji je roditelj',
        'none': 'Bez kategorije'
    };
    return labels[categoryValue] || '';
}
