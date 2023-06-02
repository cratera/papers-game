import PropTypes from 'prop-types'
import { Platform, Text, TouchableHighlight, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import Button from '@src/components/button'
import Page from '@src/components/page'
// import i18n from '@src/constants/i18n'
import { IconCheck, IconTimes } from '@src/components/icons'

import * as Theme from '@src/theme'
import Styles from './PlayingStyles.js'

const isWeb = Platform.OS === 'web'

const TurnScore = ({ papersTurn, type, onTogglePaper, onFinish, isSubmitting, getPaperByKey }) => {
  return (
    <Page styleInner={Styles.tscore_page}>
      <Page.Main>
        <View
          style={[
            Styles.header,
            Styles.tscore_header,
            Theme.utils.cardEdge,
            Theme.utils.borderBottom,
          ]}
        >
          <Text style={[Theme.typography.h2, Theme.utils.center, { maxWidth: 300 }]}>
            {papersTurn.sorted.length > 0 ? (
              <>
                Your team got <Text>{papersTurn.guessed.length}</Text> papers right!
              </>
            ) : (
              'Oooopsss...'
            )}
          </Text>
        </View>
        <ScrollView style={Theme.utils.scrollSideOffset}>
          {papersTurn.sorted.length ? (
            <View style={[Styles.tscore_list, Theme.utils.cardEdge]}>
              {papersTurn.sorted
                .filter(
                  (paper, index) =>
                    // use indexOf to avoid duplicated keys.
                    paper !== undefined && papersTurn.sorted.indexOf(paper) === index
                )
                .map((paper, i) => {
                  const hasGuessed = papersTurn.guessed.includes(paper)
                  const Icon = hasGuessed ? IconCheck : IconTimes

                  return (
                    <ItemToggle
                      key={`${i}_${paper}`}
                      underlayColor={Theme.colors.grayLight}
                      style={Styles.tscore_item}
                      onPress={() => onTogglePaper(paper, !hasGuessed)}
                    >
                      {/* Need extra wrapper for web */}
                      <View style={Styles.tscore_start}>
                        <View
                          style={[
                            Styles.tscore_iconArea,
                            Theme.utils.middle,
                            {
                              backgroundColor: Theme.colors[hasGuessed ? 'grayDark' : 'bg'],
                            },
                          ]}
                        >
                          <Icon size={28} color={Theme.colors[hasGuessed ? 'bg' : 'grayDark']} />
                        </View>
                        <Text
                          style={[
                            Theme.typography.bold,
                            Styles.tscore_itemText,
                            {
                              color: Theme.colors[hasGuessed ? 'grayDark' : 'grayMedium'],
                              textDecorationLine: hasGuessed ? 'none' : 'line-through',
                            },
                          ]}
                        >
                          {getPaperByKey(paper)}
                        </Text>
                      </View>
                    </ItemToggle>
                  )
                })}
            </View>
          ) : (
            <Text style={[Theme.typography.secondary, Theme.utils.center, { marginTop: 40 }]}>
              More luck next time...
            </Text>
          )}
        </ScrollView>
      </Page.Main>
      <Page.CTAs hasOffset>
        <Button size="lg" place="float" onPress={onFinish} isLoading={isSubmitting}>
          End turn
        </Button>
      </Page.CTAs>
    </Page>
  )
}

TurnScore.propTypes = {
  papersTurn: PropTypes.object.isRequired,
  type: PropTypes.oneOf(['timesup', 'nowords']).isRequired,
  onTogglePaper: PropTypes.func.isRequired,
  onFinish: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  getPaperByKey: PropTypes.func.isRequired,
}

function ItemToggle(props) {
  if (isWeb) {
    return (
      <View style={props.style}>
        {props.children}
        <Button variant="light" size="sm" onPress={props.onPress}>
          Change
        </Button>
      </View>
    )
  }

  return <TouchableHighlight {...props} />
}

ItemToggle.propTypes = {
  children: PropTypes.object.isRequired,
  onPress: PropTypes.func.isRequired,
  style: PropTypes.any,
}

export default TurnScore
