/**
 * Returns user initials based on the user's name:
 * - If user has first name and last name: FirstLetter(firstName) + FirstLetter(lastName) (e.g. "Bhavish Mule" -> "BM")
 * - If user only has a single name (e.g. "Bhavish"): FirstLetter(name) (e.g. "B")
 * - If name is missing / empty: Fallback to "U"
 *
 * @param {string|null|undefined} name
 * @returns {string} Initials in uppercase
 */
export function getInitials(name) {
  if (!name || typeof name !== "string") {
    return "U";
  }

  const cleanName = name.trim();
  if (!cleanName) {
    return "U";
  }

  const parts = cleanName.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    const firstInitial = parts[0][0];
    const lastInitial = parts[parts.length - 1][0];
    return (firstInitial + lastInitial).toUpperCase();
  }

  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }

  return "U";
}
