import { TextInputProps } from 'react-native'

export interface SlidePaperProps {
  i: number
  isActive: boolean
  onChange: (text: string, i: number) => void
  onFocus: EmptyCallback
  onSubmit: TextInputProps['onSubmitEditing']
}
