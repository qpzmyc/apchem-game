// --- Craftable Items Registry ---
export const craftableItems = [
    {
        id: "e_booster_1",
        name: "Basic Energy Booster",
        description: "Gain 50% more energy from nucluei",
        locations: ["H"],
        cost: { energy: 1000, electrons: 1, shards: { s: 0, p: 0, d: 0, f: 0 }, catalyticOres: 0 },
        onCraft: (state) => {
            if ((state.upgrades.energyBooster || 0) < 1) {
                state.upgrades.energyBooster = 1;
                return true;
            }
            return false;
        }
    },
    {
        id: "e_booster_2",
        name: "Normal Energy Booster",
        description: "Gain 2x energy from nucluei",
        locations: ["B"],
        cost: { energy: 5500, electrons: 2, shards: { s: 1, p: 0, d: 0, f: 0 }, catalyticOres: 1 },
        onCraft: (state) => {
            if ((state.upgrades.energyBooster || 0) < 2) {
                state.upgrades.energyBooster = 2;
                return true;
            }
            return false;
        }
    },
    {
        id: "e_booster_3",
        name: "Super Energy Booster",
        description: "Gain 3x  energy from nucluei",
        locations: ["Sn"],
        cost: { energy: 9500, electrons: 4, shards: { s: 2, p: 1, d: 0, f: 0 }, catalyticOres: 1 },
        onCraft: (state) => {
            if ((state.upgrades.energyBooster || 0) < 3) {
                state.upgrades.energyBooster = 3;
                return true;
            }
            return false;
        }
    },
    {
        id: "e_booster_4",
        name: "Ultra Energy Booster",
        description: "Gain 4.5x energy from nucluei",
        locations: ["Pd"],
        cost: { energy: 15000, electrons: 8, shards: { s: 0, p: 2, d: 1, f: 0 }, catalyticOres: 2 },
        onCraft: (state) => {
            if ((state.upgrades.energyBooster || 0) < 4) {
                state.upgrades.energyBooster = 4;
                return true;
            }
            return false;
        }
    },
    {
        id: "e_booster_5",
        name: "Hyper Energy Booster",
        description: "Gain 8x energy from nucluei",
        locations: ["Ac"],
        cost: { energy: 28000, electrons: 12, shards: { s: 12, p: 3, d: 1, f: 0 }, catalyticOres: 3 },
        onCraft: (state) => {
            if ((state.upgrades.energyBooster || 0) < 5) {
                state.upgrades.energyBooster = 5;
                return true;
            }
            return false;
        }
    },
    {
        id: "e_booster_6",
        name: "Quantum Booster",
        description: "Gain 17x energy from nucluei",
        locations: ["Pa"],
        cost: { energy: 48000, electrons: 12, shards: { s: 0, p: 8, d: 3, f: 2 }, catalyticOres: 4 },
        onCraft: (state) => {
            if ((state.upgrades.energyBooster || 0) < 6) {
                state.upgrades.energyBooster = 6;
                return true;
            }
            return false;
        }
    },
    {
        id: "upgrade_shard_1",
        name: "Shard Capacity I",
        description: "Increases max capacity to: 5 S, 1 P.",
        locations: ["Na"],
        cost: { energy: 0, electrons: 10, shards: { s: 0, p: 0, d: 0, f: 0 }, catalyticOres: 0 },
        onCraft: (state) => {
            if (state.upgrades.shardCapacity < 1) {
                state.upgrades.shardCapacity = 1;
                return true;
            }
            return false;
        }
    },
    {
        id: "upgrade_shard_2",
        name: "Shard Capacity II",
        description: "Increases max capacity to: 6 S, 2 P, 1 D.",
        locations: ["C", "Si"],
        cost: { energy: 0, electrons: 10, shards: { s: 0, p: 0, d: 0, f: 0 }, catalyticOres: 1 },
        onCraft: (state) => {
            if (state.upgrades.shardCapacity < 2) {
                state.upgrades.shardCapacity = 2;
                return true;
            }
            return false;
        }
    },
    {
        id: "upgrade_shard_3",
        name: "Shard Capacity III",
        description: "Increases max capacity to: 8 S, 4 P, 2 D.",
        locations: ["I", "Te", "Ru", "Rh"],
        cost: { energy: 0, electrons: 15, shards: { s: 0, p: 0, d: 0, f: 0 }, catalyticOres: 2 },
        onCraft: (state) => {
            if (state.upgrades.shardCapacity < 3) {
                state.upgrades.shardCapacity = 3;
                return true;
            }
            return false;
        }
    },
    {
        id: "upgrade_shard_4",
        name: "Shard Capacity IV",
        description: "Increases max capacity to: 12 S, 8 P, 4 D, 1 F.",
        locations: ["Ba", "Cs", "Bi", "Po"],
        cost: { energy: 0, electrons: 20, shards: { s: 0, p: 0, d: 0, f: 0 }, catalyticOres: 2 },
        onCraft: (state) => {
            if (state.upgrades.shardCapacity < 4) {
                state.upgrades.shardCapacity = 4;
                return true;
            }
            return false;
        }
    },
    {
        id: "upgrade_shard_5",
        name: "Shard Capacity V",
        description: "Increases max capacity to: 20 S, 12 P, 6 D, 2 F.",
        locations: ["W", "V", "Bh"],
        cost: { energy: 0, electrons: 25, shards: { s: 0, p: 0, d: 0, f: 0 }, catalyticOres: 3 },
        onCraft: (state) => {
            if (state.upgrades.shardCapacity < 5) {
                state.upgrades.shardCapacity = 5;
                return true;
            }
            return false;
        }
    },
    {
        id: "upgrade_storage_1",
        name: "Energy Capacity I",
        description: "Increases Max Energy to 4000 and Max Electrons to 6.",
        locations: ["Li"],
        cost: { energy: 2000, electrons: 1, shards: { s: 0, p: 0, d: 0, f: 0 }, catalyticOres: 0 },
        onCraft: (state) => {
            if (state.upgrades.storageCapacity < 1) {
                state.upgrades.storageCapacity = 1;
                return true;
            }
            return false;
        }
    },
    {
        id: "upgrade_storage_2",
        name: "Energy Capacity II",
        description: "Increases Max Energy to 8000 and Max Electrons to 10.",
        locations: ["Al"],
        cost: { energy: 4000, electrons: 2, shards: { s: 0, p: 0, d: 0, f: 0 }, catalyticOres: 0 },
        onCraft: (state) => {
            if (state.upgrades.storageCapacity < 2) {
                state.upgrades.storageCapacity = 2;
                return true;
            }
            return false;
        }
    },
    {
        id: "upgrade_storage_3",
        name: "Energy Capacity III",
        description: "Increases Max Energy to 14000 and Max Electrons to 14.",
        locations: ["O", "F", "Cl"],
        cost: { energy: 8000, electrons: 3, shards: { s: 0, p: 0, d: 0, f: 0 }, catalyticOres: 1 },
        onCraft: (state) => {
            if (state.upgrades.storageCapacity < 3) {
                state.upgrades.storageCapacity = 3;
                return true;
            }
            return false;
        }
    },
    {
        id: "upgrade_storage_4",
        name: "Energy Capacity IV",
        description: "Increases Max Energy to 30000 and Max Electrons to 20.",
        locations: ["In", "Cd", "Zn", "Cu", "Ag"],
        cost: { energy: 12000, electrons: 6, shards: { s: 0, p: 0, d: 0, f: 0 }, catalyticOres: 2 },
        onCraft: (state) => {
            if (state.upgrades.storageCapacity < 4) {
                state.upgrades.storageCapacity = 4;
                return true;
            }
            return false;
        }
    },
    {
        id: "upgrade_storage_5",
        name: "Energy Capacity V",
        description: "Increases Max Energy to 55000 and Max Electrons to 30.",
        locations: ["La", "Hf"],
        cost: { energy: 20000, electrons: 10, shards: { s: 0, p: 0, d: 2, f: 1 }, catalyticOres: 3 },
        onCraft: (state) => {
            if (state.upgrades.storageCapacity < 5) {
                state.upgrades.storageCapacity = 5;
                return true;
            }
            return false;
        }
    },
    {
        id: "upgrade_storage_6",
        name: "Energy Capacity VI",
        description: "Increases Max Energy to 100000 and Max Electrons to 40.",
        locations: ["Ce"],
        cost: { energy: 40000, electrons: 20, shards: { s: 10, p: 0, d: 3, f: 1 }, catalyticOres: 5 },
        onCraft: (state) => {
            if (state.upgrades.storageCapacity < 6) {
                state.upgrades.storageCapacity = 6;
                return true;
            }
            return false;
        }
    },
    {
        id: "e_boots_1",
        name: "Basic Energy Boots",
        description: "Reduces energy costs for movement by 40%",
        locations: ["Ca", "K"],
        cost: { energy: 3000, electrons: 2, shards: { s: 3, p: 1, d: 0, f: 0 }, catalyticOres: 1 },
        onCraft: (state) => {
            if ((state.upgrades.eBoots || 0) < 1) {
                state.upgrades.eBoots = 1;
                return true;
            }
            return false;
        }
    },
    {
        id: "e_boots_2",
        name: "Normal Energy Boots",
        description: "Reduces energy costs for movement by 70%",
        locations: ["Ni", "Co", "Tl", "Pb"],
        cost: { energy: 14000, electrons: 6, shards: { s: 6, p: 2, d: 1, f: 0 }, catalyticOres: 2 },
        onCraft: (state) => {
            if ((state.upgrades.eBoots || 0) < 2) {
                state.upgrades.eBoots = 2;
                return true;
            }
            return false;
        }
    },
    {
        id: "e_boots_3",
        name: "Super Energy Boots",
        description: "Reduces energy costs for movement by 90%",
        locations: ["Y", "Zr", "Ta", "Db"],
        cost: { energy: 20000, electrons: 10, shards: { s: 3, p: 3, d: 2, f: 1 }, catalyticOres: 3 },
        onCraft: (state) => {
            if ((state.upgrades.eBoots || 0) < 3) {
                state.upgrades.eBoots = 3;
                return true;
            }
            return false;
        }
    },
    {
        id: "e_boots_4",
        name: "Ultra Energy Boots",
        description: "Reduces energy costs for movement by 97%",
        locations: ["Pr", "Th"],
        cost: { energy: 50000, electrons: 20, shards: { s: 12, p: 6, d: 3, f: 2 }, catalyticOres: 4 },
        onCraft: (state) => {
            if ((state.upgrades.eBoots || 0) < 4) {
                state.upgrades.eBoots = 4;
                return true;
            }
            return false;
        }
    },
    {
        id: "h_drive",
        name: "H-Drive",
        description: "Teleports the player to Hydrogen remotely.",
        locations: ["H"],
        cost: { energy: 5000, electrons: 6, shards: { s: 3, p: 0, d: 0, f: 0 }, catalyticOres: 2 },
        onCraft: (state) => {
            if (!state.upgrades.hDrive) {
                state.upgrades.hDrive = true;
                return true;
            }
            return false;
        }
    },
    {
        id: "PES_scanner",
        name: "PES Scanner",
        description: "Highlights the crafting locations of the next Energy Capacity and Shard Capacity upgrades on the map",
        locations: ["H"],
        cost: { energy: 6000, electrons: 4, shards: { s: 3, p: 1, d: 0, f: 0 }, catalyticOres: 1 },
        onCraft: (state) => {
            if (!state.upgrades.pesScanner) {
                state.upgrades.pesScanner = true;
                return true;
            }
            return false;
        }
    },
    {
        id: "proton_scanner",
        name: "Proton Scanner",
        description: "Highlights the crafting locations of the next Energy Booster on the map",
        locations: ["H"],
        cost: { energy: 8000, electrons: 2, shards: { s: 4, p: 2, d: 0, f: 0 }, catalyticOres: 1 },
        onCraft: (state) => {
            if (!state.upgrades.protonScanner) {
                state.upgrades.protonScanner = true;
                return true;
            }
            return false;
        }
    },
    {
        id: "shard_tracker",
        name: "Shard Tracker",
        description: "Highlights the locations of all s,p,d, and f Shards on the map",
        locations: ["H"],
        cost: { energy: 10500, electrons: 10, shards: { s: 0, p: 0, d: 0, f: 0 }, catalyticOres: 3 },
        onCraft: (state) => {
            if (!state.upgrades.shardTracker) {
                state.upgrades.shardTracker = true;
                return true;
            }
            return false;
        }
    },
    {
        id: "octet_remote",
        name: "Octet Remote",
        description: "Allows remote access to energy and electrons in Noble Gas Vaults.",
        locations: ["H"],
        cost: { energy: 13500, electrons: 4, shards: { s: 6, p: 2, d: 1, f: 0 }, catalyticOres: 2 },
        onCraft: (state) => {
            if (!state.upgrades.octetRemote) {
                state.upgrades.octetRemote = true;
                return true;
            }
            return false;
        }
    },
    {
        id: "s_extractor",
        name: "s-Shard Extractor",
        description: "Allows you to harvest s-Shards found in the S block",
        locations: ["Be"],
        cost: { energy: 2400, electrons: 2, shards: { s: 0, p: 0, d: 0, f: 0 }, catalyticOres: 0 },
        onCraft: (state) => {
            if (!state.upgrades.sExtractor) {
                state.upgrades.sExtractor = true;
                return true;
            }
            return false;
        }
    },
    {
        id: "p_extractor",
        name: "p-Shard Extractor",
        description: "Allows you to harvest p-Shards found in the P block",
        locations: ["P"],
        cost: { energy: 6000, electrons: 4, shards: { s: 3, p: 0, d: 0, f: 0 }, catalyticOres: 0 },
        onCraft: (state) => {
            if (!state.upgrades.pExtractor) {
                state.upgrades.pExtractor = true;
                return true;
            }
            return false;
        }
    },
    {
        id: "d_extractor",
        name: "d-Shard Extractor",
        description: "Allows you to harvest d-Shards found in the D block",
        locations: ["Au"],
        cost: { energy: 9000, electrons: 8, shards: { s: 5, p: 2, d: 0, f: 0 }, catalyticOres: 1 },
        onCraft: (state) => {
            if (!state.upgrades.dExtractor) {
                state.upgrades.dExtractor = true;
                return true;
            }
            return false;
        }
    },
    {
        id: "f_extractor",
        name: "f-Shard Extractor",
        description: "Allows you to harvest f-Shards found in the F block",
        locations: ["Nh"],
        cost: { energy: 20000, electrons: 14, shards: { s: 10, p: 4, d: 2, f: 0 }, catalyticOres: 3 },
        onCraft: (state) => {
            if (!state.upgrades.fExtractor) {
                state.upgrades.fExtractor = true;
                return true;
            }
            return false;
        }
    },
    {
        id: "ionization_saver_1",
        name: "Ionization Saver",
        description: "Reduces energy costs of grabbing electrons by 60%",
        locations: ["Sb"],
        cost: { energy: 7500, electrons: 3, shards: { s: 4, p: 1, d: 0, f: 0 }, catalyticOres: 0 },
        onCraft: (state) => {
            if ((state.upgrades.ionizationSaver || 0) < 1) {
                state.upgrades.ionizationSaver = 1;
                return true;
            }
            return false;
        }
    },
    {
        id: "ionization_saver_2",
        name: "Super Ionization Saver",
        description: "Reduces energy costs of grabbing electrons by 90%",
        locations: ["Rf"],
        cost: { energy: 15000, electrons: 5, shards: { s: 1, p: 2, d: 1, f: 0 }, catalyticOres: 2 },
        onCraft: (state) => {
            if ((state.upgrades.ionizationSaver || 0) < 2) {
                state.upgrades.ionizationSaver = 2;
                return true;
            }
            return false;
        }
    },
    {
        id: "energy_router",
        name: "Energy Router",
        description: "Transfers excess energy to unlocked Noble Vaults when capacity is full",
        locations: ["Ir"],
        cost: { energy: 16000, electrons: 0, shards: { s: 3, p: 2, d: 2, f: 0 }, catalyticOres: 2 },
        onCraft: (state) => {
            if (!state.upgrades.energyRouter) {
                state.upgrades.energyRouter = true;
                return true;
            }
            return false;
        }
    },
    {
        id: "electron_router",
        name: "Electron Router",
        description: "Transfers excess electrons to unlocked Noble Vaults when capacity is full",
        locations: ["Tc"],
        cost: { energy: 0, electrons: 12, shards: { s: 3, p: 2, d: 2, f: 0 }, catalyticOres: 2 },
        onCraft: (state) => {
            if (!state.upgrades.electronRouter) {
                state.upgrades.electronRouter = true;
                return true;
            }
            return false;
        }
    },
    {
        id: "trend_analyzer",
        name: "Trend Analyzer",
        description: "Highlights the worst option for each element when harvesting energy",
        locations: ["Os", "Re"],
        cost: { energy: 18500, electrons: 0, shards: { s: 8, p: 3, d: 2, f: 0 }, catalyticOres: 2 },
        onCraft: (state) => {
            if (!state.upgrades.trendAnalyzer) {
                state.upgrades.trendAnalyzer = true;
                return true;
            }
            return false;
        }
    },
    {
        id: "shielding_suit",
        name: "Shielding Suit",
        description: "Significantly reduces radioactive decay.",
        locations: ["Mc", "Lv", "Ts", "Fr", "Ra"],
        cost: { energy: 60000, electrons: 8, shards: { s: 0, p: 6, d: 3, f: 2 }, catalyticOres: 5 },
        onCraft: (state) => {
            if (!state.upgrades.shieldingSuit) {
                state.upgrades.shieldingSuit = true;
                return true;
            }
            return false;
        }
    },
    {
        id: "radiation_vial_ac",
        name: "Radiation Vial",
        description: "Consume to decrease radiation by 20%.",
        locations: ["Ac"],
        cost: { energy: 20000, electrons: 0, shards: { s: 0, p: 0, d: 2, f: 0 }, catalyticOres: 1 },
        onCraft: (state) => {
            state.inventory.radiationVial = (state.inventory.radiationVial || 0) + 1;
            return true;
        }
    },
    {
        id: "radiation_vial_ra",
        name: "Radiation Vial",
        description: "Consume to decrease radiation by 20%.",
        locations: ["Ra"],
        cost: { energy: 20000, electrons: 0, shards: { s: 8, p: 0, d: 0, f: 0 }, catalyticOres: 1 },
        onCraft: (state) => {
            state.inventory.radiationVial = (state.inventory.radiationVial || 0) + 1;
            return true;
        }
    },
    {
        id: "radiation_vial_lv",
        name: "Radiation Vial",
        description: "Consume to decrease radiation by 20%.",
        locations: ["Lv"],
        cost: { energy: 20000, electrons: 0, shards: { s: 0, p: 4, d: 0, f: 0 }, catalyticOres: 1 },
        onCraft: (state) => {
            state.inventory.radiationVial = (state.inventory.radiationVial || 0) + 1;
            return true;
        }
    },
    {
        id: "radiation_vial_Th",
        name: "Radiation Vial",
        description: "Consume to decrease radiation by 20%.",
        locations: ["Th"],
        cost: { energy: 20000, electrons: 0, shards: { s: 0, p: 0, d: 0, f: 1 }, catalyticOres: 1 },
        onCraft: (state) => {
            state.inventory.radiationVial = (state.inventory.radiationVial || 0) + 1;
            return true;
        }
    }
];
