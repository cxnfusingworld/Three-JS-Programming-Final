//~ Imports

import { Enum } from "./enums.js";
import { connectToPeer, getClientId, sendData } from "./net.js";
import { State } from "./state.js";
import { sleep } from "./utils.js";

//~ Constants

const MainMenu = document.getElementById("main-menu");
const LobbyHUD = document.getElementById("lobby-hud");
const DeathScreen = document.getElementById("death-screen");

const HealthBar = document.getElementById("health-bar-fill");
const HealthValue = document.getElementById("health-value");
const MaxHealthValue = document.getElementById("max-health-value");

const JoinButton = document.getElementById("btn-join");
const CopyButton = document.getElementById("btn-copy-code");
const LeaveButton = document.getElementById("btn-leave");
const RespawnButton = document.getElementById("btn-respawn");

//~ Variables

let canRespawn = false;

//~ Helper Functions

function resetState() {
	canRespawn = false;

	State.Player.velocity.set(0, 0, 0);
	State.Player.mesh.position.set(0, 1, 0);
	State.Player.health = State.Player.maxHealth;

	State.CooldownManager.resetAll();

	updateHealthUI();
	updateDeathScreen(false);
}

//~ Public Functions

/**
 * @param {boolean?} enabled 
 */
export function updateHealthUI(enabled) {
	let percent = Math.max(0, Math.min(100, (State.Player.health / State.Player.maxHealth) * 100));

	HealthBar.style.width = `${percent}%`;
	HealthValue.innerText = Math.min(Math.max(Math.floor(State.Player.health), 0), State.Player.maxHealth);
	MaxHealthValue.innerText = Math.max(Math.floor(State.Player.maxHealth), 0);

	document.getElementById("health-hud").style.display = enabled !== false ? "flex" : "none";
}

/**
 * @param {boolean} enabled 
 */
export function updateDeathScreen(enabled) {
	DeathScreen.style.display = enabled ? "flex" : "none";
	updateHealthUI(!enabled);

	sendData(Enum.SyncType.PlayerSpawnUpdate, { id: getClientId(), spawned: !enabled });

	if (enabled) {
		RespawnButton.innerText = "[3]"
		setTimeout(() => RespawnButton.innerText = "[2]", 1000);
		setTimeout(() => RespawnButton.innerText = "[1]", 2000);
		setTimeout(() => {
			RespawnButton.innerText = "[Respawn]";
			canRespawn = true;
		}, 3000);
	}
}

export function updateLeaderboardUI() {
	let list = document.getElementById('leaderboard-list');
	list.innerHTML = '';

	let allPlayers = [
		{ id: getClientId(), name: '[You]', kills: State.Kills, isLocal: true },
		...Object.entries(State.Players).map(([id, p]) => ({
			id,
			name: `[${p.State.Name}]` || id.slice(0, 6),
			kills: p.State.Kills || 0,
			isLocal: false
		}))
	].sort((a, b) => b.kills - a.kills);

	allPlayers.forEach((p, i) => {
		let row = document.createElement('div');
		row.className = `leaderboard-row ${p.isLocal ? 'local-player' : ''}`;
		row.innerHTML = `
			<span>// [#${i + 1}] ${p.name}</span>
			<span class="leaderboard-kills">[${p.kills}]</span>
		`;
		list.appendChild(row);
	});
}

//~ Main

document.getElementById("btn-ffa").addEventListener("click", () => {
	MainMenu.style.display = "none";
	LobbyHUD.style.display = "flex";
	updateHealthUI(true);

	State.GameMode = "FFA";
});

JoinButton.addEventListener("click", async () => {
	let targetId = document.getElementById("input-room-code").value.trim();
	if (!targetId) return;

	let success = await connectToPeer(targetId);
	if (!success) {
		console.log("Failed to connect to room.");
		return;
	}

	MainMenu.style.display = "none";
	LobbyHUD.style.display = "flex";
	updateHealthUI(true);
});

CopyButton.addEventListener("click", async () => {
	if (State.CooldownManager.onCooldown("CopyCode")) return;
	State.CooldownManager.setCooldown("CopyCode", 1500 / 1000);

	let code = getClientId();
	if (!code) return;

	await navigator.clipboard.writeText(code);
	let originalText = CopyButton.innerHTML;
	CopyButton.textContent = "[Code Copied!]";
	setTimeout(() => CopyButton.innerHTML = originalText, 1500);
});

LeaveButton.addEventListener("click", () => {
	Object.values(State.Players).forEach(data => data.Connection.close());
	Object.keys(State.Players).forEach(id => {
		if (State.Players[id].Mesh) State.Scene.remove(State.Players[id].Mesh);
		delete State.Players[id];
	});

	resetState();
	updateHealthUI(false);

	State.Kills = 0;
	State.GameMode = undefined;

	LobbyHUD.style.display = "none";
	MainMenu.style.display = "flex";
});

RespawnButton.addEventListener("click", () => {
	if (!canRespawn) return;
	resetState();
});

updateLeaderboardUI();

new Promise(async (resolve) => {
	while (true) {
		if (State.Input) break;
		await sleep(100);
	}
	resolve();
}).then(() => {
	State.Input.onKeyDown((input) => {
		if (input.key === 'Tab') {
			input.preventDefault();
			if (!State.GameMode) return;
			document.getElementById('leaderboard').style.display = 'flex';
		}
	}, "Leaderboard_Open");

	State.Input.onKeyUp((input) => {
		if (input.key === 'Tab') {
			document.getElementById('leaderboard').style.display = 'none';
		}
	}, "Leaderboard_Close");	
});