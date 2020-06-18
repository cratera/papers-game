import React from 'react'
import { Alert, Platform } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as Permissions from 'expo-permissions'

export default function usePickAvatar() {
  const [isWeb] = React.useState(Platform.OS === 'web')

  async function pickAvatar({ camera } = {}) {
    if (!isWeb) {
      const responseCamera = camera
        ? await Permissions.askAsync(Permissions.CAMERA)
        : { granted: true }
      const response = await Permissions.askAsync(Permissions.CAMERA_ROLL)
      if (!response.granted || !responseCamera.granted) {
        if (!isWeb) {
          Alert.alert(
            'Camera denied',
            'Sorry, we need camera roll permissions to make this work!',
            [
              { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
              { text: 'OK', onPress: () => console.log('OK Pressed') },
            ],
            { cancelable: false }
          )
        } else {
          alert('Sorry, we need camera roll permissions to make this work!')
        }
        return
      }
    }

    let result

    if (camera) {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3,
        base64: false,
        exif: false,
      })
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3,
        base64: false,
        exif: false,
      })
    }

    console.log('usePickAvatar', result.cancelled ? 'cancelled' : 'done!')
    return result.cancelled ? null : result.uri

    // We'll go back to this again one day... or not
    // if (result.uri || result.base64) {
    //   if (result.base64) {
    //     const format = result.uri.match(/\.(jpeg|jpg|gif|png)$/)[1]; // hardcoded solution.
    //     console.warn('Photo in base64!', format, result.base64.substring(0, 25));
    //     return `data:image/${format};base64,${result.base64}`;
    //   } else {
    //     console.warn('Photo fallback to uri', result.uri.substring(0, 25));
    //     return result.uri;
    //   }
    // }
  }

  return pickAvatar
}
