import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { notifyFirstFrameReady, notifyGameReady } from "@/lib/playables";

createRoot(document.getElementById("root")!).render(<App />);

requestAnimationFrame(() => {
  notifyFirstFrameReady();
  notifyGameReady();
});
