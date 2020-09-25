import React from 'react'
import { StyleSheet, TouchableHighlight, View, Switch, Text } from 'react-native'
import PropTypes from 'prop-types'

import { IconArrow } from '@components/icons'

import * as Theme from '@theme'

export default function Item({ title, description, icon, Icon, variant, switchValue, onPress }) {
  const isSwitch = !!switchValue
  const switchValueBool = switchValue === 'true'

  function handleOnPress() {
    // when is a switch, the user must click it instead of the whole area
    if (switchValue === undefined) onPress()
  }

  const Element = isSwitch ? View : TouchableHighlight
  const elProps = isSwitch
    ? {}
    : {
        underlayColor: Theme.colors.grayLight,
        onPress: handleOnPress,
      }

  return (
    <Element {...elProps}>
      <View
        style={[
          Styles.item,
          {
            paddingVertical: switchValue ? 20 : 24,
          },
        ]}
      >
        <View style={Styles.text}>
          <Text
            style={[
              Theme.typography.body,
              {
                ...(variant === 'danger' ? { color: Theme.colors.danger } : {}),
              },
            ]}
          >
            {title}
          </Text>
          {description && <Text style={[Theme.typography.small]}>{description}</Text>}
        </View>
        {switchValue && (
          <Switch
            trackColor={{ false: Theme.colors.grayLight, true: Theme.colors.grayDark }}
            thumbColor={Theme.colors.bg}
            ios_backgroundColor={Theme.colors.grayLight}
            onValueChange={onPress}
            value={switchValueBool}
          />
        )}
        {Icon ? <Icon size={16} /> : icon === 'next' ? <IconArrow size={20} /> : null}
      </View>
    </Element>
  )
}

Item.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  hasDivider: PropTypes.bool,
  variant: PropTypes.oneOf(['danger']),
  icon: PropTypes.string,
  Icon: PropTypes.string,
  switchValue: PropTypes.string,
  onPress: PropTypes.func,
}

const Styles = StyleSheet.create({
  item: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    // backgroundColor: Theme.colors.yellow,
  },
  text: {
    flexShrink: 1,
    marginRight: 16,
  },
})
