import "./App.css";
import TreeTable from "./components/TreeTable";
import Stopwatch from "./components/Stopwatch";
import { initialData } from "./data";

export default function App() {
  return (
    <div className="page">
      <Stopwatch />
      {/* <TreeTable data={initialData} /> */}
    </div>
  );
}
