import { useCallback, useContext, useEffect, useState } from "react";
import { GameContext } from "../context";
import { Scene } from "../types";

const MIN = 1;
const MAX = 100;

const DEBUG =
	typeof window !== "undefined" &&
	new URLSearchParams(window.location.search).get("debug") === "1";

const randomBomb = (min: number, max: number) =>
	Math.floor(Math.random() * (max - min + 1)) + min;

const Game = () => {
	const { players, setScene } = useContext(GameContext);

	const [bomb, setBomb] = useState(MIN);
	const [low, setLow] = useState(MIN);
	const [high, setHigh] = useState(MAX);
	const [turn, setTurn] = useState(0);
	const [loser, setLoser] = useState<string | null>(null);

	const currentPlayer = players[turn % players.length];
	const gameOver = !!loser;

	const initGame = useCallback(() => {
		setBomb(randomBomb(MIN, MAX));
		setLow(MIN);
		setHigh(MAX);
		setTurn(0);
		setLoser(null);
	}, []);

	useEffect(() => {
		initGame();
	}, [initGame]);

	const pick = useCallback(
		(n: number) => {
			if (gameOver) return;
			if (n === bomb) {
				setLoser(currentPlayer);
				return;
			}
			if (n < bomb) {
				setLow(n + 1);
			} else {
				setHigh(n - 1);
			}
			setTurn((t) => t + 1);
		},
		[bomb, currentPlayer, gameOver],
	);

	const numbers: number[] = [];
	for (let i = MIN; i <= MAX; i++) numbers.push(i);

	return (
		<div className="flex flex-col gap-15px items-center max-w-90vw">
			{gameOver ? (
				<div className="text-center text-red-600 font-bold text-xl">
					💥 砰！{loser} 被炸飞啦！
				</div>
			) : low === high ? (
				<div className="text-center text-lg">
					轮到倒霉蛋 <span className="font-bold">{currentPlayer}</span> 啦
				</div>
			) : (
				<div className="text-center text-lg">
					轮到 <span className="font-bold">{currentPlayer}</span> 出手, 安全范围{" "}
					{low} ~ {high}
				</div>
			)}

			<div className="grid grid-cols-10 gap-5px">
				{numbers.map((n) => {
					const outOfRange = n < low || n > high;
					const isBomb = (gameOver || DEBUG) && n === bomb;

					let cls =
						"w-40px h-40px rounded font-bold flex items-center justify-center transition-colors";
					if (isBomb) {
						cls += " bg-red-500 text-white";
					} else if (outOfRange) {
						cls += " bg-gray-50 text-gray-300 line-through";
					} else if (gameOver) {
						cls += " bg-gray-100 text-gray-500";
					} else {
						cls +=
							" bg-gray-100 hover:bg-gray-500 hover:text-gray-100 cursor-pointer";
					}

					return (
						<button
							key={n}
							type="button"
							disabled={gameOver || outOfRange}
							onClick={() => pick(n)}
							className={cls}
						>
							{n}
						</button>
					);
				})}
			</div>

			<div className="flex gap-10px justify-center mt-10px">
				<button
					type="button"
					onClick={initGame}
					className="px-10px py-5px rounded bg-gray-200 font-bold hover:bg-gray-500 hover:text-gray-100 cursor-pointer"
				>
					再来一局
				</button>
				<button
					type="button"
					onClick={() => setScene(Scene.SELECT_PLAYER)}
					className="px-10px py-5px rounded bg-gray-200 font-bold hover:bg-gray-500 hover:text-gray-100 cursor-pointer"
				>
					返回玩家设置
				</button>
			</div>
		</div>
	);
};

export default Game;
