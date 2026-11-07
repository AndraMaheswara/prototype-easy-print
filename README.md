# EasyPrint · Prototype

Clickable prototype of the EasyPrint / Restu Ibu Print & Fotocopy design (18 screens).
Plain static site: no build step, no dependencies.

```
index.html      all 18 screens (inline SVG with real text) + clickable areas
styles.css      layout, fonts, hover/hint effects, notification panel
script.js       small router: splash timer, notification overlay, print, Esc
assets/fonts    Inter + Selawik (Segoe UI look-alike), subset woff2
assets/img      logo, photo and background images
```

## Run locally
Open `index.html` in a browser, or serve the folder:
`python -m http.server 8000` → http://localhost:8000

## Deploy to Vercel
- **Drag & drop:** vercel.com → Add New → Project → drag this folder in → Deploy.
- **GitHub:** push this folder to a repo → import it in Vercel →
  Framework Preset: **Other**, Build Command: *(empty)*, Output Directory: `./` → Deploy.
- **CLI:** `npm i -g vercel` then run `vercel` inside this folder.

## Using the prototype
- Splash moves to the landing page after ~2 seconds (or click it).
- Click buttons and links like in the real app. Clicking an empty area flashes everything that is clickable.
- The **☰ Layar** button (bottom-right) jumps to any screen.
- Login demo roles: *Pelanggan* → customer dashboard, *Admin* → admin dashboard, *Owner* → owner dashboard.
- The bell / notification dot opens the notification panel. Close it with ✕, Esc or by clicking outside.
- Each screen has its own URL, e.g. `/#dashboard`, `/#admin-kasir`, `/#owner-laporan`.
