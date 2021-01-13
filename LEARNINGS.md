Here's a list of my learnings while building this mobile game with reac-native.

- My best friends for this new journey: [React Native Docs](https://reactnative.dev/docs), [react-navigation docs](https://reactnavigation.org/) and [Expo](https://docs.expo.io/versions/latest/)

## React Native

- Diff between native ScrollView and react-native-gesture-handler. The 2nd is replacment improved.
- ❓What's the best way to async/wait and try/catch stuff? Component? Context? "Backend"?
- Those react-navigation screen animations are hard to understand... still need to learn it
- 🐛Firefox: width/height must be a number. If it's a string, it does not work. (found when using icons)
- Do a simple carousel/slider (for WritePapers) - based [on this code](https://github.com/catalinmiron/react-native-aiaiai-carousel-animation)
- Android: `<Views/>` inside `<Text/>` must have explicit width and height.
- Android: Use `keyboardType="visible-password"` in `TextInput` to remove auto suggestions (gif, photo, etc...)
- Custom header height - [avoid screen jumps](https://github.com/react-navigation/react-navigation/issues/5936)

## Expo

- [Remove React Navigation 5.x warnings](https://stackoverflow.com/questions/60212460/how-to-remove-reach-navigation-5-x-warnings)
- 🐛 Had to transform a Fn component to a Class, so TextInput would work properly. (HomeSignup). Back in a function component, on each onChangeText, the TextInput would unmount/mount, causing the keyboard to close (and re-open if autoFocus).... have no idea why. Google didn't help :(
- IOS: shadow doesn't work on elements with overflow:hidden (border-radius). ex: Button.
- Upload files to Firebase was a nightmare. See `store/Firebase.js _uploadAvatar()` for more info.
- 📝 Didn't understand how to handle errors [expo ErrorRecovery](https://docs.expo.io/versions/v37.0.0/sdk/error-recovery/).
  - Update 2 days later: Use a React class component with Error Boundary. (App.js -> AppFn.js)
- Add [firebase-analytics](https://docs.expo.io/versions/latest/sdk/firebase-analytics/). Update. Do NOT forget to [release a iOS build to TestFlight](https://github.com/expo/expo/issues/8277)
- Use [Sentry expo and web](https://github.com/expo/sentry-expo/issues/77#issuecomment-646099545)

### Release

- [Upload apps](https://docs.expo.io/distribution/uploading-apps/#2-start-the-upload)
- [Troubleshooting turtle-cli](https://github.com/expo/turtle/issues/179). Install node 12.0.0 using `NVM` and try again.
- [Change owner access node modules - to install turtle](https://stackoverflow.com/questions/48910876/error-eacces-permission-denied-access-usr-local-lib-node-modules-react)
- [Change between node versions using nvm](https://stackoverflow.com/questions/47763783/cant-uninstall-global-npm-packages-after-installing-nvm)
- [Release Channels](https://docs.expo.io/distribution/release-channels/) - Useful to test diff versions (a.k.a staging) for users before going to production.
- [HTTP Headers for firebase](https://github.com/expo/expo/issues/4069)
- [How to use dotenv (.env vars) in package.json](https://medium.com/@arrayknight/how-to-use-env-variables-in-package-json-509b9b663867)

```bash
# RELEASE WEB
yarn release:web -- -m "x.x.x@xx ![release summary]"
```

```bash
# RELEASE IOS

## Update version:
  ## If it's a release to App Store, update "version" at `app.json`.
  ## Update "about" version and/or OTA at `PapersContext.js`.

## Requirements:
  ### - XCode. (App Store)
  ###   - If 1st time, make sure to "Run on iOS simulator" on Expo at least once.
  ### - fastlane: $ brew install fastlane
  ### - turtle-cli: $ npm install -g turtle-cli (DO NOT use sudo) [Read bug](https://github.com/expo/turtle/issues/247)
  ### - Firebase: $ sudo npm install -g firebase-tools
  ### - If 1st time create manually a /dist in the root project
  ### -  1st time, connect firebase target (similar to git setupstream): $ firebase target:apply hosting native papers-native

# OTA update:
## A single command. Under the wood it:
### - Sets the Sentry auth token
### - Run turtle ios to ensure all's fine
### - Exports expo project to firebase CDN endpoint
### - Deploys the IOS app to firebase
yarn release:ota -- -m "x.x.x@xx ![release summary]"

# App Store build
## build a local standalone app IPA ready for Apple App Store
  ## Run the release:ota first

  ## 1º time in a new mac, fetch the certificates made by expo.
  ## expo fetch:ios:certs

  ## UPDATE APP.JSON WITH NEW VERSION

  # build everything (~1-2min)
  EXPO_IOS_DIST_P12_PASSWORD=<PASS> turtle build:ios --public-url https://papers-native.firebaseapp.com/ios-index.json --team-id <TEAMID> --dist-p12-path secrets/papers-game_dist.p12 --provisioning-profile-path secrets/papers-game.mobileprovision

  # a build path is shown in the last lines of log... something like:
  ## /Users/sandrina-p/expo-apps/@anonymous__papers-game-....8-archive.ipa

  # upload to test flight
  expo upload:ios --path path/to/archive.ipa

  # after a few seconds it asks for apple id credentials.
  # after a 1-2 min it asks for app-specific password
  # Go to secrets or https://appleid.apple.com/account/manage

  # wait 2min... and then wait ~20 minutes more... be patient...
  # After, go to AppStoreConnect. The the new build is there. It will take a few hours to process it
```

---

- **Update June 1:**
  So far, my biggest learning was to realize that it's okay to not follow best practices while building a side project / prototype.
  - Three components in the same file? No problem at all.
  - A component with 🍝 code? Add a `TODO`.
  - No unit tests? Making it work is the first test you need.
  - Not sure what's the best place for something? Just do it and leave a `REVIEW`.
  - Remember to have fun and don't be afraid to experiment.

---

## Expo eject to bare

- `npm run expo` was okay. Had to add password for Cocoa (no explicit prompt)
- Used `npx @react-native-community/cli doctor`. Nothing critical.
- Ran `yarn web` and `yarn ios`. All fine (test new account + new game 3 players. Web + Simular + iPhone12)
