// Sheet.propTypes = {
//   visible: PropTypes.bool.isRequired,
//   onClose: PropTypes.func.isRequired,
//   list: PropTypes.arrayOf(
//     PropTypes.shape({
//       text: PropTypes.node.isRequired,
//       onPress: PropTypes.func.isRequired,
//     })
//   ).isRequired,
// }

export interface SheetProps {
  visible: boolean
  onClose: () => void
  list: Array<{
    text: string
    onPress: () => void
  }>
}
