// SlidePaper.propTypes = {
//   i: PropTypes.number.isRequired,
//   isActive: PropTypes.bool.isRequired,
//   onChange: PropTypes.func.isRequired,
//   onFocus: PropTypes.func.isRequired,
//   onSubmit: PropTypes.func.isRequired,
// }

import { TextInputProps } from 'react-native'

export interface SlidePaperProps {
  i: number
  isActive: boolean
  onChange: (text: string, i: number) => void
  onFocus: EmptyCallback
  onSubmit: TextInputProps['onSubmitEditing']
}
