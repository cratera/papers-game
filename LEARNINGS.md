Here's a list of my learnings while building this mobile game with reac-native.

- My best friends for this new journey: [React Native Docs](https://reactnative.dev/docs), [react-navigation docs](https://reactnavigation.org/) and [Expo](https://docs.expo.io/versions/latest/)

# Stack

## React Native

- Diff between native ScrollView and react-native-gesture-handler. The 2nd is replacment improved.
- ❓What's the best way to async/wait and try/catch stuff? Component? Context? "Backend"?
- Those react-navigation screen animations are hard to understand... still need to learn it
- 🐛Firefox: width/height must be a number. If it's a string, it does not work. (found when using icons)
- Do a simple carousel/slider (for WritePapers) - based [on this code](https://github.com/catalinmiron/react-native-aiaiai-carousel-animation)
- Android: `<Views/>` inside `<Text/>` must have explicit width and height.
- Android: Use `keyboardType="visible-password"` in `TextInput` to remove auto suggestions (gif, photo, etc...)
- Custom header height - [avoid screen jumps](https://github.com/react-navigation/react-navigation/issues/5936)
- In-App Purchases:
  - Expo Managed doesn't support it. That was the main reason to eject to Bare React Native (SDK40).
  - Use [RevenueCat](revenuecat.com). Their docs are awesome. This [YT tutorial](https://www.youtube.com/watch?v=l_Cm906w640&ab_channel=CodeWithChris) helped a lot too.

## Expo

- [Remove React Navigation 5.x warnings](https://stackoverflow.com/questions/60212460/how-to-remove-reach-navigation-5-x-warnings)
- 🐛 Had to transform a Fn component to a Class, so TextInput would work properly. (HomeSignup). Back in a function component, on each onChangeText, the TextInput would unmount/mount, causing the keyboard to close (and re-open if autoFocus).... have no idea why. Google didn't help :(
- IOS: shadow doesn't work on elements with overflow:hidden (border-radius). ex: Button.
- Upload files to Firebase was a nightmare. See `store/Firebase.js _uploadAvatar()` for more info.
- 📝 Didn't understand how to handle errors [expo ErrorRecovery](https://docs.expo.io/versions/v37.0.0/sdk/error-recovery/).
  - Update 2 days later: Use a React class component with Error Boundary. (App.js -> AppFn.js)
- Add [firebase-analytics](https://docs.expo.io/versions/latest/sdk/firebase-analytics/). Update. Do NOT forget to [release a iOS build to TestFlight](https://github.com/expo/expo/issues/8277)
- Use [Sentry expo and web](https://github.com/expo/sentry-expo/issues/77#issuecomment-646099545)
- CocoaPods - When u need to install the latest version, use `pod update` and `pod install`.

# Releases

## Apple / IOS

### Requirements

- XCode. (App Store)
- If 1st time, make sure to "Run on iOS simulator" on Expo at least once.
- fastlane: `brew install fastlane`
- turtle-cli: `npm install -g turtle-cli` (DO NOT use sudo) [Read bug](https://github.com/expo/turtle/issues/247)
- Firebase: `sudo npm install -g firebase-tools`
- If 1st time create manually a `/dist` in the root project.
- If 1st time, connect firebase target (similar to git setupstream): `firebase target:apply hosting native papers-native`

### OTA update

A single command does it all. Under the wood it:

- Sets the Sentry auth token
- Run turtle ios to ensure all's fine
- Exports expo project to firebase CDN endpoint
- Deploys the IOS app to firebase

```bash
yarn release:ota -- -m "x.x.x@xx ![release summary]"
```

### Publishing to App Store

#### With Bare React Native

1. Follow [React Guide](https://reactnative.dev/docs/next/publishing-to-app-store)

- 1.1 Edit NSAllowsArbitraryLoads entries (Info Pane)
- 1.2 Product -> Scheme -> Edit Release
- 1.3 _(Skipped)_ LaunchScreen didn't work (check comments in fiel code)

2. Update "build version" at General tab

3. Go Product > Archive. Follow the wizard instructions and voilà.

#### With Expo Managed

_Note: This was used during SDK37. Now, with +SDK40, I use Bare workflow only._

Build a local standalone app IPA ready for Apple App Store

1. Run the OTA update command first.

- 1.1. If 1st time in a new Mac, fetch the certificates made by expo.

```bash
expo fetch:ios:certs
```

2. Update app.json with new version

3. Build everything (~1-2min)

```
  EXPO_IOS_DIST_P12_PASSWORD=<PASS> turtle build:ios --public-url https://papers-native.firebaseapp.com/ios-index.json --team-id <TEAMID> --dist-p12-path secrets/papers-game_dist.p12 --provisioning-profile-path secrets/papers-game.mobileprovision
```

A build path with `.ipa` file is shown in the last lines of log... something like: `/Users/path-to/expo-apps/@anonymous\_\_papers-game-....8-archive.ipa

4. Upload to test flight

```bash
expo upload:ios --path path/to/archive.ipa
```

- 4.1. After a few seconds it asks for apple id credentials.
- 4.2. After a 1-2 min it asks for app-specific password. Go to secrets or https://appleid.apple.com/account/manage
- 4.3. Wait 2min... and then wait ~20 minutes more... be patient...
- 4.4. After, go to AppStoreConnect. The the new build is there. It will take a few hours to process it

Apple store "Missing Compliance" - [Stackoverflow guide](https://stackoverflow.com/questions/63613197/app-store-help-answering-missing-compliance-using-expo-firebase/63613422#63613422)

## Web

```bash
yarn release:web -- -m "x.x.x@xx ![release summary]"
```

---

## Release Troubleshooting

Links that helped me during the journey to figure out the release process:

- [(Expo Bare): Upload apps](https://docs.expo.io/distribution/uploading-apps/#2-start-the-upload)
- [Troubleshooting turtle-cli](https://github.com/expo/turtle/issues/179). Install node 12.0.0 using `NVM` and try again.
- [Change owner access node modules - to install turtle](https://stackoverflow.com/questions/48910876/error-eacces-permission-denied-access-usr-local-lib-node-modules-react)
- [Change between node versions using nvm](https://stackoverflow.com/questions/47763783/cant-uninstall-global-npm-packages-after-installing-nvm)
- [(Expo Managed): Release Channels](https://docs.expo.io/distribution/release-channels/) - Useful to test diff versions (a.k.a staging) for users before going to production.
- [HTTP Headers for firebase](https://github.com/expo/expo/issues/4069)
- [How to use dotenv (.env vars) in package.json](https://medium.com/@arrayknight/how-to-use-env-variables-in-package-json-509b9b663867)
- [(Expo Bare): Custom Fonts weren't working in the release version](https://dev.to/kennymark/using-custom-fonts-in-react-native-21j7) and [this solution](https://github.com/oblador/react-native-vector-icons/issues/1074#issuecomment-534053163)

---

- **Update June 1:**
  So far, my biggest learning was to realize that it's okay to not follow best practices while building a side project / prototype.
  - Three components in the same file? No problem at all.
  - A component with 🍝 code? Add a `TODO`.
  - No unit tests? Making it work is the first test you need.
  - Not sure what's the best place for something? Just do it and leave a `REVIEW`.
  - Remember to have fun and don't be afraid to experiment.

```

```
