import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const App = React.lazy(() => import("./App"));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
