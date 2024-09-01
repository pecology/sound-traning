const notes = [
    { name: 'C', frequency: 261.63 },
    { name: 'D', frequency: 293.66 },
    { name: 'E', frequency: 329.63 },
    { name: 'F', frequency: 349.23 },
    { name: 'G', frequency: 392.00 },
    { name: 'A', frequency: 440.00 },
    { name: 'B', frequency: 493.88 },
    { name: 'C2', frequency: 523.25 },
    { name: 'D2', frequency: 587.33 },
    { name: 'E2', frequency: 659.25 },
    { name: 'F2', frequency: 698.46 },
    { name: 'G2', frequency: 783.99 },
    { name: 'A2', frequency: 880.00 },
    { name: 'B2', frequency: 987.77 },
    { name: 'C3', frequency: 1046.50 }
];

const chords = [
    { name: 'C', frequencies: [261.63, 329.63, 523.25] }, // オープンボイシング
    { name: 'Am', frequencies: [220.00, 329.63, 523.25] }, // オープンボイシング
    { name: 'Dm', frequencies: [293.66, 349.23, 587.33] }, // オープンボイシング
    { name: 'G', frequencies: [196.00, 392.00, 493.88] } // オープンボイシング
];

let audioCtx;
let sequence = [];
let userSequence = [];
let currentStep = 0;
let chordInterval;
let volume = 0.5; // 初期音量
let selectedOctave = 1; // 初期オクターブ
let inputEnabled = true; // 入力を有効にするフラグ

function createOscillator(frequency, type = 'sine') {
    const oscillator = audioCtx.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    return oscillator;
}

function playTone(frequency, duration, type = 'sine') {
    const oscillator = createOscillator(frequency, type);
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime); // 音量調整
    oscillator.connect(gainNode).connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

function playChord(frequencies, duration) {
    frequencies.forEach(frequency => {
        const oscillator = createOscillator(frequency, 'triangle'); // 異なる音色
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(volume, audioCtx.currentTime); // 音量調整
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
    const availableNotes = selectedOctave === 1 ? notes.slice(0, 7) : notes;
    for (let i = 0; i < 3; i++) {
        const randomNote = availableNotes[Math.floor(Math.random() * availableNotes.length)];
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
    inputEnabled = false; // 入力を無効にする
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

function setVolume(newVolume) {
    volume = newVolume;
}

document.getElementById('start').addEventListener('click', () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    generateSequence();
    playSequence();
    inputEnabled = true; // 入力を有効にする
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

document.getElementById('volumeControl').addEventListener('input', (event) => {
    setVolume(event.target.value);
});

document.getElementById('octaveSelect').addEventListener('change', (event) => {
    selectedOctave = parseInt(event.target.value);
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
        if (inputEnabled) { // 入力が有効な場合のみシーケンスを処理
            userSequence.push(note);
            currentStep++;
            if (currentStep === sequence.length) {
                checkSequence();
            }
        }
    });
    document.getElementById('keyboard').appendChild(key);
});
