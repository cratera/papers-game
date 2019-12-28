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

export function usePrevious2(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

// IOS HACK - https://stackoverflow.com/a/55425845/4737729
export function focusAndOpenKeyboard(el, timeout = 150) {
  // Align temp input element approximately where the input element is
  // so the cursor doesn't jump around
  // var __tempEl__ = document.createElement('input');
  // __tempEl__.style.position = 'absolute';
  // __tempEl__.style.top = el.offsetTop + 7 + 'px';
  // __tempEl__.style.left = el.offsetLeft + 'px';
  // __tempEl__.style.height = 0;
  // __tempEl__.style.opacity = 0;
  // // Put this temp element as a child of the page <body> and focus on it
  // document.body.appendChild(__tempEl__);
  // __tempEl__.focus();

  // The keyboard is open. Now do a delayed focus on the target element
  // setTimeout(() => {
  el.focus();
  el.click();
  el.focus();
  // Remove the temp element
  // document.body.removeChild(__tempEl__);
  // }, timeout);
}
