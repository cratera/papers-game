import { ModalProps, ViewProps } from 'react-native'

export interface ModalWebProps extends ViewProps {
  visible?: boolean
}

export interface TheModalProps extends ModalProps {
  onClose?: () => void
  hiddenClose?: boolean
  styleContent?: ViewProps['style']
}
