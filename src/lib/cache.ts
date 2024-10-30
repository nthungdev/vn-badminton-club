import NodeCache from 'node-cache'

declare const globalThis: {
  [key: string]: NodeCache
} & typeof global

export type NodeCacheName = 'eventsCache' | 'usersCache'

export enum EventsCacheKey {
  NewEvents,
  PastEvents,
}

export enum UsersCacheKey {
  UserById,
}

const createNodeCache = (name: NodeCacheName) => {
  console.info(`Creating cache: ${name}`)
  if (name === 'usersCache') {
    return new NodeCache({
      stdTTL: 60 * 30, // 30 minutes
    })
  }
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
