const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const video = document.getElementById("video");
const clickPhotoBtn = document.querySelector("#snap");
const img = document.getElementById("clicked-img");

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
    //video.src = window.URL.createObjectURL(stream);
    video.srcObject = stream;
    video.play();
  });
}

clickPhotoBtn.addEventListener("click", function () {
  context.drawImage(video, 0, 0, 640, 480);
  canvas.remove();
  setTimeout(function () {
    img.src = canvas.toDataURL();
    document.body.appendChild(img);
  }, 500);
});
