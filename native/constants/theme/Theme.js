import { StyleSheet } from 'react-native';

export const colors = {
  grayDark: '#484F5D',
  grayMedium: '#7F848E',
  grayLight: '#E5E6E8',
  primary: '#FF8F50',
  primaryLight: '#FFE9DC',
  success: '#4EBD81',
  successLight: '#DCF2E6',
  danger: '#e51d1d', // TODO/REVIEW @mmbotelho
  bg: '#ffffff',
};

export const Typography = StyleSheet.create({
  h1: {
    fontSize: 40,
    fontWeight: 'bold',
    lineHeight: 48,
    // display: 'block',
  },
  h2: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  h3: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  default: {
    fontSize: 16,
  },
  secondary: {
    color: colors.grayMedium,
  },
  small: {
    fontSize: 14,
  },
  italic: {
    color: colors.grayMedium,
    fontStyle: 'italic',
  },
});

// export const base = StyleSheet.create({
//   backgroundColor: colors.bg,
//   color: colors.grayDark,
//   lineHeight: 22,
//   fontSize: 16, // typography.default
// });

// export const bp = {
//   xs: '@media',
//   // xs: `@media (max-height: 35.5em)}, // 568px; - iphone5
// };

// export function ThemeGlobal() {
//   return (
//     <Global
//       styles={css`
//         html {
//           fontSize: 62.5%;
//           letter-spacing: -0.5px;
//           font-family: -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif;
//           -webkit-font-smoothing: antialiased;
//           -moz-osx-font-smoothing: grayscale;
//           color: ${colors.grayDark};
//         }

//         body {
//           box-sizing: border-box;
//           fontSize: 1.6rem;
//           line-height: 1.4;
//         }

//         body * {
//           box-sizing: inherit;
//         }

//         .sr-only {
//           position: absolute;
//           width: 1px;
//           height: 1px;
//           padding: 0;
//           margin: -1px;
//           overflow: hidden;
//           clip: rect(0, 0, 0, 0);
//           border: 0;
//         }
//       `}
//     />
//   );
// }
