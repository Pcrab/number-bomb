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
			className="flex cursor-grab! items-center p-5px rounded shadow justify-between bg-gray-50 hover:bg-gray-100"
		>
			<div>{id}</div>
			<button
				onClick={deleteUser}
				className="cursor-pointer bg-red-100 px-5px py-2px rounded hover:bg-red-900 hover:text-red-50 font-bold"
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

	const quickAdd = useCallback(
		(name: string) => {
			if (players.includes(name)) return;
			setPlayers([...players, name]);
		},
		[players, setPlayers],
	);

	const availableSuggestions = suggestions.filter(
		(name) => !players.includes(name),
	);

	return (
		<div>
			<div className="flex gap-5px">
				<input
					list="player-names"
					ref={newPlayerRef}
					value={newPlayer}
					onChange={(e) => setNewPlayer(e.target.value)}
					placeholder="新玩家名称"
					className="py-2px px-5px outline-none border-2px border-solid border-#000000 rounded"
				/>
				<datalist id="player-names">
					{availableSuggestions.map((name) => (
						<option value={name} key={name}></option>
					))}
				</datalist>
				<button
					type="button"
					onClick={() => {
						addPlayer();
					}}
					className="px-5px rounded bg-gray-200 font-bold hover:bg-gray-500 hover:text-gray-100"
				>
					添加玩家
				</button>
			</div>
			{availableSuggestions.length > 0 && (
				<div className="mt-10px">
					<div className="text-sm text-gray-500 mb-5px">常用玩家(点击添加)</div>
					<div className="flex flex-wrap gap-5px">
						{availableSuggestions.map((name) => (
							<div
								key={name}
								className="flex items-center gap-3px bg-gray-50 hover:bg-blue-50 rounded pl-8px"
							>
								<button
									type="button"
									onClick={() => quickAdd(name)}
									className="cursor-pointer py-2px font-bold bg-transparent"
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
						))}
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
				<div className="flex flex-col gap-10px mt-10px">
					{players.map((player, index) => {
						return <Sortable key={player} id={player} index={index} />;
					})}
				</div>
			</DragDropProvider>
			{!!(players.length > 0) && (
				<button
					type="button"
					className="m-auto block mt-20px px-10px py-5px rounded font-bold"
					onClick={() => {
						setScene(Scene.GAME);
					}}
				>
					开始游戏
				</button>
			)}
		</div>
	);
};

export default SelectPlayer;
