import { getNextTurn } from '../papersMethods.js'

describe('getNextTurn() - 2 vs 3', () => {
  const teams = {
    0: {
      players: ['John', 'Maggie'],
    },
    1: {
      players: ['Cata', 'Ricky', 'Sara'],
    },
  }

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

describe('getNextSkippedTurn() - team of 3', () => {
  const teams = {
    0: {
      players: ['John', 'Maggie', 'Sandy'],
    },
  }

  it('go to next player', () => {
    expect(getNextTurn({ team: 0, 0: 0, 1: 0 }, teams)).toEqual({
      team: 0,
      0: 1,
      1: 0,
    })
  })

  it('go back to first player', () => {
    expect(getNextTurn({ team: 0, 0: 2, 1: 0 }, teams)).toEqual({
      team: 0,
      0: 0,
      1: 0,
    })
  })
})
