// Ato I: a rolagem leva a luz de L'Heure ao crepúsculo e à noite.
// As cores mudam sempre; o sol só se move se o aparelho não pede "reduzir movimento".

import { PALETTES, mixPalette, paletteVars } from "../lib/sun.ts";

const section = document.querySelector<HTMLElement>("[data-hour]");
const lines = section ? Array.from(section.querySelectorAll<HTMLElement>("[data-line]")) : [];
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

let frame = 0;
let active = false;

function paint() {
  frame = 0;
  if (!section) return;
  const rect = section.getBoundingClientRect();
  const span = Math.max(1, rect.height - window.innerHeight);
  const t = Math.min(1, Math.max(0, -rect.top / span));

  const palette =
    t < 0.6
      ? mixPalette(PALETTES.heure, PALETTES.crepuscule, t / 0.6)
      : mixPalette(PALETTES.crepuscule, PALETTES.nuit, (t - 0.6) / 0.4);
  for (const [name, value] of Object.entries(paletteVars(palette))) section.style.setProperty(name, value);

  const sunset = Math.min(1, t / 0.55); // o sol some pouco depois da metade
  section.style.setProperty("--hour-sun", reduce.matches ? "-110" : String(Math.round(-110 + sunset * 270)));
  section.style.setProperty("--glitter", ((1 - sunset) * 0.7).toFixed(2));

  const middle = window.innerHeight / 2;
  let current = 0;
  let best = Infinity;
  lines.forEach((line, i) => {
    const box = line.getBoundingClientRect();
    const distance = Math.abs(box.top + box.height / 2 - middle);
    if (distance < best) {
      best = distance;
      current = i;
    }
  });
  lines.forEach((line, i) => line.classList.toggle("is-current", i === current));
}

function schedule() {
  if (active && !frame) frame = requestAnimationFrame(paint);
}

if (section && "IntersectionObserver" in window) {
  section.classList.add("is-live");
  new IntersectionObserver(([entry]) => {
    active = entry.isIntersecting;
    schedule();
  }).observe(section);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  paint();
}
