import NodeCache from 'node-cache'

declare const globalThis: {
  [key: string]: NodeCache
} & typeof global

export type NodeCacheName = 'eventsCache'

export enum EventsCacheKey {
  NewEvents,
  PastEvents
}

const createNodeCache = (name: NodeCacheName) => {
  console.log('Creating new cache')
  return new NodeCache()
}

export function getNodeCache(name: NodeCacheName) {
  if (!globalThis[name]) {
    globalThis[name] = createNodeCache(name)
  }

  return globalThis[name]
}
