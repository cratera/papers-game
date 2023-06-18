import { StackCardInterpolationProps } from '@react-navigation/stack'

export const fadeCard = ({ current }: StackCardInterpolationProps) => ({
  cardStyle: {
    opacity: current.progress,
  },
})
