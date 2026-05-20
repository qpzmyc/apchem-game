const fs = require('fs');
const path = './src/data/element_stats.json';

try {
    const rawData = fs.readFileSync(path, 'utf8');
    const data = JSON.parse(rawData);

    // Group calculation helper (copied from elements.js logic)
    function getGroup(atomicNumber) {
        let period = 0;
        let group = 0;
        let isFBlock = false;

        if (atomicNumber >= 1 && atomicNumber <= 2) period = 1;
        else if (atomicNumber >= 3 && atomicNumber <= 10) period = 2;
        else if (atomicNumber >= 11 && atomicNumber <= 18) period = 3;
        else if (atomicNumber >= 19 && atomicNumber <= 36) period = 4;
        else if (atomicNumber >= 37 && atomicNumber <= 54) period = 5;
        else if (atomicNumber >= 55 && atomicNumber <= 86) period = 6;
        else if (atomicNumber >= 87 && atomicNumber <= 118) period = 7;

        if (atomicNumber === 1) { group = 1; }
        else if (atomicNumber === 2) { group = 18; }
        else if (period === 2 || period === 3) {
            let offset = atomicNumber - (period === 2 ? 2 : 10);
            if (offset <= 2) group = offset;
            else group = offset + 10;
        } else if (period === 4 || period === 5) {
            group = atomicNumber - (period === 4 ? 18 : 36);
        } else if (period === 6) {
            if (atomicNumber >= 55 && atomicNumber <= 57) group = atomicNumber - 54;
            else if (atomicNumber >= 58 && atomicNumber <= 71) { isFBlock = true; group = atomicNumber - 57 + 3; }
            else group = atomicNumber - 54 - 14;
        } else if (period === 7) {
            if (atomicNumber >= 87 && atomicNumber <= 89) group = atomicNumber - 86;
            else if (atomicNumber >= 90 && atomicNumber <= 103) { isFBlock = true; group = atomicNumber - 89 + 3; }
            else group = atomicNumber - 86 - 14;
        }
        return { group, isFBlock };
    }

    const patchedData = data.map(el => {
        let patched = { ...el };
        const { group, isFBlock } = getGroup(el.atomicNumber);
        
        let valence = 0;
        if (isFBlock) {
            valence = 2; // Simplification for f-block
        } else if (group >= 1 && group <= 2) {
            valence = group;
        } else if (group >= 3 && group <= 12) {
            valence = 2; // Simplification for d-block
        } else if (group >= 13 && group <= 18) {
            valence = group - 10;
        }

        // Helium exception
        if (el.atomicNumber === 2) valence = 2;

        patched.valenceElectrons = valence;
        return patched;
    });

    fs.writeFileSync(path, JSON.stringify(patchedData, null, 2));
    console.log('Successfully patched valence electrons in element_stats.json');
} catch (e) {
    console.error('Error patching data:', e);
}
