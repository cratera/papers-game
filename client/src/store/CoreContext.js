import React, { useState } from 'react';

const CoreContext = React.createContext({});

export const CoreContextProvider = ({ children }) => {
  const [state, setState] = useState({
    modal: {
      component: null, // Component - a modal
      props: null, // Object - to be passed to the modal
    },
  });

  function setModal(modal) {
    setState(state => ({ ...state, modal }));
  }

  function closeModal() {
    setState(state => ({ ...state, modal: {} }));
  }

  const methods = {
    setModal,
    closeModal,
  };

  return (
    <CoreContext.Provider value={{ ...state, ...methods }}>
      {children}
    </CoreContext.Provider>
  );
};

export default CoreContext;
