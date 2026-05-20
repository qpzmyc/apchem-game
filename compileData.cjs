const fs = require('fs');

const rawData = fs.readFileSync('/Users/Cheng_1/.gemini/antigravity/brain/d6e2d2e0-9ee1-40a3-934d-7b50e0a1e58a/.system_generated/steps/92/content.md', 'utf8');

// The file has a header from the system generated output. We need to parse the JSON part.
// Find the first '{'
const jsonStartIndex = rawData.indexOf('{');
const jsonStr = rawData.substring(jsonStartIndex);

try {
    const data = JSON.parse(jsonStr);
    
    const compiledStats = data.elements.map(el => {
        // Clean up string values to numbers where possible
        const cleanNumber = (val) => {
            if (val === null || val === undefined || val === "") return null;
            if (typeof val === 'number') return val;
            // Extract the first number found in the string (e.g. "1.0080 u" -> 1.008)
            const match = val.match(/[-+]?[0-9]*\.?[0-9]+/);
            return match ? parseFloat(match[0]) : null;
        };

        return {
            name: el.name,
            symbol: el.symbol,
            atomicNumber: el.atomicNumber,
            molarMass: cleanNumber(el.atomicMass),
            electronegativity: cleanNumber(el.electronegativity),
            atomicRadius: cleanNumber(el.atomicRadius),
            electronAffinity: cleanNumber(el.electronAffinity),
            firstIonizationEnergy: cleanNumber(el.ionizationEnergy)
        };
    });

    // Ensure we only have 118 elements
    const trimmedStats = compiledStats.slice(0, 118);

    fs.writeFileSync('./src/data/element_stats.json', JSON.stringify(trimmedStats, null, 2));
    console.log(`Successfully compiled ${trimmedStats.length} elements into src/data/element_stats.json`);
} catch (e) {
    console.error("Error parsing JSON:", e);
}
