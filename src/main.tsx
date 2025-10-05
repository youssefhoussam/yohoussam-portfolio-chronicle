import { createRoot } from "react-dom/client";
import App from "./App";   // remove .ts or .tsx here
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
