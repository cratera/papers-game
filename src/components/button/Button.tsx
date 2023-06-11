import { IconSpin } from '@src/components/icons'
import { memo } from 'react'
import { Text, TouchableHighlight, View } from 'react-native'

import * as Styles from './Button.styles'
import { ButtonProps } from './Button.types'

export const defaultButtonProps = {
  variant: 'primary',
  size: 'default',
  place: undefined,
} satisfies ButtonProps

function Button({
  variant = defaultButtonProps.variant,
  size = defaultButtonProps.size,
  place = defaultButtonProps.place,
  textColor,
  bgColor,
  loadingColor,
  numberOfLines,
  isLoading,
  children,
  style,
  styleTouch,
  disabled,
  ...props
}: ButtonProps) {
  const isIcon = variant === 'icon'
  return (
    <TouchableHighlight
      style={[Styles.touch, styleTouch, place === 'float' && Styles.place_float]}
      activeOpacity={0.5}
      underlayColor="transparent"
      {...(isLoading || disabled ? { disabled: true } : {})}
      {...props}
    >
      <View style={[Styles.btnWrapper({ variant, size, place, bgColor, disabled }), style]}>
        {!isLoading ? (
          isIcon ? (
            children
          ) : (
            <Text
              numberOfLines={numberOfLines}
              style={Styles.btnText({ variant, size, textColor })}
            >
              {children}
            </Text>
          )
        ) : (
          <IconSpin size={20} color={loadingColor} />
        )}
      </View>
    </TouchableHighlight>
  )
}

export default memo(Button)
