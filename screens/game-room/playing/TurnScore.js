import React, { Fragment } from 'react'
import { View, Text } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import PropTypes from 'prop-types'

import Button from '@components/button'
import Page from '@components/page'
// import i18n from '@constants/i18n'

import * as Theme from '@theme'
import Styles from './PlayingStyles.js'

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

        <ScrollView style={Theme.u.scrollSideOffset}>
          {papersTurn.guessed.length ? (
            <View style={Styles.tscore_list}>
              {papersTurn.guessed
                .filter(paper => paper !== undefined)
                .map((paper, i) => (
                  <View style={[Styles.tscore_item]} key={`${i}_${paper}`}>
                    <Text style={Theme.typography.body}>{getPaperByKey(paper)}</Text>
                    <Button
                      style={Styles.tscore_btnRemove}
                      variant="flat"
                      onPress={() => onTogglePaper(paper, false)}
                    >
                      Remove
                    </Button>
                  </View>
                ))}
            </View>
          ) : (
            <Text style={[Theme.typography.italic, Theme.u.center, { marginTop: 40 }]}>
              More luck next time...
            </Text>
          )}
          {!!papersTurn.passed.length && (
            <View style={Styles.tscore_list}>
              <Text style={Theme.typography.h3}>Papers you did not get:</Text>
              {papersTurn.passed
                .filter(paper => paper !== undefined)
                .map((paper, i) => (
                  <View style={Styles.tscore_item} key={`${i}_${paper}`}>
                    <Text style={Theme.typography.body}>{getPaperByKey(paper)}</Text>
                    <Button
                      style={Styles.tscore_btnAdd}
                      variant="flat"
                      onPress={() => onTogglePaper(paper, true)}
                    >
                      Add
                    </Button>
                  </View>
                ))}
            </View>
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

export default TurnScore
