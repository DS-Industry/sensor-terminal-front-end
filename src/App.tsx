import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import VideoLayout from "./layouts/VideoLayout";

function App() {
  const [count, setCount] = useState(0);

  return (
    <VideoLayout>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1 className=" text-amber-300 font-inter-bold">Vite + React</h1>
      <div className="card bg-w">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <div className=" bg-gradient-to-t min-h-20 min-w-20 from-primary to-secondary rounded-lg "></div>
        <p className=" text-black p-3 bg-white-600">
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </VideoLayout>
  );
}

export default App;
