import { elements } from './elements.js';

export const quests = [
    {
        id: "q_first_harvest",
        title: "Energy Initiate",
        description: "Enter a Nucleus Hub and harvest 500 energy.",
        checkCondition: (state) => {
            return state.totalEnergyEarned > 500;
        },
        getProgress: (state) => {
            return { current: Math.min(500, Math.max(0, state.totalEnergyEarned - 100)), max: 500 };
        },
        rewardText: "",
        onComplete: (state) => {
        }
    },
    {
        id: "q_first_electron",
        title: "Electron Grabber",
        description: "Grab your first electron from a nucleus",
        checkCondition: (state) => {
            return state.totalElectronsEarned >= 1;
        },
        getProgress: (state) => {
            return { current: Math.min(1, state.totalElectronsEarned), max: 1 };
        },
        rewardText: "500 Energy",
        onComplete: (state) => {
            state.energy = Math.min(state.maxEnergy, state.energy + 500);
            state.totalEnergyEarned += 500;
        }
    },
    {
        id: "booster_1",
        title: "Investor",
        description: "Collect 1000 energy and 1 electron to craft the Basic Energy Booster (at H).",
        checkCondition: (state) => {
            return (state.upgrades.energyBooster || 0) >= 1;
        },
        getProgress: (state) => {
            return { current: (state.upgrades.energyBooster || 0), max: 1 };
        },
        rewardText: "",
        onComplete: (state) => {
        }
    },
    {
        id: "noble",
        title: "Noble Explorer",
        description: "Build a bridge to He and fill the Noble Vault",
        checkCondition: (state) => {
            return state.banks && state.banks['He'] && state.banks['He'].energy >= 1000 && state.banks['He'].electrons >= 2;
        },
        getProgress: (state) => {
            let energyFilled = (state.banks && state.banks['He'] && state.banks['He'].energy >= 1000) ? 1 : 0;
            let electronsFilled = (state.banks && state.banks['He'] && state.banks['He'].electrons >= 2) ? 1 : 0;
            return { current: energyFilled + electronsFilled, max: 2 };
        },
        rewardText: "1000 Energy",
        onComplete: (state) => {
            state.energy = Math.min(state.maxEnergy, state.energy + 1000);
            state.totalEnergyEarned += 1000;
        }
    },
    {
        id: "p2_1200",
        title: "Energy Pioneer",
        description: "Collect 6000 total energy",
        checkCondition: (state) => {
            return state.totalEnergyEarned >= 6000;
        },
        getProgress: (state) => {
            return { current: Math.min(6000, state.totalEnergyEarned), max: 6000 };
        },
        rewardText: "1 Catalytic Ore",
        onComplete: (state) => {
            state.inventory.catalyticOres += 1;
            state.totalCatalyticOres += 1;
        }
    },
    {
        id: "ecap_1",
        title: "Energy Capacity I",
        description: "Craft Energy Capacity I",
        checkCondition: (state) => {
            return state.upgrades.storageCapacity >= 1;
        },
        getProgress: (state) => {
            return { current: Math.min(1, state.upgrades.storageCapacity), max: 1 };
        },
        rewardText: "4000 Energy",
        onComplete: (state) => {
            state.energy = Math.min(state.maxEnergy, state.energy + 4000);
            state.totalEnergyEarned += 4000;
        }
    },
    {
        id: "bridge",
        title: "Bridging the Gap",
        description: "Spend 5 electrons to build a bridge to the p-block.",
        checkCondition: (state) => {
            return Array.from(state.visitedElements).some(sym => {
                const el = elements.find(e => e.symbol === sym);
                return el && el.group >= 13 && el.symbol !== 'He';
            });
        },
        getProgress: (state) => {
            const hasPBlock = Array.from(state.visitedElements).some(sym => {
                const el = elements.find(e => e.symbol === sym);
                return el && el.group >= 13 && el.symbol !== 'He';
            });
            return { current: hasPBlock ? 1 : 0, max: 1 };
        },
        rewardText: "1 Covalent Bridger",
        onComplete: (state) => {
            state.inventory.covalentBridger += 1;
        }
    },
    {
        id: "sshards",
        title: "S-Shards!",
        description: "Buy the S-Shard Extractor",
        checkCondition: (state) => {
            return state.upgrades.sExtractor === true;
        },
        getProgress: (state) => {
            return { current: state.upgrades.sExtractor ? 1 : 0, max: 1 };
        },
        rewardText: "",
        onComplete: (state) => {
        }
    },
    {
        id: "sshard_1",
        title: "S-Shards",
        description: "Find and Extract 1 S-Shard from an S-Block Element.",
        checkCondition: (state) => {
            return state.inventory.shards.s >= 1 || state.upgrades.shardCapacity > 0; // if capacity > 0 they spent it
        },
        getProgress: (state) => {
            const hasFound = (state.inventory.shards.s >= 1 || state.upgrades.shardCapacity > 0);
            return { current: hasFound ? 1 : 0, max: 1 };
        },
        rewardText: "",
        onComplete: (state) => {
        }
    },
    {
        id: "mg_4000",
        title: "Grand Harvest",
        description: "Generate 4000 energy from a single harvest.",
        //here, the progress bar should be the the maximum amount of energy the player has earned from a single game thus far. Also make sure to use the base energy gained from the harvest(so the energy capacity wont affect this)
        checkCondition: (state) => {
            return (state.maxEnergyFromHarvest || 0) >= 4000;
        },
        getProgress: (state) => {
            return { current: Math.min(4000, state.maxEnergyFromHarvest || 0), max: 4000 };
        },
        rewardText: "1 Catalytic Ore",
        onComplete: (state) => {
            state.inventory.catalyticOres += 1;
            state.totalCatalyticOres += 1;
        }
    },
    {
        id: "booster_2",
        title: "More Energy",
        description: "Craft the Normal Energy Booster",
        checkCondition: (state) => {
            return (state.upgrades.energyBooster || 0) >= 2;
        },
        getProgress: (state) => {
            return { current: Math.min(2, state.upgrades.energyBooster || 0), max: 2 };
        },
        rewardText: "",
        onComplete: (state) => {
        }
    },
    {
        id: "ecap_2",
        title: "Energy Capacity II",
        description: "Craft Energy Capacity II",
        checkCondition: (state) => {
            return (state.upgrades.storageCapacity || 0) >= 2;
        },
        getProgress: (state) => {
            return { current: Math.min(2, state.upgrades.storageCapacity || 0), max: 2 };
        },
        rewardText: "8000 Energy",
        onComplete: (state) => {
            state.energy = Math.min(state.maxEnergy, state.energy + 8000);
            state.totalEnergyEarned += 8000;
        }
    },
    {
        id: "free_energy",
        title: "Free Energy",
        description: "Give an electron to Flourine.",
        checkCondition: (state) => {
            return (state.elementGiveCount['F'] || 0) >= 1;
        },
        getProgress: (state) => {
            return { current: Math.min(1, state.elementGiveCount['F'] || 0), max: 1 };
        },
        rewardText: "1 Covalent Bridger",
        onComplete: (state) => {
            state.inventory.covalentBridger += 1;
        }
    },
    {
        id: "energy_30000",
        title: "30000 Energy",
        description: "Generate 30000 total energy",
        checkCondition: (state) => {
            return state.totalEnergyEarned >= 30000;
        },
        getProgress: (state) => {
            return { current: Math.min(30000, state.totalEnergyEarned), max: 30000 };
        },
        rewardText: "",
        onComplete: (state) => {
        }
    },
    {
        id: "pshards",
        title: "P-Shards",
        description: "Buy the P-Shard Extractor",
        checkCondition: (state) => {
            return state.upgrades.pExtractor === true;
        },
        getProgress: (state) => {
            return { current: state.upgrades.pExtractor ? 1 : 0, max: 1 };
        },
        rewardText: "1 Catalytic Ore",
        onComplete: (state) => {
            state.inventory.catalyticOres += 1;
            state.totalCatalyticOres += 1;
        }
    },
    {
        id: "scap_1",
        title: "More Shards",
        description: "Craft Shard Capacity I",
        checkCondition: (state) => {
            return (state.upgrades.shardCapacity || 0) >= 1;
        },
        getProgress: (state) => {
            return { current: Math.min(1, state.upgrades.shardCapacity || 0), max: 1 };
        },
        rewardText: "",
        onComplete: (state) => {
        }
    },
    {
        id: "ecap_3",
        title: "Energy Capacity III",
        description: "Craft Energy Capacity III",
        checkCondition: (state) => {
            return (state.upgrades.storageCapacity || 0) >= 3;
        },
        getProgress: (state) => {
            return { current: Math.min(3, state.upgrades.storageCapacity || 0), max: 3 };
        },
        rewardText: "14000 Energy",
        onComplete: (state) => {
            state.energy = Math.min(state.maxEnergy, state.energy + 14000);
            state.totalEnergyEarned += 14000;
        }
    },
    {
        id: "eboots_1",
        title: "Cheap Movement",
        description: "Craft the Basic Energy Boots",
        checkCondition: (state) => {
            return (state.upgrades.eBoots || 0) >= 1;
        },
        getProgress: (state) => {
            return { current: Math.min(1, state.upgrades.eBoots || 0), max: 1 };
        },
        rewardText: "1 Covalent Bridger",
        onComplete: (state) => {
            state.inventory.covalentBridger += 1;
        }
    },
    {
        id: "c_3",
        title: "Catalytic Collecter",
        description: "Collect 5 total Catalytic Ores",
        checkCondition: (state) => {
            return state.totalCatalyticOres >= 5;
        },
        getProgress: (state) => {
            return { current: Math.min(5, state.totalCatalyticOres), max: 5 };
        },
        rewardText: "1 Catalytic Ore",
        onComplete: (state) => {
            state.inventory.catalyticOres += 1;
            state.totalCatalyticOres += 1;
        }
    },
    {
        id: "hdrive",
        title: "Home, Sweet Home",
        description: "Craft the H-Drive",
        checkCondition: (state) => {
            return state.upgrades.hDrive === true;
        },
        getProgress: (state) => {
            return { current: state.upgrades.hDrive ? 1 : 0, max: 1 };
        },
        rewardText: "1 Radiation Vial",
        onComplete: (state) => {
            state.inventory.radiationVial += 1;
        }
    },
    {
        id: "electron_40",
        title: "40 Electrons",
        description: "Obtain a total of 40 electrons",
        checkCondition: (state) => {
            return state.totalElectronsEarned >= 40;
        },
        getProgress: (state) => {
            return { current: Math.min(40, state.totalElectronsEarned), max: 40 };
        },
        rewardText: "1 Catalytic Ore",
        onComplete: (state) => {
            state.inventory.catalyticOres += 1;
            state.totalCatalyticOres += 1;
        }
    },
    {
        id: "p5",
        title: "High Risk, High Reward",
        description: "Harvest energy from a period 5 element",
        checkCondition: (state) => {
            return Array.from(state.visitedElements).some(sym => {
                const el = elements.find(e => e.symbol === sym);
                return el && el.period >= 5;
            });
        },
        getProgress: (state) => {
            const hasP5 = Array.from(state.visitedElements).some(sym => {
                const el = elements.find(e => e.symbol === sym);
                return el && el.period >= 5;
            });
            return { current: hasP5 ? 1 : 0, max: 1 };
        },
        rewardText: "1 Covalent Bridger",
        onComplete: (state) => {
            state.inventory.covalentBridger += 1;
        }
    },
    {
        id: "i_1",
        title: "Energy Saver",
        description: "Craft the Ionization Saver",
        checkCondition: (state) => {
            return (state.upgrades.ionizationSaver || 0) >= 1;
        },
        getProgress: (state) => {
            return { current: Math.min(1, state.upgrades.ionizationSaver || 0), max: 1 };
        },
        rewardText: "",
        onComplete: (state) => {
        }
    },
    {
        id: "ecap_4",
        title: "Energy Capacity IV",
        description: "Craft Energy Capacity IV",
        checkCondition: (state) => {
            return (state.upgrades.storageCapacity || 0) >= 4;
        },
        getProgress: (state) => {
            return { current: Math.min(4, state.upgrades.storageCapacity || 0), max: 4 };
        },
        rewardText: "30000 Energy",
        onComplete: (state) => {
            state.energy = Math.min(state.maxEnergy, state.energy + 30000);
            state.totalEnergyEarned += 30000;
        }
    },
    {
        id: "scantron",
        title: "Scantron",
        description: "Craft the PES Scannar and the Proton Scannar",
        checkCondition: (state) => {
            return state.upgrades.pesScanner && state.upgrades.protonScanner;
        },
        getProgress: (state) => {
            return { current: (state.upgrades.pesScanner ? 1 : 0) + (state.upgrades.protonScanner ? 1 : 0), max: 2 };
        },
        rewardText: "",
        onComplete: (state) => {
        }
    },
    {
        id: "energy_250000",
        title: "Energy Master",
        description: "Generate 250000 total energy",
        checkCondition: (state) => {
            return state.totalEnergyEarned >= 250000;
        },
        getProgress: (state) => {
            return { current: Math.min(250000, state.totalEnergyEarned), max: 250000 };
        },
        rewardText: "1 Catalytic Ore",
        onComplete: (state) => {
            state.inventory.catalyticOres += 1;
            state.totalCatalyticOres += 1;
        }
    },
    {
        id: "scap_3",
        title: "Shard Capacity III",
        description: "Craft Shard Capacity III",
        checkCondition: (state) => {
            return (state.upgrades.shardCapacity || 0) >= 3;
        },
        getProgress: (state) => {
            return { current: Math.min(3, state.upgrades.shardCapacity || 0), max: 3 };
        },
        rewardText: "",
        onComplete: (state) => {
        }
    },
    {
        id: "shard_tracker",
        title: "Shard Seeker",
        description: "Craft the Shard Tracker",
        checkCondition: (state) => {
            return state.upgrades.shardTracker;
        },
        getProgress: (state) => {
            return { current: (state.upgrades.shardTracker ? 1 : 0), max: 1 };
        },
        rewardText: "",
        onComplete: (state) => {
        }
    },
    {
        id: "elements50",
        title: "Expert Adventurer",
        description: "Discover 50 different elements",
        checkCondition: (state) => {
            return (state.visitedElements.size || 0) >= 50;
        },
        getProgress: (state) => {
            return { current: Math.min(50, state.visitedElements.size || 0), max: 50 };
        },
        rewardText: "1 Ionic Bridger",
        onComplete: (state) => {
            state.inventory.ionicBridgers += 1;
        }
    },
    {
        id: "dshards",
        title: "D-Shards",
        description: "Buy the D-Shard Extractor",
        checkCondition: (state) => {
            return state.upgrades.dExtractor === true;
        },
        getProgress: (state) => {
            return { current: state.upgrades.dExtractor ? 1 : 0, max: 1 };
        },
        rewardText: "",
        onComplete: (state) => {
        }
    },
    {
        id: "cs",
        title: "The Weakest Link",
        description: "Grab an electron from Cesium(Cs).",
        checkCondition: (state) => {
            return state.grabbedCsElectron === true;
        },
        getProgress: (state) => {
            return { current: state.grabbedCsElectron ? 1 : 0, max: 1 };
        },
        rewardText: "1 Catalytic Ore",
        onComplete: (state) => {
            state.inventory.catalyticOres += 1;
            state.totalCatalyticOres += 1;
        }
    },
    {
        id: "eboots_2",
        title: "Energy Efficiency",
        description: "Craft the Normal Energy Boots",
        checkCondition: (state) => {
            return state.upgrades.eBoots >= 2;
        },
        getProgress: (state) => {
            return { current: Math.min(2, state.upgrades.eBoots || 0), max: 2 };
        },
        rewardText: "",
        onComplete: (state) => {
        }
    },
    {
        id: "booster_4",
        title: "Massive Gains",
        description: "Craft the Ultra Energy Booster",
        checkCondition: (state) => {
            return state.upgrades.energyBooster >= 4;
        },
        getProgress: (state) => {
            return { current: Math.min(4, state.upgrades.energyBooster || 0), max: 4 };
        },
        rewardText: "",
        onComplete: (state) => {
        }
    },
    {
        id: "mg_34000",
        title: "Energy Expert",
        description: "Earn 34000 energy from one harvest",
        //for this one, make sure to use the base energy gained from the harvest(so running out of energy capacity wont affect this)
        checkCondition: (state) => {
            return (state.maxEnergyFromHarvest || 0) >= 34000;
        },
        getProgress: (state) => {
            return { current: Math.min(34000, state.maxEnergyFromHarvest || 0), max: 34000 };
        },
        rewardText: "1 Radiation Vial",
        onComplete: (state) => {
            state.inventory.radiationVial += 1;
        }
    },
    {
        id: "i_2",
        title: "Electrons for Sale",
        description: "Craft the Super Ionization Saver",
        checkCondition: (state) => {
            return (state.upgrades.ionizationSaver || 0) >= 2;
        },
        getProgress: (state) => {
            return { current: Math.min(2, state.upgrades.ionizationSaver || 0), max: 2 };
        },
        rewardText: "",
        onComplete: (state) => {
        }
    },
    {
        id: "e_180",
        title: "Semicircle o' electrons",
        description: "Obtain a total of 180 electrons",
        checkCondition: (state) => {
            return state.totalElectronsEarned >= 180;
        },
        getProgress: (state) => {
            return { current: Math.min(180, state.totalElectronsEarned), max: 180 };
        },
        rewardText: "1 Catalytic Ore",
        onComplete: (state) => {
            state.inventory.catalyticOres += 1;
            state.totalCatalyticOres += 1;
        }
    },
    {
        id: "octet_remote",
        title: "Wireless Withdrawls",
        description: "Craft the Octet Remote",
        checkCondition: (state) => {
            return state.upgrades.octetRemote;
        },
        getProgress: (state) => {
            return { current: (state.upgrades.octetRemote ? 1 : 0), max: 1 };
        },
        rewardText: "2 Covalent Bridgers",
        onComplete: (state) => {
            state.inventory.covalentBridgers += 2;
        }
    },
    {
        id: "p_7",
        title: "Deep Dive",
        description: "Step into a period 7 element",
        checkCondition: (state) => {
            return Array.from(state.visitedElements).some(sym => {
                const el = elements.find(e => e.symbol === sym);
                return el && el.period === 7;
            });
        },
        getProgress: (state) => {
            const hasP7 = Array.from(state.visitedElements).some(sym => {
                const el = elements.find(e => e.symbol === sym);
                return el && el.period === 7;
            });
            return { current: hasP7 ? 1 : 0, max: 1 };
        },
        rewardText: "1 Radiation Vial",
        onComplete: (state) => {
            state.inventory.radiationVial += 1;
        }
    },
    {
        id: "router",
        title: "Wireless Transfers",
        description: "Craft the ELectron router and the Energy router",
        checkCondition: (state) => {
            return state.upgrades.electronRouter && state.upgrades.energyRouter;
        },
        getProgress: (state) => {
            return { current: (state.upgrades.electronRouter ? 1 : 0) + (state.upgrades.energyRouter ? 1 : 0), max: 2 };
        },
        rewardText: "1 Catalytic Ore",
        onComplete: (state) => {
            state.inventory.catalyticOres += 1;
            state.totalCatalyticOres += 1;
        }
    },
    {
        id: "energy_1000000",
        title: "Power hungry",
        description: "Generate 1000000 total energy",
        checkCondition: (state) => {
            return state.totalEnergyEarned >= 1000000;
        },
        getProgress: (state) => {
            return { current: Math.min(1000000, state.totalEnergyEarned), max: 1000000 };
        },
        rewardText: "100000 Energy",
        onComplete: (state) => {
            state.totalEnergyEarned += 100000;
            state.energy = Math.min(state.maxEnergy, state.energy + 100000);
        }
    },
    {
        id: "v_5",
        title: "Vaulting",
        description: "Unlock 5 different Noble Vaults",
        checkCondition: (state) => {
            const unlockedVaults = ['He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn', 'Og'].filter(sym => {
                return Array.from(state.bridges).some(b => b.startsWith(sym + '-') || b.endsWith('-' + sym));
            }).length;
            return unlockedVaults >= 5;
        },
        getProgress: (state) => {
            const unlockedVaults = ['He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn', 'Og'].filter(sym => {
                return Array.from(state.bridges).some(b => b.startsWith(sym + '-') || b.endsWith('-' + sym));
            }).length;
            return { current: Math.min(5, unlockedVaults), max: 5 };
        },
        rewardText: "1 Ionic Bridger",
        onComplete: (state) => {
            state.inventory.ionicBridgers += 1;
        }
    },
    {
        id: "scap_4",
        title: "Shard Capacity IV",
        description: "Craft Shard Capacity IV",
        checkCondition: (state) => {
            return (state.upgrades.shardCapacity || 0) >= 4;
        },
        getProgress: (state) => {
            return { current: Math.min(4, state.upgrades.shardCapacity || 0), max: 4 };
        },
        rewardText: "",
        onComplete: (state) => {
        }
    },
    {
        id: "trend",
        title: "Predictive Power",
        description: "Craft the Trend Analyzer",
        checkCondition: (state) => {
            return (state.upgrades.trendAnalyzer || 0) >= 1;
        },
        getProgress: (state) => {
            return { current: Math.min(1, state.upgrades.trendAnalyzer || 0), max: 1 };
        },
        rewardText: "",
        onComplete: (state) => {
        }
    },
    {
        id: "fblock",
        title: "Into the F-block",
        description: "Descend into the f-block",
        checkCondition: (state) => {
            return state.visitedElements.has("Ce");
        },
        getProgress: (state) => {
            return { current: state.visitedElements.has("Ce") ? 1 : 0, max: 1 };
        },
        rewardText: "1 Radiation Vial",
        onComplete: (state) => {
            state.inventory.radiationVial += 1;
        }
    },
    {
        id: "fshards",
        title: "F-Shards",
        description: "Craft the F-Shard Extractor",
        checkCondition: (state) => {
            return (state.upgrades.fExtractor || 0) >= 1;
        },
        getProgress: (state) => {
            return { current: Math.min(1, state.upgrades.fExtractor || 0), max: 1 };
        },
        rewardText: "1 Catalytic Ore",
        onComplete: (state) => {
            state.inventory.catalyticOres += 1;
            state.totalCatalyticOres += 1;
        }
    },
    {
        id: "ecap_5",
        title: "Energy Capacity V", // Fixed the title based on the ID and description
        description: "Craft Energy Capacity V",
        checkCondition: (state) => {
            return (state.upgrades.storageCapacity || 0) >= 5;
        },
        getProgress: (state) => {
            return { current: Math.min(5, state.upgrades.storageCapacity || 0), max: 5 };
        },
        rewardText: "55000 Energy",
        onComplete: (state) => {
            state.totalEnergyEarned += 55000;
            state.energy = Math.min(state.maxEnergy, state.energy + 55000);
        }
    },
    {
        id: "eboots_3",
        title: "Extreme Efficiency",
        description: "Craft the Super Energy Boots",
        checkCondition: (state) => {
            return (state.upgrades.eBoots || 0) >= 3;
        },
        getProgress: (state) => {
            return { current: Math.min(3, state.upgrades.eBoots || 0), max: 3 };
        },
        rewardText: "1 Ionic Bridger",
        onComplete: (state) => {
            state.inventory.catalyticOres += 1;
        }
    },
    {
        id: "scap_5",
        title: "Shard Capacity V",
        description: "Craft Shard Capacity V",
        checkCondition: (state) => {
            return (state.upgrades.shardCapacity || 0) >= 5;
        },
        getProgress: (state) => {
            return { current: Math.min(5, state.upgrades.shardCapacity || 0), max: 5 };
        },
        rewardText: "",
        onComplete: (state) => {
        }
    },
    {
        id: "c_20",
        title: "Catalytic Pro",
        description: "Collect 20 total catalytic ores (Try extracting energy from the D-Block!)",
        checkCondition: (state) => {
            return state.totalCatalyticOres >= 20;
        },
        getProgress: (state) => {
            return { current: Math.min(20, state.totalCatalyticOres), max: 20 };
        },
        rewardText: "3 Catalytic Ores",
        onComplete: (state) => {
            state.inventory.catalyticOres += 3;
            state.totalCatalyticOres += 3;
        }
    },
    {
        id: "booster_5",
        title: "Hyper Energy Booster",
        description: "Craft the Hyper Energy Booster",
        checkCondition: (state) => {
            return (state.upgrades.energyBooster || 0) >= 5;
        },
        getProgress: (state) => {
            return { current: Math.min(5, state.upgrades.energyBooster || 0), max: 5 };
        },
        rewardText: "",
        onComplete: (state) => {
        }
    },
    {
        id: "ecap_6",
        title: "Energy Capacity VI",
        description: "Craft Energy Capacity VI",
        checkCondition: (state) => {
            return (state.upgrades.storageCapacity || 0) >= 6;
        },
        getProgress: (state) => {
            return { current: Math.min(6, state.upgrades.storageCapacity || 0), max: 6 };
        },
        rewardText: "100000 Energy",
        onComplete: (state) => {
            state.totalEnergyEarned += 100000;
            state.energy = Math.min(state.maxEnergy, state.energy + 100000);
        }
    },
    {
        id: "electron_400",
        title: "Electrons Galore",
        description: "Obtain 400 total electrons",
        checkCondition: (state) => {
            return (state.totalElectronsEarned || 0) >= 400;
        },
        getProgress: (state) => {
            return { current: Math.min(400, state.totalElectronsEarned || 0), max: 400 };
        },
        rewardText: "1 Radiation Vial",
        onComplete: (state) => {
            state.inventory.radiationVial += 1;
        }
    },
    {
        id: "eboots_4",
        title: "Ultra Energy Boots",
        description: "Craft the Ultra Energy Boots",
        checkCondition: (state) => {
            return (state.upgrades.eBoots || 0) >= 4;
        },
        getProgress: (state) => {
            return { current: Math.min(4, state.upgrades.eBoots || 0), max: 4 };
        },
        rewardText: "",
        onComplete: (state) => {
        }
    },
    {
        id: "suit",
        title: "Maximum Protection",
        description: "Craft the Shielding Suit",
        checkCondition: (state) => {
            return state.upgrades.shieldingSuit;
        },
        getProgress: (state) => {
            return { current: (state.upgrades.shieldingSuit ? 1 : 0), max: 1 };
        },
        rewardText: "3 Radiation Vials",
        onComplete: (state) => {
            state.inventory.radiationVial += 3;
        }
    },

    {
        id: "booster_6",
        title: "Quantum Energy",
        description: "Craft the Quantum Booster",
        checkCondition: (state) => {
            return (state.upgrades.energyBooster || 0) >= 6;
        },
        getProgress: (state) => {
            return { current: Math.min(6, state.upgrades.energyBooster || 0), max: 6 };
        },
        rewardText: "",
        onComplete: (state) => {
        }
    },
    {
        id: "mg_600000",
        title: "Energy Master",
        description: "Earn 600000 energy from a single harvest",
        checkCondition: (state) => {
            return (state.maxEnergyFromHarvest || 0) >= 600000;
        },
        getProgress: (state) => {
            return { current: Math.min(600000, state.maxEnergyFromHarvest || 0), max: 600000 };
        },
        rewardText: "3 Catalytic Ores",
        onComplete: (state) => {
            state.inventory.catalyticOres += 5;
            state.totalCatalyticOres += 5;
        }
    },
    {
        id: "vault",
        title: "To the brim",
        description: "Fill every Noble Vault with energy",
        checkCondition: (state) => {
            const caps = { 'He': 1000, 'Ne': 3500, 'Ar': 8000, 'Kr': 17000, 'Xe': 45000, 'Rn': 170000, 'Og': 400000 };
            return ['He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn', 'Og'].every(sym => {
                return state.banks && state.banks[sym] && state.banks[sym].energy >= caps[sym];
            });
        },
        getProgress: (state) => {
            const caps = { 'He': 1000, 'Ne': 3500, 'Ar': 8000, 'Kr': 17000, 'Xe': 45000, 'Rn': 170000, 'Og': 400000 };
            const filled = ['He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn', 'Og'].filter(sym => {
                return state.banks && state.banks[sym] && state.banks[sym].energy >= caps[sym];
            }).length;
            return { current: filled, max: 7 };
        },
        rewardText: "1 Radiation Vial",
        onComplete: (state) => {
            state.inventory.radiationVial += 1;
        }
    },
    {
        id: "elements90",
        title: "Round Trip",
        description: "Discover 90 different elements",
        checkCondition: (state) => {
            return (state.visitedElements.size || 0) >= 90;
        },
        getProgress: (state) => {
            return { current: Math.min(90, state.visitedElements.size || 0), max: 90 };
        },
        rewardText: "1 Ionic Bridger",
        onComplete: (state) => {
            state.inventory.ionicBridgers += 1;
        }
    },
    {
        id: "energy_20000000",
        title: "Infinite Energy",
        description: "Generate 20000000 total energy",
        checkCondition: (state) => {
            return state.totalEnergyEarned >= 20000000;
        },
        getProgress: (state) => {
            return { current: Math.min(20000000, state.totalEnergyEarned), max: 20000000 };
        },
        rewardText: "3 Catalytic Ores",
        onComplete: (state) => {
            state.inventory.catalyticOres += 3;
            state.totalCatalyticOres += 3;
        }
    },
    {
        id: "win",
        title: "Final Stretch",
        description: "Step onto Lawrencium(Lr) to win!",
        isAvailable: (state) => {
            // Only available after all other 59 quests are completed
            return state.quests.completed.length >= 59;
        },
        checkCondition: (state) => {
            return state.visitedElements.has('Lr');
        },
        getProgress: (state) => {
            return { current: state.visitedElements.has('Lr') ? 1 : 0, max: 1 };
        },
        rewardText: "You Win!",
        onComplete: (state) => {
        }
    },
];
