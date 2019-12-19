// from https://stackoverflow.com/a/23669825/4737729
export function encodeImgToBase64(fileToLoad, callback) {
  var fileReader = new FileReader();

  fileReader.onload = function(fileLoadedEvent) {
    var srcData = fileLoadedEvent.target.result; // <--- data: base64

    var newImage = document.createElement('img');
    newImage.src = srcData;

    return callback(srcData)
    // return srcData
  }
  fileReader.readAsDataURL(fileToLoad);

}