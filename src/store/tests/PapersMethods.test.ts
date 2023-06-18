import { Game } from '../PapersContext.types'
import { getNextSkippedTurn, getNextTurn } from '../papersMethods'

describe('getNextTurn() - 2 vs 3', () => {
  const teams = {
    0: {
      id: 0,
      name: 'Team 1',
      players: ['John', 'Maggie'],
    },
    1: {
      id: 1,
      name: 'Team 2',
      players: ['Cata', 'Ricky', 'Sara'],
    },
  } satisfies Game['teams']

  it('go to next team and next player', () => {
    expect(getNextTurn({ team: 0, 0: 0, 1: 0 }, teams)).toEqual({
      team: 1,
      0: 0,
      1: 1,
    })
  })

  it('go back to first team and to next player', () => {
    expect(getNextTurn({ team: 1, 0: 0, 1: 0 }, teams)).toEqual({
      team: 0,
      0: 1,
      1: 0,
    })
  })

  it('go back to first team and to first player', () => {
    expect(getNextTurn({ team: 1, 0: 1, 1: 1 }, teams)).toEqual({
      team: 0,
      0: 0,
      1: 1,
    })
  })

  it('go to next team and to first player', () => {
    expect(getNextTurn({ team: 0, 0: 0, 1: 2 }, teams)).toEqual({
      team: 1,
      0: 0,
      1: 0,
    })
  })
})

describe('getNextSkippedTurn() - 3 v 3', () => {
  const teams = {
    0: {
      id: 0,
      name: 'Team 1',
      players: ['John', 'Maggie', 'Sandy'],
    },
    1: {
      id: 1,
      name: 'Team 2',
      players: ['Cata', 'Ricky', 'Sara'],
    },
  } satisfies Game['teams']

  it('go to next player', () => {
    expect(getNextSkippedTurn({ team: 0, 0: 0, 1: 0 }, teams)).toEqual({
      team: 0,
      0: 1,
      1: 0,
    })
  })

  it('go back to first player', () => {
    expect(getNextSkippedTurn({ team: 1, 0: 0, 1: 2 }, teams)).toEqual({
      team: 1,
      0: 0,
      1: 0,
    })
  })
})
