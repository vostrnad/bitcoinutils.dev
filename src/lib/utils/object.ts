export const mapObject = <
  T extends Record<string | number | symbol, unknown>,
  TK extends keyof T,
  U extends Record<string | number | symbol, unknown>,
  UK extends keyof U,
>(
  obj: T,
  fn: <K extends TK>(key: K, value: T[K]) => [UK, U[UK]] | undefined,
): U => {
  const res = {} as U

  Object.entries(obj).forEach(([key, value]) => {
    const resKV = fn(key as TK, value as T[TK])
    if (!resKV) return
    const [resKey, resValue] = resKV
    res[resKey] = resValue
  })

  return res
}
