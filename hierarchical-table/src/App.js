import React from "react";
import "./App.css";
import TreeTable from "./components/TreeTable";
import { initialData } from "./data";

export default function App() {
  return (
    <div className="page">
      <TreeTable data={initialData} />
    </div>
  );
}
