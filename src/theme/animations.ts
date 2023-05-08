export const fadeCard = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
  },
})
