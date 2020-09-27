import React from 'react'
import { StyleSheet, TouchableHighlight, View, Switch, Text } from 'react-native'
import PropTypes from 'prop-types'

import { IconArrow } from '@components/icons'

import * as Theme from '@theme'

export default function Item({ title, description, icon, Icon, variant, switchValue, onPress }) {
  const isSwitch = switchValue !== undefined
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
            paddingVertical: isSwitch ? 20 : 24,
          },
        ]}
      >
        <View style={Styles.text}>
          <Text
            style={[Theme.typography.body, variant === 'danger' && { color: Theme.colors.danger }]}
          >
            {title}
          </Text>
          {description && <Text style={[Theme.typography.small]}>{description}</Text>}
        </View>
        {isSwitch && (
          <Switch
            trackColor={{ false: Theme.colors.grayLight, true: Theme.colors.grayDark }}
            thumbColor={Theme.colors.bg}
            ios_backgroundColor={Theme.colors.grayLight}
            onValueChange={onPress}
            value={switchValue}
          />
        )}
        {Icon ? (
          <Icon size={16} color={variant === 'danger' && Theme.colors.danger} />
        ) : icon === 'next' ? (
          <IconArrow size={20} />
        ) : icon ? (
          <Text style={Theme.typography.secondary}>{icon}</Text>
        ) : null}
      </View>
    </Element>
  )
}

Item.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  hasDivider: PropTypes.bool,
  variant: PropTypes.oneOf(['danger']),
  icon: PropTypes.string, // Optmize - get rid of this, use only Icon
  Icon: PropTypes.func,
  switchValue: PropTypes.bool,
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
