/* eslint-disable @typescript-eslint/no-explicit-any */
export function safeStringify(obj: any) {
  const cache = new Set()
  const jsonString = JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        return // Discard circular reference
      }
      cache.add(value)
    }
    return value
  })
  return jsonString
}
