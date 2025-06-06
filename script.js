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

        // Revalidate fields when toggle changes
        highlightRequiredFields();
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
// Add CSS for required field styling

// Add event listener in DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
    // ... existing code ...

    const customFacultyToggle = document.getElementById('custom-faculty-toggle');
    if (customFacultyToggle) {
        customFacultyToggle.addEventListener('change', handleCustomFacultyToggle);
    }

    // ... rest of existing code ...
});
