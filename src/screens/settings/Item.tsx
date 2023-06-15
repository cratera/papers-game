import { Pressable, StyleSheet, Switch, Text, View } from 'react-native'

import { IconChevron } from '@src/components/icons'

import * as Theme from '@src/theme'
import { ItemProps } from './Item.types'

export default function Item({
  title,
  description,
  icon,
  Icon,
  variant,
  switchValue = undefined,
  onPress,
  hasDivider,
  ...props
}: ItemProps) {
  const isSwitch = switchValue !== undefined
  function handleOnPress() {
    // when is a switch, the user must click it instead of the whole area
    if (switchValue === undefined) {
      onPress && onPress()
    }
  }

  const Element = isSwitch ? View : Pressable // previously TouchableHighlight
  const elProps = isSwitch
    ? props
    : {
        // underlayColor: Theme.colors.salmon_desatured,
        onPress: handleOnPress,
        ...props,
      }

  return (
    <>
      {hasDivider ? <View style={Styles.divider}></View> : null}
      <Element {...elProps}>
        <View style={[Styles.item, isSwitch ? Theme.spacing.pv_20 : Theme.spacing.pv_24]}>
          <View style={Styles.text}>
            <Text
              style={[
                Theme.typography.body,
                variant === 'danger' && { color: Theme.colors.danger },
              ]}
            >
              {title}
            </Text>
            {description && <Text style={Theme.typography.small}>{description}</Text>}
          </View>
          {isSwitch && (
            <Switch
              trackColor={{ false: Theme.colors.grayLight, true: Theme.colors.green }}
              thumbColor={Theme.colors.bg}
              ios_backgroundColor={Theme.colors.grayLight}
              onValueChange={onPress}
              value={switchValue}
            />
          )}
          {Icon ? (
            <Icon size={24} color={variant === 'danger' ? Theme.colors.danger : undefined} />
          ) : icon === 'next' ? (
            <IconChevron size={24} color={Theme.colors.grayDark} />
          ) : icon ? (
            <Text style={Theme.typography.secondary}>{icon}</Text>
          ) : null}
        </View>
      </Element>
    </>
  )
}

const Styles = StyleSheet.create({
  item: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  text: {
    flexShrink: 1,
    marginRight: 16,
  },
  divider: {
    borderTopWidth: 0.5,
    marginHorizontal: 16,
    marginVertical: 4,
    borderTopColor: Theme.colors.grayLight,
  },
})
