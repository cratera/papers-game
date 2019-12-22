import { useEffect, useRef } from 'react';

// based on https://stackoverflow.com/a/23669825/4737729
export function encodeImgToBase64(fileToLoad, callback) {
  const fileReader = new FileReader();

  fileReader.onload = function(fileLoadedEvent) {
    return callback(fileLoadedEvent.target.result);
  };

  fileReader.readAsDataURL(fileToLoad);
}

export function createUniqueId(name) {
  // Q: maybe this should be created on server instead.
  // prettier-ignore
  return `${name}_${Math.random().toString(36).substr(2, 9)}_${new Date().getTime()}`;
}

// React Hook
export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
