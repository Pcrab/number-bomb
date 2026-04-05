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

const ManagePanel = ({
	suggestions,
	onAdd,
	onRemove,
	onClose,
}: {
	suggestions: string[];
	onAdd: (name: string) => boolean;
	onRemove: (name: string) => void;
	onClose: () => void;
}) => {
	const [input, setInput] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const submit = () => {
		const name = input.trim();
		if (!name) return;
		if (onAdd(name)) {
			setInput("");
			inputRef.current?.focus();
		}
	};

	return (
		<div
			className="fixed inset-0 bg-black/40 flex items-center justify-center z-10"
			onClick={onClose}
			onKeyDown={(e) => {
				if (e.key === "Escape") onClose();
			}}
		>
			<div
				className="bg-white rounded-md shadow-xl p-20px w-320px h-50dvh flex flex-col"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between mb-15px">
					<div className="font-bold text-lg">常用玩家管理</div>
					<button
						type="button"
						onClick={onClose}
						className="cursor-pointer text-gray-400 hover:text-gray-700 text-xl leading-none bg-transparent"
					>
						×
					</button>
				</div>
				<form
					className="flex gap-5px mb-15px"
					onSubmit={(e) => {
						e.preventDefault();
						submit();
					}}
				>
					<input
						ref={inputRef}
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="新增常用玩家"
						className="flex-1 min-w-0 py-5px px-10px outline-none border-2px border-solid border-gray-300 focus:border-red-500 rounded-md transition-colors"
					/>
					<button
						type="submit"
						className="px-15px rounded-md bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 cursor-pointer transition-colors"
					>
						新增
					</button>
				</form>
				<div className="flex-1 overflow-y-auto max-h-40dvh">
					{suggestions.length === 0 ? (
						<div className="text-center text-gray-400 py-20px">
							暂无常用玩家
						</div>
					) : (
						<div className="flex flex-col gap-5px">
							{suggestions.map((name) => (
								<div
									key={name}
									className="flex items-center justify-between px-10px py-5px rounded-md bg-gray-50"
								>
									<div className="font-bold">{name}</div>
									<button
										type="button"
										onClick={() => onRemove(name)}
										className="cursor-pointer bg-red-100 text-red-700 px-10px py-2px rounded hover:bg-red-500 hover:text-white font-bold text-sm transition-colors"
									>
										删除
									</button>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

const SelectPlayer = () => {
	const { setScene, players, setPlayers } = useContext(GameContext);
	const [newPlayer, setNewPlayer] = useState("");
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [manageOpen, setManageOpen] = useState(false);

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

	const addSuggestion = useCallback((name: string) => {
		let added = false;
		setSuggestions((prev) => {
			if (prev.includes(name)) return prev;
			added = true;
			const next = [...prev, name];
			saveSuggestions(next);
			return next;
		});
		return added;
	}, []);

	return (
		<div className="w-320px h-40dvh">
			<form
				className="flex gap-5px"
				onSubmit={(e) => {
					e.preventDefault();
					addPlayer();
				}}
			>
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
					type="submit"
					className="px-15px rounded-md bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 cursor-pointer transition-colors"
				>
					添加
				</button>
			</form>
			<div className="mt-5px text-right">
				<button
					type="button"
					onClick={() => setManageOpen(true)}
					className="cursor-pointer text-xs text-gray-500 hover:text-red-600 bg-transparent"
				>
					管理常用玩家
				</button>
			</div>
			<DragDropProvider
				onDragEnd={(e) => {
					const newPlayers = move(players, e);
					setPlayers(newPlayers);
				}}
				modifiers={[]}
			>
				<div className="flex flex-col gap-10px mt-10px max-h-40dvh overflow-y-auto pr-5px">
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
			{manageOpen && (
				<ManagePanel
					suggestions={suggestions}
					onAdd={addSuggestion}
					onRemove={removeSuggestion}
					onClose={() => setManageOpen(false)}
				/>
			)}
		</div>
	);
};

export default SelectPlayer;
