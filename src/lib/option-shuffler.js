/**
 * Deterministic Fisher-Yates shuffle based on a seed string.
 * Guarantees uniform random distribution across positions 1, 2, 3, 4,
 * while remaining 100% deterministic (consistent across page refreshes)
 * for a specific student and question.
 *
 * @param {Array} options - List of option objects
 * @param {string} seedStr - Unique seed string (e.g. `${examId}_${questionId}_${studentId}`)
 * @returns {Array} Shuffled options with updated 1-based order
 */
export function shuffleOptionsDeterministically(options, seedStr = "") {
  if (!options || options.length <= 1) return options || [];

  const arr = [...options];

  // Hash the seed string into a 32-bit integer
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = ((hash << 5) - hash + seedStr.charCodeAt(i)) | 0;
  }

  // Mulberry32 pseudo-random generator with seed
  let seed = Math.abs(hash) || 12345;
  function nextRandom() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Fisher-Yates shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  // Re-assign 1-based order
  return arr.map((o, idx) => ({
    ...o,
    order: idx + 1,
  }));
}
