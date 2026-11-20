//~ Types

/**
 * @typedef {{
 *  PlayerName: string,
 *  Coins: number,
 *  Level: number,
 * }} GameData
 */

//~ Constants

const TemplateData = {
    Coins: 0, 
    PlayerName: "Warrior", 
    Level: 1,
};

//~ Public API

class DataManagerCreator {
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

export const DataManager = new DataManagerCreator();