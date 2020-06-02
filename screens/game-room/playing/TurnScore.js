import React, { Fragment } from 'react'
import { View, Text, TouchableHighlight } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import PropTypes from 'prop-types'

import Button from '@components/button'
import Page from '@components/page'
import Sheet from '@components/sheet'

// import i18n from '@constants/i18n'

import * as Theme from '@theme'
import Styles from './PlayingStyles.js'

const TurnScore = ({ papersTurn, type, onTogglePaper, onFinish, getPaperByKey, isSubmitting }) => {
  const [isNotGuessedVisible, setIsNotGuessedVisible] = React.useState(false)
  const [editingPaper, setEditingPaper] = React.useState(['', null])

  function closeSheet() {
    setEditingPaper(['', null])
  }
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

        <ScrollView style={{ marginHorizontal: -16 }}>
          {papersTurn.guessed.length ? (
            <View style={Styles.tscore_list}>
              {papersTurn.guessed
                .filter(paper => paper !== undefined)
                .map((paper, i) => (
                  <TouchableHighlight
                    underlayColor={Theme.colors.grayLight}
                    onPress={() => setEditingPaper([paper, false])}
                    style={Styles.tscore_item}
                    key={`${i}_${paper}`}
                  >
                    <Text style={Theme.typography.bold}>{getPaperByKey(paper)}</Text>
                  </TouchableHighlight>
                ))}
            </View>
          ) : (
            <Text style={[Theme.typography.italic, Theme.u.center, { marginTop: 40 }]}>
              More luck next time...
            </Text>
          )}
          {!!papersTurn.passed.length && (
            <View style={[Styles.tscore_list, { marginBottom: 80 }]}>
              {/* Toggle visibility */}
              <View style={[Styles.tscore_item, { paddingBottom: 0 }]} key="ng">
                <Text style={[Theme.typography.secondary, { marginLeft: 8 }]}>
                  Not guessed ({papersTurn.passed.length})
                </Text>
                <Button
                  style={Styles.tscore_btnToggle}
                  variant="flat"
                  onPress={() => setIsNotGuessedVisible(bool => !bool)}
                >
                  {isNotGuessedVisible ? 'Hide' : 'Show'}
                </Button>
              </View>

              {isNotGuessedVisible &&
                papersTurn.passed
                  .filter(paper => paper !== undefined)
                  .map((paper, i) => (
                    <TouchableHighlight
                      underlayColor={Theme.colors.grayLight}
                      onPress={() => setEditingPaper([paper, true])}
                      style={Styles.tscore_item}
                      key={`${i}_${paper}`}
                    >
                      <Text style={Theme.typography.bold}>{getPaperByKey(paper)}</Text>
                    </TouchableHighlight>
                  ))}
            </View>
          )}
        </ScrollView>

        <Sheet
          visible={!!editingPaper[0]}
          onClose={closeSheet}
          list={[
            {
              text: !editingPaper[0]
                ? ''
                : editingPaper[1]
                ? `✅ Mark "${getPaperByKey(editingPaper[0])}" guessed`
                : `❌ Remove "${getPaperByKey(editingPaper[0])}"`,
              onPress: () => {
                closeSheet()
                setIsNotGuessedVisible(true)
                onTogglePaper(...editingPaper)
              },
            },
          ]}
        />
      </Page.Main>
      <Page.CTAs blankBg hasOffset>
        <Button onPress={onFinish} isLoading={isSubmitting}>
          End turn
        </Button>
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
  isSubmitting: PropTypes.bool,
}

export default TurnScore
