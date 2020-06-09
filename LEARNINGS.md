Here's a list of my learnings while building this mobile game with reac-native.

- My best friends for this new journey: [React Native Docs](https://reactnative.dev/docs), [react-navigation docs](https://reactnavigation.org/) and [Expo](https://docs.expo.io/versions/latest/)

## Javascript

- ❓What's the best way to async/wait and try/catch stuff? Component? Context? "Backend"?

## React Native

- Diff between native ScrollView and react-native-gesture-handler. The 2nd is replacment improved.

## Expo

- [Remove React Navigation 5.x warnings](https://stackoverflow.com/questions/60212460/how-to-remove-reach-navigation-5-x-warnings)
- 🐛 Had to transform a Fn component to a Class, so TextInput would work properly. (HomeSignup). Back in a function component, on each onChangeText, the TextInput would unmount/mount, causing the keyboard to close (and re-open if autoFocus).... have no idea why. Google didn't help :(
- IOS: shadow doesn't work on elements with overflow:hidden (border-radius). ex: Button.
- Upload files to Firebase was a nightmare. See `store/Firebase.js _uploadAvatar()` for more info.

### Release

- [Upload apps](https://docs.expo.io/distribution/uploading-apps/#2-start-the-upload)
- [Troubleshooting turtle-cli](https://github.com/expo/turtle/issues/179). Install node 12.0.0 using `NVM` and try again.
- [Release Channels](https://docs.expo.io/distribution/release-channels/) - Useful to test diff versions (a.k.a staging) for users before going to production.

```bash

# setup boilerplate
turtle setup:ios

# export
expo export --public-url https://papers-game.firebaseapp.com/

# build to ios
expo build:ios --public-url https://papers-game.firebaseapp.com/ios-index.json

# upload to test flight
expo upload:ios --url https://papers-game.firebaseapp.com/ios-index.json

  # create a app-specific password
  https://appleid.apple.com/account/manage

  # wait 5-10 minutes...
```

---

- **Update June 1:**
  So far, my biggest learning was to realize that it's okay to not follow best practices while building a side project / prototype.
  - Three components in the same file? No problem at all.
  - A component with 🍝 code? Add a `TODO`.
  - No unit tests? Making it work is the first test you need.
  - Not sure what's the best place for something? Just do it and leave a `REVIEW`.
  - Remember to have fun and don't be afraid to experiment.
