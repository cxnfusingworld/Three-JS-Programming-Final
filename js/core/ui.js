//~ Imports

import { connectToPeer, getClientId } from "./net.js";
import { State } from "./state.js";

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

	updateDeathScreen(false);

	State.Player.health = State.Player.maxHealth;
	updateHealthUI();
	
	State.CooldownManager.resetAll();
}

//~ Public Functions

/**
 * @param {boolean?} enabled 
 */
export function updateHealthUI(enabled) {
    const percent = Math.max(0, Math.min(100, (State.Player.health / State.Player.maxHealth) * 100));

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

//~ Main

document.getElementById("btn-ffa").addEventListener("click", () => {
	MainMenu.style.display = "none";
	LobbyHUD.style.display = "flex";
	updateHealthUI(true);

	State.GameMode = "FFA";
});

JoinButton.addEventListener("click", async () => {
	const targetId = document.getElementById("input-room-code").value.trim();
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

	const code = getClientId();
	if (!code) return;

	await navigator.clipboard.writeText(code);
	const originalText = CopyButton.innerHTML;
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

	LobbyHUD.style.display = "none";
	MainMenu.style.display = "flex";
});

RespawnButton.addEventListener("click", () => {
	if (!canRespawn) return;
	resetState();
});