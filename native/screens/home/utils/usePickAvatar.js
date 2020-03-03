import React, { useContext } from 'react';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

import PapersContext from '@store/PapersContext.js';

export default function usePickAvatar() {
  const Papers = useContext(PapersContext);

  async function pickAvatar() {
    // Get permission first on iOS. (No need on Android? REVIEW_SECURITY)
    if (Constants.platform.ios) {
      const response = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (!response.granted) {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
      exif: false,
    });

    if (result.uri || result.base64) {
      return result.uri || `data:image/png;base64,${result.base64}`;
    }
    console.log('usePickAvatar canceleed', result);
    return null;
  }

  return pickAvatar;
}
