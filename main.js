// Utility to create HTML element
function createElement(type, attributes = {}, styles = {}) {
  const el = document.createElement(type);

  Object.entries(attributes).forEach(([attr, value]) => {
    if (attr === 'text') el.textContent = value;
    else el.setAttribute(attr, value);
  });

  Object.entries(styles).forEach(([prop, value]) => {
    el.style[prop] = value;
  });

  return el;
}

function formatTime(time) {
  return time < 10 ? time.toString().padStart(2, '0') : time;
}

const link = createElement('link', {
  href: chrome.extension.getURL('style.css'),
  rel: 'stylesheet',
});
document.querySelector('head').appendChild(link);

const body = document.getElementsByTagName('body')[0];

const pomodoroClockContainer = createElement('div', { class: 'clock' });

// hiddenBtn
const toggleHiddenBtn = createElement('button', {
  id: 'toggleHidden',
  text: 'X',
});
toggleHiddenBtn.addEventListener('click', () => {
  const { display: clockDisplay } = pomodoroClockContainer.style;
  const { textContent: hiddenBtnText } = toggleHiddenBtn;

  pomodoroClockContainer.style.display =
    clockDisplay === 'none' ? 'block' : 'none';
  toggleHiddenBtn.textContent = hiddenBtnText === 'X' ? 'Show Clock' : 'X';
});

// container
const container = createElement('div', { class: 'my-container' });

container.appendChild(toggleHiddenBtn);
container.appendChild(pomodoroClockContainer);
body.appendChild(container);

// h1
const h1 = document.createElement('h1');
h1.textContent = 'Pomodoro Timer';
pomodoroClockContainer.append(h1);

// time
const timeDiv = createElement('div', { class: 'time' });

const minutesSpan = createElement('span', { text: '25' });
const colonSpan = createElement('span', { text: ':' });
const secondsSpan = createElement('span', { text: '00' });

timeDiv.appendChild(minutesSpan);
timeDiv.appendChild(colonSpan);
timeDiv.appendChild(secondsSpan);
pomodoroClockContainer.appendChild(timeDiv);

// all buttons
const btnContainer = createElement('div', { class: 'btn-container' });
const startBtn = createElement('button', { id: 'start', text: 'Start' });
const stopBtn = createElement('button', { id: 'stop', text: 'Stop' });
const resetBtn = createElement('button', { id: 'reset', text: 'Reset' });

btnContainer.appendChild(startBtn);
btnContainer.appendChild(stopBtn);
btnContainer.appendChild(resetBtn);
pomodoroClockContainer.appendChild(btnContainer);

// audio
const workAudio = createElement('audio', {
  src: chrome.extension.getURL('work.mp3'),
  class: 'done',
});

const breakAudio = createElement('audio', {
  src: chrome.extension.getURL('break.mp3'),
  class: 'break',
});

pomodoroClockContainer.appendChild(workAudio);
pomodoroClockContainer.appendChild(breakAudio);

// const MINUTES = 25;
// let totalSeconds = MINUTES * 60;
const MINUTES = 1;
const DEFAULT_SECONDS = MINUTES * 3;
const TITLE = document.title;

let totalSeconds = DEFAULT_SECONDS;
let timerIntervalId = null;
let h1IntervalId = null;
let mode = 'WORKING';

function getMinsAndSecs(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  return [minutes, seconds];
}

startBtn.addEventListener('click', () => {
  // Clock is not running
  if (timerIntervalId === null) {
    timerIntervalId = setInterval(() => {
      totalSeconds -= 1;

      // When timeout
      if (totalSeconds === 0) {
        clearInterval(timerIntervalId);
        timerIntervalId = null;
        h1IntervalId = setInterval(() => {
          h1.style.color = h1.style.color === 'crimson' ? 'black' : 'crimson';

          if (mode === 'WORKING') {
            workAudio.play();
          } else {
            breakAudio.play();
          }

          audio.play();
        }, 100);

        // if mode is working,
        if (mode === 'WORKING') {
          mode = 'BREAKING';
          totalSeconds = 7;
        } else {
          mode = 'WORKING';
          totalSeconds = 25 * 60;
        }

        setTimeout(() => {
          clearInterval(h1IntervalId);
          h1IntervalId = null;
        }, 1000);

        startBtn.click();
      }

      // Update time
      const [minutes, seconds] = getMinsAndSecs(totalSeconds);
      const minutesText = formatTime(minutes);
      const secondsText = formatTime(seconds);
      minutesSpan.textContent = minutesText;
      secondsSpan.textContent = secondsText;

      document.title = `${minutesText}:${secondsText} - ${TITLE}`;
    }, 1000);
  }
});

stopBtn.addEventListener('click', () => {
  clearInterval(timerIntervalId);
  timerIntervalId = null;
});

resetBtn.addEventListener('click', () => {
  // There's a clock running
  if (timerIntervalId) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }

  totalSeconds = DEFAULT_SECONDS;
  minutesSpan.textContent = '25';
  secondsSpan.textContent = '00';

  // Clear h1 interval
  clearInterval(h1IntervalId);
  h1IntervalId = null;
});
