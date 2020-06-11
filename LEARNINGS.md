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
- [HTTP Headers for firebase](https://github.com/expo/expo/issues/4069)

```bash

# RELEASE IOS

# Update version:
  ## If it's a release to App Store, update "version" at `app.json`.
  ## Update "about" version and/or OTA at `PapersContext.js`.

# verify everything is okay
turtle setup:ios

# export app with explicit CDN endpoint
rm -R dist && expo export --public-url https://papers-native.firebaseapp.com/

# deploy the IOS app to firebase

  ## do this only first time to apply (like git setupstream, I guess?)
  ### firebase target:apply hosting native papers-native

  # deploy
  firebase deploy --only hosting:native -m "[description]"

# build a local standalone app IPA ready for Apple App Store
  # fetch the certificates made by expo previously (only first time)
  ## expo fetch:ios:certs

  # build it
  EXPO_IOS_DIST_P12_PASSWORD=<pass> turtle build:ios --public-url https://papers-native.firebaseapp.com/ios-index.json --team-id <teamid> --dist-p12-path papers-game_dist.p12 --provisioning-profile-path papers-game.mobileprovision

  # a build path is shown in the last lines of log... something like:
  ## /Users/sandrina-p/expo-apps/@anonymous__papers-game-....8-archive.ipa

# upload to test flight
expo upload:ios --path path/to/archive.ipa

  # after a few seconds it asks for app-specific password
  https://appleid.apple.com/account/manage

  # wait 1min... and then wait more ~15 minutes... be patient...
  # After, go to AppStoreConnect. The the new build is there. It will take a few hours to process the build


# RELEASE WEB
expo build:web && firebase deploy --only hosting:web
```

---

- **Update June 1:**
  So far, my biggest learning was to realize that it's okay to not follow best practices while building a side project / prototype.
  - Three components in the same file? No problem at all.
  - A component with 🍝 code? Add a `TODO`.
  - No unit tests? Making it work is the first test you need.
  - Not sure what's the best place for something? Just do it and leave a `REVIEW`.
  - Remember to have fun and don't be afraid to experiment.
