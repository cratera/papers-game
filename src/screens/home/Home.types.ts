import { StackScreenProps } from '@react-navigation/stack'
import { AppStackParamList } from '@src/navigation/navigation.types'
import { Profile } from '@src/store/PapersContext.types'
import { TouchableOpacityProps } from 'react-native'

export interface HomeSignupState {
  name: Profile['name']
  avatar: Profile['avatar']
  step: number
}

export interface HomeSignupProps
  extends Pick<StackScreenProps<AppStackParamList, 'home'>, 'navigation'> {
  onSubmit: (profile: Pick<Profile, 'name' | 'avatar'>) => void
}

export interface HeaderMenuProps {
  onPress: TouchableOpacityProps['onPress']
}
