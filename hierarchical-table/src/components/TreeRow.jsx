import React from "react";
import {
  formatNumber,
  formatPercent,
  getNodeTotal,
  computeVariancePercent,
} from "../utils/tree";

export default function TreeRow({
  node,
  level,
  leafValues,
  originalTotals,
  inputById,
  onInputChange,
  onAllocatePercent,
  onAllocateValue,
}) {
  const total = getNodeTotal(node, leafValues);
  const original = originalTotals.get(node.id) ?? 0;
  const variance = computeVariancePercent(total, original);

  return (
    <>
      <tr>
        <td className="labelCell">
          <div className="labelWrap" style={{ paddingLeft: `${level * 18}px` }}>
            {level > 0 ? <span className="dash">—</span> : null}
            <span className={node.children?.length ? "bold" : ""}>
              {node.label}
            </span>
          </div>
        </td>

        <td className="valueCell">{formatNumber(total)}</td>

        <td className="inputCell">
          <input
            className="numInput"
            type="number"
            value={inputById[node.id] ?? ""}
            onChange={(e) => onInputChange(node.id, e.target.value)}
            placeholder="Enter…"
          />
        </td>

        <td className="btnCell">
          <button
            className="btn"
            onClick={() => onAllocatePercent(node.id)}
            title="Increase row by percentage"
          >
            Allocation %
          </button>
        </td>

        <td className="btnCell">
          <button
            className="btn"
            onClick={() => onAllocateValue(node.id)}
            title="Set row to value"
          >
            Allocation Val
          </button>
        </td>

        <td className="varCell">
          {variance === null ? "—" : formatPercent(variance)}
        </td>
      </tr>

      {node.children?.map((ch) => (
        <TreeRow
          key={ch.id}
          node={ch}
          level={level + 1}
          leafValues={leafValues}
          originalTotals={originalTotals}
          inputById={inputById}
          onInputChange={onInputChange}
          onAllocatePercent={onAllocatePercent}
          onAllocateValue={onAllocateValue}
        />
      ))}
    </>
  );
}
