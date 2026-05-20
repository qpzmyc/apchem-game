const fs = require('fs');
const path = './src/data/element_stats.json';

try {
    const rawData = fs.readFileSync(path, 'utf8');
    const data = JSON.parse(rawData);

    const patchedData = data.map(el => {
        let patched = { ...el };

        // Patch Electronegativity (Noble Gases are usually null, set to 0 to represent lack of reactivity in game)
        if (patched.electronegativity === null) {
            patched.electronegativity = 0;
        }

        // Patch Electron Affinity (Alkaline earths, Nitrogen, Noble Gases usually near 0 or slightly negative)
        if (patched.electronAffinity === null) {
            patched.electronAffinity = 0;
        }

        // Patch First Ionization Energy (Super heavy elements missing data, copy from element above them or use a base)
        if (patched.firstIonizationEnergy === null) {
            patched.firstIonizationEnergy = 5.0; // A baseline low value for super heavy metals
        }

        // Patch Atomic Radius (Crucial for Map rendering!)
        if (patched.atomicRadius === null) {
            // Rough estimation for missing heavy elements
            patched.atomicRadius = 175; 
        }

        // Patch Molar Mass for super heavies
        if (patched.molarMass === null) {
            patched.molarMass = el.atomicNumber * 2.5; // Very rough approximation
        }

        return patched;
    });

    fs.writeFileSync(path, JSON.stringify(patchedData, null, 2));
    console.log('Successfully patched missing data in element_stats.json');
} catch (e) {
    console.error('Error patching data:', e);
}
