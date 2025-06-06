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

