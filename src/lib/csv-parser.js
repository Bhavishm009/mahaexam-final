export function parseCSV(text) {
  const rows = [];
  let row = [],
    field = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i],
      n = text[i + 1];
    if (quoted) {
      if (c === '"' && n === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  row.push(field);
  if (row.length > 1 || row[0]) {
    rows.push(row);
  }
  if (!rows.length) {
    return [];
  }
  const headers = rows[0].map((x) => x.trim());
  return rows
    .slice(1)
    .filter((r) => r.some((x) => String(x).trim()))
    .map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""])));
}
