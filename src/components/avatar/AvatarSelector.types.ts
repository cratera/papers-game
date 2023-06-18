import { ScrollViewProps, TouchableOpacityProps } from 'react-native'
import { AvatarProps } from './Avatar.types'
import { IllustrationName } from './Illustrations.types'

export interface AvatarBtnProps
  extends Pick<AvatarProps, 'src'>,
    Omit<TouchableOpacityProps, 'children'> {
  isActive?: boolean
  onPress: TouchableOpacityProps['onPress'] // make onPress required
}

export interface AvatarSelectorProps
  extends Omit<
    ScrollViewProps,
    | 'horizontal'
    | 'snapToStart'
    | 'snapToAlignment'
    | 'onMomentumScrollEnd'
    | 'snapToInterval'
    | 'decelarationRate'
  > {
  value: IllustrationName
  defaultValue?: IllustrationName
  onChange: (value: IllustrationName) => void
  isChangeOnMount?: boolean
}
