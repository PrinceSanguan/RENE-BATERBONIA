// Run with: npm test  (Node strips the TypeScript types natively, no test framework needed)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cameraAt, type Viewport } from './camera.ts';
import { AUDIO_DURATION, FACE, SCENE, SHOUT_AT } from './scene.ts';

const VIEWPORTS: Record<string, Viewport> = {
    'desktop 16:9': { w: 1920, h: 1080 },
    'laptop 16:10': { w: 1440, h: 900 },
    'tablet 4:3': { w: 1024, h: 768 },
    'phone portrait': { w: 390, h: 844 },
    'phone landscape': { w: 844, h: 390 },
};

const facePos = (t: number, vp: Viewport) => {
    const c = cameraAt(t, vp);
    return { x: c.x + FACE.x * SCENE.width * c.scale, y: c.y + FACE.y * SCENE.height * c.scale };
};

test('the image always covers the whole viewport', () => {
    for (const [name, vp] of Object.entries(VIEWPORTS)) {
        for (let t = 0; t <= AUDIO_DURATION; t += 0.05) {
            const c = cameraAt(t, vp);
            assert.ok(c.x <= 0 && c.y <= 0, `${name} t=${t.toFixed(2)}: gap at top/left`);
            assert.ok(c.x + SCENE.width * c.scale >= vp.w - 0.5, `${name} t=${t.toFixed(2)}: gap at right`);
            assert.ok(c.y + SCENE.height * c.scale >= vp.h - 0.5, `${name} t=${t.toFixed(2)}: gap at bottom`);
        }
    }
});

test('the opening shot is on the crowd, not on Rene', () => {
    for (const [name, vp] of Object.entries(VIEWPORTS)) {
        assert.ok(facePos(0, vp).x > vp.w, `${name}: his face is already in frame at t=0`);
    }
});

test('after the shout his face sits in the upper middle of the frame', () => {
    for (const [name, vp] of Object.entries(VIEWPORTS)) {
        for (const t of [SHOUT_AT + 0.3, 13, AUDIO_DURATION]) {
            const p = facePos(t, vp);
            assert.ok(p.x > vp.w * 0.3 && p.x < vp.w * 0.7, `${name} t=${t}: face x=${p.x.toFixed(0)} not centred`);
            assert.ok(p.y > vp.h * 0.12 && p.y < vp.h * 0.45, `${name} t=${t}: face y=${p.y.toFixed(0)} not in the upper part`);
        }
    }
});

test('flash and shake start at the shout and fade out', () => {
    const vp = VIEWPORTS['desktop 16:9'];
    const before = cameraAt(SHOUT_AT - 0.01, vp);
    assert.equal(before.flash, 0);
    assert.equal(before.shakeX, 0);
    assert.ok(cameraAt(SHOUT_AT + 0.01, vp).flash > 0.3);
    assert.ok(cameraAt(SHOUT_AT + 1.5, vp).flash < 0.01);
});

test('reduced motion holds one still framing with no flash or shake', () => {
    const vp = VIEWPORTS['laptop 16:10'];
    const a = cameraAt(1, vp, true);
    const b = cameraAt(SHOUT_AT + 0.05, vp, true);
    assert.deepEqual(a, b);
    assert.equal(b.flash, 0);
});
