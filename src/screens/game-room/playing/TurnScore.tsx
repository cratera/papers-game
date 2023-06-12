import { Platform, Text, TouchableHighlight, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import Button from '@src/components/button'
import Page from '@src/components/page'

import { IconCheck, IconTimes } from '@src/components/icons'

import * as Theme from '@src/theme'
import Styles from './Playing.styles.js'
import { ItemToggleProps, TurnScoreProps } from './Playing.types.js'

const isWeb = Platform.OS === 'web'

const TurnScore = ({
  papersTurn,
  onTogglePaper,
  onFinish,
  isSubmitting,
  getPaperByKey,
}: TurnScoreProps) => {
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
          <Text style={[Theme.typography.h2, Theme.utils.center, Styles.tscore_title]}>
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
                            },
                            !hasGuessed && Styles.tscore_itemTextGuessed,
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
            <Text style={[Theme.typography.secondary, Theme.utils.center, Theme.spacing.mt_40]}>
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

function ItemToggle({ onPress, children, ...props }: ItemToggleProps) {
  if (isWeb) {
    return (
      <View {...props}>
        {children}

        <Button variant="light" size="sm" onPress={onPress}>
          Change
        </Button>
      </View>
    )
  }

  return <TouchableHighlight {...props} />
}

export default TurnScore
