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

