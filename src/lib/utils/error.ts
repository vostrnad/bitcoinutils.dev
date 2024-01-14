export const getErrorMessage = (e: unknown): string => {
  return e instanceof Error ? e.message : 'Something went wrong'
}
