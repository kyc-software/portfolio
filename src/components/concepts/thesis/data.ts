export const connection = [
  ["Status", "Connected"],
  ["Protocol", "2.4 GHz wireless"],
  ["Latency", "18 ms"],
  ["Packet loss", "0%"],
  ["Device ID", "KG-RH-24A7"],
  ["Firmware", "v2.3.1"],
] as const;

export const calibrationSteps = [
  "Open hand",
  "Fist",
  "Pinch",
  "Point",
  "Spread",
  "Rest pose",
] as const;

export const jointRows = [
  { joint: "MCP", left: [32, 45, 41, 38, 28], right: [29, 42, 38, 35, 25] },
  { joint: "PIP", left: [18, 67, 62, 59, 44], right: [21, 64, 58, 55, 40] },
  { joint: "DIP", left: [12, 43, 40, 37, 31], right: [14, 40, 36, 34, 28] },
  { joint: "TIP", left: [8, 15, 14, 13, 10], right: [9, 14, 12, 11, 8] },
] as const;

export const sensorValues = [
  512, 498, 523, 487, 505, 515, 502, 509, 493, 517, 488, 503, 497, 521, 496, 508,
].map((value, index) => ({
  channel: `CH ${String(index + 1).padStart(2, "0")}`,
  value,
}));

export const translations = [
  "Hello · I am eating",
  "Nice to meet you",
  "How are you?",
  "Thank you",
] as const;

export const handNodes = {
  left: [
    [50, 84],
    [48, 69],
    [44, 52],
    [40, 33],
    [42, 68],
    [42, 47],
    [42, 24],
    [53, 65],
    [54, 43],
    [55, 20],
    [64, 70],
    [67, 51],
    [71, 31],
    [74, 78],
    [80, 63],
    [87, 51],
  ],
  right: [
    [47, 85],
    [47, 68],
    [45, 50],
    [43, 31],
    [57, 68],
    [58, 47],
    [58, 26],
    [67, 67],
    [71, 48],
    [76, 33],
    [75, 75],
    [81, 59],
    [88, 47],
    [37, 77],
    [29, 65],
    [20, 55],
  ],
} as const;
