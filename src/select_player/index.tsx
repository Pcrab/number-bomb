import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { GameContext } from "../context";
import { Scene } from "../types";

const SUGGESTIONS_KEY = "number-bomb:player-suggestions";

const loadSuggestions = (): string[] => {
	try {
		const raw = localStorage.getItem(SUGGESTIONS_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed)
			? parsed.filter((s) => typeof s === "string")
			: [];
	} catch {
		return [];
	}
};

const saveSuggestions = (list: string[]) => {
	try {
		localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(list));
	} catch {}
};

const Sortable = ({ id, index }: { id: string; index: number }) => {
	const { ref } = useSortable({ id, index });

	const { players, setPlayers } = useContext(GameContext);

	const deleteUser = useCallback(() => {
		const newPlayers = players.toSpliced(index, 1);
		setPlayers(newPlayers);
	}, [players, setPlayers]);

	return (
		<div
			ref={ref}
			className="flex cursor-grab! items-center px-10px py-5px rounded-md shadow justify-between bg-gray-50 hover:bg-gray-100"
		>
			<div className="font-bold">
				<span className="text-gray-400 mr-8px">{index + 1}.</span>
				{id}
			</div>
			<button
				type="button"
				onClick={deleteUser}
				className="cursor-pointer bg-red-100 text-red-700 px-10px py-2px rounded hover:bg-red-500 hover:text-white font-bold text-sm transition-colors"
			>
				删除
			</button>
		</div>
	);
};

const SelectPlayer = () => {
	const { setScene, players, setPlayers } = useContext(GameContext);
	const [newPlayer, setNewPlayer] = useState("");
	const [suggestions, setSuggestions] = useState<string[]>([]);

	const newPlayerRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		setSuggestions(loadSuggestions());
	}, []);

	const addPlayer = useCallback(() => {
		const newPlayerName = newPlayer.trim();
		if (!newPlayerName || players.includes(newPlayerName)) {
			return;
		}

		setPlayers([...players, newPlayerName]);
		setNewPlayer("");

		setSuggestions((prev) => {
			if (prev.includes(newPlayerName)) return prev;
			const next = [...prev, newPlayerName];
			saveSuggestions(next);
			return next;
		});

		newPlayerRef.current?.focus();
	}, [newPlayer, players, setPlayers]);

	const removeSuggestion = useCallback((name: string) => {
		setSuggestions((prev) => {
			const next = prev.filter((s) => s !== name);
			saveSuggestions(next);
			return next;
		});
	}, []);

	const toggleQuickAdd = useCallback(
		(name: string) => {
			if (players.includes(name)) {
				setPlayers(players.filter((p) => p !== name));
			} else {
				setPlayers([...players, name]);
			}
		},
		[players, setPlayers],
	);

	return (
		<div className="w-320px">
			<div className="flex gap-5px">
				<input
					list="player-names"
					ref={newPlayerRef}
					value={newPlayer}
					onChange={(e) => setNewPlayer(e.target.value)}
					placeholder="输入玩家昵称"
					className="flex-1 min-w-0 py-5px px-10px outline-none border-2px border-solid border-gray-300 focus:border-red-500 rounded-md transition-colors"
				/>
				<datalist id="player-names">
					{suggestions
						.filter((name) => !players.includes(name))
						.map((name) => (
							<option value={name} key={name}></option>
						))}
				</datalist>
				<button
					type="button"
					onClick={() => {
						addPlayer();
					}}
					className="px-15px rounded-md bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 cursor-pointer transition-colors"
				>
					添加
				</button>
			</div>
			{suggestions.length > 0 && (
				<div className="mt-10px">
					<div className="text-sm text-gray-500 mb-5px">
						常用玩家(点击加入或移出)
					</div>
					<div className="flex flex-wrap gap-5px">
						{suggestions.map((name) => {
							const active = players.includes(name);
							return (
								<div
									key={name}
									className={`flex items-center gap-3px rounded-md pl-8px transition-colors ${
										active ? "bg-blue-100" : "bg-gray-50 hover:bg-blue-50"
									}`}
								>
									<button
										type="button"
										onClick={() => toggleQuickAdd(name)}
										className={`cursor-pointer py-2px font-bold bg-transparent ${
											active ? "text-blue-700" : ""
										}`}
									>
										{name}
									</button>
									<button
										type="button"
										onClick={() => removeSuggestion(name)}
										title="从常用列表移除"
										className="cursor-pointer px-5px py-2px text-gray-400 bg-transparent hover:text-red-600"
									>
										×
									</button>
								</div>
							);
						})}
					</div>
				</div>
			)}
			<DragDropProvider
				onDragEnd={(e) => {
					const newPlayers = move(players, e);
					setPlayers(newPlayers);
				}}
				modifiers={[]}
			>
				<div className="flex flex-col gap-10px mt-10px min-h-40px">
					{players.map((player, index) => {
						return <Sortable key={player} id={player} index={index} />;
					})}
				</div>
			</DragDropProvider>
			<button
				type="button"
				disabled={players.length === 0}
				className="m-auto block mt-30px px-30px py-10px rounded-full bg-red-500 text-white font-bold text-lg shadow-lg hover:bg-red-600 hover:shadow-xl cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-500 disabled:hover:shadow-lg"
				onClick={() => {
					setScene(Scene.GAME);
				}}
			>
				开始游戏
			</button>
		</div>
	);
};

export default SelectPlayer;
