import React from 'react';
import { Button, View, StyleSheet, Text } from 'react-native';

import PapersContext from '@store/PapersContext.js';

export default function Playing() {
  const Papers = React.useContext(PapersContext);

  return <Text>Playing</Text>;
}
