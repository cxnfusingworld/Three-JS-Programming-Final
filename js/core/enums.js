//~ Public API

export const Enum = Object.freeze({
	SyncType: Object.freeze({
		"PlayerUpdate": "PLAYER_UPDATE",
		"PlayerAdded": "PLAYER_ADDED",
		"PlayerSpawnUpdate": "PLAYER_SPAWN_UPDATE",
		"PlayerKilled": "PLAYER_KILLED",
		"InvokeOtherPlayers": "INVOKE_OTHERS",
		"SpawnEffect": "SPAWN_EFFECT",
		"Damage": "DAMAGE",
		"ApplyVelocity": "APPLY_VELOCITY",
	}),

	Ability: Object.freeze({
		"Dash": "Dash",
		"GroundPound": "GroundPound",
		"Fireball": "Fireball",
	}),
});