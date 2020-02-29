Here's a list of my learnings while building this mobile game with reac-native.

- My best friends for this new journey: [React Native Docs](https://reactnative.dev/docs), [react-navigation docs](https://reactnavigation.org/) and [Expo](https://docs.expo.io/versions/latest/)

# Expo

- [Remove React Navigation 5.x warnings](https://stackoverflow.com/questions/60212460/how-to-remove-reach-navigation-5-x-warnings)
- 🐛 Had to transform a Fn component to a Class, so TextInput would work properly. (HomeSignup). Back in a function component, on each onChangeText, the TextInput would unmount/mount, causing the keyboard to close (and re-open if autoFocus).... have no idea why. Google didn't help :(
