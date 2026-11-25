/**
 * The arithmetic behind the homepage's scroll-driven film (hooks/useScrollScrubVideo.js): which
 * frame a moment falls in, where to seek to show it, how far the film may run while it is still
 * loading, and the easing that gives the scrub its weight. Kept apart from the hook so it can be
 * tested without a browser.
 */

/** HTMLMediaElement.NETWORK_LOADING: the browser is fetching the film right now. */
export const NETWORK_LOADING = 2;

/**
 * How far behind the edge of what has loaded the film stays while the rest is still arriving,
 * in seconds. Chrome works that edge out as a straight line over the bytes received, and a film's
 * bytes are not spread evenly, so the edge it reports can run ahead of the frames it really has:
 * for the current file by up to 0.4 s in its first second and 0.6 s in its last, and nowhere in
 * between (measured from the file). Half a second covers the start; at the very end the film
 * waits a moment for the last few kilobytes.
 */
export const FILM_LOAD_MARGIN = 0.5;

/**
 * Within this many seconds of the end, a film counts as wholly loaded. Kept to a couple of frames:
 * near the end Chrome's straight-line edge runs furthest ahead of the frames it really has, and a
 * seek to the last frames before they are in has to wait for them.
 */
const NEAR_END = 0.1;

/** How loosely "the stretch that holds the current position" is matched, in seconds. */
const RANGE_SLACK = 0.1;

/** The frame (counted from 0) that is on screen at `time` seconds. */
export function frameAt(time, fps, frameCount) {
  const frame = Math.floor(time * fps + 1e-6);
  return Math.max(0, Math.min(frameCount - 1, frame));
}

/**
 * The moment to seek to in order to show `frame`: the middle of it, so that rounding inside the
 * browser can never land on the frame before or after.
 */
export function frameTime(frame, fps) {
  return (frame + 0.5) / fps;
}

/**
 * Where the loaded stretch that holds `at` ends, in seconds, or null when the browser reports no
 * stretch around that position.
 *
 * @param {Array<[number, number]>} ranges  Loaded stretches, as [start, end] in seconds (video.buffered).
 * @param {number} at  A position in the film (video.currentTime).
 */
export function loadedEnd(ranges, at) {
  const here = ranges.find(([start, end]) => start <= at + RANGE_SLACK && at <= end + RANGE_SLACK);
  return here ? here[1] : null;
}

/**
 * How far into the film (seconds) a frame can be shown now without waiting for the network.
 *
 * While the browser is still fetching, a seek past what has arrived shows nothing until the data
 * comes in, and it can cost the download itself: Chrome may drop it and start another at the new
 * place, leaving holes behind, and Safari stops loading the film in one piece and from then on
 * fetches small pieces as each seek asks for them. So during loading the film is held just inside
 * the loaded stretch, and follows its edge as it grows; where the browser reports no stretch yet,
 * it is held where it is. Once the browser has stopped fetching it either has the whole film or
 * fetches what a seek asks for, and nothing is held back.
 *
 * @param {object} state
 * @param {number|null} state.loadedTo  End of the loaded stretch the film is in (loadedEnd), or null if unknown.
 * @param {number} state.at        Where the film is now (video.currentTime).
 * @param {number} state.duration  Length of the film.
 * @param {boolean} state.loading  Whether the browser is fetching it right now.
 * @param {number} [state.margin]  Distance to keep from the loaded edge.
 */
export function playableEnd({ loadedTo, at, duration, loading, margin = FILM_LOAD_MARGIN }) {
  if (!loading) return duration;
  // Still fetching and no stretch reported around the current position: stay put for now.
  if (loadedTo === null) return at;
  if (loadedTo >= duration - NEAR_END) return duration;
  // Never pull the film backwards to make room for the margin.
  return Math.max(at, loadedTo - margin);
}

/**
 * Move `from` toward `to` the way a weighted object would: the distance left shrinks by the same
 * share in every equal stretch of time, whatever the frame rate. `timeConstantMs` is how long it
 * takes to cover about 63% of the distance.
 */
export function easeToward(from, to, elapsedMs, timeConstantMs) {
  if (!(timeConstantMs > 0)) return to; // no weight: arrive at once
  if (!(elapsedMs > 0)) return from; // no time has passed
  return to + (from - to) * Math.exp(-elapsedMs / timeConstantMs);
}
