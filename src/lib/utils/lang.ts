export const pluralize = (
  number: number,
  singular: string,
  plural?: string,
): string => {
  if (number === 1) {
    return singular
  }
  if (plural) {
    return plural
  }
  return `${singular}s`
}
