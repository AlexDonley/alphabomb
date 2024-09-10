let lettersList = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
let nouns = [
                'apple', 'book', 'cat', 'dog', 'egg', 'fish', 'girl', 'hat', 'ink', 'jump', 'king', 'lion', 'monkey',
                'nose', 'ox', 'pen', 'queen', 'read', 'sun', 'tea', 'up', 'vest', 'water', 'box', 'yoyo', 'zoo'
            ]
let svgNames = ['a_apple.svg', 'b_book.svg', 'c_cat.svg']

let myDocument = document.documentElement;
let btn = document.getElementById('btn');
let volumeCursor = document.getElementById('volumeCursor');
let volumeDisplay = document.getElementById('volumeDisplay')
let cumulative = 0;
let cumulativeCorrect = 0;
let addToBomb = 0;
let bombSize;
let threshold = 400;
let holdover = 0;
let cumTrans = 0;
let cumCorTrans = 0;

let pronunciationFeedback = 0;
let correctSpeech = false;
let isExploding = false;
let showData = false;
let recognizing = false;

let res = 100;
let proportion = 0.6;
let boxSide;
let boxX;
let boxY;

let mic = false;
let letterIndex = Math.floor(Math.random(25));
let abcPics = [];

let bombs = []

function toggleData() {
    if (showData) {
        showData = false;
        volumeDisplay.style.display = 'none';
    } else {
        showData = true;
        volumeDisplay.style.display = 'block';
    }
}

function preload() {
    for (i=0; i<26; i++) {
        address = "PNGs/" + lettersList[i] + "_" + nouns[i] + ".png"

        nextImg = loadImage(address)
        abcPics.push(nextImg);
    }
    for (i=0; i<2; i++) {
        address = "PNGs/0_bomb" + i + ".png";
        
        nextImg = loadImage(address);
        bombs.push(nextImg);
    }
    explosion = loadSound('SFXs/explosion.wav')
}

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    imageMode(CENTER)
    textAlign(CENTER)

    boxSide = Math.round(min(windowWidth, windowHeight) * proportion)
    boxX = (windowWidth - boxSide) / 2;
    boxY = (windowHeight - boxSide) / 2

    loadNewPic(letterIndex);
}

function loadNewPic(i){
    nextPic = abcPics[i]

    imgW = nextPic.width;
    imgH = nextPic.height;
    aspect = imgW / imgH;

    // console.log(imgW, imgH, aspect)

    let newW;
    let newH;

    if (imgW == imgH) {

        newW = boxSide;
        newH = boxSide;

    } else {
        if (imgW > imgH) {
            
            newW = boxSide
            newH = boxSide / aspect

        } else {
            
            newW = boxSide * aspect
            newH = boxSide

        }
    }

    image(nextPic, width/2, height/2, newW, newH);

}

function draw() {
    clear();

    tint(255);
    strokeWeight(0);

    // DATA CALCULATIONS

    if (mic) {
        rawMic = mic.getLevel()
    } else {
        rawMic = 0
    }

    currentVol = rawMic * 36;
    volumeMap = Math.round(currentVol) * 10

    if (volumeMap > 180) {
        volumeMap = 180;
    }

    cumulative += volumeMap / 10
    targ = max(cumulative, cumulativeCorrect)

    if (!(addToBomb == targ)) {
        addToBomb += (targ - addToBomb) / 25
    }

    tick = cos(new Date().getMilliseconds() * TWO_PI * addToBomb / 100000) * 10
    bombSize = 100 + addToBomb + tick

    if (!(cumTrans == cumulative)) {
        cumTrans += (cumulative - cumTrans) / 25
    }
    if (!(cumCorTrans == cumulativeCorrect)) {
        cumCorTrans += (cumulativeCorrect - cumCorTrans) / 25
    }

    // TEXT TO SEE DATA IN THE CANVAS

    if(showData) {
        textSize(100);
        fill(255);
        text(cumulative, 100, 400);
        text(cumulativeCorrect, 100, 500);
        textSize(20);
        text(userUtterance, 100, 550)
        volumeCursor.style.transform = 'rotate(' + volumeMap + "deg)"
    }
    

    centerH = (height - boxSide) / 2
    centerW = (width - boxSide) / 2

    fill(128, 128, 255)
    rect(centerW - 175, centerH, 120, boxSide, 15)
    fill(0, 255, 0)
    rect(centerW - 160, height - centerH - 15, 90, -boxSide * (cumCorTrans) / threshold, 15)

    if (pronunciationFeedback > 0){
        if(correctSpeech) {
            fill(0, 255, 0)
        } else {
            fill(255, 0, 0)
        }
        pronunciationFeedback -= 1;
    } else {
        fill(255);
    }

    textSize(200);
    text(nouns[letterIndex], width/2, 200);
    loadNewPic(letterIndex);
    rect(centerW - 160, height - centerH - 15, 90, -boxSide * (cumTrans) / threshold, 15)


    tint(255, 255 - addToBomb, 255 - addToBomb)
    image(bombs[0], (width + boxSide) / 2, (height + boxSide) / 2, bombSize, bombSize)

    if (cumulativeCorrect > threshold && !isExploding) {
        explodeItem();
        isExploding = true;
    }
}

function explodeItem() {
    setTimeout(() => {
        explosion.play();
        cumulative = 0;
        cumulativeCorrect = 0;
        pronunciationFeedback = 0;
        nextLetter();
        isExploding = false;
    }, 700)
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);

    boxSide = Math.round(min(windowWidth, windowHeight) * proportion)
    boxX = (windowWidth - boxSide) / 2;
    boxY = (windowHeight - boxSide) / 2
}

function toggleFullscreen() {
    if (btn.textContent == "Go Fullscreen"){
        if(myDocument.requestFullscreen){
            myDocument.requestFullscreen();
        } else if(myDocument.msRequestFullscreen){
            myDocument.msRequestFullscreen();
        } else if (myDocument.mozRequestFullscreen){
            myDocument.mozRequestFullscreen();
        } else if (myDocument.webkitRequestFullscreen){
            myDocument.webkitRequestFullscreen();
        }

        btn.textContent = "Exit Fullscreen";
    } else {
        if(document.exitFullscreen){
            document.exitFullscreen();
        } else if (document.msexitFullscreen){
            document.msexitFullscreen();
        } else if (document.mozexitFullscreen){
            document.mozexitFullscreen();
        } else if (document.webkitexittFullscreen){
            document.webkitexittFullscreen();
        }

        btn.textContent = "Go Fullscreen";
    }
}

function shuffle(array) {
    let shuffledArray = [];
    let usedIndexes = [];

    let i = 0;
    while (i < array.length) {
        let randomNumber = Math.floor(Math.random() * array.length);
        if (!usedIndexes.includes(randomNumber)){
            shuffledArray.push(array[randomNumber]);
            usedIndexes.push(randomNumber);

            i++;
        }
    }
    //console.log(shuffledArray);
    return shuffledArray;
}

document.addEventListener('keydown', (e) => {
    if (e.keyCode === 40) {
        nextLetter();
    } else if (e.keyCode === 38) {
        previousLetter();
    } else if (e.keyCode === 39) {
        res += 5;
    } else if (e.keyCode === 37) {
        if (res > 5) {
            res -=5 ;
        }  
    }
})

function nextLetter() {
    console.log(letterIndex);
    if (letterIndex > 24) {
        letterIndex = 0
    } else {
        letterIndex++;
    }
    loadNewPic(letterIndex);
}

function previousLetter() {
    console.log(letterIndex);
    if (letterIndex < 1) {
        letterIndex = 25
    } else {
        letterIndex--;
    }
    loadNewPic(letterIndex);
}



// console.log(lettersList);
shuffle(lettersList);



// - - - SPEECH RECOGNITION SNIPPET - - - //

userSpeech = document.getElementById('userSpeech')
listenBool = 1;
let userUtterance = [];

window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = true;

function setLanguage(str) {
  targetLang = str
  recognition.lang = targetLang
}

setLanguage('en');

recognition.addEventListener("result", (e) => {
  
    if (holdover > 0) {
        holdover = 0;
    }
    if (pronunciationFeedback > 0) {
        pronunciationFeedback = 0;
    }

  const text = Array.from(e.results)
    .map((result) => result[0])
    .map((result) => result.transcript)
    .join("");

    userUtterance = text;

    // inputWord.innerText = text;

    if (e.results[0].isFinal) {
        // console.log('checking sentence');
        checkSpeech(userUtterance);
    }
});

recognition.addEventListener("end", () => {
  if(listenBool){
    recognition.start();
  }
});

function checkSpeech(str) {
    if (str.toLowerCase().includes(nouns[letterIndex])) {
        cumulativeCorrect += cumulative;
        correctSpeech = true;
    } else {
        correctSpeech = false;
    }
    pronunciationFeedback = 200;
    holdover = cumulative;
    cumulative = 0;
}

function beginAudioContext() {
    mic = new p5.AudioIn();
    mic.start();
    // amp = new p5.Amplitude();
    getAudioContext().resume();
    console.log(Math.ceil(mic.getLevel() * 100))
}

function beginRecognition() {
    cumulative = 0;
    if (!recognizing) {
        recognizing = true;
        recognition.start()
    }
}

// beginRecognition();