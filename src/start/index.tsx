import { useContext } from "react";
import { GameContext } from "../context";
import { Scene } from "../types";

const Start = () => {
	const { setScene } = useContext(GameContext);

	return (
		<div className="flex flex-col items-center gap-30px">
			<button
				type="button"
				onClick={() => {
					setScene(Scene.SELECT_PLAYER);
				}}
				className="px-30px py-10px rounded-full bg-red-500 text-white font-bold text-lg shadow-lg hover:bg-red-600 hover:shadow-xl cursor-pointer transition-all"
			>
				开始游戏
			</button>
		</div>
	);
};

export default Start;
