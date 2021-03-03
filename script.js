// ChangeSpec
import { constants } from "./consts.js";
import "../tracking.js-master/build/tracking-min.js";
import "../tracking.js-master/build/data/eye-min.js";
import "../tracking.js-master/build/data/face-min.js";

// SELECTORS
const trySpecBtn = document.querySelector(".try-spec-btn");
const trySpecBtnImg = document.querySelector("#try-spec-btn-img");
const snapPhoto = document.querySelector("#snap");
const userVideo = document.querySelector("#video");
const specDiv = document.querySelector(constants.specDivClassName);
const nextSpecBtn = document.querySelector("#next-spec");
const prevSpecBtn = document.querySelector("#prev-spec");
const nextSpecBtnImg = nextSpecBtn.firstElementChild;
const prevSpecBtnImg = prevSpecBtn.firstElementChild;
const cameraShutterImg = document.querySelector("#camera-shutter-img");

cameraShutterImg.classList.add(constants.animations.cameraShutterOffClassName);
let face = document.querySelector("#clicked-img");
trySpecBtnImg.src = constants.trySpecsDisabledIcon;

// SOUNDS
const cameraShutterSound = document.querySelector("#camera-shutter");
const correctSound = document.querySelector("#correct-sound");
const wrongSound = document.querySelector("#wrong-sound");

// INITIALIZATION
let specPathIndex = 0;
let specPath = constants.specPaths[specPathIndex];
let showOutline = true;
let accurateFaceFeatures;
let accurateEyeFeatures;
window.value = [];

nextSpecBtnImg.style.width = "0px";
nextSpecBtnImg.style.height = "0px";
prevSpecBtnImg.style.width = "0px";
prevSpecBtnImg.style.height = "0px";

// RUNS AFTER THE WINDOW HAS LOADED
const init = () => {
  window.img = face;

  // EVENT LISTENERS
  trySpecBtn.addEventListener("click", addSpecs);
  snapPhoto.addEventListener("click", trackImage);
  nextSpecBtn.addEventListener("click", renderNextSpec, 1);
  prevSpecBtn.addEventListener("click", renderPrevSpec, -1);
  console.log("added event listeners");
};

const trackImage = (event) => {
  nextSpecBtnImg.src = "";
  prevSpecBtnImg.src = "";
  prevSpecBtnImg.style.width = "0px";
  prevSpecBtnImg.style.height = "0px";
  nextSpecBtnImg.style.width = "0px";
  nextSpecBtnImg.style.height = "0px";

  const personIcon = document.querySelector("#person-icon");
  if (personIcon != null) personIcon.remove();

  deleteOldRects();

  const oldSpec = document.querySelector("#spec");
  if (oldSpec != null) {
    oldSpec.src = "";
    oldSpec.style.height = "0px";
    oldSpec.style.width = "0px";
  }

  // removing old rects data
  window.value = [];

  let faceTracker = new tracking.ObjectTracker(["face"]);
  let eyeTracker = new tracking.ObjectTracker(["eye"]);

  window.faceTracker = faceTracker;
  window.eyetracker = eyeTracker;

  faceTracker.setInitialScale(4);
  faceTracker.setStepSize(2);
  faceTracker.setEdgesDensity(0.1);

  eyeTracker.setInitialScale(4);
  eyeTracker.setStepSize(1.7);
  eyeTracker.setEdgesDensity(0.1);

  eyeTracker.setInitialScale(2);
  eyeTracker.setStepSize(1);

  // Camera chutter animation
  cameraShutterImg.classList.add(constants.animations.cameraShutterOnClassName);
  cameraShutterImg.classList.remove(
    constants.animations.cameraShutterOffClassName
  );
  cameraShutterSound.play();
  setTimeout(function () {
    cameraShutterImg.classList.remove(
      constants.animations.cameraShutterOnClassName
    );
    cameraShutterImg.classList.add(
      constants.animations.cameraShutterOffClassName
    );
    console.log(window.img, eyeTracker, faceTracker);
    trackFeatures(window.img, faceTracker);
    trackFeatures(window.img, eyeTracker);

    faceTracker.on("track", function (event) {
      accurateFaceFeatures = accurateDetection(event, 1, "face");
    });

    eyeTracker.on("track", function (event) {
      accurateEyeFeatures = accurateDetection(event, 2, "eye");
    });

    setTimeout(function () {
      if (accurateEyeFeatures && accurateFaceFeatures) {
        correctSound.play();
        trySpecBtnImg.src = constants.trySpecsIcon;
        console.log("correct");
        console.log(accurateEyeFeatures, accurateFaceFeatures);
      } else {
        wrongSound.play();
        trySpecBtnImg.src = constants.trySpecsDisabledIcon;
        console.log(`Wrong`);
      }
    }, 500);
  }, 1000);
};

const deleteOldRects = () => {
  while (true) {
    const oldRect = document.querySelector(
      `.${constants.eyeDetectionOutlineClassName}`
    );
    try {
      oldRect.remove();
    } catch {
      break;
    }
  }
};

const addSpecs = (event) => {
  let tracker = window.faceTracker;
  if (accurateEyeFeatures && accurateFaceFeatures) {
    // userVideo.remove();
    nextSpecBtnImg.src = constants.nextSpecBtnPath;
    prevSpecBtnImg.src = constants.prevSpecBtnPath;
    nextSpecBtnImg.style.width = "50px";
    nextSpecBtnImg.style.height = "50px";
    prevSpecBtnImg.style.width = "50px";
    prevSpecBtnImg.style.height = "50px";
    let coords = giveSpecCoords(tracker);
    console.log(coords);
    renderSpec(specDiv, specPath, coords);
  }
};

const trackFeatures = (face, tracker) => {
  tracking.track(face, tracker);
  showDetectedFeatureOutline(tracker, face, showOutline);
};

const accurateDetection = (data, featureLength, type) => {
  const features = data.data.length;
  if (features === featureLength) {
    console.log(`The ${type} detection passed with ${features} features.`);
    return true;
  } else {
    console.log(`The ${type} detection failed with ${features} features.`);
    return false;
  }
};

const showDetectedFeatureOutline = (tracker, face, showOutline) => {
  let rects = [];
  tracker.on("track", function (event) {
    event.data.forEach(function (rect) {
      renderFeatureDetectionOutline(
        rect.x,
        rect.y,
        rect.width,
        rect.height,
        face
      );
      rects.push(rect);
    });
  });
  window.value.push(rects);
};

const renderFeatureDetectionOutline = (x, y, w, h, image) => {
  let rect = document.createElement("div");
  document.querySelector(constants.rectsDivClassName).appendChild(rect);
  rect.classList.add(constants.eyeDetectionOutlineClassName);
  if (!showOutline) rect.classList.add(constants.rectTransparentColorClassName);
  rect.style.width = `${w}px`;
  rect.style.height = `${h}px`;
  rect.style.left = `${image.offsetLeft + x}px`;
  rect.style.top = `${image.offsetTop + y}px`;
};

const giveSpecCoords = (tracker) => {
  const rects = window.value;
  const face = rects[0][0];
  const eye1 = rects[1][0];
  const eye2 = rects[1][1];
  console.log(rects[1][1]);

  console.log(rects);

  let biggerEyeWidth = Math.max(eye1.width, eye2.width);
  let biggerEye;
  let rightEye;
  let leftEye;

  if (eye1.width === biggerEyeWidth) biggerEye = eye1;
  else biggerEye = eye2;

  if (eye1.left < eye2.left) {
    rightEye = eye1;
    leftEye = eye2;
  } else {
    rightEye = eye2;
    leftEye = eye1;
  }

  console.log(`RightEye: ${rightEye}, LeftEye: ${leftEye}`);

  console.log(`face: ${face}, eye1: ${eye1}, eye2: ${eye2}`);

  const eyesCenter = (rightEye.x + (leftEye.x + leftEye.width)) / 2;
  const coordinates = {
    left: eyesCenter + window.img.offsetLeft - face.width * 0.4,
    top: biggerEye.y + window.img.offsetTop - biggerEye.y * 0.03,
    width: face.width - face.width * 0.1,
    height: biggerEye.width + biggerEye.width * 0.4,
  };

  window.coordinates = coordinates;
  return coordinates;
};

const renderSpec = (container, spec, coordinates) => {
  deleteOldRects();

  const x = coordinates.left;
  const y = coordinates.top;
  const height = coordinates.height;
  const width = coordinates.width;

  container.style.left = `${x}px`;
  container.style.top = `${y}px`;
  container.style.height = `${height}px`;
  container.style.width = `${width}px`;
  container.src = spec;

  console.log(container, x, y, spec);
  console.log(`rendering specs`);
};

const renderNextSpec = (event) => {
  if (specPathIndex < constants.specPaths.length - 1) {
    specPathIndex += 1;
  } else {
    specPathIndex = 0;
  }

  console.log(`SpecPathINdex: ${specPathIndex}, SpecPath: ${specPath}`);
  specPath = constants.specPaths[specPathIndex];
  renderSpec(specDiv, specPath, window.coordinates);
};

const renderPrevSpec = (event) => {
  if (specPathIndex != 0) {
    specPathIndex -= 1;
  } else {
    specPathIndex = constants.specPaths.length - 1;
  }

  console.log(`SpecPathINdex: ${specPathIndex}, SpecPath: ${specPath}`);
  specPath = constants.specPaths[specPathIndex];
  renderSpec(specDiv, specPath, window.coordinates);
};

window.onload = init;
