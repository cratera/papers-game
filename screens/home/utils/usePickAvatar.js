import React from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
// import { Camera } from 'expo-camera';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

// import PapersContext from '@store/PapersContext.js';

export default function usePickAvatar() {
  const [isWeb] = React.useState(Platform.OS === 'web');
  // const Papers = React.useContext(PapersContext);

  async function pickAvatar() {
    // Get permission first on iOS. (No need on Android? REVIEW_SECURITY)
    if (Constants.platform.ios) {
      const response = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (!response.granted) {
        if (!isWeb) {
          Alert.alert(
            'Camera denied',
            'Sorry, we need camera roll permissions to make this work!',
            [
              { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
              { text: 'OK', onPress: () => console.log('OK Pressed') },
            ],
            { cancelable: false }
          );
        } else {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: false,
      exif: false,
    });

    console.log('usePickAvatar', result.cancelled ? 'cancelled' : 'done!');
    return result.cancelled ? null : result.uri;
  }

  return pickAvatar;
}
