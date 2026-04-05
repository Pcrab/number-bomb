import { createContext } from "react";
import { Scene } from "./types";

type SceneType = (typeof Scene)[keyof typeof Scene];

export const GameContext = createContext<{
	scene: SceneType;
	setScene: (newScene: SceneType) => unknown;
	players: string[];
	setPlayers: (newPlayers: string[]) => unknown;
}>({
	scene: Scene.START,
	setScene: () => {},
	players: [],
	setPlayers: () => {},
});
