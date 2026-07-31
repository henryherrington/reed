const POSTER_COLORS = ["#e7d9c4", "#cddccb", "#e6cdbf", "#c6d3e2", "#ddc9d5", "#d3ddc4", "#e3d7bd", "#c3d6d4"];

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function posterColor(id: string) {
  return POSTER_COLORS[hashStr(id) % POSTER_COLORS.length];
}
