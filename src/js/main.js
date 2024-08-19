let buildingState = {};
let numFloors = 5;
let numLifts = 1;

document.getElementById("floors").addEventListener("input", (event) => {
  let maxLimit = parseInt(document.getElementById("max").value);
  if (maxLimit < 2) {
    document.getElementById("max-error").style.display == "block";
  } else {
    document.getElementById("max-error").style.display == "none";
  }
  value = parseInt(event.target.value);
  if (value > maxLimit) {
    document.getElementById("max-floor").style.display = "block";
  } else if (value < 2) {
    document.getElementById("min-floor").style.display = "block";
  } else {
    document.getElementById("max-floor").style.display = "none";
    document.getElementById("min-floor").style.display = "none";
  }
});
document.getElementById("lifts").addEventListener("input", (event) => {
  let maxLimit = parseInt(document.getElementById("max").value);
  if (maxLimit < 2) {
    document.getElementById("max-error").style.display == "block";
  } else {
    document.getElementById("max-error").style.display == "none";
  }
  value = parseInt(event.target.value);
  if (value > maxLimit) {
    document.getElementById("max-lift").style.display = "block";
  } else if (value < 1) {
    document.getElementById("min-lift").style.display = "block";
  } else {
    document.getElementById("max-lift").style.display = "none";
    document.getElementById("min-lift").style.display = "none";
  }
});

document.getElementById("submit").addEventListener("click", (event) => {
  event.preventDefault();
  let maxLimit = parseInt(document.getElementById("max").value);
  let totalFloors = parseInt(document.getElementById("floors").value);
  let totalLifts = parseInt(document.getElementById("lifts").value);
  if (
    totalFloors > maxLimit ||
    totalLifts > maxLimit ||
    totalFloors < 2 ||
    totalLifts < 1
  )
    return;
  initialize();
});

const directions = Object.freeze({
  Up: "up",
  Down: "down",
});

const createButton = (dir, index) => {
  const buttonRef = document.createElement("div");
  buttonRef.className = "btn";
  buttonRef.innerHTML = dir === directions.Up ? "&#11165;" : "&#11167;";
  buttonRef.addEventListener("click", () => callLift(index, dir));
  return buttonRef;
};

const createLifts = (floorRef) => {
  for (let j = 0; j < numLifts; j++) {
    const lift = document.createElement("div");
    lift.className = "lift";
    lift.id = `lift-${j}`;
    floorRef.appendChild(lift);
  }
};

const generateFloor = (buildingRef) => {
  for (let i = numFloors - 1; i >=0; i--) {
    const floorRef = document.createElement("div");
    floorRef.className = "floor";
    floorRef.id = `floor-${i}`;

    const buttons = document.createElement("div");
    const floorCount = document.createElement('div');
    floorCount.innerHTML = `<h3>${i}</h3>`;
    floorRef.appendChild(floorCount);

    buttons.className = "floor-buttons";

    if (i !== numFloors - 1)
      buttons.appendChild(createButton(directions.Up, i));
    if (i !== 0) buttons.appendChild(createButton(directions.Down, i));

    floorRef.appendChild(buttons);

    if (i === 0) createLifts(floorRef);

    buildingRef.appendChild(floorRef);
  }
};

function initialize() {
  const buildingRef = document.getElementById("building");
  numFloors = document.getElementById("floors").value;
  numLifts = document.getElementById("lifts").value;

  buildingRef.innerHTML = ""; // Clear previous state

  buildingState = {
    floors: numFloors,
    lifts: numLifts,
    liftState: Array.from({ length: numLifts }, () => ({
      pos: 0,
      dir: null,
      busy: false,
    })),
    calls: [],
  };

  // Generate floors and lifts
  generateFloor(buildingRef);
}

function callLift(floorNumber, direction) {
  if (
    buildingState.calls.some(
      (call) => call.floorNumber === floorNumber && call.direction === direction
    )
  )
    return;

  const liftsAtFloor = buildingState.liftState.filter(
    (state) => state.pos === floorNumber
  ).length;

  if (liftsAtFloor >= 2) return;

  if (liftsAtFloor == 1 && buildingState.liftState.length == 1) return;

  if (
    liftsAtFloor == 1 &&
    buildingState.liftState.some(
      (state) => state.pos === floorNumber && state.dir === direction
    )
  )
    return;

  buildingState.calls.push({ floorNumber, direction });
  processLifts();
}

function processLifts() {
  if (buildingState.calls.length === 0) return;

  const { floorNumber, direction } = buildingState.calls.shift();
  const availableLiftIndex = findAvailableLift(floorNumber, direction);

  if (availableLiftIndex === -1) {
    buildingState.calls.unshift({ floorNumber, direction });
    setTimeout(processLifts, 500);
    return;
  }

  const liftElement = document.getElementById(`lift-${availableLiftIndex}`);
  const currentLiftPosition = buildingState.liftState[availableLiftIndex].pos;

  const distance = Math.abs(currentLiftPosition - floorNumber);
  const travelTime = distance * 2000;

  buildingState.liftState[availableLiftIndex].busy = true;
  buildingState.liftState[availableLiftIndex].pos = floorNumber;
  buildingState.liftState[availableLiftIndex].dir = direction;

  liftElement.style.transform = `translateY(-${floorNumber * 120}px)`;

  setTimeout(() => {
    openAndCloseDoors(availableLiftIndex, floorNumber);
  }, travelTime);
}

function findAvailableLift(floorNumber, direction) {
  // Prioritize lifts that are free and match the direction or have no direction assigned yet
  let availableLiftIndex = -1;
  for (let i = 0; i < buildingState.lifts; i++) {
    if (
      !buildingState.liftState[i].busy &&
      (buildingState.liftState[i].dir === null ||
        buildingState.liftState[i].dir === direction) &&
      buildingState.liftState[i].pos !== floorNumber
    ) {
      availableLiftIndex = i;
      break;
    }
  }
  return availableLiftIndex;
}

function openAndCloseDoors(liftIndex, floorNumber) {
  const liftElement = document.getElementById(`lift-${liftIndex}`);

  setTimeout(() => {
    buildingState.liftState[liftIndex].busy = false;
    buildingState.liftState[liftIndex].dir = null;
    processLifts();
  }, 2500);
}
