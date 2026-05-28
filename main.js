import './style.css'
import { elements, getElementColor } from './src/elements.js'
import { craftableItems } from './src/crafting.js'
import { quests } from './src/quests.js'

// --- Constants & Rules ---
const DEV_MODE = true; // Set to true to enable playtest cheats (Q and Z)
const GLOBAL_STEP = 600;
const CELL_SIZE = 40;
const CELL_GAP = 4;
const CELL_PITCH = CELL_SIZE + CELL_GAP;
const LAND_PADDING = 10;

const COVALENT_GROUP = ['B', 'Si', 'Ge', 'As', 'Sb', 'Te', 'C', 'N', 'P', 'O', 'S', 'Se', 'F', 'Cl', 'Br', 'I'];

function getMovementType(source, target) {
    if (source.isFBlock && target.isFBlock) return 'IONIC';
    if (source.group === 2 && target.group >= 13) return 'IONIC';
    if (source.group >= 13 && target.group === 2) return 'IONIC';
    // Noble gas connections require bridges
    if (target.group === 18 && source.group !== 18) return 'NOBLE_BRIDGE';
    if (source.group === 18 && target.group !== 18) return 'NOBLE_BRIDGE';
    if (COVALENT_GROUP.includes(source.symbol) && COVALENT_GROUP.includes(target.symbol)) return 'COVALENT';
    return 'NORMAL';
}

// Global mapping of element symbols to objects for fast lookup
const elementMap = {};
elements.forEach(e => elementMap[e.symbol] = e);

// --- Pre-calculated Trend Rankings for Minigame ---
const trendRankings = {
    electronegativity: [...elements].sort((a, b) => (b.electronegativity || -1) - (a.electronegativity || -1)),
    electronAffinity: [...elements].sort((a, b) => (b.electronAffinity || -999) - (a.electronAffinity || -999)),
    firstIonizationEnergy: [...elements].sort((a, b) => (b.firstIonizationEnergy || -1) - (a.firstIonizationEnergy || -1)),
    atomicRadius: [...elements].sort((a, b) => (b.atomicRadius || -1) - (a.atomicRadius || -1)),
    atomicNumber: [...elements].sort((a, b) => b.atomicNumber - a.atomicNumber),
    molarMass: [...elements].sort((a, b) => b.molarMass - a.molarMass),
    density: [...elements].sort((a, b) => (b.density || 0) - (a.density || 0)),
    meltingPoint: [...elements].sort((a, b) => (b.meltingPoint || 0) - (a.meltingPoint || 0)),
    boilingPoint: [...elements].sort((a, b) => (b.boilingPoint || 0) - (a.boilingPoint || 0)),
};

const trendRankingsLow = {
    electronegativity: [...elements].sort((a, b) => {
        const valA = a.electronegativity !== undefined && a.electronegativity !== null ? a.electronegativity : 0;
        const valB = b.electronegativity !== undefined && b.electronegativity !== null ? b.electronegativity : 0;
        return valA - valB;
    }),
    electronAffinity: [...elements].sort((a, b) => {
        const valA = a.electronAffinity !== undefined && a.electronAffinity !== null ? a.electronAffinity : -999;
        const valB = b.electronAffinity !== undefined && b.electronAffinity !== null ? b.electronAffinity : -999;
        return valA - valB;
    }),
    firstIonizationEnergy: [...elements].sort((a, b) => {
        const valA = a.firstIonizationEnergy !== undefined && a.firstIonizationEnergy !== null ? a.firstIonizationEnergy : 0;
        const valB = b.firstIonizationEnergy !== undefined && b.firstIonizationEnergy !== null ? b.firstIonizationEnergy : 0;
        return valA - valB;
    }),
    atomicRadius: [...elements].sort((a, b) => {
        const valA = a.atomicRadius !== undefined && a.atomicRadius !== null ? a.atomicRadius : 0;
        const valB = b.atomicRadius !== undefined && b.atomicRadius !== null ? b.atomicRadius : 0;
        return valA - valB;
    }),
    atomicNumber: [...elements].sort((a, b) => a.atomicNumber - b.atomicNumber),
    molarMass: [...elements].sort((a, b) => a.molarMass - b.molarMass),
    density: [...elements].sort((a, b) => {
        const valA = a.density !== undefined && a.density !== null ? a.density : 0;
        const valB = b.density !== undefined && b.density !== null ? b.density : 0;
        return valA - valB;
    }),
    meltingPoint: [...elements].sort((a, b) => {
        const valA = a.meltingPoint !== undefined && a.meltingPoint !== null ? a.meltingPoint : 0;
        const valB = b.meltingPoint !== undefined && b.meltingPoint !== null ? b.meltingPoint : 0;
        return valA - valB;
    }),
    boilingPoint: [...elements].sort((a, b) => {
        const valA = a.boilingPoint !== undefined && a.boilingPoint !== null ? a.boilingPoint : 0;
        const valB = b.boilingPoint !== undefined && b.boilingPoint !== null ? b.boilingPoint : 0;
        return valA - valB;
    }),
};

function getElementRank(element, category, isOpposite = false) {
    if (isOpposite) {
        return trendRankingsLow[category].findIndex(e => e.symbol === element.symbol) + 1;
    }
    return trendRankings[category].findIndex(e => e.symbol === element.symbol) + 1;
}

// Find Hydrogen as start
const hydrogen = elements.find(e => e.symbol === 'H');

// --- Upgrade Tiers ---
const shardUpgrades = [
    { s: 3, p: 0, d: 0, f: 0 },
    { s: 5, p: 1, d: 0, f: 0 },
    { s: 6, p: 2, d: 1, f: 0 },
    { s: 8, p: 4, d: 2, f: 0 },
    { s: 12, p: 8, d: 4, f: 1 },
    { s: 20, p: 12, d: 6, f: 2 }
];

const storageUpgrades = [
    { energy: 2000, electrons: 4 },
    { energy: 4000, electrons: 6 },
    { energy: 8000, electrons: 10 },
    { energy: 14000, electrons: 14 },
    { energy: 30000, electrons: 20 },
    { energy: 55000, electrons: 30 },
    { energy: 100000, electrons: 40 }
];

// --- Game State ---
function showNotification(message, type = 'error') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `notification-toast type-${type}`;
    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

const state = {
    currentElement: hydrogen,
    localX: Math.floor(hydrogen.gridSize / 2),
    localY: Math.floor(hydrogen.gridSize / 2),
    energy: 100,
    maxEnergy: storageUpgrades[0].energy,
    radiation: 0,
    totalElectronsEarned: 0,
    totalCatalyticOres: 0,
    inventory: {
        electrons: 0,
        catalyticOres: 0,
        shards: { s: 0, p: 0, d: 0, f: 0 },
        covalentBridger: 0,
        ionicBridger: 0,
        radiationVial: 0
    },
    upgrades: {
        shardCapacity: 0,
        storageCapacity: 0,
        shieldingSuit: false,
        eBoots: 0,
        octetRemote: false,
        hDrive: false,
        pesScanner: false,
        protonScanner: false,
        shardTracker: false,
        energyBooster: 0,
        sExtractor: false,
        pExtractor: false,
        dExtractor: false,
        fExtractor: false,
        shardSaver: false,
        ionizationSaver: 0,
        energyRouter: false,
        electronRouter: false
    },
    bridges: new Set(),
    visitedElements: new Set(['H']),
    pendingAction: null,
    menuOpen: false,
    remoteVaultActive: false,
    inventoryOpen: false,
    mapOpen: false,
    elementDebts: {},
    elementGiveCount: {},
    banks: {},
    canReset: false,
    shardSpawns: [], // Array of { type: 's'|'p'|'d'|'f', elementSymbol, x, y }
    won: false,
    totalEnergyEarned: 100, // Start with the initial 100 energy
    totalElectronsEarned: 0,
    top5Placements: 0,
    maxEnergyFromHarvest: 0,
    quests: { completed: [], active: [] },
    foundItems: {},
    grabbedCsElectron: false
};

function saveGame() {
    try {
        const saveData = {
            currentElementSymbol: state.currentElement ? state.currentElement.symbol : 'H',
            localX: state.localX,
            localY: state.localY,
            energy: state.energy,
            maxEnergy: state.maxEnergy,
            radiation: state.radiation,
            totalElectronsEarned: state.totalElectronsEarned,
            totalCatalyticOres: state.totalCatalyticOres,
            inventory: state.inventory,
            upgrades: state.upgrades,
            bridges: Array.from(state.bridges),
            visitedElements: Array.from(state.visitedElements),
            elementDebts: state.elementDebts,
            elementGiveCount: state.elementGiveCount,
            banks: state.banks,
            won: state.won,
            totalEnergyEarned: state.totalEnergyEarned,
            top5Placements: state.top5Placements,
            maxEnergyFromHarvest: state.maxEnergyFromHarvest,
            quests: state.quests,
            foundItems: state.foundItems,
            grabbedCsElectron: state.grabbedCsElectron,
            shardSpawns: state.shardSpawns
        };
        localStorage.setItem('elemental_survival_save', JSON.stringify(saveData));
    } catch (e) {
        console.error("Failed to save game to localStorage:", e);
    }
}

function loadGame() {
    try {
        const rawSave = localStorage.getItem('elemental_survival_save');
        if (!rawSave) return false;

        const saveData = JSON.parse(rawSave);
        if (!saveData) return false;

        if (saveData.currentElementSymbol) {
            const el = elements.find(e => e.symbol === saveData.currentElementSymbol);
            if (el) state.currentElement = el;
        }

        state.localX = saveData.localX ?? state.localX;
        state.localY = saveData.localY ?? state.localY;
        state.energy = saveData.energy ?? state.energy;
        state.maxEnergy = saveData.maxEnergy ?? state.maxEnergy;
        state.radiation = saveData.radiation ?? state.radiation;
        state.totalElectronsEarned = saveData.totalElectronsEarned ?? state.totalElectronsEarned;
        state.totalCatalyticOres = saveData.totalCatalyticOres ?? state.totalCatalyticOres;

        if (saveData.inventory) Object.assign(state.inventory, saveData.inventory);
        if (saveData.upgrades) Object.assign(state.upgrades, saveData.upgrades);

        if (saveData.bridges) state.bridges = new Set(saveData.bridges);
        if (saveData.visitedElements) state.visitedElements = new Set(saveData.visitedElements);

        if (saveData.elementDebts) Object.assign(state.elementDebts, saveData.elementDebts);
        if (saveData.elementGiveCount) Object.assign(state.elementGiveCount, saveData.elementGiveCount);
        if (saveData.banks) Object.assign(state.banks, saveData.banks);

        state.won = saveData.won ?? state.won;
        state.totalEnergyEarned = saveData.totalEnergyEarned ?? state.totalEnergyEarned;
        state.top5Placements = saveData.top5Placements ?? state.top5Placements;
        state.maxEnergyFromHarvest = saveData.maxEnergyFromHarvest ?? state.maxEnergyFromHarvest;

        if (saveData.quests) {
            state.quests.completed = saveData.quests.completed || [];
            state.quests.active = saveData.quests.active || [];
        }
        if (saveData.foundItems) Object.assign(state.foundItems, saveData.foundItems);
        state.grabbedCsElectron = saveData.grabbedCsElectron ?? state.grabbedCsElectron;

        if (saveData.shardSpawns) state.shardSpawns = saveData.shardSpawns;

        return true;
    } catch (e) {
        console.error("Failed to load game from localStorage:", e);
        return false;
    }
}

// --- Canvas Setup ---
const appEl = document.getElementById('app');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const energyFill = document.getElementById('energy-fill');
const energyVal = document.getElementById('energy-value');
const radFill = document.getElementById('rad-fill');
const radVal = document.getElementById('rad-value');
const electronCount = document.getElementById('electrons-count');
const electronMax = document.getElementById('electrons-max');

const inventoryOverlay = document.getElementById('inventory-overlay');
const invSShards = document.getElementById('inv-s-shards');
const capSShards = document.getElementById('cap-s-shards');
const invPShards = document.getElementById('inv-p-shards');
const capPShards = document.getElementById('cap-p-shards');
const invDShards = document.getElementById('inv-d-shards');
const capDShards = document.getElementById('cap-d-shards');
const invFShards = document.getElementById('inv-f-shards');
const capFShards = document.getElementById('cap-f-shards');
const invCatalytic = document.getElementById('inv-catalytic');
const btnCloseInventory = document.getElementById('btn-close-inventory');

const craftingOverlay = document.getElementById('crafting-overlay');
const craftingList = document.getElementById('crafting-list');
const btnCloseCrafting = document.getElementById('btn-close-crafting');
const btnCraft = document.getElementById('btn-craft');

const actionPopup = document.createElement('div');
actionPopup.className = 'action-popup';
appEl.appendChild(actionPopup);

const mapOverlay = document.getElementById('map-overlay');
const mapGrid = document.getElementById('map-grid');
const btnCloseMap = document.getElementById('btn-close-map');

const winOverlay = document.getElementById('win-overlay');
const winStatElements = document.getElementById('win-stat-elements');
const winStatEnergy = document.getElementById('win-stat-energy');
const winStatElectrons = document.getElementById('win-stat-electrons');
const winStatTop5 = document.getElementById('win-stat-top5');
const btnWinContinue = document.getElementById('btn-win-continue');

// Nucleus Menu DOM
const menuOverlay = document.getElementById('nucleus-menu-overlay');
const menuTitle = document.getElementById('nucleus-menu-title');
const menuStandard = document.getElementById('nucleus-menu-standard');
const menuNoble = document.getElementById('nucleus-menu-noble');
const costSpan = document.getElementById('grab-cost');
const gainSpan = document.getElementById('give-gain');
const grabRemainingSpan = document.getElementById('grab-remaining');
const vaultElectronsSpan = document.getElementById('vault-electrons');
const vaultEnergySpan = document.getElementById('vault-energy');

const bankAmount = document.getElementById('bank-amount');
const bankResource = document.getElementById('bank-resource');
const capElectronsSpan = document.getElementById('cap-electrons');
const capEnergySpan = document.getElementById('cap-energy');

const nobleCapacities = {
    'He': { electrons: 2, energy: 1000 },
    'Ne': { electrons: 4, energy: 3500 },
    'Ar': { electrons: 6, energy: 8000 },
    'Kr': { electrons: 8, energy: 17000 },
    'Xe': { electrons: 12, energy: 45000 },
    'Rn': { electrons: 16, energy: 170000 },
    'Og': { electrons: 24, energy: 400000 }
};

const nobleVaultBridgeCosts = {
    'He': { cost: 0, requiredLevel: 0 },
    'Ne': { cost: 2, requiredLevel: 1 },
    'Ar': { cost: 6, requiredLevel: 2 },
    'Kr': { cost: 10, requiredLevel: 3 },
    'Xe': { cost: 15, requiredLevel: 4 },
    'Rn': { cost: 23, requiredLevel: 5 },
    'Og': { cost: 40, requiredLevel: 6 }
};

const nobleVaultOrder = ['He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn', 'Og'];

function isNobleVaultUnlocked(nobleSymbol) {
    for (const bridge of state.bridges) {
        if (bridge.startsWith(nobleSymbol + '-') || bridge.endsWith('-' + nobleSymbol)) return true;
    }
    return false;
}

function routeOverflowEnergy(overflow) {
    if (!state.upgrades.energyRouter || overflow <= 0) return 0;
    let routed = 0;
    for (const symbol of nobleVaultOrder) {
        if (!isNobleVaultUnlocked(symbol)) continue;
        if (!state.banks[symbol]) state.banks[symbol] = { electrons: 0, energy: 0 };
        const cap = nobleCapacities[symbol].energy;
        const space = cap - state.banks[symbol].energy;
        if (space <= 0) continue;
        const toDeposit = Math.min(overflow, space);
        state.banks[symbol].energy += toDeposit;
        overflow -= toDeposit;
        routed += toDeposit;
        if (overflow <= 0) break;
    }
    return routed;
}

function routeOverflowElectrons(overflow) {
    if (!state.upgrades.electronRouter || overflow <= 0) return 0;
    let routed = 0;
    for (const symbol of nobleVaultOrder) {
        if (!isNobleVaultUnlocked(symbol)) continue;
        if (!state.banks[symbol]) state.banks[symbol] = { electrons: 0, energy: 0 };
        const cap = nobleCapacities[symbol].electrons;
        const space = cap - state.banks[symbol].electrons;
        if (space <= 0) continue;
        const toDeposit = Math.min(overflow, space);
        state.banks[symbol].electrons += toDeposit;
        overflow -= toDeposit;
        routed += toDeposit;
        if (overflow <= 0) break;
    }
    return routed;
}

// --- Camera & Render Loop ---
const camera = { x: state.currentElement.xpos * GLOBAL_STEP, y: state.currentElement.ypos * GLOBAL_STEP, scale: 0.8 };

function getPlayerGlobalPos() {
    const el = state.currentElement;
    const landSize = el.gridSize * CELL_PITCH - CELL_GAP + (LAND_PADDING * 2);
    const startX = (el.xpos * GLOBAL_STEP) - (landSize / 2);
    const startY = (el.ypos * GLOBAL_STEP) - (landSize / 2);
    return {
        x: startX + LAND_PADDING + (state.localX * CELL_PITCH) + (CELL_SIZE / 2),
        y: startY + LAND_PADDING + (state.localY * CELL_PITCH) + (CELL_SIZE / 2)
    };
}

function getExitGlobalPos(el, dx, dy) {
    const landSize = el.gridSize * CELL_PITCH - CELL_GAP + (LAND_PADDING * 2);
    const startX = (el.xpos * GLOBAL_STEP) - (landSize / 2);
    const startY = (el.ypos * GLOBAL_STEP) - (landSize / 2);

    let x = Math.floor(el.gridSize / 2);
    let y = Math.floor(el.gridSize / 2);

    if (dx === 1) x = el.gridSize - 1;
    if (dx === -1) x = 0;
    if (dy === 1) y = el.gridSize - 1;
    if (dy === -1) y = 0;

    return {
        x: startX + LAND_PADDING + x * CELL_PITCH + (CELL_SIZE / 2),
        y: startY + LAND_PADDING + y * CELL_PITCH + (CELL_SIZE / 2)
    };
}

function renderLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update Camera (Smooth Pan)
    const pPos = getPlayerGlobalPos();
    camera.x += (pPos.x - camera.x) * 0.1;
    camera.y += (pPos.y - camera.y) * 0.1;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(camera.scale, camera.scale);
    ctx.translate(-camera.x, -camera.y);

    // 1. Draw Lines (Underneath)
    ctx.lineWidth = 6;
    elements.forEach(el => {
        // Only check right and down to avoid drawing lines twice
        const checks = [{ dx: 1, dy: 0 }, { dx: 0, dy: 1 }];

        checks.forEach(({ dx, dy }) => {
            const target = getNearestElementFrom(el, dx, dy);
            if (!target) return;

            let valid = true;
            if (el.group === 2 && dx === 1 && target.group >= 3 && target.group <= 12) valid = false;
            if (el.group === 3 && dx === -1 && target.group === 2) valid = false;
            if (el.group === 18 && dy !== 0) valid = false;
            if (el.group === 18 && dx === 1) valid = false;
            // Block paths between transition metals (y<=7) and f-block rows (y>=9)
            if (el.ypos <= 7 && target.ypos >= 9) valid = false;
            if (el.ypos >= 9 && target.ypos <= 7) valid = false;
            // Exception: Ac → Ce path (treated as a bridge)
            let isAcCe = false;
            if ((el.symbol === 'Ac' && target.symbol === 'Ce') || (el.symbol === 'Ce' && target.symbol === 'Ac')) {
                valid = true;
                isAcCe = true;
            }

            let moveType = getMovementType(el, target);
            if (isAcCe) moveType = 'F_DESCENT';

            if (!valid) return;

            let drawLine = false;
            let lineColor = '';

            if (moveType === 'NORMAL') {
                drawLine = true;
                lineColor = 'rgba(100, 255, 100, 0.8)'; // Green
            } else if (state.bridges.has(el.symbol + '-' + target.symbol)) {
                drawLine = true;
                if (moveType === 'IONIC') lineColor = 'rgba(200, 100, 255, 0.8)'; // Purple
                else if (moveType === 'COVALENT') lineColor = 'rgba(100, 200, 255, 0.8)'; // Blue
                else if (moveType === 'NOBLE_BRIDGE') lineColor = 'rgba(255, 215, 0, 0.8)'; // Gold
                else if (moveType === 'F_DESCENT') lineColor = 'rgba(100, 200, 255, 0.8)'; // Cyan
            }

            if (drawLine) {
                let pos1 = getExitGlobalPos(el, dx, dy);
                let pos2 = getExitGlobalPos(target, -dx, -dy);

                // Shorten lines so they don't touch the grids
                const len = Math.hypot(pos2.x - pos1.x, pos2.y - pos1.y);
                const gap = 15;
                if (len > gap * 2) {
                    const dirX = (pos2.x - pos1.x) / len;
                    const dirY = (pos2.y - pos1.y) / len;
                    pos1.x += dirX * gap;
                    pos1.y += dirY * gap;
                    pos2.x -= dirX * gap;
                    pos2.y -= dirY * gap;
                }

                ctx.strokeStyle = lineColor;
                ctx.shadowBlur = 15;
                ctx.shadowColor = lineColor;
                ctx.beginPath();
                ctx.moveTo(pos1.x, pos1.y);
                ctx.lineTo(pos2.x, pos2.y);
                ctx.stroke();
            }
        });
    });
    ctx.shadowBlur = 0;

    // 2. Draw Element Lands
    elements.forEach(el => {
        const landSize = el.gridSize * CELL_PITCH - CELL_GAP + (LAND_PADDING * 2);
        const startX = (el.xpos * GLOBAL_STEP) - (landSize / 2);
        const startY = (el.ypos * GLOBAL_STEP) - (landSize / 2);

        // Land Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(startX, startY, landSize, landSize, 12);
            ctx.fill(); ctx.stroke();
        } else {
            ctx.fillRect(startX, startY, landSize, landSize);
            ctx.strokeRect(startX, startY, landSize, landSize);
        }

        // Grid Cells
        const centerIdx = Math.floor(el.gridSize / 2);
        for (let y = 0; y < el.gridSize; y++) {
            for (let x = 0; x < el.gridSize; x++) {
                const cellX = startX + LAND_PADDING + x * CELL_PITCH;
                const cellY = startY + LAND_PADDING + y * CELL_PITCH;

                if (x === centerIdx && y === centerIdx) {
                    // Nucleus Node
                    const elColor = getElementColor(el);
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = elColor;
                    ctx.beginPath();
                    ctx.arc(cellX + CELL_SIZE / 2, cellY + CELL_SIZE / 2, CELL_SIZE / 2 + 5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = elColor;
                    ctx.stroke();
                    ctx.shadowBlur = 0;

                    ctx.fillStyle = elColor;
                    ctx.font = 'bold 16px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(el.symbol, cellX + CELL_SIZE / 2, cellY + CELL_SIZE / 2);
                } else {
                    // Cloud Node
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'; // Brightened grid lines
                    ctx.lineWidth = 1;

                    let isExit = false;
                    let exitColor = null;

                    const isMidX = (x === centerIdx);
                    const isMidY = (y === centerIdx);
                    if ((isMidX && (y === 0 || y === el.gridSize - 1)) || (isMidY && (x === 0 || x === el.gridSize - 1))) {
                        let dx = 0, dy = 0;
                        if (x === 0) dx = -1;
                        if (x === el.gridSize - 1) dx = 1;
                        if (y === 0) dy = -1;
                        if (y === el.gridSize - 1) dy = 1;

                        const target = getNearestElementFrom(el, dx, dy);
                        let valid = false;
                        let moveType = 'NORMAL';

                        if (target) {
                            valid = true;
                            if (el.group === 2 && dx === 1 && target.group >= 3 && target.group <= 12) valid = false;
                            if (el.group === 3 && dx === -1 && target.group === 2) valid = false;
                            if (el.group === 18 && dy !== 0) valid = false;
                            if (el.group === 18 && dx === 1) valid = false;
                            // Block paths between transition metals (y<=7) and f-block rows (y>=9)
                            if (el.ypos <= 7 && target.ypos >= 9) valid = false;
                            if (el.ypos >= 9 && target.ypos <= 7) valid = false;
                            // Exception: Ac → Ce path (treated as a bridge)
                            if ((el.symbol === 'Ac' && target.symbol === 'Ce') || (el.symbol === 'Ce' && target.symbol === 'Ac')) {
                                valid = true;
                            }
                            moveType = getMovementType(el, target);
                            // Override for Ac-Ce
                            if ((el.symbol === 'Ac' && target.symbol === 'Ce') || (el.symbol === 'Ce' && target.symbol === 'Ac')) {
                                moveType = 'F_DESCENT';
                            }
                        }


                        if (valid) {
                            isExit = true;
                            if (moveType === 'IONIC') exitColor = 'rgba(200, 100, 255, 1)';
                            else if (moveType === 'COVALENT') exitColor = 'rgba(100, 200, 255, 1)';
                            else if (moveType === 'NOBLE_BRIDGE') exitColor = 'rgba(255, 215, 0, 1)'; // Gold
                            else if (moveType === 'F_DESCENT') exitColor = 'rgba(100, 200, 255, 1)'; // Cyan
                            else exitColor = 'rgba(100, 255, 100, 1)'; // Normal Green
                        }
                    }

                    if (isExit && exitColor) {
                        ctx.fillStyle = exitColor.replace('1)', '0.15)');
                        ctx.strokeStyle = exitColor.replace('1)', '0.5)');
                        ctx.shadowBlur = 6;
                        ctx.shadowColor = exitColor;
                    }

                    if (ctx.roundRect) {
                        ctx.beginPath();
                        ctx.roundRect(cellX, cellY, CELL_SIZE, CELL_SIZE, 4);
                        ctx.fill(); ctx.stroke();
                    } else {
                        ctx.fillRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
                        ctx.strokeRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
                    }
                    ctx.shadowBlur = 0;

                    // Draw shard icon if present on this cell
                    const shardHere = (el.symbol === state.currentElement.symbol) ? getShardAt(el.symbol, x, y) : null;
                    if (shardHere) {
                        const shardColors = { s: '#ff6666', p: '#66ccff', d: '#ffcc33', f: '#cc66ff' };
                        const sc = shardColors[shardHere.type];
                        const cx = cellX + CELL_SIZE / 2;
                        const cy = cellY + CELL_SIZE / 2;
                        const r = 12; // Increased from 8
                        ctx.save();
                        ctx.shadowBlur = 20; // Increased from 10
                        ctx.shadowColor = sc;
                        ctx.fillStyle = sc;
                        ctx.beginPath();
                        ctx.moveTo(cx, cy - r);
                        ctx.lineTo(cx + r, cy);
                        ctx.lineTo(cx, cy + r);
                        ctx.lineTo(cx - r, cy);
                        ctx.closePath();
                        ctx.fill();
                        ctx.restore();
                    }
                }
            }
        }
    });

    // 3. Draw Player
    ctx.strokeStyle = '#fff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#fff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(pPos.x, pPos.y, 14, 0, Math.PI * 2); // Larger hollow circle
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.restore();
    requestAnimationFrame(renderLoop);
}

// --- Nucleus Menu Logic ---
function openNucleusMenu() {
    const el = state.remoteVaultActive ? { symbol: 'REMOTE', name: 'Remote Noble Vault', group: 18 } : state.currentElement;
    state.menuOpen = true;
    clearAction();
    menuOverlay.style.display = 'flex';
    menuTitle.innerText = state.remoteVaultActive ? el.name : `${el.atomicNumber} - ${el.name}`;
    menuTitle.style.color = state.remoteVaultActive ? '#ff00ff' : getElementColor(el);

    if (el.group === 18) {
        // Noble Gas
        menuStandard.style.display = 'none';
        menuNoble.style.display = 'block'; // Or flex if you styled it

        let sumElectrons = 0;
        let sumEnergy = 0;
        let capElectrons = 0;
        let capEnergy = 0;

        if (state.remoteVaultActive) {
            if (!state.banks['REMOTE']) state.banks['REMOTE'] = { electrons: 0, energy: 0 };
            for (const sym of state.visitedElements) {
                const tempEl = elements.find(e => e.symbol === sym);
                if (tempEl && tempEl.group === 18 && nobleCapacities[sym]) {
                    capElectrons += nobleCapacities[sym].electrons;
                    capEnergy += nobleCapacities[sym].energy;
                    if (state.banks[sym]) {
                        sumElectrons += state.banks[sym].electrons;
                        sumEnergy += state.banks[sym].energy;
                    }
                }
            }
            state.banks['REMOTE'].electrons = sumElectrons;
            state.banks['REMOTE'].energy = sumEnergy;
        } else {
            capElectrons = nobleCapacities[el.symbol].electrons;
            capEnergy = nobleCapacities[el.symbol].energy;
            const bank = state.banks ? state.banks[el.symbol] : null;
            if (!bank) {
                if (!state.banks) state.banks = {};
                state.banks[el.symbol] = { electrons: 0, energy: 0 };
            }
        }

        vaultElectronsSpan.innerText = state.banks[el.symbol].electrons;
        vaultEnergySpan.innerText = Math.round(state.banks[el.symbol].energy);
        capElectronsSpan.innerText = capElectrons;
        capEnergySpan.innerText = capEnergy;

        const storeBtn = document.getElementById('btn-bank-store');
        if (state.remoteVaultActive) {
            storeBtn.style.display = 'none';
        } else {
            storeBtn.style.display = 'block';
        }
    } else {
        // Standard Element
        menuNoble.style.display = 'none';
        menuStandard.style.display = 'grid'; // Grid display for 2x2

        const debt = state.elementDebts[el.symbol] || 0;
        const giveCount = state.elementGiveCount[el.symbol] || 0;

        // 120x first ionization energy, multiplied by 1.5 for each prior grab (ionization saver applied)
        let baseCost = (el.firstIonizationEnergy && !el.isFBlock) ? Math.round(el.firstIonizationEnergy * 120) : null;
        if (baseCost !== null) {
            if (state.upgrades.ionizationSaver === 1) baseCost = Math.round(baseCost * 0.4);
            else if (state.upgrades.ionizationSaver >= 2) baseCost = Math.round(baseCost * 0.1);
        }
        const currentCost = baseCost !== null ? Math.round(baseCost * Math.pow(1.5, debt)) : null;

        // 2.3^(electron affinity) * 600, multiplied by 0.8 for each prior give (unavailable if electronAffinity is 0)
        const baseGain = el.electronAffinity ? Math.pow(2.3, el.electronAffinity) * 600 : null;
        const gain = baseGain !== null ? Math.round(baseGain * Math.pow(0.8, giveCount)) : null;

        const electronsRemaining = el.atomicNumber - debt + giveCount;

        if (currentCost !== null) {
            costSpan.innerText = currentCost;
        } else {
            costSpan.innerText = 'N/A';
        }

        if (gain !== null) {
            gainSpan.innerText = gain;
        } else {
            gainSpan.innerText = 'UNAVAILABLE';
        }

        if (grabRemainingSpan) grabRemainingSpan.innerText = electronsRemaining;

        const grabBtn = document.getElementById('btn-grab-electron');
        if (baseCost === null) {
            grabBtn.classList.add('disabled');
            grabBtn.disabled = true;
            grabBtn.style.opacity = '0.5';
            costSpan.innerText = 'UNAVAILABLE';
        } else if (electronsRemaining <= 0) {
            grabBtn.classList.add('disabled');
            grabBtn.disabled = true;
            grabBtn.style.opacity = '0.5';
            costSpan.innerText = 'DEPLETED';
        } else {
            grabBtn.classList.remove('disabled');
            grabBtn.disabled = false;
            grabBtn.style.opacity = '1';
        }

        const giveBtn = document.getElementById('btn-give-electron');
        if (gain === null) {
            giveBtn.classList.add('disabled');
            giveBtn.disabled = true;
            giveBtn.style.opacity = '0.5';
            gainSpan.innerText = 'UNAVAILABLE';
        } else if (state.inventory.electrons <= 0) {
            giveBtn.classList.add('disabled');
            giveBtn.disabled = true;
            giveBtn.style.opacity = '0.5';
        } else {
            giveBtn.classList.remove('disabled');
            giveBtn.disabled = false;
            giveBtn.style.opacity = '1';
        }

        // Crafting Button
        const availableCrafts = craftableItems.filter(item => item.locations.includes(el.symbol));
        if (availableCrafts.length > 0) {
            btnCraft.classList.remove('disabled');
            btnCraft.disabled = false;
            btnCraft.style.opacity = '1';
            btnCraft.style.cursor = 'pointer';
            btnCraft.querySelector('p').innerText = `${availableCrafts.length} Recipes Available`;
        } else {
            btnCraft.classList.add('disabled');
            btnCraft.disabled = true;
            btnCraft.style.opacity = '0.5';
            btnCraft.style.cursor = 'not-allowed';
            btnCraft.querySelector('p').innerText = `Unavailable`;
        }
    }
}

function closeNucleusMenu() {
    state.menuOpen = false;
    menuOverlay.style.display = 'none';

    if (state.remoteVaultActive) {
        state.remoteVaultActive = false;
    } else {
        // Re-show the nucleus prompt since the player is still standing on it
        promptAction('NUCLEUS_MENU', {}, "Press [ENTER] to access the Nucleus Hub");
    }
}

document.getElementById('btn-close-nucleus').addEventListener('click', closeNucleusMenu);

// ============================
// NUCLEUS DRAFTING MINIGAME
// ============================
const minigameOverlay = document.getElementById('minigame-overlay');
const minigameRound = document.getElementById('minigame-round');
const minigameCardSymbol = document.getElementById('minigame-card-symbol');
const minigameCardName = document.getElementById('minigame-card-name');
const minigameActiveArea = document.getElementById('minigame-active-area');
const minigameResults = document.getElementById('minigame-results');
const minigameResultList = document.getElementById('minigame-result-list');
const minigameCategoriesContainer = document.getElementById('minigame-categories');

// All possible categories (normal versions)
const allCategoryLabels = {
    electronegativity: 'High Electronegativity',
    electronAffinity: 'High Electron Affinity',
    firstIonizationEnergy: 'High First Ionization Energy',
    atomicRadius: 'Large Atomic Radius',
    atomicNumber: 'High Coulombic Charge',
    molarMass: 'High Molar Mass',
    density: 'High Density',
    meltingPoint: 'High Melting Point',
    boilingPoint: 'High Boiling Point'
};

// Opposite labels (for "inverted" categories)
const oppositeCategoryLabels = {
    electronegativity: 'Low Electronegativity',
    electronAffinity: 'Low Electron Affinity',
    firstIonizationEnergy: 'Low First Ionization Energy',
    atomicRadius: 'Small Atomic Radius',
    atomicNumber: 'Low Coulombic Charge',
    molarMass: 'Low Molar Mass',
    density: 'Low Density',
    meltingPoint: 'Low Melting Point',
    boilingPoint: 'Low Boiling Point'
};

// The 6 base categories (periods 1-5)
const baseCategories = ['electronegativity', 'electronAffinity', 'firstIonizationEnergy', 'atomicRadius', 'atomicNumber', 'molarMass'];
// Extended pool (period 6+)
const extendedCategories = [...baseCategories, 'density', 'meltingPoint', 'boilingPoint'];

let minigameState = {
    active: false,
    spinning: false,
    round: 0,
    totalSlots: 0,
    dealtElements: [],
    backupElements: [],
    skipsRemaining: 3,
    currentElement: null,
    assignments: {},      // { slotKey: element }
    slotConfigs: [],      // [{category, isOpposite, slotKey}]
    lockedSlots: new Set(),
    nucleusElement: null,
    runningTotalRank: 0,
    pendingReward: 0
};

// Skips per period
const skipsPerPeriod = { 1: 1, 2: 2, 3: 2, 4: 3, 5: 3, 6: 4, 7: 5 };

// Helper: pick N random items from array without replacement
function pickRandom(arr, n) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(n, arr.length));
}

// Helper: randomly pick how many opposites given a range [min, max]
function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildMinigameConfig(period) {
    let totalSlots, categoryPool, numOpposites;

    switch (period) {
        case 1:
            totalSlots = 3;
            categoryPool = baseCategories;
            numOpposites = 0;
            break;
        case 2:
            totalSlots = 4;
            categoryPool = baseCategories;
            numOpposites = 0;
            break;
        case 3:
            totalSlots = 4;
            categoryPool = baseCategories;
            numOpposites = randomInRange(0, 2);
            break;
        case 4:
            totalSlots = 6;
            categoryPool = baseCategories;
            numOpposites = 0;
            break;
        case 5:
            totalSlots = 6;
            categoryPool = baseCategories;
            numOpposites = randomInRange(1, 3);
            break;
        case 6:
            totalSlots = 6;
            categoryPool = extendedCategories;
            numOpposites = randomInRange(1, 3);
            break;
        case 7:
        default:
            totalSlots = 9;
            categoryPool = extendedCategories;
            numOpposites = randomInRange(0, 9);
            break;
    }

    // Pick categories from the pool
    const selectedCategories = pickRandom(categoryPool, totalSlots);

    // Decide which ones become opposites
    const oppositeIndices = new Set();
    if (numOpposites > 0) {
        const indices = [...Array(selectedCategories.length).keys()];
        const shuffledIndices = indices.sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(numOpposites, selectedCategories.length); i++) {
            oppositeIndices.add(shuffledIndices[i]);
        }
    }

    // Build slot configs
    const slotConfigs = selectedCategories.map((cat, i) => {
        const isOpposite = oppositeIndices.has(i);
        const slotKey = isOpposite ? `opposite_${cat}` : cat;
        return { category: cat, isOpposite, slotKey };
    });

    return { totalSlots, slotConfigs };
}

function getGridColumns(totalSlots) {
    if (totalSlots <= 3) return 3;       // 1x3
    if (totalSlots <= 4) return 2;       // 2x2
    if (totalSlots <= 6) return 3;       // 2x3
    return 3;                            // 3x3
}

// Calculate live energy from running total rank
function calcMinigameEnergy(totalRank) {
    const protons = minigameState.nucleusElement.atomicNumber;
    const baseEnergy = Math.pow(0.986, totalRank - 12) * Math.pow(1.04, protons + 11) * 2300;
    const boosterLvl = state.upgrades.energyBooster || 0;
    const boosterMultipliers = { 0: 1, 1: 1.5, 2: 2, 3: 3, 4: 4.5, 5: 8, 6: 17 };
    const mult = boosterMultipliers[boosterLvl] || 1;
    let energy = Math.round(baseEnergy * mult);
    // F-block energy nerf: earn 6x less energy
    if (state.currentElement.isFBlock) energy = Math.round(energy / 6);
    return energy;
}

// Update the collect button text and state
function updateCollectButton() {
    const btn = document.getElementById('btn-collect-energy');
    const energy = calcMinigameEnergy(minigameState.runningTotalRank);
    minigameState.pendingReward = energy;
    btn.innerText = `Collect ${energy} Energy`;

    const isComplete = minigameState.round >= minigameState.totalSlots;
    btn.disabled = !isComplete;
    btn.style.opacity = isComplete ? '1' : '0.5';
}

// Find the best slot for an element among available (unlocked) slots
function findBestSlotForElement(el) {
    let bestRank = 999;
    let bestSlot = null;

    for (const slot of minigameState.slotConfigs) {
        if (minigameState.lockedSlots.has(slot.slotKey)) continue;
        let rank = getElementRank(el, slot.category, slot.isOpposite);
        if (rank < bestRank) {
            bestRank = rank;
            bestSlot = slot;
        }
    }

    return { bestSlot, bestRank };
}

// Show the rank notification
function showRankNotification(el, rank, bestSlot, bestRank, placedSlot) {
    const notif = document.getElementById('minigame-notification');
    const rankText = document.getElementById('notif-rank-text');
    const bestText = document.getElementById('notif-best-text');

    const placedLabel = placedSlot.isOpposite
        ? oppositeCategoryLabels[placedSlot.category]
        : allCategoryLabels[placedSlot.category];

    rankText.innerHTML = `<strong>${el.name}</strong> → Rank <strong>#${rank}</strong> in ${placedLabel}`;

    if (bestSlot) {
        const bestLabel = bestSlot.isOpposite
            ? oppositeCategoryLabels[bestSlot.category]
            : allCategoryLabels[bestSlot.category];
        if (bestSlot.slotKey === placedSlot.slotKey) {
            bestText.innerHTML = `✅ Best available slot!`;
            bestText.style.color = '#4ade80';
        } else {
            bestText.innerHTML = `💡 Best was: ${bestLabel} (Rank #${bestRank})`;
            bestText.style.color = '#facc15';
        }
    } else {
        bestText.innerHTML = '';
    }

    notif.style.display = 'block';
    // Re-trigger animation
    notif.style.animation = 'none';
    notif.offsetHeight; // force reflow
    notif.style.animation = 'notifFadeIn 0.3s ease';
}

function getMinigameElementPools() {
    const nobleGases = elements.filter(el => el.group === 18);
    const p2p3set = new Set(['H', 'Br', 'Ca', 'K', 'Fr', 'Ts', 'Ra', 'Mc', 'Ac', 'Lv', 'Th', 'Fl', 'Nh']);
    const p2p3 = elements.filter(el =>
        ((el.period === 2 || el.period === 3 || p2p3set.has(el.symbol)) && el.group !== 18)
    );
    const dBlock = elements.filter(el => el.group >= 3 && el.group <= 12 && !el.isFBlock);
    const fBlock = elements.filter(el => el.isFBlock);

    const aboveSets = new Set([...nobleGases, ...p2p3, ...dBlock, ...fBlock]);
    const everythingElse = elements.filter(el => !aboveSets.has(el));

    return { nobleGases, p2p3, dBlock, fBlock, everythingElse };
}

function getRandomElementFromPool(pool, usedSet) {
    const available = pool.filter(el => !usedSet.has(el.symbol));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
}

function pickElementWithProbabilities(pools, usedSet) {
    let r = Math.random();
    let selectedPool = null;

    if (r < 0.10) selectedPool = pools.nobleGases;
    else if (r < 0.60) selectedPool = pools.p2p3;
    else if (r < 0.75) selectedPool = pools.dBlock;
    else if (r < 0.85) selectedPool = pools.fBlock;
    else selectedPool = pools.everythingElse;

    let el = getRandomElementFromPool(selectedPool, usedSet);
    if (!el) {
        const allAvailable = elements.filter(e => !usedSet.has(e.symbol));
        if (allAvailable.length > 0) {
            el = allAvailable[Math.floor(Math.random() * allAvailable.length)];
        }
    }
    return el;
}

function startMinigame() {
    // Close the nucleus menu
    menuOverlay.style.display = 'none';

    const isFBlock = state.currentElement.category === 'lanthanide' || state.currentElement.category === 'actinide';
    if (isFBlock) {
        let radBurst = 20;
        if (state.upgrades.shieldingSuit) radBurst = 10;
        state.radiation += radBurst;
        if (state.radiation > 100) state.radiation = 100;
        updateHUD();
    }

    const period = state.currentElement.period || 1;
    const config = buildMinigameConfig(period);

    minigameState.active = true;
    minigameState.round = 0;
    minigameState.totalSlots = config.totalSlots;
    minigameState.assignments = {};
    minigameState.lockedSlots = new Set();
    minigameState.slotConfigs = config.slotConfigs;
    minigameState.nucleusElement = state.currentElement;
    minigameState.skipsRemaining = skipsPerPeriod[period] || 3;
    minigameState.runningTotalRank = 0;
    minigameState.pendingReward = 0;

    // Pick N random distinct elements using configured probabilities, plus backups for skipping
    const pools = getMinigameElementPools();
    const usedSet = new Set();
    minigameState.dealtElements = [];
    minigameState.backupElements = [];

    for (let i = 0; i < config.totalSlots; i++) {
        let el = pickElementWithProbabilities(pools, usedSet);
        if (el) {
            usedSet.add(el.symbol);
            minigameState.dealtElements.push(el);
        }
    }

    for (let i = 0; i < 15; i++) {
        let el = pickElementWithProbabilities(pools, usedSet);
        if (el) {
            usedSet.add(el.symbol);
            minigameState.backupElements.push(el);
        }
    }

    // Dynamically build category buttons
    minigameCategoriesContainer.innerHTML = '';
    const cols = getGridColumns(config.totalSlots);
    minigameCategoriesContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    config.slotConfigs.forEach(slot => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary category-btn';
        btn.dataset.slotKey = slot.slotKey;

        const labelText = slot.isOpposite
            ? oppositeCategoryLabels[slot.category]
            : allCategoryLabels[slot.category];

        btn.innerHTML = `
            <div class="cat-label">${labelText}</div>
            <div class="cat-value"></div>
        `;

        btn.addEventListener('click', () => {
            assignToSlot(slot.slotKey);
        });

        minigameCategoriesContainer.appendChild(btn);
    });

    // Reset UI
    minigameActiveArea.style.display = 'flex';
    minigameResults.style.display = 'none';
    document.getElementById('minigame-notification').style.display = 'none';

    minigameOverlay.style.display = 'flex';
    updateCollectButton();
    dealNextElement();
}

function dealNextElement() {
    if (minigameState.round >= minigameState.totalSlots) {
        calculateResults();
        return;
    }

    const finalEl = minigameState.dealtElements[minigameState.round];
    minigameState.spinning = true;

    const skipBtn = document.getElementById('btn-skip-element');
    skipBtn.disabled = true;
    skipBtn.style.opacity = '0.5';
    skipBtn.innerText = `⏭ Skip (${minigameState.skipsRemaining} left)`;

    const card = document.getElementById('minigame-card');
    card.classList.remove('selected');

    const minigameCardNumber = document.getElementById('minigame-card-number');

    let spins = 0;
    const maxSpins = 15;
    const interval = setInterval(() => {
        const randomEl = elements[Math.floor(Math.random() * elements.length)];
        minigameCardNumber.innerText = randomEl.atomicNumber;
        minigameCardSymbol.innerText = randomEl.symbol;
        minigameCardName.innerText = randomEl.name;
        const color = getElementColor(randomEl);
        card.style.borderColor = color;
        card.style.boxShadow = `0 0 25px ${color}`;
        minigameCardSymbol.style.color = color;

        spins++;
        if (spins >= maxSpins) {
            clearInterval(interval);
            minigameState.currentElement = finalEl;
            minigameState.spinning = false;

            minigameRound.innerText = `Round ${minigameState.round + 1} / ${minigameState.totalSlots}`;
            minigameCardNumber.innerText = finalEl.atomicNumber;
            minigameCardSymbol.innerText = finalEl.symbol;
            minigameCardName.innerText = finalEl.name;
            const finalColor = getElementColor(finalEl);
            card.style.borderColor = finalColor;
            card.style.boxShadow = `0 0 25px ${finalColor}`;
            minigameCardSymbol.style.color = finalColor;

            // Trigger pulse animation
            void card.offsetWidth; // Force reflow to restart animation
            card.classList.add('selected');

            if (minigameState.skipsRemaining <= 0) {
                skipBtn.disabled = true;
                skipBtn.style.opacity = '0.5';
                skipBtn.innerText = '⏭ Skip (0 left)';
            } else {
                skipBtn.disabled = false;
                skipBtn.style.opacity = '1';
                skipBtn.innerText = `⏭ Skip (${minigameState.skipsRemaining} left)`;
            }

            applyTrendAnalyzer(finalEl);
        }
    }, 50);
}

// Skip button click listener
document.getElementById('btn-skip-element').addEventListener('click', () => {
    if (!minigameState.active || minigameState.skipsRemaining <= 0 || minigameState.spinning) return;
    if (minigameState.backupElements.length === 0) return;

    minigameState.skipsRemaining--;
    const newEl = minigameState.backupElements.pop();
    minigameState.dealtElements[minigameState.round] = newEl;

    dealNextElement();
});

function assignToSlot(slotKey) {
    if (!minigameState.active || !minigameState.currentElement || minigameState.spinning) return;
    if (minigameState.lockedSlots.has(slotKey)) return;

    document.querySelectorAll('.trend-worst').forEach(div => div.classList.remove('trend-worst'));

    const el = minigameState.currentElement;

    // Find the best available slot BEFORE locking this one
    const { bestSlot, bestRank } = findBestSlotForElement(el);

    // Find the slot config for the chosen slot
    const placedSlot = minigameState.slotConfigs.find(s => s.slotKey === slotKey);

    // Calculate rank for the placement
    let rank = getElementRank(el, placedSlot.category, placedSlot.isOpposite);

    // Lock it
    minigameState.assignments[slotKey] = el;
    minigameState.lockedSlots.add(slotKey);
    minigameState.runningTotalRank += rank;
    if (rank <= 5) state.top5Placements++;

    // Determine rank quality class
    let rankClass = 'cat-rank-bad';
    if (rank <= 10) rankClass = 'cat-rank-good';
    else if (rank <= 40) rankClass = 'cat-rank-ok';

    // Update the button visually: "Name (Rank #X)"
    const buttons = minigameCategoriesContainer.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        if (btn.dataset.slotKey === slotKey) {
            btn.disabled = true;
            btn.style.opacity = '0.6';
            btn.classList.add('disabled');
            const valDiv = btn.querySelector('.cat-value');
            if (valDiv) {
                valDiv.innerHTML = `${el.name} <span class="cat-rank-display ${rankClass}">(Rank #${rank})</span>`;
            }
        }
    });

    // Show rank notification
    showRankNotification(el, rank, bestSlot, bestRank, placedSlot);

    // Update live energy
    updateCollectButton();

    minigameState.round++;
    dealNextElement();
}

function calculateResults() {
    minigameActiveArea.style.display = 'none';
    minigameResults.style.display = 'block';

    let resultHTML = '';

    for (const slot of minigameState.slotConfigs) {
        const el = minigameState.assignments[slot.slotKey];
        if (!el) continue;

        let rank = getElementRank(el, slot.category, slot.isOpposite);

        const labelText = slot.isOpposite
            ? oppositeCategoryLabels[slot.category]
            : allCategoryLabels[slot.category];

        resultHTML += `<div class="result-item">
            <strong>${labelText}</strong><br>
            ${el.name} <span class="rank">Rank #${rank}</span>
        </div>`;
    }

    minigameResultList.innerHTML = resultHTML;

    // Final energy update
    updateCollectButton();
}

// Collect energy button
document.getElementById('btn-collect-energy').addEventListener('click', () => {
    if (!minigameState.active) return;
    if (minigameState.round < minigameState.totalSlots) return;

    if (minigameState.pendingReward) {
        const reward = minigameState.pendingReward;
        const before = state.energy;

        if (state.upgrades.energyRouter && state.energy + reward > state.maxEnergy) {
            const spaceInMax = Math.max(0, state.maxEnergy - state.energy);
            const overflow = reward - spaceInMax;
            const routed = routeOverflowEnergy(overflow);
            state.energy = Math.min(state.maxEnergy, state.energy + spaceInMax);
            state.totalEnergyEarned += (state.energy - before) + routed;
        } else {
            state.energy = Math.min(state.maxEnergy, state.energy + reward);
            state.totalEnergyEarned += (state.energy - before);
        }

        state.maxEnergyFromHarvest = Math.max(state.maxEnergyFromHarvest || 0, reward);

        minigameState.pendingReward = 0;
    }

    // Catalytic Ore Reward Logic
    const el = state.currentElement;
    if (el && el.symbol !== 'H') {
        const numCategories = minigameState.totalSlots;
        const avgRank = minigameState.runningTotalRank / numCategories;
        let chance = Math.pow(0.9, avgRank) * 2.3;

        // Tripled in d-block (groups 3-12 and not f-block)
        if (el.group >= 3 && el.group <= 12 && !el.isFBlock) {
            chance *= 2;
        }
        // Doubled in period 7
        if (el.period === 7) {
            chance *= 2;
        }
        // Halved in period 2 and 3
        if (el.period === 2 || el.period === 3) {
            chance *= 0.5;
        }

        const roll = Math.random();
        if (roll < chance) {
            state.inventory.catalyticOres++;
            state.totalCatalyticOres++;
            showNotification("The nucleus precipitated a Catalytic Ore!", 'success');
        }
    }

    minigameState.active = false;
    minigameOverlay.style.display = 'none';
    state.menuOpen = false;
    updateHUD();
    // Re-show nucleus prompt
    promptAction('NUCLEUS_MENU', {}, "Press [ENTER] to access the Nucleus Hub");
    saveGame();
});

// Wire the Harvest Energy button to trigger the minigame
document.getElementById('btn-harvest').addEventListener('click', () => {
    startMinigame();
});

document.getElementById('btn-grab-electron').addEventListener('click', () => {
    const maxElectrons = storageUpgrades[state.upgrades.storageCapacity].electrons;
    if (state.inventory.electrons >= maxElectrons) {
        if (!state.upgrades.electronRouter) {
            showNotification("Electron hotbar is full! Give or use electrons before grabbing more.");
            return;
        } else {
            let space = 0;
            for (const symbol of nobleVaultOrder) {
                if (!isNobleVaultUnlocked(symbol)) continue;
                if (!state.banks[symbol]) state.banks[symbol] = { electrons: 0, energy: 0 };
                space += nobleCapacities[symbol].electrons - state.banks[symbol].electrons;
            }
            if (space <= 0) {
                showNotification("Electron hotbar AND Noble Vaults are full!");
                return;
            }
        }
    }
    const el = state.currentElement;
    if (el.isFBlock) {
        showNotification("Electrons are unavailable in the F-block!");
        return;
    }
    if (!el.firstIonizationEnergy) {
        showNotification("This element has no ionization energy! Unable to grab electrons.");
        return;
    }
    const debt = state.elementDebts[el.symbol] || 0;
    let baseCost = Math.round(el.firstIonizationEnergy * 120);
    if (state.upgrades.ionizationSaver === 1) baseCost = Math.round(baseCost * 0.4);
    else if (state.upgrades.ionizationSaver >= 2) baseCost = Math.round(baseCost * 0.1);
    const currentCost = Math.round(baseCost * Math.pow(1.5, debt));

    if (state.energy < currentCost) {
        showNotification("Not enough energy to grab this electron!");
        return;
    }
    state.energy -= currentCost;

    state.inventory.electrons++;

    if (state.inventory.electrons > maxElectrons) {
        const overflow = state.inventory.electrons - maxElectrons;
        const routed = routeOverflowElectrons(overflow);
        state.inventory.electrons -= routed;
    }

    state.totalElectronsEarned++;
    state.elementDebts[el.symbol] = debt + 1;
    if (el && el.symbol === 'Cs') {
        state.grabbedCsElectron = true;
    }
    updateHUD();
    openNucleusMenu();
});

document.getElementById('btn-give-electron').addEventListener('click', () => {
    const el = state.currentElement;
    if (!el.electronAffinity) {
        showNotification("This element does not accept donated electrons!");
        return;
    }
    const giveCount = state.elementGiveCount[el.symbol] || 0;
    const baseGain = Math.pow(2.3, el.electronAffinity) * 600;
    const gain = Math.round(baseGain * Math.pow(0.8, giveCount));

    if (state.inventory.electrons > 0 && gain > 0) {
        state.inventory.electrons--;
        const before = state.energy;

        if (state.upgrades.energyRouter && state.energy + gain > state.maxEnergy) {
            const spaceInMax = Math.max(0, state.maxEnergy - state.energy);
            const overflow = gain - spaceInMax;
            const routed = routeOverflowEnergy(overflow);
            state.energy = Math.min(state.maxEnergy, state.energy + spaceInMax);
            state.totalEnergyEarned += (state.energy - before) + routed;
        } else {
            state.energy = Math.min(state.maxEnergy, state.energy + gain);
            state.totalEnergyEarned += (state.energy - before);
        }

        state.elementGiveCount[el.symbol] = giveCount + 1;
        updateHUD();
        openNucleusMenu();
    }
});

document.getElementById('btn-bank-store').addEventListener('click', () => {
    const el = state.remoteVaultActive ? { symbol: 'REMOTE' } : state.currentElement;
    const res = bankResource.value;
    const rawAmt = parseInt(bankAmount.value) || 0;
    if (rawAmt <= 0) return;

    let cap = 0;
    if (state.remoteVaultActive) {
        for (const sym of state.visitedElements) {
            const tempEl = elements.find(e => e.symbol === sym);
            if (tempEl && tempEl.group === 18 && nobleCapacities[sym]) {
                cap += nobleCapacities[sym][res];
            }
        }
    } else {
        cap = nobleCapacities[el.symbol][res];
    }
    const current = state.banks[el.symbol][res];

    let amt = rawAmt;
    const remainingSpace = cap - current;

    if (remainingSpace <= 0) {
        showNotification(`Vault is already full of ${res}!`);
        return;
    }
    amt = Math.min(amt, remainingSpace);

    if (res === 'electrons') {
        if (state.inventory.electrons < amt) {
            showNotification("Not enough resources to store!");
            return;
        }
        amt = Math.min(amt, state.inventory.electrons);
        state.inventory.electrons -= amt;
        state.banks[el.symbol].electrons += amt;
    } else if (res === 'energy') {
        if (state.energy < amt) {
            showNotification("Not enough resources to store!");
            return;
        }
        amt = Math.min(amt, state.energy);
        state.energy -= amt;
        state.banks[el.symbol].energy += amt;
    }

    updateHUD();
    openNucleusMenu();
});

document.getElementById('btn-bank-withdraw').addEventListener('click', () => {
    const el = state.remoteVaultActive ? { symbol: 'REMOTE' } : state.currentElement;
    const res = bankResource.value;
    const rawAmt = parseInt(bankAmount.value) || 0;
    if (rawAmt <= 0) return;

    // Automatically limit amount to what can actually fit
    let amt = rawAmt;
    if (res === 'energy') {
        const capacitySpace = state.maxEnergy - state.energy;
        if (state.energy >= state.maxEnergy) {
            showNotification("Energy is already at maximum capacity!");
            return;
        }
        amt = Math.min(amt, capacitySpace);
    } else if (res === 'electrons') {
        const maxElectrons = storageUpgrades[state.upgrades.storageCapacity].electrons;
        const capacitySpace = maxElectrons - state.inventory.electrons;
        if (state.inventory.electrons >= maxElectrons) {
            showNotification("Electron hotbar is already full!");
            return;
        }
        amt = Math.min(amt, capacitySpace);
    }

    let val = (res === 'electrons') ? state.banks[el.symbol].electrons : state.banks[el.symbol].energy;

    if (val < amt) {
        showNotification("Not enough resources in vault to withdraw that amount!");
        return;
    }

    if (state.remoteVaultActive) {
        let remainingToDeduct = amt;
        for (const sym of state.visitedElements) {
            if (remainingToDeduct <= 0) break;
            const tempEl = elements.find(e => e.symbol === sym);
            if (tempEl && tempEl.group === 18 && state.banks[sym]) {
                const available = state.banks[sym][res];
                const deduct = Math.min(available, remainingToDeduct);
                state.banks[sym][res] -= deduct;
                remainingToDeduct -= deduct;
            }
        }
        state.banks['REMOTE'][res] -= amt;
    } else {
        if (res === 'electrons') {
            state.banks[el.symbol].electrons -= amt;
        } else if (res === 'energy') {
            state.banks[el.symbol].energy -= amt;
        }
    }

    if (res === 'electrons') {
        state.inventory.electrons += amt;
    } else if (res === 'energy') {
        state.energy += amt;
    }

    updateHUD();
    openNucleusMenu();
});

// --- Keyboard Logic ---
window.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') {
        if (state.mapOpen) {
            closeMap();
        } else {
            if (state.inventoryOpen) {
                closeInventoryMenu();
            }
            openMap();
        }
        return;
    }

    if (e.key === 'r' || e.key === 'R') {
        if (state.canReset) {
            const hydrogen = elements.find(el => el.symbol === 'H');
            state.currentElement = hydrogen;
            state.localX = Math.floor(hydrogen.gridSize / 2);
            state.localY = Math.floor(hydrogen.gridSize / 2);
            state.energy = 100;
            state.inventory.electrons = 0;
            state.canReset = false;
            state.radiation = 0;
            updateHUD();
            processSurvival();
            showNotification("Respawned at Hydrogen!", 'success');
            promptAction('NUCLEUS_MENU', {}, "Press [ENTER] to access the Nucleus Hub");
        }
        return;
    }

    if (e.key === 'f' || e.key === 'F') {
        const findOverlay = document.getElementById('find-menu-overlay');
        const locOverlay = document.getElementById('location-display-overlay');
        const confirmOverlay = document.getElementById('find-confirm-overlay');

        if (locOverlay.style.display === 'flex' || confirmOverlay.style.display === 'flex') {
            locOverlay.style.display = 'none';
            confirmOverlay.style.display = 'none';
            return;
        }

        if (findOverlay.style.display === 'flex') {
            findOverlay.style.display = 'none';
            state.menuOpen = false;
        } else {
            if (!state.menuOpen && !minigameState.active && !state.mapOpen) {
                openFindMenu();
            }
        }
        return;
    }

    if (e.key === 'v' || e.key === 'V') {
        const confirmOverlay = document.getElementById('vial-confirm-overlay');
        if (confirmOverlay.style.display === 'flex') {
            confirmOverlay.style.display = 'none';
            return;
        }

        if (state.inventory.radiationVial > 0 && !state.menuOpen && !minigameState.active && !state.mapOpen && !state.inventoryOpen) {
            confirmOverlay.style.display = 'flex';
        }
        return;
    }

    if (minigameState.active) {
        if (e.key === 'Escape') {
            minigameState.active = false;
            minigameOverlay.style.display = 'none';
            state.menuOpen = false;
            promptAction('NUCLEUS_MENU', {}, "Press [ENTER] to access the Nucleus Hub");
        } else if (e.key === 'Enter' && minigameState.round >= minigameState.totalSlots) {
            document.getElementById('btn-collect-energy').click();
        }
        return; // Block all movement during minigame
    }

    // Playtest cheat key: Q grants 1000 energy
    if (DEV_MODE && (e.key === 'q' || e.key === 'Q')) {
        state.energy += 100000;
        state.totalEnergyEarned += 100000;
        updateHUD();
        // Refresh open menus to reflect new energy
        if (state.menuOpen) {
            openNucleusMenu();
        }
        if (craftingOverlay && craftingOverlay.style.display === 'flex') {
            openCraftingMenu();
        }
        return;
    }

    // Playtest cheat key: Z grants shards ignoring capacity
    if (DEV_MODE && (e.key === 'z' || e.key === 'Z')) {
        state.inventory.shards.s++;
        state.inventory.shards.p++;
        state.inventory.shards.d++;
        state.inventory.shards.f++;
        state.inventory.catalyticOres++;
        state.totalCatalyticOres++;
        state.inventory.electrons += 5;
        state.totalElectronsEarned += 5;
        state.inventory.covalentBridger += 2;
        state.inventory.ionicBridger += 2;
        state.inventory.radiationVial += 2;
        const findOverlayZ = document.getElementById('find-menu-overlay');
        if (findOverlayZ && findOverlayZ.style.display === 'flex') return;
        updateHUD();
        if (state.menuOpen) {
            openNucleusMenu();
        }
        if (state.inventoryOpen) {
            openInventoryMenu();
        }
        if (craftingOverlay && craftingOverlay.style.display === 'flex') {
            openCraftingMenu();
        }
        return;
    }

    // Handle E key for inventory closing/opening first
    if (e.key === 'e' || e.key === 'E') {
        if (state.inventoryOpen) {
            closeInventoryMenu();
        } else {
            if (state.mapOpen) {
                closeMap();
            }
            if (!state.menuOpen && !minigameState.active && !(craftingOverlay && craftingOverlay.style.display === 'flex')) {
                openInventoryMenu();
            }
        }
        return;
    }

    if (state.menuOpen || state.inventoryOpen || state.mapOpen || (craftingOverlay && craftingOverlay.style.display === 'flex') || document.getElementById('vial-confirm-overlay').style.display === 'flex') {
        if (e.key === 'Escape') {
            const vialConfirm = document.getElementById('vial-confirm-overlay');
            if (vialConfirm.style.display === 'flex') {
                vialConfirm.style.display = 'none';
            } else if (state.mapOpen) {
                closeMap();
            } else if (state.inventoryOpen) {
                closeInventoryMenu();
            } else if (craftingOverlay && craftingOverlay.style.display === 'flex') {
                craftingOverlay.style.display = 'none';
                menuOverlay.style.display = 'flex'; // Go back to nucleus menu
            } else if (document.getElementById('find-menu-overlay').style.display === 'flex') {
                const locOverlay = document.getElementById('location-display-overlay');
                const confirmOverlay = document.getElementById('find-confirm-overlay');
                if (locOverlay.style.display === 'flex' || confirmOverlay.style.display === 'flex') {
                    locOverlay.style.display = 'none';
                    confirmOverlay.style.display = 'none';
                } else {
                    document.getElementById('find-menu-overlay').style.display = 'none';
                    state.menuOpen = false;
                }
            } else if (state.menuOpen) {
                closeNucleusMenu();
            }
        }
        return; // Block movement
    }

    if ((e.key === 'n' || e.key === 'N') && state.upgrades.octetRemote) {
        state.remoteVaultActive = true;
        openNucleusMenu();
        return;
    }

    if ((e.key === 'h' || e.key === 'H') && state.upgrades.hDrive) {
        promptAction('TELEPORT_H', {}, "Press ENTER to Teleport to Hydrogen");
        return;
    }

    const centerIdx = Math.floor(state.currentElement.gridSize / 2);
    if (e.key === 'Enter') {
        if (state.pendingAction) {
            executeAction();
            return;
        } else if (state.localX === centerIdx && state.localY === centerIdx) {
            openNucleusMenu();
            return;
        }
    }

    let dx = 0, dy = 0;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === 'i' || e.key === 'I') dy = -1;
    else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === 'k' || e.key === 'K') dy = 1;
    else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'j' || e.key === 'J') dx = -1;
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === 'l' || e.key === 'L') dx = 1;

    if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        tryMove(dx, dy);
    }
});

function getNearestElementFrom(sourceElement, dx, dy) {
    const currentX = sourceElement.xpos;
    const currentY = sourceElement.ypos;

    let candidates = elements.filter(e => {
        if (dx > 0) return e.xpos > currentX && e.ypos === currentY;
        if (dx < 0) return e.xpos < currentX && e.ypos === currentY;
        if (dy > 0) return e.ypos > currentY && e.xpos === currentX;
        if (dy < 0) return e.ypos < currentY && e.xpos === currentX;
        return false;
    });

    if (candidates.length === 0) return null;

    candidates.sort((a, b) => {
        return (Math.abs(a.xpos - currentX) + Math.abs(a.ypos - currentY)) -
            (Math.abs(b.xpos - currentX) + Math.abs(b.ypos - currentY));
    });

    return candidates[0];
}

function tryMove(dx, dy) {
    const el = state.currentElement;
    let newX = state.localX + dx;
    let newY = state.localY + dy;

    const centerIdx = Math.floor(el.gridSize / 2);

    if (newX < 0 || newX >= el.gridSize || newY < 0 || newY >= el.gridSize) {
        if (dx !== 0 && state.localY !== centerIdx) return;
        if (dy !== 0 && state.localX !== centerIdx) return;

        const target = getNearestElementFrom(el, dx, dy);
        if (!target) return;

        if (el.group === 2 && dx === 1 && target.group >= 3 && target.group <= 12) {
            return;
        }
        if (el.group === 3 && dx === -1 && target.group === 2) {
            return;
        }

        // Block paths between transition metals (y<=7) and f-block rows (y>=9)
        if (el.ypos <= 7 && target.ypos >= 9 && !(el.symbol === 'Ac' && target.symbol === 'Ce')) {
            return;
        }
        if (el.ypos >= 9 && target.ypos <= 7 && !(el.symbol === 'Ce' && target.symbol === 'Ac')) {
            return;
        }

        if (el.group === 18 && dy !== 0) return;
        if (el.group === 18 && dx === 1) return; // World boundary right

        const moveType = getMovementType(el, target);
        let isAcCe = (el.symbol === 'Ac' && target.symbol === 'Ce') || (el.symbol === 'Ce' && target.symbol === 'Ac');
        const bridgeKey = el.symbol + '-' + target.symbol; // Unidirectional unlock

        if (!state.bridges.has(bridgeKey)) {
            if (isAcCe || moveType === 'NOBLE_BRIDGE' || moveType === 'IONIC' || moveType === 'COVALENT') {
                return; // Block move if bridge not built
            }
        }

        let enterX = centerIdx;
        let enterY = centerIdx;
        if (dx > 0) { enterX = 0; enterY = Math.floor(target.gridSize / 2); }
        if (dx < 0) { enterX = target.gridSize - 1; enterY = Math.floor(target.gridSize / 2); }
        if (dy > 0) { enterY = 0; enterX = Math.floor(target.gridSize / 2); }
        if (dy < 0) { enterY = target.gridSize - 1; enterX = Math.floor(target.gridSize / 2); }

        clearAction();
        commitInterElementMove(target, enterX, enterY);
    } else {
        clearAction();
        commitLocalMove(newX, newY);
    }
}

function getBaseMovementCost(element) {
    if (element.isFBlock) return 3800;
    switch (element.period) {
        case 1: return 2;
        case 2: return 10;
        case 3: return 24;
        case 4: return 60;
        case 5: return 180;
        case 6: return 530;
        case 7: return 1200;
        default: return 2;
    }
}

function commitLocalMove(x, y) {
    const el = state.currentElement;
    const centerIdx = Math.floor(el.gridSize / 2);
    const isNucleus = (x === centerIdx && y === centerIdx);

    let baseAmount = getBaseMovementCost(el);
    let cost = isNucleus ? 0 : baseAmount * (1 + 0.03 * el.atomicNumber);

    if (state.radiation >= 100) cost *= 2;

    if (el.isFBlock) cost *= 2;

    //Boots
    if (state.upgrades.eBoots === 1) cost *= 0.6;
    else if (state.upgrades.eBoots === 2) cost *= 0.3;
    else if (state.upgrades.eBoots === 3) cost *= 0.1;
    else if (state.upgrades.eBoots >= 4) cost *= 0.03;

    // Radiation Penalty
    const radPenaltyBase = state.upgrades.shieldingSuit ? 1.016 : 1.02;
    cost *= Math.pow(radPenaltyBase, state.radiation);

    cost = Math.floor(cost);

    if (state.energy >= cost) {
        state.energy -= cost;
        state.localX = x;
        state.localY = y;

        updateHUD();
        processSurvival();

        if (isNucleus && !state.menuOpen) {
            promptAction('NUCLEUS_MENU', {}, "Press [ENTER] to access the Nucleus Hub");
        } else if (!isNucleus && state.pendingAction?.type === 'NUCLEUS_MENU') {
            clearAction();
        }

        // Check for shard at new position
        if (!isNucleus) {
            const shard = getShardAt(el.symbol, x, y);
            if (shard) {
                const config = SHARD_CONFIG[shard.type];
                const shardCaps = shardUpgrades[state.upgrades.shardCapacity];
                const currentCount = state.inventory.shards[shard.type];
                const maxCount = shardCaps[shard.type];

                if (!state.upgrades[config.extractorKey]) {
                    showRedMessage(`Craft the ${config.extractorName} to harvest ${shard.type.toUpperCase()}-Shards`);
                } else if (currentCount >= maxCount) {
                    showRedMessage(`You need more capacity to harvest this ${shard.type.toUpperCase()}-Shard`);
                } else {
                    const actualCost = getShardHarvestCost(shard.type);
                    promptAction('HARVEST_SHARD', { shard }, `Press [ENTER] to harvest the ${shard.type.toUpperCase()}-Shard (-${actualCost} Energy)`);
                }
            } else if (!state.pendingAction) {
                // Check if on edge to prompt bridge
                const isMidX = (x === centerIdx);
                const isMidY = (y === centerIdx);
                if ((isMidX && (y === 0 || y === el.gridSize - 1)) || (isMidY && (x === 0 || x === el.gridSize - 1))) {
                    let dx = 0, dy = 0;
                    if (x === 0) dx = -1;
                    if (x === el.gridSize - 1) dx = 1;
                    if (y === 0) dy = -1;
                    if (y === el.gridSize - 1) dy = 1;

                    const target = getNearestElementFrom(el, dx, dy);
                    if (target) {
                        let valid = true;
                        if (el.group === 2 && dx === 1 && target.group >= 3 && target.group <= 12) valid = false;
                        if (el.group === 3 && dx === -1 && target.group === 2) valid = false;
                        if (el.group === 18 && dy !== 0) valid = false;
                        if (el.group === 18 && dx === 1) valid = false;
                        if (el.ypos <= 7 && target.ypos >= 9 && !(el.symbol === 'Ac' && target.symbol === 'Ce')) valid = false;
                        if (el.ypos >= 9 && target.ypos <= 7 && !(el.symbol === 'Ce' && target.symbol === 'Ac')) valid = false;

                        if (valid) {
                            const moveType = getMovementType(el, target);
                            let isAcCe = (el.symbol === 'Ac' && target.symbol === 'Ce') || (el.symbol === 'Ce' && target.symbol === 'Ac');
                            const bridgeKey = el.symbol + '-' + target.symbol;

                            let enterX = centerIdx;
                            let enterY = centerIdx;
                            if (dx > 0) { enterX = 0; enterY = Math.floor(target.gridSize / 2); }
                            if (dx < 0) { enterX = target.gridSize - 1; enterY = Math.floor(target.gridSize / 2); }
                            if (dy > 0) { enterY = 0; enterX = Math.floor(target.gridSize / 2); }
                            if (dy < 0) { enterY = target.gridSize - 1; enterX = Math.floor(target.gridSize / 2); }

                            if (!state.bridges.has(bridgeKey)) {
                                if (isAcCe) {
                                    promptAction('UNLOCK_BRIDGE', { source: el, target, enterX, enterY, type: 'f-Block Descent', key: bridgeKey, cost: 30, color: 'var(--accent-cyan, #64c8ff)' }, `Press ENTER to Descend into the f-block! (-30 Electrons)`);
                                } else if (moveType === 'NOBLE_BRIDGE') {
                                    const nobleSymbol = target.group === 18 ? target.symbol : el.symbol;
                                    const config = nobleVaultBridgeCosts[nobleSymbol];
                                    if (state.upgrades.storageCapacity >= config.requiredLevel) {
                                        if (state.inventory.ionicBridger > 0) {
                                            promptAction('UNLOCK_BRIDGE', { source: el, target, enterX, enterY, type: 'Noble Vault Bridge', key: bridgeKey, cost: 0, useIonicBridger: true, color: 'var(--accent-gold, #ffd700)' }, `Press ENTER to build a Noble Vault Bridge to ${nobleSymbol} (-0 Electrons)`);
                                        } else {
                                            promptAction('UNLOCK_BRIDGE', { source: el, target, enterX, enterY, type: 'Noble Vault Bridge', key: bridgeKey, cost: config.cost, color: 'var(--accent-gold, #ffd700)' }, `Press ENTER to build a Noble Vault Bridge to ${nobleSymbol} (-${config.cost} Electrons)`);
                                        }
                                    } else {
                                        const upgradeNames = ['Capacity I', 'Capacity II', 'Capacity III', 'Capacity IV', 'Capacity V', 'Capacity VI'];
                                        promptAction('NO_ACTION', {}, `Requires Energy ${upgradeNames[config.requiredLevel - 1] || 'Capacity Upgrades'} to build a bridge to ${nobleSymbol}.`);
                                    }
                                } else if (moveType === 'IONIC') {
                                    const isFBlockBridge = el.isFBlock && target.isFBlock;
                                    const cost = isFBlockBridge ? 6 : 5;
                                    const type = isFBlockBridge ? 'F-Block Ionic Bridge' : 'Ionic Bridge';
                                    if (state.inventory.ionicBridger > 0) {
                                        promptAction('UNLOCK_BRIDGE', { source: el, target, enterX, enterY, type: type, key: bridgeKey, cost: 0, useIonicBridger: true, color: 'var(--danger-purple, #c864ff)' }, `Press ENTER to build an Ionic Bridge to ${target.symbol} (-1 Ionic Bridger)`);
                                    } else {
                                        promptAction('UNLOCK_BRIDGE', { source: el, target, enterX, enterY, type: type, key: bridgeKey, cost: cost, color: 'var(--danger-purple, #c864ff)' }, `Press ENTER to form an Ionic Bridge to ${target.symbol} (-${cost} Electrons)`);
                                    }
                                } else if (moveType === 'COVALENT') {
                                    if (state.inventory.covalentBridger > 0) {
                                        promptAction('UNLOCK_BRIDGE', { source: el, target, enterX, enterY, type: 'Covalent Bond', key: bridgeKey, cost: 0, useCovalentBridger: true, color: 'var(--accent-cyan, #64c8ff)' }, `Press ENTER to build a Covalent Bond to ${target.symbol} (-1 Covalent Bridger)`);
                                    } else {
                                        promptAction('UNLOCK_BRIDGE', { source: el, target, enterX, enterY, type: 'Covalent Bond', key: bridgeKey, cost: 2, color: 'var(--accent-cyan, #64c8ff)' }, `Press ENTER to form a Covalent Bond to ${target.symbol} (-2 Electrons)`);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    } else {
        showNotification("Insufficient Energy! Press [R] to respawn at H (lose all electrons)");
        state.canReset = true;
    }
}

function commitInterElementMove(targetElement, enterX, enterY) {
    let baseAmount = getBaseMovementCost(targetElement);
    let cost = baseAmount * (1 + 0.03 * targetElement.atomicNumber) * 3;

    if (state.radiation >= 100) cost *= 2;
    if (targetElement.isFBlock) cost *= 2;

    if (state.upgrades.eBoots === 1) cost *= 0.6;
    else if (state.upgrades.eBoots === 2) cost *= 0.3;
    else if (state.upgrades.eBoots === 3) cost *= 0.1;
    else if (state.upgrades.eBoots >= 4) cost *= 0.03;

    // Radiation Penalty (same as local movement)
    const radPenaltyBase = state.upgrades.shieldingSuit ? 1.016 : 1.02;
    cost *= Math.pow(radPenaltyBase, state.radiation);

    cost = Math.floor(cost);

    if (state.energy >= cost) {
        state.energy -= cost;
        state.currentElement = targetElement;
        state.localX = enterX;
        state.localY = enterY;
        state.visitedElements.add(targetElement.symbol);
        if (targetElement.group === 18) {
            state.radiation = 0;
        }

        updateHUD();
        processSurvival();
        checkWin(targetElement);
    } else {
        showNotification("Insufficient Energy to traverse the gap!");
    }
}


function promptAction(type, payload, message) {
    state.pendingAction = { type, payload };
    actionPopup.innerText = message;
    actionPopup.style.color = '#fff';
    actionPopup.style.borderColor = 'var(--accent-cyan, #00ffcc)';
    actionPopup.style.boxShadow = '0 0 20px var(--accent-cyan, #00ffcc)';
    actionPopup.style.display = 'block';
}

function showRedMessage(message) {
    state.pendingAction = null;
    actionPopup.innerText = message;
    actionPopup.style.color = '#ff6666';
    actionPopup.style.borderColor = '#ff6666';
    actionPopup.style.boxShadow = '0 0 20px #ff6666';
    actionPopup.style.display = 'block';
}

function clearAction() {
    state.pendingAction = null;
    actionPopup.style.display = 'none';
}

function executeAction() {
    const { type, payload } = state.pendingAction;

    if (type === 'UNLOCK_BRIDGE') {
        if (state.inventory.electrons >= payload.cost) {
            state.inventory.electrons -= payload.cost;
            if (payload.useIonicBridger) {
                state.inventory.ionicBridger = Math.max(0, state.inventory.ionicBridger - 1);
            }
            if (payload.useCovalentBridger) {
                state.inventory.covalentBridger = Math.max(0, state.inventory.covalentBridger - 1);
            }
            // Bidirectional unlock
            state.bridges.add(payload.source.symbol + '-' + payload.target.symbol);
            state.bridges.add(payload.target.symbol + '-' + payload.source.symbol);

            commitInterElementMove(payload.target, payload.enterX, payload.enterY);
        } else {
            showNotification(`Not enough Valence Electrons for ${payload.type}!`);
        }
    } else if (type === 'TELEPORT_H') {
        const hydrogen = elements.find(e => e.symbol === 'H');
        state.currentElement = hydrogen;
        state.localX = Math.floor(hydrogen.gridSize / 2);
        state.localY = Math.floor(hydrogen.gridSize / 2);
        updateHUD();
        processSurvival();
    } else if (type === 'HARVEST_SHARD') {
        collectShard(payload.shard);
    } else if (type === 'NUCLEUS_MENU') {
        openNucleusMenu();
        return; // Important: do not call clearAction here since openNucleusMenu handles its own flow
    }

    saveGame();
    clearAction();
}

const MAX_RADIATION_LIMITS = {
    1: 0, 2: 0, 3: 5, 4: 15, 5: 30, 6: 50, 7: 75
};

function getPeriodMaxRadiation(element) {
    if (element.category === 'lanthanide' || element.category === 'actinide') return 100;
    return MAX_RADIATION_LIMITS[element.period] || 0;
}

function processSurvival() {
    let chance = 0;
    let amount = 0;
    const isFBlock = state.currentElement.category === 'lanthanide' || state.currentElement.category === 'actinide';
    const isDBlock = state.currentElement.category === 'transition metal';
    const period = state.currentElement.period;

    if (isFBlock) { chance = 1.50; amount = 3; }
    else if (period === 3) { chance = 0.05; amount = 1; }
    else if (period === 4) { chance = 0.10; amount = 1; }
    else if (period === 5) { chance = 0.15; amount = 2; }
    else if (period === 6) { chance = 0.30; amount = 2; }
    else if (period === 7) { chance = 0.40; amount = 3; }

    if (state.upgrades.shieldingSuit) chance *= 0.5;
    if (isDBlock) amount *= 2;

    const maxRad = getPeriodMaxRadiation(state.currentElement);
    // Only cap it going UP. If they are already over the max, we let the time-based decay handle it.
    if (state.radiation <= maxRad) {
        if (Math.random() < chance) {
            state.radiation += amount;
            if (state.radiation > maxRad) {
                state.radiation = maxRad;
            }
        }
    }

    // Making sure we don't exceed absolute max of 100
    if (state.radiation > 100) state.radiation = 100;

    updateHUD();
}

function checkWin(target) {
    if (target.symbol === 'Lr' && !state.won) {
        state.won = true;

        winStatEnergy.innerText = Math.round(state.totalEnergyEarned).toLocaleString();
        winStatElectrons.innerText = state.totalElectronsEarned.toLocaleString();
        winStatElements.innerText = state.visitedElements.size;
        winStatTop5.innerText = state.top5Placements;
        setTimeout(() => { winOverlay.style.display = 'flex'; }, 500);
    }
}

function applyTrendAnalyzer(el) {
    document.querySelectorAll('.trend-worst').forEach(div => div.classList.remove('trend-worst'));

    if (!state.upgrades.trendAnalyzer) return;

    let availableSlots = minigameState.slotConfigs.filter(s => !minigameState.lockedSlots.has(s.slotKey));
    if (availableSlots.length <= 1) return;

    let worstRank = -1;
    let worstSlot = null;

    for (const slot of availableSlots) {
        let rank = getElementRank(el, slot.category, slot.isOpposite);
        if (rank > worstRank) {
            worstRank = rank;
            worstSlot = slot;
        }
    }

    if (worstSlot) {
        const btn = document.querySelector(`.category-btn[data-slot-key="${worstSlot.slotKey}"]`);
        if (btn) btn.classList.add('trend-worst');
    }
}

if (btnWinContinue) {
    btnWinContinue.addEventListener('click', () => {
        winOverlay.style.display = 'none';
    });
}

function updateHUD() {
    const storageCaps = storageUpgrades[state.upgrades.storageCapacity];
    state.maxEnergy = storageCaps.energy;

    if (state.energy >= 2) {
        state.canReset = false;
    }

    const energyPct = Math.max(0, (state.energy / state.maxEnergy) * 100);
    energyFill.style.width = `${energyPct}%`;
    energyVal.innerText = `${Math.round(state.energy)}/${state.maxEnergy}`;

    radFill.style.width = `${state.radiation}%`;
    radVal.innerText = `${Math.round(state.radiation)}%`;

    const questVal = document.getElementById('quest-value');
    const questFill = document.getElementById('quest-fill');
    if (questVal) {
        questVal.innerText = `${state.quests.completed.length} / 60`;
    }
    if (questFill) {
        const questPct = Math.max(0, Math.min(100, (state.quests.completed.length / 60) * 100));
        questFill.style.width = `${questPct}%`;
    }

    electronCount.innerText = state.inventory.electrons;
    electronMax.innerText = `/${storageCaps.electrons}`;

    // Show upgrade prompts if active
    const hDrivePrompt = document.getElementById('h-drive-prompt');
    if (hDrivePrompt) hDrivePrompt.style.display = state.upgrades.hDrive ? 'block' : 'none';

    const remoteVaultPrompt = document.getElementById('remote-vault-prompt');
    if (remoteVaultPrompt) remoteVaultPrompt.style.display = state.upgrades.octetRemote ? 'block' : 'none';

    const radVialPrompt = document.getElementById('rad-vial-prompt');
    if (radVialPrompt) {
        radVialPrompt.style.display = (state.inventory.radiationVial > 0) ? 'block' : 'none';
    }

    checkQuests();
}

// Quest animation state - tracks which slots are animating
const questSlotState = {}; // keyed by slot index, values: { animating: bool, questId: string }

function getMaxQuestSlots() {
    let maxSlots = 1;
    if (state.quests.completed.length >= 10) maxSlots = 2;
    if (state.quests.completed.length >= 30) maxSlots = 3;
    return maxSlots;
}

function getNextAvailableQuest() {
    return quests.find(q =>
        !state.quests.completed.includes(q.id) &&
        !state.quests.active.includes(q.id) &&
        (typeof q.isAvailable === 'function' ? q.isAvailable(state) : true)
    );
}

function checkQuests() {
    // Initialize active quests on first call
    const maxSlots = getMaxQuestSlots();
    while (state.quests.active.length < maxSlots) {
        const next = getNextAvailableQuest();
        if (next) {
            state.quests.active.push(next.id);
        } else break;
    }

    // Check currently active quests for completion
    for (let i = 0; i < state.quests.active.length; i++) {
        const activeId = state.quests.active[i];
        if (questSlotState[i]?.animating) continue; // Don't interrupt animations

        const questDef = quests.find(q => q.id === activeId);
        if (questDef && questDef.checkCondition(state)) {
            completeQuestAtSlot(i);
        }
    }

    renderQuestUI();
}

function completeQuestAtSlot(slotIndex) {
    const activeId = state.quests.active[slotIndex];
    const questDef = quests.find(q => q.id === activeId);
    if (!questDef) return;

    // Apply reward immediately, mark as animating (completed-wait)
    questSlotState[slotIndex] = { animating: true, phase: 'completed-wait' };
    if (questDef.rewardText && questDef.rewardText.trim() !== "") {
        showNotification(`Quest Completed: ${questDef.title}! Reward: ${questDef.rewardText}`, 'success');
    } else {
        showNotification(`Quest Completed: ${questDef.title}!`, 'success');
    }
    if (questDef.onComplete) {
        questDef.onComplete(state);
    }
    state.quests.completed.push(activeId);

    // Update quest HUD immediately for each individual completed quest in the chain
    const questVal = document.getElementById('quest-value');
    const questFill = document.getElementById('quest-fill');
    if (questVal) {
        questVal.innerText = `${state.quests.completed.length} / 60`;
    }
    if (questFill) {
        const questPct = Math.max(0, Math.min(100, (state.quests.completed.length / 60) * 100));
        questFill.style.width = `${questPct}%`;
    }

    renderQuestUI();
    saveGame();

    // Wait 1 second before starting the fade-out
    setTimeout(() => {
        questSlotState[slotIndex] = { animating: true, phase: 'fading-out' };
        const container = document.getElementById('quest-tracker');
        const card = container?.querySelector(`.quest-card[data-slot="${slotIndex}"]`);
        if (card) {
            card.classList.add('fade-out');
        }

        // Wait 2 seconds after fade begins (3 seconds total since completion) to slide in the next quest
        setTimeout(() => {
            // Remove from active
            const idx = state.quests.active.indexOf(activeId);
            if (idx !== -1) state.quests.active.splice(idx, 1);

            // Find replacement
            const maxSlots = getMaxQuestSlots();
            const next = getNextAvailableQuest();
            if (next && state.quests.active.length < maxSlots) {
                state.quests.active.splice(slotIndex, 0, next.id);
                questSlotState[slotIndex] = { animating: true, phase: 'sliding-in', questId: next.id };
                renderQuestUI(true);

                // After slide-in animation (500ms), pause for 2 seconds
                setTimeout(() => {
                    questSlotState[slotIndex] = { animating: true, phase: 'cascading-pause' };

                    // 2 seconds pause to let the player read it before it potentially completes
                    setTimeout(() => {
                        questSlotState[slotIndex] = { animating: false };
                        const newDef = quests.find(q => q.id === next.id);
                        if (newDef && newDef.checkCondition(state)) {
                            // Already completed! Trigger completion cycle
                            completeQuestAtSlot(slotIndex);
                        } else {
                            renderQuestUI(true);
                        }
                    }, 2000);
                }, 500);
            } else {
                questSlotState[slotIndex] = { animating: false };
                renderQuestUI(true);
            }
        }, 2000);
    }, 1000);
}

let lastRenderedQuestIds = '';

function renderQuestUI(forceRebuild = false) {
    const container = document.getElementById('quest-tracker');
    if (!container) return;

    const currentIds = state.quests.active.join(',');
    const anyAnimating = Object.values(questSlotState).some(s => s?.animating);

    // If any slot is animating, only update progress bars on non-animating slots (don't rebuild DOM)
    if (anyAnimating && !forceRebuild && container.children.length > 0) {
        state.quests.active.forEach((activeId, i) => {
            if (questSlotState[i]?.animating && questSlotState[i]?.phase !== 'completed-wait') return;
            const card = container.querySelector(`.quest-card[data-slot="${i}"]`);
            if (!card) return;
            const questDef = quests.find(q => q.id === activeId);
            if (!questDef?.getProgress) return;
            const prog = questDef.getProgress(state);
            const pct = Math.max(0, Math.min(100, (prog.current / prog.max) * 100));
            const currentFmt = Number.isInteger(prog.current) ? prog.current : prog.current.toFixed(1);
            const progressText = card.querySelector('.quest-progress-text');
            const progressFill = card.querySelector('.quest-progress-fill');
            if (progressText) progressText.textContent = `${currentFmt} / ${prog.max}`;
            if (progressFill) progressFill.style.width = `${pct}%`;
        });
        return;
    }

    // If quests haven't changed and no force, just update progress bars in-place
    if (currentIds === lastRenderedQuestIds && !forceRebuild && container.children.length > 0) {
        state.quests.active.forEach((activeId, i) => {
            const card = container.querySelector(`.quest-card[data-slot="${i}"]`);
            if (!card) return;
            const questDef = quests.find(q => q.id === activeId);
            if (!questDef?.getProgress) return;
            const prog = questDef.getProgress(state);
            const pct = Math.max(0, Math.min(100, (prog.current / prog.max) * 100));
            const currentFmt = Number.isInteger(prog.current) ? prog.current : prog.current.toFixed(1);
            const progressText = card.querySelector('.quest-progress-text');
            const progressFill = card.querySelector('.quest-progress-fill');
            if (progressText) progressText.textContent = `${currentFmt} / ${prog.max}`;
            if (progressFill) progressFill.style.width = `${pct}%`;
        });
        return;
    }

    // Full rebuild
    let html = '';
    if (state.quests.active.length === 0) {
        html = `<div class="quest-card empty">No active quests</div>`;
    } else {
        state.quests.active.forEach((activeId, i) => {
            const questDef = quests.find(q => q.id === activeId);
            if (!questDef) return;

            let progressHtml = '';
            if (questDef.getProgress) {
                const prog = questDef.getProgress(state);
                const pct = Math.max(0, Math.min(100, (prog.current / prog.max) * 100));
                const currentFmt = Number.isInteger(prog.current) ? prog.current : prog.current.toFixed(1);
                progressHtml = `
                    <div class="quest-progress-text">${currentFmt} / ${prog.max}</div>
                    <div class="quest-progress-track">
                        <div class="quest-progress-fill" style="width: ${pct}%;"></div>
                    </div>
                `;
            }

            const slotAnim = questSlotState[i];
            let extraClass = '';
            if (slotAnim?.animating && slotAnim.phase === 'sliding-in') {
                extraClass = ' slide-in';
            } else if (slotAnim?.animating && slotAnim.phase === 'fading-out') {
                extraClass = ' fade-out';
            }

            html += `
                <div class="quest-card${extraClass}" data-slot="${i}">
                    <div class="quest-title">${questDef.title}</div>
                    <div class="quest-desc">${questDef.description}</div>
                    <div class="quest-reward">Reward: ${questDef.rewardText}</div>
                    ${progressHtml}
                </div>
            `;
        });
    }

    container.innerHTML = html;
    lastRenderedQuestIds = currentIds;
}

function openInventoryMenu() {
    state.inventoryOpen = true;

    // Populate Shards
    const shardCaps = shardUpgrades[state.upgrades.shardCapacity];
    invSShards.innerText = state.inventory.shards.s;
    capSShards.innerText = shardCaps.s;
    invPShards.innerText = state.inventory.shards.p;
    capPShards.innerText = shardCaps.p;
    invDShards.innerText = state.inventory.shards.d;
    capDShards.innerText = shardCaps.d;
    invFShards.innerText = state.inventory.shards.f;
    capFShards.innerText = shardCaps.f;

    // Populate Ores
    invCatalytic.innerText = state.inventory.catalyticOres;

    // Populate Bridgers and Vials
    document.getElementById('inv-covalent-bridger').innerText = state.inventory.covalentBridger || 0;
    document.getElementById('inv-ionic-bridger').innerText = state.inventory.ionicBridger || 0;
    document.getElementById('inv-rad-vial').innerText = state.inventory.radiationVial || 0;

    inventoryOverlay.style.display = 'flex';
}

function closeInventoryMenu() {
    state.inventoryOpen = false;
    inventoryOverlay.style.display = 'none';
}

if (btnCloseInventory) {
    btnCloseInventory.addEventListener('click', closeInventoryMenu);
}

// --- Crafting Functions ---
function openCraftingMenu() {
    const el = state.currentElement;
    const availableCrafts = craftableItems.filter(item => item.locations.includes(el.symbol));

    craftingList.innerHTML = '';

    availableCrafts.forEach(item => {
        const card = document.createElement('div');
        card.className = 'crafting-card';

        // Determine requirements
        const reqs = [];
        let canAfford = true;

        if (item.cost.energy > 0) {
            const ok = state.energy >= item.cost.energy;
            reqs.push(`<span class="cost-item ${!ok ? 'insufficient' : ''}">⚡ ${item.cost.energy}</span>`);
            if (!ok) canAfford = false;
        }
        if (item.cost.electrons > 0) {
            const ok = state.inventory.electrons >= item.cost.electrons;
            reqs.push(`<span class="cost-item ${!ok ? 'insufficient' : ''}">⚛️ ${item.cost.electrons}</span>`);
            if (!ok) canAfford = false;
        }
        if (item.cost.catalyticOres > 0) {
            const ok = state.inventory.catalyticOres >= item.cost.catalyticOres;
            reqs.push(`<span class="cost-item ${!ok ? 'insufficient' : ''}">💎 ${item.cost.catalyticOres} </span>`);
            if (!ok) canAfford = false;
        }
        if (item.cost.shards.s > 0) {
            const ok = state.inventory.shards.s >= item.cost.shards.s;
            reqs.push(`<span class="cost-item ${!ok ? 'insufficient' : ''}"><span class="shard-indicator s-indicator"></span> x${item.cost.shards.s}</span>`);
            if (!ok) canAfford = false;
        }
        if (item.cost.shards.p > 0) {
            const ok = state.inventory.shards.p >= item.cost.shards.p;
            reqs.push(`<span class="cost-item ${!ok ? 'insufficient' : ''}"><span class="shard-indicator p-indicator"></span> x${item.cost.shards.p}</span>`);
            if (!ok) canAfford = false;
        }
        if (item.cost.shards.d > 0) {
            const ok = state.inventory.shards.d >= item.cost.shards.d;
            reqs.push(`<span class="cost-item ${!ok ? 'insufficient' : ''}"><span class="shard-indicator d-indicator"></span> x${item.cost.shards.d}</span>`);
            if (!ok) canAfford = false;
        }
        if (item.cost.shards.f > 0) {
            const ok = state.inventory.shards.f >= item.cost.shards.f;
            reqs.push(`<span class="cost-item ${!ok ? 'insufficient' : ''}"><span class="shard-indicator f-indicator"></span> x${item.cost.shards.f}</span>`);
            if (!ok) canAfford = false;
        }

        // Generic "Acquired" check: try calling onCraft — if it returns false, the upgrade has already been applied
        let isAcquired = !item.onCraft({ upgrades: { ...state.upgrades }, inventory: { ...state.inventory } });

        card.innerHTML = `
            <div class="crafting-info">
                <div class="crafting-title">${item.name}</div>
                <div class="crafting-desc">${item.description}</div>
                <div class="crafting-cost">${reqs.join('')}</div>
            </div>
            <div class="crafting-action">
                <button class="btn btn-primary btn-craft-item" ${(!canAfford || isAcquired) ? 'disabled style="opacity:0.5;"' : ''}>
                    ${isAcquired ? 'Acquired' : 'Craft'}
                </button>
            </div>
        `;

        const craftBtn = card.querySelector('.btn-craft-item');
        craftBtn.addEventListener('click', () => {
            if (!canAfford || isAcquired) return;

            // Deduct
            state.energy -= item.cost.energy;
            state.inventory.electrons -= item.cost.electrons;
            state.inventory.catalyticOres -= item.cost.catalyticOres;
            state.inventory.shards.s -= item.cost.shards.s;
            state.inventory.shards.p -= item.cost.shards.p;
            state.inventory.shards.d -= item.cost.shards.d;
            state.inventory.shards.f -= item.cost.shards.f;

            // Apply effect
            const success = item.onCraft(state);

            if (success) {
                updateHUD();
                openCraftingMenu(); // Re-render menu
                saveGame();
            }
        });

        craftingList.appendChild(card);
    });

    menuOverlay.style.display = 'none'; // Hide nucleus menu
    craftingOverlay.style.display = 'flex';
}

if (btnCraft) {
    btnCraft.addEventListener('click', openCraftingMenu);
}
if (btnCloseCrafting) {
    btnCloseCrafting.addEventListener('click', () => {
        craftingOverlay.style.display = 'none';
        menuOverlay.style.display = 'flex'; // Go back to nucleus menu
    });
}


// --- Map Functions ---
function openMap() {
    state.mapOpen = true;
    mapOverlay.style.display = 'flex';
    const pesKeyItem = document.getElementById('pes-key-item');
    if (pesKeyItem) {
        pesKeyItem.style.display = state.upgrades.pesScanner ? 'block' : 'none';
    }
    const protonKeyItem = document.getElementById('proton-key-item');
    if (protonKeyItem) {
        protonKeyItem.style.display = state.upgrades.protonScanner ? 'block' : 'none';
    }
    const shardKeyItem = document.getElementById('shard-key-item');
    if (shardKeyItem) {
        shardKeyItem.style.display = state.upgrades.shardTracker ? 'block' : 'none';
    }
    renderMap();
}

function closeMap() {
    state.mapOpen = false;
    mapOverlay.style.display = 'none';
}

function renderMap() {
    mapGrid.innerHTML = '';

    let pesHighlights = new Set();
    if (state.upgrades.pesScanner) {
        const nextStorage = craftableItems.find(item => item.id.startsWith('upgrade_storage_') && parseInt(item.id.split('_')[2]) === state.upgrades.storageCapacity + 1);
        if (nextStorage) nextStorage.locations.forEach(loc => pesHighlights.add(loc));

        const nextShard = craftableItems.find(item => item.id.startsWith('upgrade_shard_') && parseInt(item.id.split('_')[2]) === state.upgrades.shardCapacity + 1);
        if (nextShard) nextShard.locations.forEach(loc => pesHighlights.add(loc));
    }

    let protonHighlights = new Set();
    if (state.upgrades.protonScanner) {
        const nextBooster = craftableItems.find(item => item.id.startsWith('e_booster_') && parseInt(item.id.split('_')[2]) === state.upgrades.energyBooster + 1);
        if (nextBooster) nextBooster.locations.forEach(loc => protonHighlights.add(loc));
    }

    let shardHighlights = new Set();
    if (state.upgrades.shardTracker) {
        state.shardSpawns.forEach(shard => {
            shardHighlights.add(shard.elementSymbol);
        });
    }

    // Build a 22x11 grid (xpos 1-22, ypos 1-11)
    // Rows 8-9 are gap rows between main table and f-block
    for (let y = 1; y <= 11; y++) {
        for (let x = 1; x <= 22; x++) {
            const el = elements.find(e => e.xpos === x && e.ypos === y);
            const cell = document.createElement('div');
            cell.className = 'map-cell';

            if (y === 8 || y === 9) {
                // Gap rows
                cell.classList.add('empty');
                mapGrid.appendChild(cell);
                continue;
            }

            if (!el) {
                cell.classList.add('empty');
                mapGrid.appendChild(cell);
                continue;
            }

            const isCurrent = el.symbol === state.currentElement.symbol;
            const isVisited = state.visitedElements.has(el.symbol);

            cell.classList.add(isCurrent ? 'current' : (isVisited ? 'visited' : 'unvisited'));
            cell.style.color = getElementColor(el);
            cell.style.borderColor = isCurrent ? '#fff' : (isVisited ? getElementColor(el) + '80' : 'rgba(255,255,255,0.08)');
            if (isVisited || isCurrent) {
                cell.style.background = getElementColor(el) + '33'; // 20% opacity hex
            }
            if (el.symbol === 'Lr') {
                cell.classList.add('win-pad');
            }
            if (pesHighlights.has(el.symbol)) {
                cell.classList.add('pes-highlight');
            }
            if (protonHighlights.has(el.symbol)) {
                cell.classList.add('proton-highlight');
            }
            if (shardHighlights.has(el.symbol)) {
                cell.classList.add('shard-highlight');
            }

            cell.innerHTML = `<span class="map-number">${el.atomicNumber}</span>${el.symbol}`;
            cell.title = `${el.atomicNumber} - ${el.name}`;

            mapGrid.appendChild(cell);
        }
    }
}

if (btnCloseMap) {
    btnCloseMap.addEventListener('click', closeMap);
}

// ============================
// SHARD SPAWNING SYSTEM
// ============================
const SHARD_CONFIG = {
    s: {
        elements: ['Li', 'Be', 'Mg', 'Na', 'K', 'Ca'],
        maxActive: 2,
        harvestCost: 1000,
        extractorKey: 'sExtractor',
        extractorName: 'S-Shard Extractor'
    },
    p: {
        // Rectangle from B(xpos=15,ypos=2) to I(xpos=19,ypos=5) and including F(xpos=19,ypos=2), In(xpos=15,ypos=5)
        elements: [], // Populated dynamically below
        maxActive: 3,
        harvestCost: 4000,
        extractorKey: 'pExtractor',
        extractorName: 'P-Shard Extractor'
    },
    d: {
        // D-block: groups 3-12, periods 4-6 (ypos 4-6)
        elements: [],
        maxActive: 3,
        harvestCost: 11000,
        extractorKey: 'dExtractor',
        extractorName: 'D-Shard Extractor'
    },
    f: {
        elements: ['Ce', 'Pr', 'Th', 'Pa'],
        maxActive: 1,
        harvestCost: 23000,
        extractorKey: 'fExtractor',
        extractorName: 'F-Shard Extractor'
    }
};

// Populate P-block elements: xpos 15-19, ypos 2-5
elements.forEach(el => {
    if (el.xpos >= 15 && el.xpos <= 19 && el.ypos >= 2 && el.ypos <= 5) {
        SHARD_CONFIG.p.elements.push(el.symbol);
    }
});

// Populate D-block elements: groups 3-12, periods 4-6 (NOT period 7)
elements.forEach(el => {
    if (el.group >= 3 && el.group <= 12 && el.ypos >= 4 && el.ypos <= 6) {
        SHARD_CONFIG.d.elements.push(el.symbol);
    }
});



function getShardHarvestCost(type) {
    let cost = SHARD_CONFIG[type].harvestCost;
    if (state.upgrades.shardSaver) {
        cost = Math.round(cost * 0.4); // 60% reduction
    }
    return cost;
}

function spawnShard(type) {
    const config = SHARD_CONFIG[type];
    const possibleElements = config.elements;
    if (possibleElements.length === 0) return null;

    const elSymbol = possibleElements[Math.floor(Math.random() * possibleElements.length)];
    const el = elements.find(e => e.symbol === elSymbol);
    if (!el) return null;

    const centerIdx = Math.floor(el.gridSize / 2);
    // Pick a random non-nucleus, non-connector cell
    let x, y;
    let isNucleus, isConnector;
    do {
        x = Math.floor(Math.random() * el.gridSize);
        y = Math.floor(Math.random() * el.gridSize);
        isNucleus = (x === centerIdx && y === centerIdx);
        isConnector = (x === centerIdx && (y === 0 || y === el.gridSize - 1)) ||
            (y === centerIdx && (x === 0 || x === el.gridSize - 1));
    } while (isNucleus || isConnector);

    return { type, elementSymbol: elSymbol, x, y };
}

function initShards() {
    state.shardSpawns = [];
    for (const type of ['s', 'p', 'd', 'f']) {
        const config = SHARD_CONFIG[type];
        for (let i = 0; i < config.maxActive; i++) {
            const shard = spawnShard(type);
            if (shard) state.shardSpawns.push(shard);
        }
    }
}

function respawnShard(type) {
    const shard = spawnShard(type);
    if (shard) state.shardSpawns.push(shard);
}

function getShardAt(elementSymbol, x, y) {
    return state.shardSpawns.find(s => s.elementSymbol === elementSymbol && s.x === x && s.y === y) || null;
}

function collectShard(shard) {
    const config = SHARD_CONFIG[shard.type];
    const shardCaps = shardUpgrades[state.upgrades.shardCapacity];
    const currentCount = state.inventory.shards[shard.type];
    const maxCount = shardCaps[shard.type];

    if (currentCount >= maxCount) {
        showNotification(`${shard.type.toUpperCase()}-Shard inventory is full!`);
        return;
    }

    const actualCost = getShardHarvestCost(shard.type);

    if (state.energy < actualCost) {
        showNotification(`Not enough energy! Need ${actualCost} to harvest.`);
        return;
    }

    state.energy -= actualCost;
    state.inventory.shards[shard.type]++;
    // Remove from spawns
    const idx = state.shardSpawns.indexOf(shard);
    if (idx !== -1) state.shardSpawns.splice(idx, 1);
    // Respawn a new one
    respawnShard(shard.type);
    updateHUD();
    showNotification(`Harvested ${shard.type.toUpperCase()}-Shard!`, 'success');
}

// --- Find Item Menu Logic ---
function openFindMenu() {
    state.menuOpen = true;
    const overlay = document.getElementById('find-menu-overlay');
    const listContainer = document.getElementById('find-list');
    listContainer.innerHTML = '';

    const validCrafts = craftableItems.filter(c => {
        if (c.id.startsWith('upgrade_storage_')) return false;
        if (c.id.startsWith('upgrade_shard_')) return false;
        if (c.id.startsWith('e_booster_')) return false;
        if (c.id.startsWith('radiation_vial_')) return false; // Handled separately as merged entry
        if (c.locations.includes('H')) return false;
        return true;
    });

    const extractors = validCrafts.filter(c => c.id.endsWith('_extractor'));
    const boots = validCrafts.filter(c => c.id.startsWith('e_boots_'));
    const rootItems = validCrafts.filter(c => !c.id.endsWith('_extractor') && !c.id.startsWith('e_boots_'));

    // Build a merged Radiation Vial entry for the find menu
    const vialRecipes = craftableItems.filter(c => c.id.startsWith('radiation_vial_'));
    const vialMergedId = 'radiation_vial_merged';
    const vialIsFound = state.foundItems[vialMergedId];

    function renderItem(c) {
        const isFound = state.foundItems[c.id];
        const statusHtml = isFound ? `<span class="find-item-status found">Found</span>` : ``;
        return `
            <div class="find-item-row" data-id="${c.id}">
                <span class="find-item-title">${c.name}</span>
                ${statusHtml}
            </div>
        `;
    }

    function renderFolder(title, items) {
        if (items.length === 0) return '';
        const itemsHtml = items.map(renderItem).join('');
        return `
            <div class="folder-container">
                <div class="folder-header">
                    <span>${title}</span>
                    <span style="font-size: 0.8em;">▼</span>
                </div>
                <div class="folder-content">
                    ${itemsHtml}
                </div>
            </div>
        `;
    }

    listContainer.innerHTML += renderFolder('Extractors', extractors);
    listContainer.innerHTML += renderFolder('Energy Boots', boots);
    listContainer.innerHTML += rootItems.map(renderItem).join('');

    // Add merged Radiation Vial entry
    if (vialRecipes.length > 0) {
        const vialStatusHtml = vialIsFound ? `<span class="find-item-status found">Found</span>` : ``;
        listContainer.innerHTML += `
            <div class="find-item-row" data-id="${vialMergedId}">
                <span class="find-item-title">Radiation Vial</span>
                ${vialStatusHtml}
            </div>
        `;
    }

    // Attach listeners
    listContainer.querySelectorAll('.folder-header').forEach(header => {
        header.addEventListener('click', (e) => {
            const content = e.currentTarget.nextElementSibling;
            content.classList.toggle('expanded');
        });
    });

    listContainer.querySelectorAll('.find-item-row').forEach(row => {
        row.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');

            // Handle merged Radiation Vial entry
            if (id === 'radiation_vial_merged') {
                const vialRecipes = craftableItems.filter(c => c.id.startsWith('radiation_vial_'));
                // Build a virtual merged item with all vial locations
                const mergedItem = {
                    id: 'radiation_vial_merged',
                    name: 'Radiation Vial',
                    locations: vialRecipes.flatMap(c => c.locations)
                };
                if (state.foundItems['radiation_vial_merged']) {
                    showLocationDisplay(mergedItem);
                } else {
                    showFindConfirm(mergedItem);
                }
                return;
            }

            const item = craftableItems.find(c => c.id === id);
            if (!item) return;

            if (state.foundItems[id]) {
                showLocationDisplay(item);
            } else {
                showFindConfirm(item);
            }
        });
    });

    overlay.style.display = 'flex';
}

document.getElementById('btn-close-find').addEventListener('click', () => {
    document.getElementById('find-menu-overlay').style.display = 'none';
    state.menuOpen = false;
});

let pendingFindItem = null;

function showFindConfirm(item) {
    pendingFindItem = item;
    const confirmOverlay = document.getElementById('find-confirm-overlay');
    document.getElementById('find-confirm-text').innerText = `Spend one Catalytic Ore to find the ${item.name}?`;
    confirmOverlay.style.display = 'flex';
}

document.getElementById('btn-find-cancel').addEventListener('click', () => {
    document.getElementById('find-confirm-overlay').style.display = 'none';
    pendingFindItem = null;
});

document.getElementById('btn-find-yes').addEventListener('click', () => {
    if (!pendingFindItem) return;
    if (state.inventory.catalyticOres >= 1) {
        state.inventory.catalyticOres--;
        state.foundItems[pendingFindItem.id] = true;
        updateHUD();
        document.getElementById('find-confirm-overlay').style.display = 'none';

        // Re-render the menu underneath so it says 'Found'
        openFindMenu();
        showLocationDisplay(pendingFindItem);
        saveGame();
    } else {
        showNotification("Not enough Catalytic Ores!", "error");
        document.getElementById('find-confirm-overlay').style.display = 'none';
    }
});

document.getElementById('btn-vial-cancel').addEventListener('click', () => {
    document.getElementById('vial-confirm-overlay').style.display = 'none';
});

document.getElementById('btn-vial-yes').addEventListener('click', () => {
    if (state.radiation <= 0) {
        document.getElementById('vial-confirm-overlay').style.display = 'none';
        showNotification("You are already at 0% radiation", "error");
        return;
    }
    if (state.inventory.radiationVial >= 1) {
        state.inventory.radiationVial--;
        state.radiation = Math.max(0, state.radiation - 20);
        updateHUD();
        document.getElementById('vial-confirm-overlay').style.display = 'none';
        showNotification("Consumed one Radiation Vial. Radiation decreased by 20%!", "success");
        saveGame();
    } else {
        showNotification("No Radiation Vials in inventory!", "error");
        document.getElementById('vial-confirm-overlay').style.display = 'none';
    }
});

function showLocationDisplay(item) {
    const locOverlay = document.getElementById('location-display-overlay');
    document.getElementById('location-display-title').innerText = `The ${item.name} is at:`;
    const grid = document.getElementById('location-display-grid');
    grid.innerHTML = '';

    item.locations.forEach(sym => {
        const el = elements.find(e => e.symbol === sym);
        if (!el) return;
        const color = getElementColor(el);
        grid.innerHTML += `
            <div class="element-card glass-panel" style="width: 120px; height: 160px; border-color: ${color}; box-shadow: 0 0 15px ${color};">
                <div style="font-size: 0.8rem; opacity: 0.6; margin-bottom: 2px;">${el.atomicNumber}</div>
                <div style="font-size: 2.2rem; font-weight: bold; margin-bottom: 10px; color: ${color};">${el.symbol}</div>
                <div style="font-size: 0.9rem; opacity: 0.8;">${el.name}</div>
            </div>
        `;
    });

    locOverlay.style.display = 'flex';
}

document.getElementById('btn-close-location').addEventListener('click', () => {
    document.getElementById('location-display-overlay').style.display = 'none';
});

function checkCurrentTile() {
    const el = state.currentElement;
    const centerIdx = Math.floor(el.gridSize / 2);
    const isNucleus = (state.localX === centerIdx && state.localY === centerIdx);

    if (isNucleus) {
        promptAction('NUCLEUS_MENU', {}, "Press [ENTER] to access the Nucleus Hub");
        return;
    }

    const shard = getShardAt(el.symbol, state.localX, state.localY);
    if (shard) {
        const config = SHARD_CONFIG[shard.type];
        const shardCaps = shardUpgrades[state.upgrades.shardCapacity];
        const currentCount = state.inventory.shards[shard.type];
        const maxCount = shardCaps[shard.type];

        if (state.upgrades[config.extractorKey] && currentCount < maxCount) {
            const actualCost = getShardHarvestCost(shard.type);
            promptAction('HARVEST_SHARD', { shard }, `Press [ENTER] to harvest the ${shard.type.toUpperCase()}-Shard (-${actualCost} Energy)`);
            return;
        }
    }

    clearAction();
}

// --- Init ---
const saveLoaded = loadGame();
if (!saveLoaded) {
    initShards();
}

setInterval(() => {
    if (state.radiation <= 0) return;

    const el = state.currentElement;
    const isDBlock = el.category === 'transition metal';
    const isFBlock = el.category === 'lanthanide' || el.category === 'actinide';
    const period = el.period;
    const maxRad = getPeriodMaxRadiation(el);
    const hasSuit = state.upgrades.shieldingSuit;

    let decrease = 0;

    // Hydrogen or Noble Gas Rule
    if (el.symbol === 'H' || el.group === 18) {
        decrease = state.radiation; // Instant 0
    }
    // Period 2 Rule
    else if (period === 2) {
        decrease = 5;
    }
    // Over-Max Rule
    else if (state.radiation > maxRad) {
        decrease = hasSuit ? 5 : 3;
        // Don't decrease below maxRad through this rule
        if (state.radiation - decrease < maxRad) {
            decrease = state.radiation - maxRad;
        }
    }
    // Nucleus Rule
    else {
        const centerIdx = Math.floor(el.gridSize / 2);
        const isNucleus = (state.localX === centerIdx && state.localY === centerIdx);

        if (isNucleus && !isFBlock) {
            if (period === 3) decrease = 2;
            else if (period === 4) decrease = 1.5;
            else if (period === 5) decrease = 1;
            else if (period === 6) decrease = 0.75;
            else if (period === 7) decrease = 0.5;

            if (isDBlock) decrease /= 2;
            if (hasSuit) decrease *= 3;
        }
    }

    if (decrease > 0) {
        state.radiation -= decrease;
        if (state.radiation < 0) state.radiation = 0;
        updateHUD();
    }
}, 1000);

// Auto-save progress every 10 seconds
setInterval(saveGame, 10000);

updateHUD();
renderLoop();

if (saveLoaded) {
    checkCurrentTile();
} else {
    // Player starts on Hydrogen's nucleus
    promptAction('NUCLEUS_MENU', {}, "Press [ENTER] to access the Nucleus Hub");
}

// Reset Progress button logic
document.getElementById('btn-reset-progress')?.addEventListener('click', () => {
    if (confirm("Are you sure you want to reset ALL progress? This will delete your save and restart the game!")) {
        localStorage.removeItem('elemental_survival_save');
        location.reload();
    }
});
