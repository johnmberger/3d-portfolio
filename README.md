# John's Studio

An interactive 3D portfolio — a walkable loft inspired by my Atlanta apartment. Look around, click things, and see where the work happens.

**Live:** [johnberger.dev](https://www.johnberger.dev/)

## What's in the room

| Click… | Find… |
|--------|--------|
| **Monitor** | Résumé ([resume.johnberger.dev](https://resume.johnberger.dev/)) |
| **Turntable** | [Earworms](https://earworms.johnberger.dev) — what I've been listening to |
| **Bathroom mirror** | [Poop the Hooch](https://www.poopthehooch.com) — is the Chattahoochee poopy? |
| **Dining menu** | About me |
| **TV** | A local-news explainer for this site |
| **Wall plaque** | Model credits & licenses |
| **Light switch** | Day / night |
| **Dog** | Good boy |

Drag to look, scroll to zoom. On mobile, tap objects to look closer.

## Stack

- [Three.js](https://threejs.org/) — scene, camera, lights, CSS3D overlays
- [Vite](https://vite.dev/) — dev server & build
- [Vercel Analytics](https://vercel.com/docs/analytics) — page views (enable in the Vercel project dashboard)

## Develop

```bash
npm install
npm run dev
```

```bash
npm run test    # sanity checks
npm run build
npm run preview
```

`npm run check` runs tests then a production build.

## Notes

The room is a stylized take on a real apartment, not a 1:1 scan. Third-party models (Shiba, bicycle, food, etc.) are attributed on the wall plaque in-scene.
