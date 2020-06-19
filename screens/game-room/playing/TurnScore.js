import React, { Fragment } from 'react'
import { Platform, View, Text } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import PropTypes from 'prop-types'

import Button from '@components/button'
import Page from '@components/page'
// import i18n from '@constants/i18n'
import { IconCheck, IconTimes } from '@components/icons'

import * as Theme from '@theme'
import Styles from './PlayingStyles.js'

const isWeb = Platform.OS === 'web'

const TurnScore = ({ papersTurn, type, onTogglePaper, onFinish, getPaperByKey }) => {
  return (
    <Fragment>
      <Page.Main blankBg>
        <View style={Styles.header}>
          <Text style={Theme.typography.secondary}>
            {type === 'timesup' ? "Time's Up!" : 'All papers guessed!'}
          </Text>
          <Text style={[Theme.typography.h2, Theme.u.center]}>
            Your team got <Text>{papersTurn.guessed.length}</Text> papers right!
          </Text>
        </View>

        <ScrollView style={[Theme.u.scrollSideOffset, { marginLeft: -16 }]}>
          {papersTurn.sorted.length ? (
            <View style={Styles.tscore_list}>
              {papersTurn.sorted
                .filter(
                  (paper, index) =>
                    // use indexOf to avoid duplicated keys.
                    // TODO later keep last indexOf instead of first.
                    paper !== undefined && papersTurn.sorted.indexOf(paper) === index
                )
                .map((paper, i) => {
                  const hasGuessed = papersTurn.guessed.includes(paper)
                  const Icon = hasGuessed ? IconCheck : IconTimes
                  return (
                    <ItemToggle
                      key={`${i}_${paper}`}
                      style={[Styles.tscore_item]}
                      onPress={() => onTogglePaper(paper, !hasGuessed)}
                    >
                      <Icon
                        size={20}
                        color={hasGuessed ? Theme.colors.success : null}
                        style={{ flexShrink: 0, transform: [{ translateY: 4 }] }}
                      />
                      <View style={{ width: 8 }}>{/* lazyness level 99 */}</View>
                      <Text
                        style={[
                          Theme.typography.bold,
                          {
                            flexGrow: 1,
                            paddingRight: 4,
                            color: Theme.colors[hasGuessed ? 'success' : 'grayMedium'],
                            textDecorationLine: hasGuessed ? 'none' : 'line-through',
                          },
                        ]}
                      >
                        {getPaperByKey(paper)}
                      </Text>
                    </ItemToggle>
                  )
                })}
            </View>
          ) : (
            <Text style={[Theme.typography.secondary, Theme.u.center, { marginTop: 40 }]}>
              More luck next time...
            </Text>
          )}
        </ScrollView>
      </Page.Main>
      <Page.CTAs blankBg hasOffset>
        {/* TODO add loading */}
        <Button onPress={onFinish}>End turn</Button>
      </Page.CTAs>
    </Fragment>
  )
}

TurnScore.propTypes = {
  papersTurn: PropTypes.object.isRequired,
  type: PropTypes.oneOf(['timesup', 'nowords']).isRequired,
  onTogglePaper: PropTypes.func.isRequired,
  onFinish: PropTypes.func.isRequired,
  getPaperByKey: PropTypes.func.isRequired,
}

function ItemToggle(props) {
  if (!isWeb) {
    return <Button {...props} />
  }

  return (
    <View style={props.style}>
      {props.children}
      <Button variant="light" size="sm" onPress={props.onPress}>
        Change
      </Button>
    </View>
  )
}

ItemToggle.propTypes = {
  children: PropTypes.object.isRequired,
  onPress: PropTypes.func.isRequired,
  style: PropTypes.any,
}

export default TurnScore
