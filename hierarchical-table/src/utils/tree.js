export function round2(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return 0;
  return Math.round(num * 100) / 100;
}

export function formatNumber(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function formatPercent(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "0%";
  return `${round2(num)}%`;
}


function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function buildOriginalTotals(rows) {
  const totals = new Map();

  function dfs(node) {
    if (!node.children || node.children.length === 0) {
      const v = round2(node.value ?? 0);
      totals.set(node.id, v);
      return v;
    }
    const sum = round2(node.children.reduce((acc, ch) => acc + dfs(ch), 0));
    totals.set(node.id, sum);
    return sum;
  }

  rows.forEach(dfs);
  return totals;
}

export function getNodeTotal(node, leafValues) {
  if (!node.children || node.children.length === 0) {
    return round2(leafValues.get(node.id) ?? 0);
  }
  return round2(node.children.reduce((acc, ch) => acc + getNodeTotal(ch, leafValues), 0));
}

export function getGrandTotal(rows, leafValues) {
  return round2(rows.reduce((acc, r) => acc + getNodeTotal(r, leafValues), 0));
}

export function collectLeaves(node) {
  const leaves = [];
  function dfs(n) {
    if (!n.children || n.children.length === 0) {
      leaves.push(n);
      return;
    }
    n.children.forEach(dfs);
  }
  dfs(node);
  return leaves;
}

export function applySetValue(rows, leafValues, targetId, newValue) {
  const nextLeafValues = new Map(leafValues);

  function dfs(node) {
    if (node.id === targetId) {
      const currentTotal = getNodeTotal(node, nextLeafValues);
      const desiredTotal = round2(newValue);

      if (!node.children || node.children.length === 0) {
        nextLeafValues.set(node.id, desiredTotal);
        return true;
      }

      const leaves = collectLeaves(node);
      if (leaves.length === 0) return true;

      if (currentTotal === 0) {
        const perLeaf = round2(desiredTotal / leaves.length);
        leaves.forEach((lf, idx) => {
          if (idx === leaves.length - 1) {
            const assignedSoFar = round2(perLeaf * (leaves.length - 1));
            nextLeafValues.set(lf.id, round2(desiredTotal - assignedSoFar));
          } else {
            nextLeafValues.set(lf.id, perLeaf);
          }
        });
        return true;
      }

      let running = 0;
      leaves.forEach((lf, idx) => {
        const leafCur = round2(nextLeafValues.get(lf.id) ?? 0);
        const ratio = leafCur / currentTotal; 
        let leafNew = round2(desiredTotal * ratio);

        if (idx === leaves.length - 1) {
          leafNew = round2(desiredTotal - running);
        } else {
          running = round2(running + leafNew);
        }

        nextLeafValues.set(lf.id, leafNew);
      });

      return true;
    }

    if (node.children) {
      for (const ch of node.children) {
        if (dfs(ch)) return true;
      }
    }
    return false;
  }

  for (const r of rows) {
    if (dfs(r)) break;
  }

  return nextLeafValues;
}

export function applyAllocatePercent(rows, leafValues, targetId, percent) {
  const pct = Number(percent);
  if (!Number.isFinite(pct)) return leafValues;

  function findNode(rows) {
    let found = null;
    function dfs(n) {
      if (n.id === targetId) {
        found = n;
        return;
      }
      n.children?.forEach(dfs);
    }
    rows.forEach(dfs);
    return found;
  }

  const node = findNode(rows);
  if (!node) return leafValues;

  const currentTotal = getNodeTotal(node, leafValues);
  const desiredTotal = round2(currentTotal * (1 + pct / 100));

  return applySetValue(rows, leafValues, targetId, desiredTotal);
}

export function computeVariancePercent(currentTotal, originalTotal) {
  const o = Number(originalTotal);
  const c = Number(currentTotal);
  if (!Number.isFinite(o) || o === 0) return null;
  return round2(((c - o) / o) * 100);
}

export function buildInitialLeafValues(rows) {
  const leafValues = new Map();
  function dfs(node) {
    if (!node.children || node.children.length === 0) {
      leafValues.set(node.id, round2(node.value ?? 0));
      return;
    }
    node.children.forEach(dfs);
  }
  rows.forEach(dfs);
  return leafValues;
}

export function deepCloneRows(rows) {
  return clone(rows);
}
