import { useState } from "react";
import { GameContext } from "./context.tsx";
import Game from "./game/index.tsx";
import SelectPlayer from "./select_player/index.tsx";
import Start from "./start/index.tsx";
import { Scene } from "./types.ts";

function App() {
	const [scene, setScene] = useState<(typeof Scene)[keyof typeof Scene]>(
		Scene.START,
	);
	const [players, setPlayers] = useState<string[]>([]);

	return (
		<GameContext.Provider
			value={{
				scene,
				setScene,
				players,
				setPlayers,
			}}
		>
			<div className="py-40px px-20px">
				<h1 className="font-bold text-center text-2xl mb-20px">数字炸弹</h1>
				{!!(scene === Scene.START) && <Start />}
				{!!(scene === Scene.SELECT_PLAYER) && <SelectPlayer />}
				{!!(scene === Scene.GAME) && <Game />}
			</div>
		</GameContext.Provider>
	);
}

export default App;
