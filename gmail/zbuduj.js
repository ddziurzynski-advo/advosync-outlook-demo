/*
  Składa rozszerzenie Chrome dla Gmaila w plik ZIP do pobrania.
  Uruchomienie (z folderu gmail):  node zbuduj.js
  Bierze pliki rozszerzenia z „zrodlo/” i wspólne pliki panelu z folderu głównego
  (te same co w Outlooku), dzięki czemu obie wersje zawsze wyglądają i działają tak samo.
*/
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const tu = __dirname;
const glowny = path.join(tu, "..");
const cel = fs.mkdtempSync(path.join(os.tmpdir(), "szkic-gmail-"));

function kopiuj(z, doPliku) {
  fs.mkdirSync(path.dirname(doPliku), { recursive: true });
  fs.copyFileSync(z, doPliku);
}

for (const plik of fs.readdirSync(path.join(tu, "zrodlo"))) {
  kopiuj(path.join(tu, "zrodlo", plik), path.join(cel, plik));
}
for (const plik of ["dopasowanie.js", "panel.js", "taskpane.css", "odpowiedzi.json"]) {
  kopiuj(path.join(glowny, plik), path.join(cel, plik));
}
for (const plik of fs.readdirSync(path.join(glowny, "fonts"))) {
  kopiuj(path.join(glowny, "fonts", plik), path.join(cel, "fonts", plik));
}
for (const r of [16, 32, 48, 128]) {
  kopiuj(path.join(glowny, "assets", `icon-${r}.png`), path.join(cel, `icon-${r}.png`));
}

// Wersja w nazwie folderu po rozpakowaniu, np. „szkic-odpowiedzi-gmail-1.0.0”.
const wersja = JSON.parse(fs.readFileSync(path.join(cel, "manifest.json"), "utf8")).version;
const folder = `szkic-odpowiedzi-gmail-${wersja}`;
const paczka = path.join(os.tmpdir(), folder);
fs.rmSync(paczka, { recursive: true, force: true });
fs.renameSync(cel, paczka);

const zip = path.join(tu, "szkic-odpowiedzi-gmail.zip");
fs.rmSync(zip, { force: true });
execFileSync("zip", ["-r", "-X", "-q", zip, folder, "-x", "*.DS_Store"], { cwd: os.tmpdir() });
fs.rmSync(paczka, { recursive: true, force: true });
console.log(`Gotowe: gmail/szkic-odpowiedzi-gmail.zip (wersja ${wersja})`);
