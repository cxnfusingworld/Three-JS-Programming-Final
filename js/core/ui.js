//~ Imports

import { connectToPeer, getClientId } from "./net.js";
import { State } from "./state.js";

//~ Constants

const mainMenu = document.getElementById('main-menu');
const lobbyHud = document.getElementById('lobby-hud');
const btnCopyCode = document.getElementById('btn-copy-code');

//~ Main

document.getElementById('btn-ffa').addEventListener('click', () => {
    mainMenu.style.display = 'none';
    lobbyHud.style.display = 'flex';
    
    State.GameMode = "FFA";
});

document.getElementById('btn-join').addEventListener('click', async () => {
    const targetId = document.getElementById('input-room-code').value.trim();
    if (!targetId) return;

    let success = await connectToPeer(targetId);
    if (!success) {
        console.log("Failed to connect to room.");
        return;
    }

    mainMenu.style.display = 'none';
    lobbyHud.style.display = 'flex';
});

btnCopyCode.addEventListener('click', async () => {
    if (State.CooldownManager.onCooldown("CopyCode")) return;
    State.CooldownManager.setCooldown("CopyCode", 1500 / 1000);

    const code = getClientId();
    if (!code) return;

    await navigator.clipboard.writeText(code);
    const originalText = btnCopyCode.innerHTML;
    btnCopyCode.textContent = "[Code Copied!]";
    setTimeout(() => btnCopyCode.innerHTML = originalText, 1500);
});

document.getElementById('btn-leave').addEventListener('click', () => {
    Object.values(State.Players).forEach(data => data.Connection.close());
    
    Object.keys(State.Players).forEach(id => {
        if (State.Players[id].Mesh) State.Scene.remove(State.Players[id].Mesh);
        delete State.Players[id];
    });

    lobbyHud.style.display = 'none';
    mainMenu.style.display = 'flex';
});