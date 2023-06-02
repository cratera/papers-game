// Utils that don't fit anywhere else, we can move them later if we find a better place.

export function isDebugging(profileName: string | undefined) {
  if (!profileName) return false

  return profileName.includes('_bug')
}

export const createUniqueId = (name: string) => {
  // Q: maybe this should be created on server instead.
  // TODO: use uuid instead? https://www.npmjs.com/package/uuid
  return `${name}_${Math.random().toString(36).substring(2, 9)}_${new Date().getTime()}`
}

export const getRandomInt = (max: number) => {
  const min = 0
  return Math.floor(Math.random() * (max - min + 1)) + min
}
