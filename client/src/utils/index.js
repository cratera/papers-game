import { useEffect, useState, useCallback, useRef } from 'react';

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

export function getRandomInt(max) {
  const min = 0;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// React Hook
export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export function useCountdown(initialDate, options = {}) {
  const opts = {
    intervalTime: 1000,
    timer: 60000,
    ...options,
  };
  const [dateStarted, resetDateStarted] = useState(initialDate);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(dateStarted));
  const intervalTime = opts.intervalTime;

  const getTimeLeftCb = useCallback(datePivot => getTimeLeft(datePivot), []); // eslint-disable-line

  function getTimeLeft(datePivot) {
    const timeLeft = opts.timer - (Date.now() - datePivot);
    return Math.max(0, timeLeft);
  }

  function restartCountdown(newDate) {
    setTimeLeft(getTimeLeft(newDate));
    resetDateStarted(newDate);
  }

  useEffect(() => {
    console.log('useEffect - countdown');
    const startedTimeLeft = getTimeLeftCb(dateStarted);
    if (startedTimeLeft === 0) {
      // useCountdown was called with a dateStarted already expired.
      // Probably will use restartCountdown later in the road.
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft(() => {
        const newTimeLeft = getTimeLeftCb(dateStarted);

        if (newTimeLeft <= 0) {
          clearInterval(interval);

          return 0;
        }

        return newTimeLeft;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [dateStarted, getTimeLeftCb, intervalTime]);

  return [timeLeft, restartCountdown];
}
