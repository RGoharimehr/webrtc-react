// src/simulationEnv.js
// Simulation visualization configuration — properties and color presets.
// Edit this file to add or change the output variables and color maps
// available in the Results Visualization tab and the legend color bar.

export const LEGEND_VARIABLES = [
  { id: "temperature", label: "Temperature", units: "°C",  min: 20,  max: 90  },
  { id: "pressure",    label: "Pressure",    units: "bar", min: 0.8, max: 2.8 },
  { id: "power",       label: "Power",       units: "kW",  min: 0,   max: 200 },
  { id: "velocity",    label: "Velocity",    units: "m/s", min: 0,   max: 6   },
  { id: "humidity",    label: "Humidity",    units: "%",   min: 0,   max: 100 },
];

export const LEGEND_PRESETS = [
  {
    id: "viridis",
    name: "Viridis",
    gradient: "linear-gradient(180deg, #440154, #31688e, #35b779, #fde725)",
  },
  {
    id: "inferno",
    name: "Inferno",
    gradient: "linear-gradient(180deg, #000004, #420a68, #932567, #dd513a, #fca50a, #fcffa4)",
  },
  {
    id: "magma",
    name: "Magma",
    gradient: "linear-gradient(180deg, #000004, #3b0f70, #8c2981, #de4968, #fe9f6d, #fcfdbf)",
  },
  {
    id: "plasma",
    name: "Plasma",
    gradient: "linear-gradient(180deg, #0d0887, #7e03a8, #cc4678, #f89441, #f0f921)",
  },
  {
    id: "turbo",
    name: "Turbo",
    gradient: "linear-gradient(180deg, #30123b, #3b4cc0, #2ab9a1, #aadb32, #e6550d, #7f0000)",
  },
  {
    id: "coolwarm",
    name: "Cool–Warm",
    gradient: "linear-gradient(180deg, #3b4cc0, #788bff, #e6e6e6, #f2906b, #b40426)",
  },
  {
    id: "gray",
    name: "Grayscale",
    gradient: "linear-gradient(180deg, #000000, #ffffff)",
  },
];
