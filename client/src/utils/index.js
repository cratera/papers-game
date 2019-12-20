// based on https://stackoverflow.com/a/23669825/4737729
export function encodeImgToBase64(fileToLoad, callback) {
  const fileReader = new FileReader();

  fileReader.onload = function(fileLoadedEvent) {
    return callback(fileLoadedEvent.target.result);
  };

  fileReader.readAsDataURL(fileToLoad);
}
