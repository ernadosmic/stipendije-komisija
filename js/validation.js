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
        'faculty-extra',  // Always check faculty-extra
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

    // Add appropriate faculty field based on toggle
    const customToggle = document.getElementById('custom-faculty-toggle');
    if (customToggle.checked) {
        requiredFields.push('custom-faculty');
    } else {
        requiredFields.push('faculty');
    }

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
        { id: 'subject-number', name: 'Broj predmeta' },
        { id: 'jmbg', name: 'JMBG' },
        { id: 'surname', name: 'Prezime' },
        { id: 'father-name', name: 'Ime oca' },
        { id: 'name', name: 'Ime' },
        { id: 'nationality', name: 'Nacionalnost' },
        { id: 'phone', name: 'Broj telefona' },
        { id: 'average-grade', name: 'Prosjek ocjena' },
        // Socio-economic status
        { id: 'household-members', name: 'Broj članova domaćinstva' },
        { id: 'grade1', name: 'Mama I' },
        { id: 'grade2', name: 'Mama II' },
        { id: 'grade3', name: 'Mama III' },
        { id: 'grade4', name: 'Tata I' },
        { id: 'grade5', name: 'Tata II' },
        { id: 'grade6', name: 'Tata III' },
        { id: 'grade7', name: 'Baka/Sestra/Brat' },
        // Additional criteria
        { id: 'u4', name: 'Osnovna škola' },
        { id: 'v4', name: 'Srednja škola' },
        { id: 'w4', name: 'Fakultet' },
        // Year of study
        { id: 'ah4', name: 'Godina studija' },
        // Faculty-extra is always required
        { id: 'faculty-extra', name: 'Fakultet' }
    ];

    // Add faculty field conditionally
    if (customToggle.checked) {
        requiredFields.push({ id: 'custom-faculty', name: 'Naziv univerziteta' });
    } else {
        requiredFields.push({ id: 'faculty', name: 'Naziv univerziteta' });
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
        'u4', 'v4', 'w4', 'ah4',
        'faculty-extra'  // Always monitor faculty-extra
    ];

    // Add faculty fields conditionally
    const requiredFieldIds = [...baseRequiredFieldIds];
    requiredFieldIds.push('custom-faculty');
    requiredFieldIds.push('faculty');

    // Text/number/select inputs
    requiredFieldIds.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', highlightRequiredFields);
            input.addEventListener('change', highlightRequiredFields);
        }
    });

    // Radio buttons
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', highlightRequiredFields);
    });

    // Monitor the toggle to re-check highlighting when it changes
    if (customToggle) {
        customToggle.addEventListener('change', highlightRequiredFields);
    }
}

// Add this function to handle custom faculty toggle
function handleCustomFacultyToggle() {
    const customToggle = document.getElementById('custom-faculty-toggle');
    const facultyDropdown = document.getElementById('faculty');
    const customFacultyInput = document.getElementById('custom-faculty');

    if (customToggle.checked) {
        // Show custom input, hide dropdown
        facultyDropdown.style.display = 'none';
        customFacultyInput.style.display = 'block';
        facultyDropdown.classList.remove('required-field');
    } else {
        // Show dropdown, hide custom input
        facultyDropdown.style.display = 'block';
        customFacultyInput.style.display = 'none';
        customFacultyInput.classList.remove('required-field');
        customFacultyInput.value = '';
    }

    updateFacultyCombined();

    // Recheck validation highlighting
    highlightRequiredFields();
}
