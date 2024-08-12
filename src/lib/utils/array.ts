export const createArray = <T>(length: number, fn: (index: number) => T): T[] =>
  Array.from({ length }).map((_, i) => fn(i))

export const sum = (array: number[]): number =>
  array.reduce((prev, curr) => prev + curr, 0)

export const getMax = <T>(array: T[], fn: (item: T) => number): T => {
  let maxItem = array[0]
  let maxValue = fn(maxItem)
  for (let i = 1; i < array.length; i++) {
    const item = array[i]
    const value = fn(item)
    if (value >= maxValue) {
      maxItem = item
      maxValue = value
    }
  }
  return maxItem
}
