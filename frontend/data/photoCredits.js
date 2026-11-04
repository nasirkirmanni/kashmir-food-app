/**
 * Photographs taken for the desktop homepage (components/home/feast) and who took them. (The seven's vessel
 * shows each dish's own photograph instead, the one its dish page shows: lib/homeFeast.js feastSeven.)
 * A PhotoSlot shows a photograph only when its slot has an entry here; until then it shows its drawn
 * fallback (or nothing).
 * Entry: { slot, src, alt, subject, place, month, photographer, rights }. src is a file under
 * /public/images/home/. rights is "owner" or the licence. No AI-generated images and nothing from
 * /images/scroll. Every frame is a circle. lib/homeFeast.test.js checks every entry.
 */
export const PHOTO_CREDITS = [];
