import React, { useMemo, useState } from "react";
import TreeRow from "./TreeRow";
import {
  applyAllocatePercent,
  applySetValue,
  buildInitialLeafValues,
  buildOriginalTotals,
  deepCloneRows,
  formatNumber,
  formatPercent,
  getGrandTotal,
  computeVariancePercent,
} from "../utils/tree";

export default function TreeTable({ data }) {
  // Keep rows structure (labels + hierarchy) immutable
  const rows = useMemo(() => deepCloneRows(data.rows), [data.rows]);

  // Baseline for variance (computed totals from original data)
  const originalTotals = useMemo(() => buildOriginalTotals(rows), [rows]);

  // Current state stores only leaf values
  const [leafValues, setLeafValues] = useState(() => buildInitialLeafValues(rows));

  // Per-row input
  const [inputById, setInputById] = useState({});

  const grandTotal = getGrandTotal(rows, leafValues);
  const originalGrandTotal = rows.reduce((acc, r) => acc + (originalTotals.get(r.id) ?? 0), 0);
  const grandVar = computeVariancePercent(grandTotal, originalGrandTotal);

  function onInputChange(id, val) {
    setInputById((prev) => ({ ...prev, [id]: val }));
  }

  function readNumberInput(id) {
    const raw = inputById[id];
    const num = Number(raw);
    return Number.isFinite(num) ? num : null;
  }

  function onAllocatePercent(id) {
    const pct = readNumberInput(id);
    if (pct === null) return;

    setLeafValues((prev) => applyAllocatePercent(rows, prev, id, pct));
    setInputById((p) => ({ ...p, [id]: "" }));
  }

  function onAllocateValue(id) {
    const val = readNumberInput(id);
    if (val === null) return;

    setLeafValues((prev) => applySetValue(rows, prev, id, val));
    setInputById((p) => ({ ...p, [id]: "" }));
  }

  function onReset() {
    setLeafValues(buildInitialLeafValues(rows));
    setInputById({});
  }

  return (
    <div className="card">
      <div className="header">
        <h2>Hierarchical Allocation Table</h2>
        <button className="btn ghost" onClick={onReset}>Reset</button>
      </div>

      <div className="tableWrap">
        <table className="table">
          <thead>
            <tr>
              <th className="left">Label</th>
              <th className="right">Value</th>
              <th className="left">Input</th>
              <th className="left">Allocation %</th>
              <th className="left">Allocation Val</th>
              <th className="right">Variance %</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <TreeRow
                key={r.id}
                node={r}
                level={0}
                leafValues={leafValues}
                originalTotals={originalTotals}
                inputById={inputById}
                onInputChange={onInputChange}
                onAllocatePercent={onAllocatePercent}
                onAllocateValue={onAllocateValue}
              />
            ))}

            <tr className="grand">
              <td className="labelCell bold">Grand Total</td>
              <td className="valueCell bold">{formatNumber(grandTotal)}</td>
              <td />
              <td />
              <td />
              <td className="varCell bold">
                {grandVar === null ? "—" : formatPercent(grandVar)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
