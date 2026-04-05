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
		<div className="flex flex-col gap-15px sm:gap-20px items-center w-95vw max-w-700px">
			<div className="flex flex-wrap gap-8px sm:gap-15px justify-center">
				{players.map((p, i) => {
					const isCurrent = !gameOver && p === currentPlayer;
					const isLoser = gameOver && p === loser;
					return (
						<div
							key={p}
							className={`px-10px py-3px rounded-full font-bold text-sm sm:text-lg transition-all ${
								isLoser
									? "bg-red-500 text-white shadow-lg"
									: isCurrent
										? "bg-red-100 text-red-700 ring-2 ring-red-400 scale-110"
										: "bg-gray-100 text-gray-600"
							}`}
						>
							<span className="text-gray-400 mr-4px">{i + 1}.</span>
							{p}
						</div>
					);
				})}
			</div>

			{gameOver ? (
				<div className="text-center text-red-600 font-bold text-2xl sm:text-3xl">
					💥 砰！{loser} 被炸飞啦！
				</div>
			) : low === high ? (
				<div className="text-center text-xl sm:text-2xl">
					轮到倒霉蛋 <span className="font-bold">{currentPlayer}</span> 啦
				</div>
			) : (
				<div className="text-center text-xl sm:text-2xl leading-tight">
					轮到 <span className="font-bold">{currentPlayer}</span> 出手
					<br className="sm:hidden" />
					<span className="hidden sm:inline">,</span>
					安全范围{" "}
					<span className="font-bold text-red-600 text-2xl sm:text-3xl">
						{low} ~ {high}
					</span>
				</div>
			)}

			<div className="grid grid-cols-10 gap-4px sm:gap-6px w-full">
				{numbers.map((n) => {
					const outOfRange = n < low || n > high;
					const isBomb = (gameOver || DEBUG) && n === bomb;

					let cls =
						"w-full aspect-square rounded-md font-bold text-sm sm:text-2xl flex items-center justify-center transition-colors";
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

			<div className="flex flex-wrap gap-10px justify-center mt-5px">
				<button
					type="button"
					onClick={initGame}
					className="px-20px py-8px rounded-full bg-red-500 text-white font-bold shadow hover:bg-red-600 hover:shadow-lg cursor-pointer transition-all"
				>
					再来一局
				</button>
				<button
					type="button"
					onClick={() => setScene(Scene.SELECT_PLAYER)}
					className="px-20px py-8px rounded-full bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 cursor-pointer transition-colors"
				>
					返回玩家设置
				</button>
			</div>
		</div>
	);
};

export default Game;
