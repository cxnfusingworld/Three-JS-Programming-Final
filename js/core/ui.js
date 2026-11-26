//~ Imports

import * as THREE from "three";
import { Enum } from "./enums.js";
import { connectToPeer, getClientId, sendData } from "./net.js";
import { State } from "./state.js";
import { sleep } from "./utils.js";

//~ Constants

const MainMenu = document.getElementById("main-menu");
const LobbyUI = document.getElementById("lobby-ui");
const DeathScreen = document.getElementById("death-screen");

const HealthBar = document.getElementById("health-bar-fill");
const HealthValue = document.getElementById("health-value");
const MaxHealthValue = document.getElementById("max-health-value");

const JoinButton = document.getElementById("btn-join");
const CopyButton = document.getElementById("btn-copy-code");
const LeaveButton = document.getElementById("btn-leave");
const RespawnButton = document.getElementById("btn-respawn");

const OverheadVector = new THREE.Vector3();

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

	document.getElementById("health-ui").style.display = enabled !== false ? "flex" : "none";
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

/**
 * @param {string} id 
 * @param {boolean?} updatePosition
 * @param {boolean?} updateHealth
 */
export function updateOverheadUI(id, updatePosition, updateHealth) {
	let playerData = State.Players[id];
	if (!playerData) return;

	let overheadUI = document.getElementById(`overhead-${id}`);
	if (!overheadUI || !playerData.Mesh) return;

	if (!playerData.Mesh.visible) {
		overheadUI.style.display = 'none';
		return;
	} else {
		if (overheadUI.style.display === 'none') {
			overheadUI.style.display = 'flex';
		}
	}

	if (updatePosition !== false) {
		OverheadVector.copy(playerData.Mesh.position);
		OverheadVector.y += 1.4;

		OverheadVector.project(State.Camera);

		if (OverheadVector.z > 1) {
			overheadUI.style.display = 'none';
			return;
		}

		let x = (OverheadVector.x * 0.5 + 0.5) * window.innerWidth;
		let y = (-(OverheadVector.y * 0.5) + 0.5) * window.innerHeight;

		overheadUI.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
	}

	if (updateHealth !== false) {
		let fill = document.getElementById(`hp-fill-${id}`);
		if (!fill) return;

		if (fill) {
			let percent = Math.max(0, Math.min(100, (State.Players[id].State.Health / 100) * 100));
			fill.style.width = `${percent}%`;
		}
	}
}

/**
 * @param {boolean?} updatePosition
 * @param {boolean?} updateHealth
 */
export function updateOverheadUIs(updatePosition, updateHealth) {
	Object.entries(State.Players).forEach(([id]) => updateOverheadUI(id, updatePosition, updateHealth));
}

//~ Main

document.getElementById("btn-ffa").addEventListener("click", () => {
	MainMenu.style.display = "none";
	LobbyUI.style.display = "flex";
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

	State.GameMode = "FFA"

	MainMenu.style.display = "none";
	LobbyUI.style.display = "flex";
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
	Object.keys(State.Players).forEach(id => State.Players[id].Connection.disconnect());

	resetState();
	updateHealthUI(false);

	State.Kills = 0;
	State.GameMode = undefined;

	LobbyUI.style.display = "none";
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