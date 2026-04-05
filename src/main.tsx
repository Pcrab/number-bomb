import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "virtual:uno.css";
import "@unocss/reset/tailwind-compat.css";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<style>
			{`
                        html,body,#root {
                                width: 100dvw;
                                height: 100dvh;
                                overflow: hidden;
                        }
                        #root {
                                display: flex;
                                justify-content: center;
                                align-items: center;
                        }
                        `}
		</style>
		<App />
	</StrictMode>,
);
