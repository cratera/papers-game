import { ComponentType } from 'react'

/**
 * This HOC is used to apply Tailwind CSS to the web version of the app.
 *
 * We essentially just return the component as-is, the only thing that changes is that the `tailwind.css` file is imported on the web version of the app.
 *
 * We have to do this because importing a `.css` file on the native version of the app causes it to crash.
 */
const withTailwind = <P extends object>(Component: ComponentType<P>) => Component

export default withTailwind
