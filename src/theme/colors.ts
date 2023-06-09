export type Color = keyof typeof colors

const colors = {
  grayDark: '#000000',
  grayMedium: 'rgba(0, 0, 0, 0.5)',
  grayLight: 'rgba(0, 0, 0, 0.2)',
  grayVeryLight: 'rgba(0, 0, 0, 0.1)',
  grayBg: '#F7F8FA',
  primary: '#FF8F50',
  primaryLight: '#FFE9DC',
  success: '#4EBD81',
  successLight: '#DCF2E6',
  danger: '#FF005c',
  bg: '#ffffff',
  transparent: 'transparent',

  orange: '#EFA16F',
  orange_desatured: '#EFBD9E',
  purple: '#C299C4',
  purple_desatured: '#C3A3C4',
  yellow: '#EED486',
  yellow_desatured: '#EEDA9D',
  pink: '#DE7C9B',
  pink_desatured: '#C56E8A',
  salmon: '#F2C9AD',
  salmon_desatured: '#F2D7C4',
  green: '#A3C764',
  green_desatured: '#B4CF84',
}

export default colors
