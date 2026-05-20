import elementStats from './data/element_stats.json';

// Helper to determine group and period based on atomic number
// Standard 18-column layout with f-block below.
function getElementLayout(atomicNumber) {
    let period = 0;
    let group = 0;
    let isFBlock = false;
    let category = 'unknown';

    if (atomicNumber >= 1 && atomicNumber <= 2) period = 1;
    else if (atomicNumber >= 3 && atomicNumber <= 10) period = 2;
    else if (atomicNumber >= 11 && atomicNumber <= 18) period = 3;
    else if (atomicNumber >= 19 && atomicNumber <= 36) period = 4;
    else if (atomicNumber >= 37 && atomicNumber <= 54) period = 5;
    else if (atomicNumber >= 55 && atomicNumber <= 86) period = 6;
    else if (atomicNumber >= 87 && atomicNumber <= 118) period = 7;

    if (atomicNumber === 1) { group = 1; category = 'diatomic nonmetal'; }
    else if (atomicNumber === 2) { group = 18; category = 'noble gas'; }
    else if (period === 2 || period === 3) {
        let offset = atomicNumber - (period === 2 ? 2 : 10);
        if (offset <= 2) group = offset;
        else group = offset + 10; // Jump over d-block
    } else if (period === 4 || period === 5) {
        group = atomicNumber - (period === 4 ? 18 : 36);
    } else if (period === 6) {
        if (atomicNumber >= 55 && atomicNumber <= 57) group = atomicNumber - 54;
        else if (atomicNumber >= 58 && atomicNumber <= 71) { isFBlock = true; group = atomicNumber - 57 + 3; category = 'lanthanide'; } // Lanthanides
        else group = atomicNumber - 54 - 14;
    } else if (period === 7) {
        if (atomicNumber >= 87 && atomicNumber <= 89) group = atomicNumber - 86;
        else if (atomicNumber >= 90 && atomicNumber <= 103) { isFBlock = true; group = atomicNumber - 89 + 3; category = 'actinide'; } // Actinides
        else group = atomicNumber - 86 - 14;
    }

    // Determine basic categories if not f-block
    if (!isFBlock) {
        if (group === 1 && atomicNumber !== 1) category = 'alkali metal';
        else if (group === 2) category = 'alkaline earth metal';
        else if (group >= 3 && group <= 12) category = 'transition metal';
        else if (group === 17) category = 'halogen';
        else if (group === 18) category = 'noble gas';
        else if (group >= 13 && group <= 16) {
            const metalloids = [5, 14, 32, 33, 51, 52];
            if (metalloids.includes(atomicNumber)) category = 'metalloid';
            else if ([6, 7, 8, 15, 16, 34].includes(atomicNumber)) category = 'polyatomic nonmetal';
            else category = 'post-transition metal';
        }
    }

    // Determine layout coordinates
    let xpos = group;
    let ypos = period;

    // Position f-block underneath
    if (isFBlock) {
        ypos = period === 6 ? 10 : 11; // Underneath the main table
        xpos = atomicNumber - (period === 6 ? 58 : 90) + 5; // Start shifted over
    } else {
        if (group >= 3 && group <= 12) {
            // Gap between s-block and d-block
            xpos += 2;
        } else if (group >= 13) {
            // Smaller Gap for the p-block
            xpos += 4;
        }
    }

    return { group, period, isFBlock, category, xpos, ypos };
}

// Map the raw stats to include layout and calculated properties
export const elements = elementStats.map(stat => {
    const layout = getElementLayout(stat.atomicNumber);

    // Calculate grid size based on atomic radius (roughly 30 to 350)
    let gridSize = 7; // Default fallback
    const radius = stat.atomicRadius || 150;

    // Spread across sizes 3, 5, 7, 9, 11, 13, 15, 17
    if (radius < 90) gridSize = 5;
    else if (radius < 150) gridSize = 7;
    else if (radius < 250) gridSize = 9;
    else if (radius < 320) gridSize = 11;
    else gridSize = 13;

    return { ...stat, ...layout, gridSize };
});

export const getElementBySymbol = (symbol) => elements.find(e => e.symbol === symbol);
export const getElementByNumber = (num) => elements.find(e => e.atomicNumber === num);
export const getElementByPos = (x, y) => elements.find(e => e.xpos === x && e.ypos === y);

/**
 * Calculates the energy cost to move to an element.
 * Cost = base_cost * (mass_factor) + radius_factor
 */
export const calculateMovementCost = (element) => {
    const base = 10;
    const massFactor = element.molarMass ? (element.molarMass / 10) : 1;
    const radiusFactor = element.atomicRadius ? (element.atomicRadius / 50) : 1;
    return base + massFactor + radiusFactor;
};

/**
 * Calculates radiation drain per tick.
 * Higher periods = higher drain.
 */
export const calculateRadiationDrain = (element) => {
    if (element.period <= 3) return 0;
    return (element.period - 3) * 0.5;
};

/**
 * Gets the color associated with an element's category.
 */
export const getElementColor = (element) => {
    const categoryColors = {
        'diatomic nonmetal': '#00ffcc',
        'noble gas': '#ff00ff',
        'alkali metal': '#ff3300',
        'alkaline earth metal': '#ffcc00',
        'metalloid': '#ccff00',
        'polyatomic nonmetal': '#00ccff',
        'halogen': '#00ffcc',
        'post-transition metal': '#aaaaaa',
        'transition metal': '#ff66aa',
        'lanthanide': '#ffbbff',
        'actinide': '#cc99ff'
    };
    return categoryColors[element.category] || '#ffffff';
};
