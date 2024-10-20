import NodeCache from 'node-cache'

declare const globalThis: {
  [key: string]: NodeCache
} & typeof global

export type NodeCacheName = 'eventsCache'

export enum EventsCacheKey {
  NewEvents,
  PastEvents,
}

const createNodeCache = (name: NodeCacheName) => {
  console.info(`Creating cache: ${name}`)
  return new NodeCache({
    stdTTL: 60 * 60 * 24, // 24 hours
  })
}

export function getNodeCache(name: NodeCacheName) {
  if (!globalThis[name]) {
    globalThis[name] = createNodeCache(name)
  }

  return globalThis[name]
}
