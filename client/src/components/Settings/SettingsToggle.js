/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext } from 'react';
import SettingsModal from './SettingsModal';
import Button from 'components/Button';

import CoreContext from 'store/CoreContext.js';

export default function SettingsToggle(props) {
  const { setModal } = useContext(CoreContext);

  function openSettingsModal() {
    setModal({
      component: SettingsModal,
    });
  }
  return (
    <Button variant="icon" aria-label="Settings" onClick={openSettingsModal}>
      <span role="img" aria-label="">
        ⚙️
      </span>
    </Button>
  );
}
