import { IllustrationName } from './Illustrations.types'

// TODO: a guard to prevent undefineds eg avatars.xpto

export const charactersGroups = {
  0: ['isa', 'per', 'joana', 'joao', 'sara', 'chris'],
  1: ['andre', 'sandy', 'manuel', 'bea', 'edgar', 'marianne'],
  2: ['julia', 'kitt', 'maggie', 'brito', 'mario', 'bruna'],
  3: ['boni', 'miguel', 'kelly', 'abraul', 'anne', 'micas'],
  4: ['carlos', 'leo', 'sao', 'karl'],
} satisfies Record<number, IllustrationName[]>
