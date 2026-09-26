// Cache only successful catalogue reads; share in-flight requests.
export function createCatalogCache(ttlMs = 300000, limit = 40) {
  const values = new Map()
  const pending = new Map()
  return async (key, load) => {
    const cached = values.get(key)
    if (cached && cached.expires > Date.now()) return cached.value
    if (pending.has(key)) return pending.get(key)
    const task = Promise.resolve().then(load).then(value => {
      values.delete(key)
      if (values.size >= limit) values.delete(values.keys().next().value)
      values.set(key, { value, expires: Date.now() + ttlMs })
      return value
    }).finally(() => pending.delete(key))
    pending.set(key, task)
    return task
  }
}
