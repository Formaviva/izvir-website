// countdown Timer
const countdownElement = document.getElementById('countdown');
const countdownDate = new Date('August 12, 2023 00:00:00').getTime();

const updateCountdown = () => {
  const now = new Date().getTime();
  const distance = countdownDate - now;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;

  if (distance < 0) {
    countdownElement.innerHTML = 'Event has ended';
  }
};

setInterval(updateCountdown, 1000);

// strobe
function startStrobe() {
  setTimeout(function () {
    var flashes = getRandomNumber(10, 15);
    console.log('stroke rescue', flashes);
    performFlashes(flashes);
    startStrobe();
  }, getRandomNumber(10000, 20000));
}

function performFlashes(count) {
  const god = document.getElementById("god");
  // document.body.
  // god.style.animation = 'strobe 0.05s ' + count;
  god.classList.remove("strobe");

  setTimeout(function () {
    // document.body.style.animation = '';
    const god = document.getElementById("god");
    god.classList.add("strobe");
    // performFlashes(count - 1);
  }, 5000);
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

startStrobe();