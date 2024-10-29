import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { trans } from "./utils/translate";
import Trans from "./components/Trans";

// @evaluate

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>
        {trans("Edit Vite + React")} {_AUTHOR_}
      </h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          {trans("count is")} {count}
        </button>
        <p>
          <Trans>
            Edit
            <code style={{ color: "red" }}>
              src/App.tsx{" "}
              <span>
                3 <strong>goats</strong>
              </span>
            </code>
            and save to test <strong>HMR</strong>
          </Trans>
        </p>
      </div>
      <p className="read-the-docs">
        {trans("Click on the Vite and React logos to learn more")}
      </p>
    </>
  );
}

export default App;
