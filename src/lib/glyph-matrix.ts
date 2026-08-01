/**
 * A faithful port of the GlyphMaps matrix composer.
 *
 * These are not decorative approximations: the row widths, the arrow patterns,
 * the 3x5 digit font and the two stamp origins are transcribed from the app's
 * own `MatrixFrame.kt`, `ArrowBitmaps.kt` and `DigitFont.kt`, so what the site
 * lights is what the phone lights. The app itself renders through a single pure
 * composer (parsed state in, 13x13 brightness grid out) and this mirrors that
 * shape deliberately — same input, same output, same arrows.
 *
 * If the app's patterns ever change, they change here too. Drift between the
 * two is the thing worth guarding against; that is the whole reason this is a
 * transcription rather than a redraw.
 *
 * Source: github.com/capad-xyz/GlyphMaps (AGPL-3.0).
 */

export const SIZE = 13;

/**
 * The circular mask of the Phone (4a) Pro panel, as cells per row. Sums to
 * exactly 137 — the LED count the product is named for.
 */
export const ROW_WIDTHS = [5, 7, 11, 13, 13, 13, 13, 13, 13, 13, 11, 7, 5];

export const ARROW_ORIGIN_Y = 1;
export const DIGIT_ORIGIN_Y = 7;

/** Brightness encoding shared by the arrow patterns (MatrixFrame.stamp). */
const LEVELS: Record<string, number> = { X: 255, o: 178, "+": 102, ":": 40, ".": 0 };

export type Maneuver =
  | "STRAIGHT"
  | "KEEP_LEFT"
  | "LEFT"
  | "SHARP_LEFT"
  | "KEEP_RIGHT"
  | "RIGHT"
  | "SHARP_RIGHT"
  | "FORWARD_LEFT"
  | "FORWARD_RIGHT"
  | "ROUNDABOUT"
  | "UTURN"
  | "ARRIVE";

export const MANEUVERS: Maneuver[] = [
  "STRAIGHT",
  "KEEP_LEFT",
  "LEFT",
  "SHARP_LEFT",
  "KEEP_RIGHT",
  "RIGHT",
  "SHARP_RIGHT",
  "FORWARD_LEFT",
  "FORWARD_RIGHT",
  "ROUNDABOUT",
  "UTURN",
  "ARRIVE",
];

/** Human labels matching the app's own vocabulary. */
export const MANEUVER_LABELS: Record<Maneuver, string> = {
  STRAIGHT: "Continue straight",
  KEEP_LEFT: "Keep left",
  LEFT: "Turn left",
  SHARP_LEFT: "Sharp left",
  KEEP_RIGHT: "Keep right",
  RIGHT: "Turn right",
  SHARP_RIGHT: "Sharp right",
  FORWARD_LEFT: "Fork left",
  FORWARD_RIGHT: "Fork right",
  ROUNDABOUT: "At the roundabout",
  UTURN: "Make a U-turn",
  ARRIVE: "Arriving",
};

// 6 rows x 13 cols, stamped at ARROW_ORIGIN_Y. Transcribed verbatim.
const PATTERNS: Record<Maneuver, string[]> = {
  STRAIGHT: [
    "......X......",
    ".....XoX.....",
    "....X.o.X....",
    "......o......",
    "......o......",
    "......o......",
  ],
  LEFT: [
    ".............",
    "...X.........",
    "..X..........",
    ".Xooooo......",
    "..X..........",
    "...X.........",
  ],
  RIGHT: [
    ".............",
    ".........X...",
    "..........X..",
    "......oooooX.",
    "..........X..",
    ".........X...",
  ],
  KEEP_LEFT: [
    "...XXX.......",
    "...Xo........",
    "...X.o.......",
    "......o......",
    ".......o.....",
    ".............",
  ],
  KEEP_RIGHT: [
    ".......XXX...",
    "........oX...",
    ".......o.X...",
    "......o......",
    ".....o.......",
    ".............",
  ],
  SHARP_LEFT: [
    ".......oo....",
    "......o.o....",
    "...X.o..o....",
    "...Xo...o....",
    "...XXX..o....",
    ".............",
  ],
  SHARP_RIGHT: [
    "....oo.......",
    "....o.o......",
    "....o..o.X...",
    "....o...oX...",
    "....o..XXX...",
    ".............",
  ],
  FORWARD_LEFT: [
    ".....X.......",
    "....X........",
    "...X.oooo....",
    "....X...o....",
    ".....X..o....",
    "........o....",
  ],
  FORWARD_RIGHT: [
    ".......X.....",
    "........X....",
    "....oooo.X...",
    "....o...X....",
    "....o..X.....",
    "....o........",
  ],
  ROUNDABOUT: [
    "....ooooo....",
    "...o.....o...",
    "...o...X.X.X.",
    "...+....X.X..",
    "...+.....X...",
    "....+++++....",
  ],
  UTURN: [
    "....++++++...",
    "....+....+...",
    "....+....+...",
    "..X.+.X..+...",
    "...X.X...+...",
    "....X....+...",
  ],
  ARRIVE: [
    ".....+++.....",
    "....+...+....",
    "....+.X.+....",
    "....+...+....",
    ".....+++.....",
    ".............",
  ],
};

// Hand-tuned 3x5 font. Three glyphs plus gaps fit the 11-cell row 10, which is
// why the distance never gets clipped by the circular mask.
const GLYPH_W = 3;
const GLYPHS: Record<string, string[]> = {
  "0": ["XXX", "X.X", "X.X", "X.X", "XXX"],
  "1": [".X.", "XX.", ".X.", ".X.", "XXX"],
  "2": ["XXX", "..X", "XXX", "X..", "XXX"],
  "3": ["XXX", "..X", "XXX", "..X", "XXX"],
  "4": ["X.X", "X.X", "XXX", "..X", "..X"],
  "5": ["XXX", "X..", "XXX", "..X", "XXX"],
  "6": ["XXX", "X..", "XXX", "X.X", "XXX"],
  "7": ["XXX", "..X", ".X.", ".X.", ".X."],
  "8": ["XXX", "X.X", "XXX", "X.X", "XXX"],
  "9": ["XXX", "X.X", "XXX", "..X", "XXX"],
  ".": ["...", "...", "...", "...", ".X."],
  k: ["X..", "X.X", "XX.", "X.X", "X.X"],
  m: ["...", "X.X", "XXX", "X.X", "X.X"],
  " ": ["...", "...", "...", "...", "..."],
};

/** Width in cells of `text`, including the 1-cell gaps between glyphs. */
export function measure(text: string): number {
  return text.length * GLYPH_W + Math.max(text.length - 1, 0);
}

/** True when (x, y) falls inside the circular mask. */
export function inMask(x: number, y: number): boolean {
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return false;
  const half = Math.floor(ROW_WIDTHS[y] / 2);
  const center = Math.floor(SIZE / 2);
  return Math.abs(x - center) <= half;
}

export type Grid = number[][];

function blank(): Grid {
  return Array.from({ length: SIZE }, () => new Array<number>(SIZE).fill(0));
}

function stamp(grid: Grid, originX: number, originY: number, pattern: string[]) {
  pattern.forEach((row, dy) => {
    const y = originY + dy;
    for (let dx = 0; dx < row.length; dx++) {
      const level = LEVELS[row[dx]] ?? 0;
      if (!level) continue;
      const x = originX + dx;
      // Cells outside the circular mask are silently dropped, exactly as the
      // device does — this is why patterns can be authored on a full 13-wide
      // grid without worrying about the corners.
      if (inMask(x, y)) grid[y][x] = level;
    }
  });
}

/**
 * Compose one frame: arrow on top, distance underneath.
 *
 * `scroll` shifts the distance text horizontally, which is how the app handles
 * readouts wider than the panel ("1.5k" is 15 cells against a 13-cell grid) —
 * it marquees them rather than shrinking the font.
 */
export function composeFrame(
  maneuver: Maneuver,
  distance = "",
  scroll = 0,
): Grid {
  const grid = blank();
  stamp(grid, 0, ARROW_ORIGIN_Y, PATTERNS[maneuver]);

  if (distance) {
    const width = measure(distance);
    const originX = width <= SIZE ? Math.floor((SIZE - width) / 2) : -scroll;
    let x = originX;
    for (const ch of distance) {
      const glyph = GLYPHS[ch];
      if (glyph) stamp(grid, x, DIGIT_ORIGIN_Y, glyph);
      x += GLYPH_W + 1;
    }
  }

  return grid;
}

/** Every lit cell of the mask, for rendering the unlit panel behind a frame. */
export function maskCells(): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (inMask(x, y)) cells.push({ x, y });
    }
  }
  return cells;
}

/** 137, computed rather than asserted. */
export const LED_COUNT = ROW_WIDTHS.reduce((a, b) => a + b, 0);
