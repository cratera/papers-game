// LoadingBadge.propTypes = {
//   children: PropTypes.string,
//   size: PropTypes.oneOf(['sm', 'md']),
//   variant: PropTypes.oneOf(['page']),
//   style: PropTypes.any,
// }

import { ViewProps } from 'react-native'

export interface LoadingBadgeProps extends ViewProps {
  size?: 'sm' | 'md'
  variant?: 'default' | 'page'
}
