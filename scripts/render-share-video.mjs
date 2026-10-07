// Renders the intro as a 1920x1080 MP4 for posting on Facebook (with the site link in the caption).
// It reads the same camera keyframes as the website (lib/scene.ts), so the video and the site always match.
//   node scripts/render-share-video.mjs            -> out-media/rene-tribute.mp4
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AUDIO_DURATION, KEYFRAMES, SHOUT_AT, TITLE_AT } from '../lib/scene.ts';

const FFMPEG = process.env.FFMPEG ?? 'C:\\ffmpeg\\ffmpeg.exe';
const FPS = 30;
const OUT_W = 1920;
const OUT_H = 1080;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'out-media');
const frames = Math.ceil(AUDIO_DURATION * FPS);

// ---- camera keyframes -> ffmpeg expressions (same easing curves as lib/camera.ts) ----
const T = `(on/${FPS})`;
const EASE = {
    linear: (p) => p,
    inOutSine: (p) => `(-(cos(PI*${p})-1)/2)`,
    inOutCubic: (p) => `if(lt(${p},0.5),4*pow(${p},3),1-pow(-2*${p}+2,3)/2)`,
    inQuad: (p) => `pow(${p},2)`,
    outExpo: (p) => `if(gte(${p},1),1,1-pow(2,-10*${p}))`,
    outSine: (p) => `sin(${p}*PI/2)`,
};
const n = (v) => Number(v.toFixed(5));

/** Piecewise expression for one keyframe property (f, cx or cy) over time. */
function track(prop) {
    let expr = `${n(KEYFRAMES[KEYFRAMES.length - 1][prop])}`;
    for (let i = KEYFRAMES.length - 1; i >= 1; i--) {
        const a = KEYFRAMES[i - 1];
        const b = KEYFRAMES[i];
        const p = `clip((${T}-${n(a.t)})/${n(b.t - a.t)},0,1)`;
        const e = EASE[b.ease ?? 'linear'](p);
        expr = `if(lt(${T},${n(b.t)}),${n(a[prop])}+(${n(b[prop] - a[prop])})*${e},${expr})`;
    }
    return `if(lt(${T},${n(KEYFRAMES[0].t)}),${n(KEYFRAMES[0][prop])},${expr})`;
}

// Visible height fraction f -> zoom 1/f; centre (cx, cy) -> top-left of the visible region. zoompan clamps to the edges.
const f = track('f');
const since = `(${T}-${SHOUT_AT})`;
const shake = (freq) => `if(gte(${T},${SHOUT_AT}),ih*0.0072*sin(${since}*${freq})*exp(-${since}/0.35),0)`;
const zoom = `1/(${f})`;
const x = `(${track('cx')})*iw-iw*(${f})/2+${shake(47)}`;
const y = `(${track('cy')})*ih-ih*(${f})/2+${shake(39)}`;

// ---- title card text (UTF-8 files keep the curly quotes and dash intact) ----
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'rene-video-'));
const write = (name, text) => fs.writeFileSync(path.join(work, name), text, 'utf8');
write('eyebrow.txt', 'ISANG PAGPUPUGAY');
write('name.txt', 'Rene Clert “Bobet” Baterbonia');
write('years.txt', '2008 – 2026');
write('motto.txt', '“Just a kid with a big dream.”');
write('credit.txt', 'BUILT BY STUDENT WEB SOLUTIONS');
for (const font of ['georgia.ttf', 'georgiab.ttf', 'georgiai.ttf', 'arial.ttf']) {
    fs.copyFileSync(path.join('C:\\Windows\\Fonts', font), path.join(work, font));
}
const fade = (start) => `alpha='if(lt(t,${start}),0,min(1,(t-${start})/1.2))'`;
const text = (file, font, size, color, y, start) =>
    `drawtext=fontfile=${font}:textfile=${file}:fontsize=${size}:fontcolor=${color}:shadowcolor=black@0.7:shadowx=0:shadowy=3:x=(w-text_w)/2:y=${y}:${fade(start)}`;

const graph = [
    `[0:v]scale=5504:-2:flags=lanczos,zoompan=z='${zoom}':x='${x}':y='${y}':d=${frames}:s=${OUT_W}x${OUT_H}:fps=${FPS}[cam]`,
    // Shout flash: a quick warm brightness pop that decays.
    `[cam]eq=brightness='if(gte(t,${SHOUT_AT}),0.28*exp(-(t-${SHOUT_AT})/0.16),0)':eval=frame[lit]`,
    // Dark lower third behind the name card, faded in with it.
    `color=black:s=${OUT_W}x${OUT_H}:d=1,trim=end_frame=1,format=rgba,geq=r=4:g=6:b=12:a='240*clip((Y/H-0.38)/0.5,0,1)',` +
        `loop=loop=${frames}:size=1,setpts=N/${FPS}/TB,fade=t=in:st=${TITLE_AT}:d=1.4:alpha=1[shade]`,
    `[lit][shade]overlay=shortest=1,` +
        [
            text('eyebrow.txt', 'arial.ttf', 22, '0xF2C46D', 'h*0.64', TITLE_AT),
            text('name.txt', 'georgiab.ttf', 78, '0xF5EFE3', 'h*0.68', TITLE_AT + 0.15),
            text('years.txt', 'georgia.ttf', 30, '0xF5EFE3@0.85', 'h*0.78', TITLE_AT + 0.3),
            text('motto.txt', 'georgiai.ttf', 34, '0xF5EFE3@0.8', 'h*0.835', TITLE_AT + 0.45),
            text('credit.txt', 'arial.ttf', 16, '0xF5EFE3@0.7', 'h*0.94', TITLE_AT + 0.8),
        ].join(',') +
        `,format=yuv420p[v]`,
].join(';');

fs.writeFileSync(path.join(work, 'graph.txt'), graph, 'utf8');
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, 'rene-tribute.mp4');
const args = [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-i', path.join(root, 'public', 'media', 'scene.jpg'),
    '-i', path.join(root, 'public', 'media', 'tribute.mp3'),
    '-filter_complex_script', 'graph.txt',
    '-map', '[v]', '-map', '1:a',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-c:a', 'aac', '-b:a', '192k',
    '-shortest', '-movflags', '+faststart', out,
];
const run = spawnSync(FFMPEG, args, { cwd: work, stdio: 'inherit' });
fs.rmSync(work, { recursive: true, force: true });
if (run.status !== 0) process.exit(run.status ?? 1);
console.log(`Done: ${out} (${frames} frames, shout at ${SHOUT_AT}s)`);
