/**
 * Helper function to transform a string to make it more usable in a URL or filename.
 * Converts to lowercase and replaces non-word characters with hyphen ('-').
 * @example
 * makeAnchor('Rosh Chodesh Adar II') // 'rosh-chodesh-adar-ii'
 */
export function makeAnchor(s: string): string {
  return s
    .toLowerCase()
    .replaceAll("'", '')
    .replaceAll(/[^\w]/g, '-')
    .replaceAll(/-+/g, '-')
    .replaceAll(/^-/g, '')
    .replaceAll(/-$/g, '');
}
