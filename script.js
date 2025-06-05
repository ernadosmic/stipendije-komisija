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

    // Add required field functionality
    addRequiredFieldStyles();
    setupRequiredFieldListeners();

    // Initial highlight check
    setTimeout(highlightRequiredFields, 100);

    const facultySelect = document.getElementById('faculty');
    const customFacultyToggle = document.getElementById('custom-faculty-toggle');
    const customFaculty = document.getElementById('custom-faculty');
    const facultyExtra = document.getElementById('faculty-extra');
    const facultyCombined = document.getElementById('faculty-combined');

    function updateFacultyCombined() {
        let faculty = customFacultyToggle.checked ? customFaculty.value.trim() : facultySelect.value;
        let extra = facultyExtra.value.trim();
        facultyCombined.value = extra ? `${faculty} - ${extra}` : faculty;
    }

    customFacultyToggle.addEventListener('change', function () {
        if (this.checked) {
            facultySelect.style.display = 'none';
            customFaculty.style.display = '';
        } else {
            facultySelect.style.display = '';
            customFaculty.style.display = 'none';
        }
        updateFacultyCombined();
    });

    facultySelect.addEventListener('change', updateFacultyCombined);
    customFaculty.addEventListener('input', updateFacultyCombined);
    facultyExtra.addEventListener('input', updateFacultyCombined);
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

    // Add new button event listeners
    document.getElementById('clear-form').addEventListener('click', clearForm);
    document.getElementById('populate-random').addEventListener('click', populateRandomData);
}

// Function to generate table row
function generateTableRow() {
    // Check if all required fields are filled
    const requiredFieldsEmpty = checkRequiredFields();

    if (requiredFieldsEmpty.length > 0) {
        highlightRequiredFields();
        showNotification(`Molimo popunite sva obavezna polja: ${requiredFieldsEmpty.join(', ')}`);
        return;
    }

    // Clear highlighting before generating
    clearRequiredFieldHighlighting();

    // Get all the form values
    const brojPredmeta = document.getElementById('subject-number')?.value || '';
    const jmbg = document.getElementById('jmbg')?.value || '';
    const prezime = document.getElementById('surname')?.value || '';
    const imeOca = document.getElementById('father-name')?.value || '';
    const ime = document.getElementById('name')?.value || '';
    const nacionalnostFull = document.getElementById('nationality')?.value || '';
    const nacionalnost = nacionalnostFull.charAt(0).toUpperCase();
    const brojTelefona = document.getElementById('phone')?.value || '';
    const nazivFakulteta = document.getElementById('faculty-combined')?.value || '';
    const prosjekOcjena = (document.getElementById('average-grade')?.value || '').replace('.', ',');
    const gradePoints = (document.getElementById('grade-points')?.textContent.replace('Bodovi: ', '') || '').replace('.', ','); // Convert . to ,

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

    // Get category selections
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
    const godinaStudija = document.getElementById('ah4')?.value || '';
    const ai4 = document.getElementById('total-ai4')?.textContent || '';

    // Get final categories
    const selectedZavrsne = document.querySelector('input[name="zavrsne-kategorije"]:checked');
    const zavrsneValue = selectedZavrsne ? selectedZavrsne.value : 'none';

    const budzet = zavrsneValue === 'aj4' ? '1' : '0';
    const sufinansira = zavrsneValue === 'ak4' ? '1' : '0';

    const al4 = document.getElementById('total-al4')?.textContent || '';
    const am4 = (document.getElementById('final-total')?.textContent || '').replace('.', ',');
    const napomene = document.getElementById('napomena')?.value || '';

    const fullName = `${prezime} (${imeOca}) ${ime}`;

    // Define headers and data arrays - UPDATE to include JMBG instead of duplicate
    const headers = [
        'Broj predmeta', 'JMBG', 'Puno ime', 'Nac.', 'Telefon', 'Fakultet', 'Prosjek', 'Bodovi od prosjeka',
        'Br. članova porodice', 'Mama I', 'Mama II', 'Mama III', 'Tata I', 'Tata II', 'Tata III', 'Baka/Sestra/Brat',
        'Prosjek', 'Prosjek / broj članova', 'Bodovi za ekonomski status', 'Osnovna', 'Srednja', 'Fakultet', 'Bodovi', 'Bez oba', 'Bez jednog', 'Ratni inv.',
        'Inv. rada', 'Civilne žrtve', 'Rastavljeni', 'Bračna zajednica', 'Student roditelj', 'Bodovi',
        'Godina studija', 'Bodovi', 'BUDŽET', 'SUFINANSIRA', 'Bodovi', 'Ukupno', 'Napomene'
    ];

    const dataValues = [
        brojPredmeta, jmbg, fullName, nacionalnost, brojTelefona, nazivFakulteta, prosjekOcjena, gradePoints,
        brojClanova, mamaI, mamaII, mamaIII, tataI, tataII, tataIII, baka,
        r4, s4, t4, osnovna, srednja, fakultet, x4, bezObaRoditelja, bezJednogRoditelja, ratnihVojnihInvalida,
        invalidiRada, civilneZrtve, rastavljenih, bracnaZajednica, studentRoditelj, ag4,
        godinaStudija, ai4, budzet, sufinansira, al4, am4, napomene
    ];

    // Create tab-separated string for clipboard
    const tableRow = dataValues.join('\t');

    // 1. IMMEDIATELY COPY TO CLIPBOARD
    copyToClipboard(tableRow);

    // 2. DOWNLOAD TIMESTAMPED EXCEL FILE
    downloadExcelFile(headers, dataValues, fullName);

    // Display the tab-separated text
    document.getElementById('table-row-text').value = tableRow;
    document.getElementById('table-row-output').style.display = 'block';

    // 3. SCROLL BACK TO TOP
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 4. MESSAGE THAT IT IS COPIED TO CLIPBOARD
    showNotification('Red tabele je kopiran u clipboard i Excel fajl je preuzet!');
}

// Function to copy to clipboard
function copyToClipboard(text) {
    try {
        // Try modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
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

// Function to download Excel file with timestamp
function downloadExcelFile(headers, dataValues, studentName) {
    try {
        // Create timestamp
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_');

        // Clean student name for filename
        const cleanName = studentName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
        const filename = `stipendija_${cleanName}_${timestamp}.xlsx`;

        // Create worksheet data
        const wsData = [headers, dataValues];

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Auto-size columns
        const colWidths = headers.map(() => ({ wch: 15 }));
        ws['!cols'] = colWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Stipendija');

        // Download the file
        XLSX.writeFile(wb, filename);

    } catch (err) {
        console.error('Failed to create Excel file:', err);
        showNotification('Greška pri kreiranju Excel fajla!');
    }
}

// Update the copy button function to work with the existing textarea
function copyTableRow() {
    const textArea = document.getElementById('table-row-text');
    copyToClipboard(textArea.value);

    // Change button text temporarily
    const button = document.getElementById('copy-table-row');
    const originalHTML = button.innerHTML;
    button.innerHTML = 'Kopirano!';
    button.classList.remove('btn-outline-secondary');
    button.classList.add('btn-success');

    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.classList.remove('btn-success');
        button.classList.add('btn-outline-secondary');
    }, 2000);

    showNotification('Red tabele je kopiran u clipboard!');
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
    const rodjenBrcko = document.querySelector('input[name="rodjen-brcko"]:checked').value;
    const rodniList = document.getElementById('doc-rodni-list').checked;
    const potvrdaUpis = document.getElementById('doc-potvrda-upis').checked;
    const potvrdaIspiti = document.getElementById('doc-potvrda-ispiti').checked;
    const izjavaDomacinstvo = document.getElementById('doc-izjava-domacinstvo').checked;
    const potvrdaFinansiranje = document.getElementById('doc-potvrda-finansiranje').checked;

    let missing = [];

    missing.push('→ Potvrda ili uvjerenje o mjestu prebivališta studenta i njegovih roditelja ili staratelja pribavlja se po službenoj dužnosti (Odluka, član V, stavka b)');

    // If born in Brčko, add note about residence
    if (rodjenBrcko === 'da') {
        missing.push('→ Izvod iz matične knjige rođenih se pribavlja po službenoj dužnosti');

    }

    // Only check rodni list if student is NOT born in Brčko AND checkbox is not checked
    if (rodjenBrcko === 'ne' && !rodniList) {
        missing.push('→ DOPUNA: Nedostaje rodni list za studenta koji nije upisan u matičnu knjigu rođenih u Distriktu (Javni poziv, član V)');
    }

    if (!potvrdaUpis) missing.push('→ DOPUNA: Nedostaje potvrda ili uvjerenje o upisu na godinu studija');
    if (!potvrdaIspiti) missing.push('→ DOPUNA: Nedostaje potvrda ili uvjerenje o položenim ispitima');
    if (!izjavaDomacinstvo) missing.push('→ DOPUNA: Nedostaje izjava o zajedničkom domaćinstvu');
    if (!izjava) missing.push('→ DOPUNA: Nedostaje izjava o neprimanju stipendija');
    if (!potvrdaFinansiranje) missing.push('→ DOPUNA: Nedostaje potvrda ili uvjerenje da se studij finansira iz budžetskih sredstava ili sufinansira na javnoj viosokoškolskoj ustanovi');

    const napomena = document.getElementById('napomena');
    if (missing.length === 0) {
        napomena.value = '';
    } else {
        napomena.value = '' + missing.join('; ');
    }

    // Auto-resize textarea to fit content
    napomena.style.height = 'auto';
    napomena.style.height = napomena.scrollHeight + 'px';
}

// Function to handle showing/hiding rodni list checkbox
function handleRodjenBrcko() {
    const rodjenBrcko = document.querySelector('input[name="rodjen-brcko"]:checked').value;
    const rodniListContainer = document.getElementById('rodni-list-container');

    if (rodjenBrcko === 'ne') {
        rodniListContainer.style.display = 'block';
    } else {
        rodniListContainer.style.display = 'none';
        // Reset the checkbox when hiding
        document.getElementById('doc-rodni-list').checked = false;
    }

    updateNapomena();
}

// Add event listeners for document checkboxes and radio buttons
document.addEventListener('DOMContentLoaded', function () {
    // Add radio button event listeners for "Rođen u Brčkom?"
    document.getElementById('rodjen-brcko-da').addEventListener('change', handleRodjenBrcko);
    document.getElementById('rodjen-brcko-ne').addEventListener('change', handleRodjenBrcko);

    // Add document checkbox event listeners
    const docCheckboxes = [
        'doc-izjava',
        'doc-rodni-list',
        'doc-potvrda-upis',
        'doc-potvrda-ispiti',
        'doc-izjava-domacinstvo',
        'doc-potvrda-finansiranje'
    ];

    docCheckboxes.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.addEventListener('change', updateNapomena);
        }
    });

    // Initial calls
    handleRodjenBrcko();
    updateNapomena();
});

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

    // Check required fields after calculation
    highlightRequiredFields();
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
    const bsToast = bootstrap.Toast.getOrCreateInstance(toast, { delay: 4200 });
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
        'ad4': 'Rastavljeni',
        'ae4': 'Student koji je u bračnoj zajednici',
        'af4': 'Student koji je roditelj',
        'none': 'Bez kategorije'
    };
    return labels[categoryValue] || '';
}

// Function to clear the entire form
function clearForm() {
    // Clear all text inputs
    const textInputs = document.querySelectorAll('input[type="text"], input[type="number"], textarea');
    textInputs.forEach(input => {
        input.value = '';
        input.disabled = false;
        input.style.backgroundColor = '';
        input.classList.remove('is-invalid', 'warning');

        // Restore original placeholder
        const originalPlaceholder = input.getAttribute('data-original-placeholder');
        if (originalPlaceholder) {
            input.placeholder = originalPlaceholder;
        }
    });

    // Clear all checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    // Reset all radio buttons to default
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.checked = false;
    });

    // Set default radio selections
    document.querySelector('input[name="zavrsne-kategorije"][value="none"]').checked = true;

    // Reset dropdown to first option
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.selectedIndex = 0;
    });

    // Hide table output
    const tableOutput = document.getElementById('table-row-output');
    if (tableOutput) {
        tableOutput.style.display = 'none';
    }

    // Reset current values to defaults
    currentValues = {
        averageGrade: 0,
        u4: 0,
        v4: 0,
        w4: 0,
        householdMembers: 0,
        grade1: 0, grade2: 0, grade3: 0,
        grade4: 0, grade5: 0, grade6: 0,
        grade7: 0,
        categories: {
            y4: false, z4: false, aa4: false, ab4: false,
            ac4: false, ad4: false, ae4: false, af4: false
        },
        ah4: 0,
        zavrsneKategorije: 'none'
    };

    // Recalculate everything
    calculateAll();
    updateNapomena();

    showNotification('Forma je očišćena!');
}

// Function to populate random data for testing
function populateRandomData() {
    // Random basic information
    const firstNames = ['Ana', 'Esed', 'Milica', 'Stefan', 'Adnan', 'Nikola', 'Tijana', 'Miloš', 'Sara', 'Petar'];
    const lastNames = ['Marić', 'Petrović', 'Nikolić', 'Mehić', 'Jovanović', 'Đorđević', 'Ibrahimović', 'Popović'];
    const fatherNames = ['Petar', 'Mehmedalija', 'Stefan', 'Ismar', 'Miloš', 'Aleksandar', 'Dragan', 'Zoran'];
    const nationalities = ['Bošnjak', 'Srbin', 'Hrvat', 'Ostali'];
    const faculties = [
        'Fakultet elektrotehnike',
        'Medicinski fakultet',
        'Ekonomski fakultet',
        'Pravni fakultet',
        'Fakultet za menadžment'
    ];

    // 1. DOKUMENTI (PRILOŽENI) - Random checkboxes
    document.getElementById('doc-izjava').checked = Math.random() > 0.3;
    document.getElementById('doc-rodni-list').checked = Math.random() > 0.3;

    // 2. OSNOVNE INFORMACIJE
    document.getElementById('subject-number').value = Math.floor(Math.random() * 9000) + 1000;

    // Generate random JMBG (13 digits)
    let jmbg = '';
    for (let i = 0; i < 13; i++) {
        jmbg += Math.floor(Math.random() * 10);
    }
    document.getElementById('jmbg').value = jmbg;

    document.getElementById('surname').value = lastNames[Math.floor(Math.random() * lastNames.length)];
    document.getElementById('father-name').value = fatherNames[Math.floor(Math.random() * fatherNames.length)];
    document.getElementById('name').value = firstNames[Math.floor(Math.random() * firstNames.length)];
    document.getElementById('nationality').value = nationalities[Math.floor(Math.random() * nationalities.length)];
    document.getElementById('phone').value = '065' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    document.getElementById('faculty').value = faculties[Math.floor(Math.random() * faculties.length)];

    // Random average grade between 6.0 and 10.0
    const avgGrade = (Math.random() * 4 + 6).toFixed(2);
    document.getElementById('average-grade').value = avgGrade;

    // 3. SOCIJALNO EKONOMSKI STATUS
    // Random household members (2-8)
    document.getElementById('household-members').value = Math.floor(Math.random() * 7) + 2;

    // Reset all radio buttons for income fields to 'platne' (enabled) first
    const radioGroups = ['mama1-radio', 'mama2-radio', 'mama3-radio', 'tata1-radio', 'tata2-radio', 'tata3-radio'];
    radioGroups.forEach(group => {
        const platneRadio = document.querySelector(`input[name="${group}"][value="platne"]`);
        if (platneRadio) platneRadio.checked = true;
    });

    // Random income values (0-1000) and random radio button states
    const incomeFields = [
        { id: 'grade1', radio: 'mama1-radio' },
        { id: 'grade2', radio: 'mama2-radio' },
        { id: 'grade3', radio: 'mama3-radio' },
        { id: 'grade4', radio: 'tata1-radio' },
        { id: 'grade5', radio: 'tata2-radio' },
        { id: 'grade6', radio: 'tata3-radio' }
    ];

    incomeFields.forEach(field => {
        const element = document.getElementById(field.id);

        // Random radio button selection
        const radioOptions = ['platne', '0', 'blank'];
        const randomRadio = radioOptions[Math.floor(Math.random() * radioOptions.length)];
        const radioElement = document.querySelector(`input[name="${field.radio}"][value="${randomRadio}"]`);
        if (radioElement) radioElement.checked = true;

        // Set income value based on radio selection
        if (randomRadio === 'platne') {
            element.disabled = false;
            element.style.backgroundColor = '';
            element.value = Math.floor(Math.random() * 1000);
        } else if (randomRadio === '0') {
            element.disabled = true;
            element.value = '0';
            element.style.backgroundColor = '#f8f9fa';
        } else if (randomRadio === 'blank') {
            element.disabled = true;
            element.value = '';
            element.style.backgroundColor = '#f8f9fa';
        }

        // Trigger the radio button change event
        handleRadioButtonChange(field.radio, field.id);
    });

    // Baka/Sestra/Brat (no radio buttons for this field)
    document.getElementById('grade7').value = Math.floor(Math.random() * 500);

    // 4. BROJ OSTALE DJECE KOJA SE ŠKOLUJU U PORODICI
    // Random values for additional criteria (0-3 for each)
    const additionalCriteria = ['u4', 'v4', 'w4'];
    additionalCriteria.forEach(fieldId => {
        // 70% chance of having a value, 30% chance of being empty
        if (Math.random() > 0.3) {
            document.getElementById(fieldId).value = Math.floor(Math.random() * 3) + 1;
        } else {
            document.getElementById(fieldId).value = '';
        }
    });

    // 5. PORODIČNE PRILIKE (radio buttons)
    const categoryOptions = ['none', 'y4', 'z4', 'aa4', 'ab4', 'ac4', 'ad4', 'ae4', 'af4'];
    const randomCategory = categoryOptions[Math.floor(Math.random() * categoryOptions.length)];
    const categoryRadio = document.querySelector(`input[name="porodicne-prilike"][value="${randomCategory}"]`);
    if (categoryRadio) categoryRadio.checked = true;

    // 6. DOSTIGNUTO OBRAZOVANJE (godina studija)
    const years = ['1', '2', '3', '4', '5', '6'];
    const randomYear = years[Math.floor(Math.random() * years.length)];
    document.getElementById('ah4').value = randomYear;

    // 7. ZAVRŠNE KATEGORIJE (radio buttons)
    const finalCategories = ['none', 'aj4', 'ak4'];
    const randomFinal = finalCategories[Math.floor(Math.random() * finalCategories.length)];
    const finalRadio = document.querySelector(`input[name="zavrsne-kategorije"][value="${randomFinal}"]`);
    if (finalRadio) finalRadio.checked = true;

    // 8. Trigger all calculations and updates to ensure everything is recalculated
    // Update current values object
    currentValues.averageGrade = parseFloat(avgGrade) || 0;
    currentValues.householdMembers = parseInt(document.getElementById('household-members').value) || 0;

    // Update grade values
    currentValues.grade1 = parseFloat(document.getElementById('grade1').value) || 0;
    currentValues.grade2 = parseFloat(document.getElementById('grade2').value) || 0;
    currentValues.grade3 = parseFloat(document.getElementById('grade3').value) || 0;
    currentValues.grade4 = parseFloat(document.getElementById('grade4').value) || 0;
    currentValues.grade5 = parseFloat(document.getElementById('grade5').value) || 0;
    currentValues.grade6 = parseFloat(document.getElementById('grade6').value) || 0;
    currentValues.grade7 = parseFloat(document.getElementById('grade7').value) || 0;

    // Update additional criteria
    currentValues.u4 = parseFloat(document.getElementById('u4').value) || 0;
    currentValues.v4 = parseFloat(document.getElementById('v4').value) || 0;
    currentValues.w4 = parseFloat(document.getElementById('w4').value) || 0;

    // Update categories
    currentValues.categories = {
        y4: randomCategory === 'y4',
        z4: randomCategory === 'z4',
        aa4: randomCategory === 'aa4',
        ab4: randomCategory === 'ab4',
        ac4: randomCategory === 'ac4',
        ad4: randomCategory === 'ad4',
        ae4: randomCategory === 'ae4',
        af4: randomCategory === 'af4'
    };

    // Update year and final categories
    currentValues.ah4 = parseInt(randomYear) || 0;
    currentValues.zavrsneKategorije = randomFinal;

    // Trigger all calculation functions
    calculateAll();
    updateNapomena();

    showNotification('Cijela forma je nasumično popunjena za testiranje!');
}

// Add CSS for required field styling
function addRequiredFieldStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .required-field {
            border: 2px solid #ff6b6b !important;
            box-shadow: 0 0 8px rgba(255, 107, 107, 0.4) !important;
            background-color: rgba(255, 107, 107, 0.05) !important;
        }
        
        .required-field:focus {
            border-color: #ff6b6b !important;
            box-shadow: 0 0 12px rgba(255, 107, 107, 0.6) !important;
        }
        
        .required-radio-group {
            background-color: rgba(255, 107, 107, 0.05) !important;
            border: 1px solid #ff6b6b !important;
            border-radius: 0.375rem;
            padding: 0.5rem;
        }
    `;
    document.head.appendChild(style);
}

// Function to check and highlight required fields
function highlightRequiredFields() {
    // Remove existing highlighting first
    clearRequiredFieldHighlighting();

    const requiredFields = [
        // Basic information
        'subject-number',
        'jmbg',
        'surname',
        'father-name',
        'name',
        'nationality',
        'phone',
        'faculty',
        'faculty-extra',
        'average-grade',
        // Socio-economic status
        'household-members',
        'grade1', 'grade2', 'grade3',
        'grade4', 'grade5', 'grade6',
        'grade7',
        // Additional criteria (u4, v4, w4) - these are required too
        'u4', 'v4', 'w4',
        // Year of study
        'ah4'
    ];

    // Check text/number inputs
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && (!field.value || field.value.trim() === '')) {
            // Don't highlight disabled fields that are intentionally empty
            if (!field.disabled) {
                field.classList.add('required-field');
            }
        }
    });

    // Check radio button groups - only highlight if NO selection is made
    const radioGroups = [
        { name: 'porodicne-prilike', containerId: 'categories-section' },
        { name: 'zavrsne-kategorije', containerId: 'final-categories-section' }
    ];

    radioGroups.forEach(group => {
        const selectedRadio = document.querySelector(`input[name="${group.name}"]:checked`);
        const container = document.getElementById(group.containerId);

        // Only highlight if no radio button is selected at all
        if (!selectedRadio) {
            if (container) {
                container.classList.add('required-radio-group');
            }
        }
    });

    // Don't highlight checkboxes - they are optional document requirements
}

// Function to clear required field highlighting
function clearRequiredFieldHighlighting() {
    const highlightedFields = document.querySelectorAll('.required-field');
    highlightedFields.forEach(field => {
        field.classList.remove('required-field');
    });

    const highlightedGroups = document.querySelectorAll('.required-radio-group');
    highlightedGroups.forEach(group => {
        group.classList.remove('required-radio-group');
    });
}

// Update checkRequiredFields function
function checkRequiredFields() {
    const customToggle = document.getElementById('custom-faculty-toggle');
    const requiredFields = [
        // Basic information
        'subject-number',
        'jmbg',
        'surname',
        'father-name',
        'name',
        'nationality',
        'phone',
        'average-grade',
        // Socio-economic status
        'household-members',
        'grade1', 'grade2', 'grade3',
        'grade4', 'grade5', 'grade6',
        'grade7',
        // Additional criteria (u4, v4, w4) - these are required too
        'u4', 'v4', 'w4',
        // Year of study
        'ah4'
    ];

    // Add faculty field conditionally
    if (customToggle.checked) {
        requiredFields.push({ id: 'custom-faculty', name: 'Naziv univerziteta' });
    } else {
        requiredFields.push({ id: 'faculty-combined', name: 'Fakultet' });
    }

    // Check text/number inputs
    const emptyFields = [];
    requiredFields.forEach(field => {
        const element = document.getElementById(field.id);
        if (element && (!element.value || element.value.trim() === '')) {
            // Don't flag disabled fields that are intentionally empty
            if (!element.disabled) {
                emptyFields.push(field.name);
            }
        }
    });

    // Check radio groups - only flag if NO selection is made
    const porodiceRadio = document.querySelector('input[name="porodicne-prilike"]:checked');
    if (!porodiceRadio) {
        emptyFields.push('Porodične prilike');
    }

    const zavrsneRadio = document.querySelector('input[name="zavrsne-kategorije"]:checked');
    if (!zavrsneRadio) {
        emptyFields.push('Završne kategorije');
    }

    return emptyFields;
}

// Update setupRequiredFieldListeners function
function setupRequiredFieldListeners() {
    const customToggle = document.getElementById('custom-faculty-toggle');
    const baseRequiredFieldIds = [
        'subject-number', 'jmbg', 'surname', 'father-name', 'name',
        'nationality', 'phone', 'average-grade',
        'household-members', 'grade1', 'grade2', 'grade3',
        'grade4', 'grade5', 'grade6', 'grade7',
        'u4', 'v4', 'w4', 'ah4'
    ];

    // Add faculty fields conditionally
    const requiredFieldIds = [...baseRequiredFieldIds];
    if (customToggle.checked) {
        requiredFieldIds.push('custom-faculty');
    } else {
        requiredFieldIds.push('faculty-combined');
    }

    // Text inputs
    const textInputs = document.querySelectorAll('input[type="text"], input[type="number"], select');
    textInputs.forEach(input => {
        input.addEventListener('input', () => {
            if (input.value && input.value.trim() !== '') {
                input.classList.remove('required-field');
            }
        });
    });

    // Radio buttons
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', () => {
            const container = radio.closest('.required-radio-group');
            if (container) {
                container.classList.remove('required-radio-group');
            }
        });
    });

    // Checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                const label = checkbox.closest('.required-radio-group');
                if (label) {
                    label.classList.remove('required-radio-group');
                }
            }
        });
    });
}

// Add this function to handle custom faculty toggle
function handleCustomFacultyToggle() {
    const customToggle = document.getElementById('custom-faculty-toggle');
    const facultyDropdown = document.getElementById('faculty');
    const customFacultyInput = document.getElementById('custom-faculty');

    if (customToggle.checked) {
        // Show custom input, hide dropdown requirement
        customFacultyInput.style.display = 'block';
        facultyDropdown.classList.remove('required-field-empty');
        facultyDropdown.value = '';
    } else {
        // Hide custom input
        customFacultyInput.style.display = 'none';
        customFacultyInput.value = '';
    }

    updateFacultyCombined();
}

// Add event listener in DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
    // ... existing code ...

    const customFacultyToggle = document.getElementById('custom-faculty-toggle');
    if (customFacultyToggle) {
        customFacultyToggle.addEventListener('change', handleCustomFacultyToggle);
    }

    // ... rest of existing code ...
});
