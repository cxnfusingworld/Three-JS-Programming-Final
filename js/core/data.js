//~ Types

/**
 * @typedef {{
 *  PlayerName: string,
 *  Currency: number,
 *  Level: number,
 * }} GameData
 */

//~ Constants

const TemplateData = {
	PlayerName: "Warrior",
	Currency: 0,
	Level: 1,
};

//~ Public API

class DataManagerCreator {
	constructor() { }

	/**
	 * @template {keyof GameData} K
	 * @param {K} key
	 * @returns {GameData[K]}
	 */
	get(key) {
		let savedData = localStorage.get(key);
		if (!savedData) return TemplateData[key];

		let goalType = typeof(TemplateData[key]);
		if (goalType === "string") return savedData;
		if (goalType === "number") return Number(savedData);

		return savedData
	}

	/**
	 * @template {keyof GameData} K
	 * @param {K} key
	 * @param {GameData[K]} value
	 */
	set(key, value) {
		let goalType = typeof(TemplateData[key]);
		if (goalType === "string" || goalType === "number") localStorage.setItem(key, String(value));
	}
}

export const DataManager = new DataManagerCreator();