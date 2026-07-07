# PizzaCalc 🍕

Neapolitan pizza dough calculator that plans backwards from **when you want to cook**. Instead of entering cold-proof and warm-proof durations, you pick a cook time — the app builds the proofing schedule and calculates the recipe (including how much yeast the timeline needs).

## How it works

- **Recipe**: baker's percentages from total dough weight (pizzas × ball weight). Defaults: 62 % hydration, 2.8 % salt.
- **Schedule**: if there's more than 12 h until cooking, the app plans room-temp bulk → fridge → out 3 h before baking; otherwise a single room-temperature proof. Override to force either mode under Advanced settings.
- **Yeast**: modeled as an accumulating rate process — fermentation rate doubles per +7 °C, and the required instant-dry-yeast percentage is `1.8 / effective-hours-at-21°C`, converted for fresh (3×) or active dry (1.25×) yeast. Constants live in `src/config.ts` — tune them after real bakes.

Pure client-side PWA — installable, works offline, no backend. Settings persist in localStorage; dates reset on each visit.

## Development

```bash
npm install
npm run dev      # dev server on :3004
npm test         # vitest unit tests (fermentation model, schedule, recipe math)
npm run build    # tsc + vite build → dist/
```

Icons: `public/icons/icon.svg` is the master; the PNGs were generated from it with `sharp` (192, 512, and a maskable 512 with 80 % safe-zone art).
