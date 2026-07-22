// Cloud Tetris — Themes
// Each theme is grounded in a real handset/display reference so the
// palettes read as intentional, not decorative.

const THEMES = [
  {
    id: "nokia",
    name: "Nokia Ice",
    desc: "Monochrome LCD, like a 90s handset screen",
    vars: {
      "--bg": "#c7d6c0",
      "--fg": "#1c2b17",
      "--header-bg": "#1c2b17",
      "--header-fg": "#c7d6c0",
      "--panel-bg": "#b7c8ae",
      "--sel-bg": "#1c2b17",
      "--sel-fg": "#c7d6c0",
      "--soft-bg": "#1c2b17",
      "--soft-fg": "#c7d6c0",
      "--board-bg": "#a9bd9f",
      "--grid": "#98ad8d"
    },
    pieces: {
      I: "#26381f", O: "#324a29", T: "#2f4426", S: "#3a5330",
      Z: "#243619", J: "#354c2b", L: "#2b3f23"
    },
    ghost: "rgba(28,43,23,0.25)"
  },
  {
    id: "gameboy",
    name: "GameBoy Green",
    desc: "4-shade dot-matrix, DMG classic",
    vars: {
      "--bg": "#9bbc0f",
      "--fg": "#0f380f",
      "--header-bg": "#0f380f",
      "--header-fg": "#9bbc0f",
      "--panel-bg": "#8bac0f",
      "--sel-bg": "#0f380f",
      "--sel-fg": "#9bbc0f",
      "--soft-bg": "#0f380f",
      "--soft-fg": "#9bbc0f",
      "--board-bg": "#8bac0f",
      "--grid": "#7a9a0d"
    },
    pieces: {
      I: "#0f380f", O: "#306230", T: "#0f380f", S: "#306230",
      Z: "#0f380f", J: "#306230", L: "#0f380f"
    },
    ghost: "rgba(15,56,15,0.25)"
  },
  {
    id: "brick",
    name: "NES Brick",
    desc: "Classic 8-bit console cartridge colors",
    vars: {
      "--bg": "#c0c0c8",
      "--fg": "#101018",
      "--header-bg": "#3050c0",
      "--header-fg": "#f8f8f8",
      "--panel-bg": "#d8d8e0",
      "--sel-bg": "#3050c0",
      "--sel-fg": "#f8f8f8",
      "--soft-bg": "#101018",
      "--soft-fg": "#f8f8f8",
      "--board-bg": "#181828",
      "--grid": "#30304a"
    },
    pieces: {
      I: "#31c7ef", O: "#f3d54e", T: "#a53fc4", S: "#3fcf5a",
      Z: "#e0393e", J: "#3a5fcf", L: "#e08a2b"
    },
    ghost: "rgba(255,255,255,0.18)"
  },
  {
    id: "neon",
    name: "Neon Grid",
    desc: "After-dark arcade cabinet, circuit-trace board",
    vars: {
      "--bg": "#0a0a12",
      "--fg": "#e6f9ff",
      "--header-bg": "#120b22",
      "--header-fg": "#5ef2ff",
      "--panel-bg": "#150e26",
      "--sel-bg": "#ff2e88",
      "--sel-fg": "#0a0a12",
      "--soft-bg": "#120b22",
      "--soft-fg": "#5ef2ff",
      "--board-bg": "#0c0a1a",
      "--grid": "#231a3d"
    },
    pieces: {
      I: "#5ef2ff", O: "#ffe15e", T: "#c86bff", S: "#5eff9d",
      Z: "#ff5e7a", J: "#5e8dff", L: "#ff9d5e"
    },
    ghost: "rgba(94,242,255,0.18)"
  }
];

function applyTheme(themeId) {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  return theme;
}
