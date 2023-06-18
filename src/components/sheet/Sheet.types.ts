export interface SheetProps {
  visible: boolean
  onClose: () => void
  list: Array<{
    text: string
    onPress: () => void
  }>
}
