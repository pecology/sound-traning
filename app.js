const notes = [
    { name: 'C', frequency: 261.63 },
    { name: 'D', frequency: 293.66 },
    { name: 'E', frequency: 329.63 },
    { name: 'F', frequency: 349.23 },
    { name: 'G', frequency: 392.00 },
    { name: 'A', frequency: 440.00 },
    { name: 'B', frequency: 493.88 },
    { name: 'C2', frequency: 523.25 }
];

const chords = [
    { name: 'C', frequencies: [261.63, 329.63, 523.25] }, // オープンボイシング
    { name: 'Am', frequencies: [220.00, 329.63, 523.25] }, // オープンボイシング
    { name: 'Dm', frequencies: [293.66, 349.23, 523.25] }, // オープンボイシング
    { name: 'G', frequencies: [196.00, 392.00, 523.25] } // オープンボイシング
];

let audioCtx;
let sequence = [];
let userSequence = [];
let currentStep = 0;
let chordInterval;

function createOscillator(frequency, type = 'sine') {
    const oscillator = audioCtx.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    return oscillator;
}

function playTone(frequency, duration, type = 'sine') {
    const oscillator = createOscillator(frequency, type);
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime); // 音量調整
    oscillator.connect(gainNode).connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

function playChord(frequencies, duration) {
    frequencies.forEach(frequency => {
        const oscillator = createOscillator(frequency, 'triangle'); // 異なる音色
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime); // 音量調整
        oscillator.connect(gainNode).connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
    });
}

function playSequence() {
    sequence.forEach((note, index) => {
        setTimeout(() => playTone(note.frequency, 0.5, 'square'), index * 600); // 異なる音色
    });
}

function generateSequence() {
    sequence = [];
    for (let i = 0; i < 3; i++) {
        const randomNote = notes[Math.floor(Math.random() * notes.length)];
        sequence.push(randomNote);
    }
}

function checkSequence() {
    const resultDiv = document.getElementById('result');
    const correctSequence = sequence.map(note => note.name).join(', ');
    if (JSON.stringify(sequence) === JSON.stringify(userSequence)) {
        resultDiv.textContent = `正解です！ 正しい音: ${correctSequence}`;
    } else {
        resultDiv.textContent = `不正解です。 正しい音: ${correctSequence}`;
    }
    userSequence = [];
    currentStep = 0;
}

function startChordProgression() {
    let chordIndex = 0;
    chordInterval = setInterval(() => {
        playChord(chords[chordIndex].frequencies, 1);
        chordIndex = (chordIndex + 1) % chords.length;
    }, 1200);
}

function stopChordProgression() {
    clearInterval(chordInterval);
}

document.getElementById('start').addEventListener('click', () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    generateSequence();
    playSequence();
});

document.getElementById('playC').addEventListener('click', () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    playTone(261.63, 0.5); // C音
});

document.getElementById('playChords').addEventListener('click', () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    startChordProgression();
});

notes.forEach(note => {
    const key = document.createElement('div');
    key.className = 'key';
    key.textContent = note.name;
    key.addEventListener('click', () => {
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        playTone(note.frequency, 0.5, 'square'); // 異なる音色
        userSequence.push(note);
        currentStep++;
        if (currentStep === sequence.length) {
            checkSequence();
        }
    });
    document.getElementById('keyboard').appendChild(key);
});
