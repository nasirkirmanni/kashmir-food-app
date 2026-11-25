import { existsSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FILM_LOAD_MARGIN, easeToward, frameAt, frameTime, loadedEnd, playableEnd } from "./filmScrub";

// The homepage's opening film is never played: the scroll position picks the frame
// (hooks/useScrollScrubVideo.js). These pin the arithmetic that picks it, and the things that have
// to agree for the film to keep up with a scroll: the file the page asks for, how that file is
// built, and how long browsers may keep it.

const FRONTEND = join(__dirname, "..");
const require = createRequire(import.meta.url);
const read = (path) => readFileSync(join(FRONTEND, path), "utf8");

const FPS = 24;
const FRAMES = 240;
const DURATION = 10;

describe("frames", () => {
  it("finds the frame a moment falls in", () => {
    expect(frameAt(0, FPS, FRAMES)).toBe(0);
    expect(frameAt(0.04, FPS, FRAMES)).toBe(0);
    expect(frameAt(1 / FPS, FPS, FRAMES)).toBe(1);
    expect(frameAt(9.2, FPS, FRAMES)).toBe(220);
  });

  it("never leaves the film at either end", () => {
    expect(frameAt(-1, FPS, FRAMES)).toBe(0);
    expect(frameAt(DURATION, FPS, FRAMES)).toBe(FRAMES - 1);
    expect(frameAt(99, FPS, FRAMES)).toBe(FRAMES - 1);
  });

  it("seeks to the middle of a frame, and every such seek lands back on that frame", () => {
    expect(frameTime(0, FPS)).toBeCloseTo(0.5 / FPS, 10);
    for (let frame = 0; frame < FRAMES; frame += 1) {
      const time = frameTime(frame, FPS);
      expect(frameAt(time, FPS, FRAMES)).toBe(frame);
      // Room on both sides: a browser that rounds the time a little still shows this frame.
      expect(frameAt(time - 0.01, FPS, FRAMES)).toBe(frame);
      expect(frameAt(time + 0.01, FPS, FRAMES)).toBe(frame);
      expect(time).toBeLessThan(DURATION);
    }
  });
});

describe("how far the film may run while it loads", () => {
  it("finds the loaded stretch the film is in", () => {
    expect(loadedEnd([[0, 3.2]], 1)).toBe(3.2);
    expect(loadedEnd([[0, 3.2], [6, 8]], 7)).toBe(8);
    expect(loadedEnd([[0, 3.2], [6, 8]], 4.5)).toBeNull();
    expect(loadedEnd([], 0)).toBeNull();
  });

  it("holds the film inside what has arrived while the browser is still fetching", () => {
    const limit = playableEnd({ loadedTo: 3.2, at: 1, duration: DURATION, loading: true });
    expect(limit).toBeCloseTo(3.2 - FILM_LOAD_MARGIN, 10);
    expect(limit).toBeLessThan(3.2);
  });

  it("follows the edge as more arrives", () => {
    const before = playableEnd({ loadedTo: 3.2, at: 2.7, duration: DURATION, loading: true });
    const after = playableEnd({ loadedTo: 4.4, at: 2.7, duration: DURATION, loading: true });
    expect(after).toBeGreaterThan(before);
  });

  it("never pulls the film backwards to make room for the margin", () => {
    expect(playableEnd({ loadedTo: 3.2, at: 3.1, duration: DURATION, loading: true })).toBe(3.1);
  });

  it("holds nothing back once the whole film is in", () => {
    expect(playableEnd({ loadedTo: DURATION, at: 1, duration: DURATION, loading: true })).toBe(DURATION);
    // Some browsers report the start of the last frame as the end of what they have.
    expect(playableEnd({ loadedTo: frameTime(FRAMES - 1, FPS) - 0.5 / FPS, at: 1, duration: DURATION, loading: true })).toBe(DURATION);
  });

  it("still holds the film back when all but the last quarter second has been reported", () => {
    expect(playableEnd({ loadedTo: 9.75, at: 1, duration: DURATION, loading: true })).toBeCloseTo(9.75 - FILM_LOAD_MARGIN, 10);
  });

  it("holds nothing back when the browser has stopped fetching", () => {
    expect(playableEnd({ loadedTo: 3.2, at: 1, duration: DURATION, loading: false })).toBe(DURATION);
    expect(playableEnd({ loadedTo: null, at: 1, duration: DURATION, loading: false })).toBe(DURATION);
  });

  it("stays where it is while the browser is fetching and reports nothing loaded yet", () => {
    expect(playableEnd({ loadedTo: null, at: 0, duration: DURATION, loading: true })).toBe(0);
    // Safari reports a stretch of no length at the current frame for the first seconds of a load.
    expect(playableEnd({ loadedTo: 0.02, at: 0.02, duration: DURATION, loading: true })).toBe(0.02);
  });
});

describe("the weight of the scrub", () => {
  it("closes about 63% of the distance in one time constant and never overshoots", () => {
    expect(easeToward(0, 1, 150, 150)).toBeCloseTo(1 - Math.exp(-1), 10);
    expect(easeToward(5, 2, 150, 150)).toBeCloseTo(2 + 3 * Math.exp(-1), 10);
    expect(easeToward(0, 1, 100000, 150)).toBeLessThanOrEqual(1);
  });

  it("is the same at 30, 60 and 120 frames a second", () => {
    // 600 ms of easing, cut into 18, 36 or 72 equal frames.
    const run = (frames) => {
      let x = 0;
      for (let i = 0; i < frames; i += 1) x = easeToward(x, 1, 600 / frames, 150);
      return x;
    };
    expect(run(18)).toBeCloseTo(run(36), 10);
    expect(run(36)).toBeCloseTo(run(72), 10);
    expect(run(72)).toBeCloseTo(1 - Math.exp(-4), 10);
  });

  it("stays put when no time has passed and arrives at once when there is no weight", () => {
    expect(easeToward(3, 7, 0, 150)).toBe(3);
    expect(easeToward(3, 7, 16, 0)).toBe(7);
  });
});

// A minimal reader for the parts of an MP4 file these checks need. Boxes are [size][type][body].
function boxes(buffer, start = 0, end = buffer.length) {
  const out = [];
  for (let at = start; at + 8 <= end; ) {
    const size = buffer.readUInt32BE(at);
    const type = buffer.toString("latin1", at + 4, at + 8);
    if (size < 8) break;
    out.push({ type, start: at, bodyStart: at + 8, end: at + size });
    at += size;
  }
  return out;
}
function find(buffer, path, start = 0, end = buffer.length) {
  const [type, ...rest] = path;
  const found = boxes(buffer, start, end).filter((box) => box.type === type);
  if (rest.length === 0) return found;
  return found.flatMap((box) => find(buffer, rest, box.bodyStart, box.end));
}

describe("the film the page asks for", () => {
  const hero = read("components/hero/ScrollVideoHero.js");
  const src = hero.match(/const VIDEO_SRC = "([^"]+)"/)[1];
  const file = join(FRONTEND, "public", src);

  it("is a file with a version in its name", () => {
    expect(src).toMatch(/^\/redesign\/[a-z-]+-v\d+\.mp4$/);
    expect(existsSync(file)).toBe(true);
  });

  it("is the file the encode script writes, from the master it names", () => {
    const script = read("scripts/encode-hero-scrub.sh");
    expect(script).toContain(`OUT="public${src}"`);
    const master = script.match(/MASTER="([^"]+)"/)[1];
    expect(existsSync(join(FRONTEND, master))).toBe(true);
  });

  it("may be kept by browsers for a year, under exactly that name", () => {
    const { headers } = require("../next.config.js");
    return headers().then((rules) => {
      const rule = rules.find((entry) => entry.source === src);
      expect(rule, `a headers() rule for ${src}`).toBeTruthy();
      expect(rule.headers).toContainEqual({ key: "Cache-Control", value: "public, max-age=31536000, immutable" });
    });
  });

  it("is small enough to arrive before the visitor scrolls on an ordinary connection", () => {
    // 2.5 MB is 2 seconds at 10 Mbit/s. The film it replaced was 15.4 MB.
    expect(statSync(file).size).toBeLessThan(2.5 * 1024 * 1024);
  });

  const buffer = existsSync(file) ? readFileSync(file) : Buffer.alloc(0);

  it("can start from its first bytes: the index comes before the pictures", () => {
    const order = boxes(buffer).map((box) => box.type);
    expect(order.indexOf("moov")).toBeGreaterThan(-1);
    expect(order.indexOf("moov")).toBeLessThan(order.indexOf("mdat"));
  });

  it("carries pictures only, no sound track", () => {
    const handlers = find(buffer, ["moov", "trak", "mdia", "hdlr"]).map((box) => buffer.toString("latin1", box.bodyStart + 8, box.bodyStart + 12));
    expect(handlers).toEqual(["vide"]);
  });

  it("has the length and frame count the page assumes", () => {
    const [mvhd] = find(buffer, ["moov", "mvhd"]);
    const timescale = buffer.readUInt32BE(mvhd.bodyStart + 12);
    const length = buffer.readUInt32BE(mvhd.bodyStart + 16) / timescale;
    const [stsz] = find(buffer, ["moov", "trak", "mdia", "minf", "stbl", "stsz"]);
    const frames = buffer.readUInt32BE(stsz.bodyStart + 8);
    const duration = Number(hero.match(/const VIDEO_DURATION = ([\d.]+)/)[1]);
    const fps = Number(hero.match(/const VIDEO_FPS = (\d+)/)[1]);
    expect(length).toBeCloseTo(duration, 2);
    expect(frames).toBe(duration * fps);
  });

  it("has a keyframe at least every second, so no seek decodes more than a second of film", () => {
    const fps = Number(hero.match(/const VIDEO_FPS = (\d+)/)[1]);
    const [stss] = find(buffer, ["moov", "trak", "mdia", "minf", "stbl", "stss"]);
    expect(stss, "a list of keyframes (without one, every frame is a keyframe)").toBeTruthy();
    const count = buffer.readUInt32BE(stss.bodyStart + 4);
    const keyframes = Array.from({ length: count }, (_, i) => buffer.readUInt32BE(stss.bodyStart + 8 + i * 4) - 1);
    expect(keyframes[0]).toBe(0);
    const gaps = keyframes.slice(1).map((frame, i) => frame - keyframes[i]);
    expect(Math.max(...gaps)).toBeLessThanOrEqual(fps);
  });

  it("stores frames in the order they are shown, so what has loaded can be shown in full", () => {
    // A ctts box is how an MP4 file says frames are stored out of order (B-frames).
    expect(find(buffer, ["moov", "trak", "mdia", "minf", "stbl", "ctts"])).toEqual([]);
  });
});

describe("the hero and the hook", () => {
  const hero = read("components/hero/ScrollVideoHero.js");
  const hook = read("hooks/useScrollScrubVideo.js");

  it("starts loading the whole film without waiting for a scroll", () => {
    expect(hero).toContain('preload={wholeFilm ? "auto" : "metadata"}');
    expect(hero).toMatch(/const wholeFilm = scrub && !waitForVisitor;/);
    expect(hero).toMatch(/const waitForVisitor = scrub && saveData && !engaged;/);
  });

  it("gives the hook the film's frame rate, and the hook asks for whole frames only", () => {
    expect(hero).toMatch(/fps: VIDEO_FPS,/);
    expect(hook).toContain("video.currentTime = frameTime(frame, fps);");
    expect(hook.match(/video\.currentTime = /g)).toHaveLength(1);
  });
});
