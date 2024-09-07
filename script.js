let lettersList = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
let nouns = [
                'apple', 'book', 'cat', 'dog', 'egg', 'fish', 'girl', 'hat', 'ink', 'jump', 'king', 'lion', 'monkey',
                'nose', 'ox', 'pen', 'queen', 'read', 'sun', 'tea', 'up', 'vest', 'water', 'box', 'yoyo', 'zoo'
            ]
let svgNames = ['a_apple.svg', 'b_book.svg', 'c_cat.svg']

let myDocument = document.documentElement;
let btn = document.getElementById('btn');
let volumeCursor = document.getElementById('volumeCursor');
let cumulative = 0;
let addToBomb = 0;
let bombSet = 0;
let bombSize;
let threshold = 400;

let pronunciationFeedback = 0;
let correctSpeech = false;
let isExploding = false;
let showData = false;

let res = 100;
let proportion = 0.6;
let boxSide;
let boxX;
let boxY;

let mic;
let letterIndex = Math.floor(Math.random(25));
let abcPics = [];

let bombs = []

function toggleData() {
    if (showData) {
        showData = false;
    } else {
        showData = true;
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
    createCanvas(windowWidth, windowHeight);
    imageMode(CENTER)

    boxSide = Math.round(min(windowWidth, windowHeight) * proportion)
    boxX = (windowWidth - boxSide) / 2;
    boxY = (windowHeight - boxSide) / 2

    // tint(255, 0);

    loadNewPic(letterIndex);

    mic = new p5.AudioIn();
    mic.start();
    amp = new p5.Amplitude();
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

    // CORNERS MODE

    // if (imgW == imgH) {
    //     for corners mode
    //     image(nextPic, boxX, boxY, boxSide, boxSide);
    // } else {
    //     if (imgW > imgH) {
    //         for corners mode
    //         image(nextPic, boxX, boxY + (boxSide - (boxSide / aspect)) / 2, boxSide, boxSide * (1 / aspect));
    //     } else {
    //         for corners mode
    //         image(nextPic, boxX + (boxSide - (boxSide * aspect)) / 2, boxY, boxSide * aspect, boxSide);
    //     }
    // }
    
    // abcPics[letterIndex].loadPixels();
}

function draw() {
    clear();

    tint(255);
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
    text(nouns[letterIndex], 100, 250);
    loadNewPic(letterIndex);

    // for (let i=0; i < abcPics[letterIndex].width; i+=res) {
    //     for (let j=0; j < abcPics[letterIndex].height; j+=res) {
    //         let c = (abcPics[letterIndex].get(i,j));
    //         fill(c);
    //         noStroke();
    //         rect(i * propWidth,j * propHeight,res,res)
    //     }
    // }
    // if (res > 5) {
    //     res -= Math.round(currentVol) / 3.6;
    //     if (res < 1) {
    //         res = 1
    //     }
    // }
    
    // centerpoint check
    // ellipse(width/2, height/2, 6, 6)

    currentVol = mic.getLevel() * 36

    volumeMap = Math.round(currentVol) * 10

    if (volumeMap > 180) {
        volumeMap = 180;
    }

    cumulative += volumeMap / 10

    if(showData) {
        textSize(100);
        fill(255);
        text(cumulative, 100, 400);
        text(bombSet, 100, 500);
        textSize(20);
        text(userUtterance, 100, 550)
    }
    
    volumeCursor.style.transform = 'rotate(' + volumeMap + "deg)"

    if (!(addToBomb == bombSet)) {
        addToBomb += (bombSet - addToBomb) / 25
    }


    tick = sin(new Date().getMilliseconds() * (addToBomb / 200) / 100 * PI) * 10
    bombSize = 100 + addToBomb + tick
    

    tint(255, 255 - addToBomb, 255 - addToBomb)
    image(bombs[0], (width + boxSide) / 2, (height + boxSide) / 2, bombSize, bombSize)

    if (bombSet > threshold && !isExploding) {
        explodeItem();
        isExploding = true;
    }
}

function explodeItem() {
    setTimeout(() => {
        explosion.play();
        cumulative = 0;
        bombSet = 0;
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
  
  const text = Array.from(e.results)
    .map((result) => result[0])
    .map((result) => result.transcript)
    .join("");

    // console.log(e.results)

    //   if (targetLang == 'zh') {
    //     userUtterance = omitPunctuation(text).toLowerCase().split('');
    //   } else {
    //     userUtterance = omitPunctuation(text).toLowerCase().split(' ');
    //   }

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
        bombSet += cumulative;
        correctSpeech = true;
    } else {
        correctSpeech = false;
    }
    pronunciationFeedback = 200;
    cumulative = 0;
}

function beginAudioContext() {
    mic = new p5.AudioIn();
    mic.start();
    amp = new p5.Amplitude();
    console.log(Math.ceil(mic.getLevel() * 100))
}

function beginRecognition() {
    cumulative = 0;
    recognition.start()
}

beginRecognition();