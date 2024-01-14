export const getErrorMessage = (e: unknown): string => {
  return e instanceof Error ? e.message : 'Something went wrong'
}

export const formatErrorOutput = (message: string): string => {
  return `Error: ${message}.`
}
