//~ Types

/**
 * @typedef {Object} GameData
 * @property {number} Coins
 * @property {string} PlayerName
 * @property {number} Level
 */

//~ Constants

const TemplateData = {
    Coins: 0, 
    PlayerName: "Warrior", 
    Level: 1,
};

//~ Public API

export class DataManager {
    constructor() {}

    /**
     * @template {keyof GameData} K
     * @param {K} key 
     * @returns {GameData[K]}
     */
    get(key) {
        return localStorage.get(key) || TemplateData[key];
    }
    
    /**
     * @template {keyof GameData} K
     * @param {K} key 
     * @param {GameData[K]} value 
     */
    set(key, value) {
        localStorage.setItem(key, String(value))
    }
}

export const data = new DataManager();