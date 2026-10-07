# Para kay Rene "Bobet" Baterbonia

A tribute site for Rene Clert "Bobet" Baterbonia (2008–2026). Visitors get a cinematic intro: the sound plays and a camera starts on the cheering crowd, pans to reveal Rene under the spotlight, pushes in, and punches in on his face at the shout. The page then tells his story.

Built by [Student Web Solutions](https://www.studentwebsolutions.com). Next.js 16, Tailwind 4, static, deployed on Vercel.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # camera math tests (node --test)
npm run lint
npm run build
```

## How the intro works

- `lib/scene.ts`: the camera keyframes, `SHOUT_AT` (the second of the shout, currently 11.2 s), and Rene's face position. Change the shot here.
- `lib/camera.ts`: turns a time and a screen size into the image transform. It works for any orientation, so phones get the same shot cropped tighter.
- `components/intro/TributeIntro.tsx`: the player. The camera follows the audio clock, so it stays in sync even when the audio buffers.

**Autoplay with sound:** browsers block sound on a first visit (Safari, iPhone, the Facebook in-app browser, and Chrome for new visitors). The site still tries. When the browser says no, the visitor sees the **Simulan** screen, and one tap starts everything.

**Fine-tuning the shout:** open `/?tune=1`, press Simulan, and press Space the moment you hear "MAMA". The exact second appears on screen. Put it in `SHOUT_AT`.

## Media

All files in `public/media` and the OG/icon images in `app/` are generated from the originals:

```bash
npm run media    # scene (AVIF/WebP/JPG), statue, logo, audio, OG card, icons
npm run video    # out-media/rene-tribute.mp4: the intro as a 1080p video for Facebook (not deployed)
```

Source paths are parameters at the top of `scripts/prepare-media.ps1`. The scripts need ffmpeg at `C:\ffmpeg`.

## Content

Every word on the page lives in `lib/content.ts`, and each fact in the story is linked under "Mga Pinagkunan".

## Deploy

```bash
npx vercel login     # once
npx vercel           # preview
npx vercel --prod    # production
```

After the first deploy, turn on **Web Analytics** in the Vercel project to see visitor counts. Check the share card at https://developers.facebook.com/tools/debug/.
