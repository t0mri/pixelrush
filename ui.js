import { dimension } from "./canvas";
import errImg from "./Assets/Icons/tooltip-start-alert-svgrepo-com.svg";
import errAudio from "./Assets/Sfx/err.wav";
import gameMusicSrc from "./Assets/Sfx/Extraterrestrial.mp3";
import touchAudio from "./Assets/Sfx/touch.wav";

const body = document.body;
const musicIcon = document.querySelector(`[onclick="toggleMusic()"]`);
const fullscreenIcon = document.querySelector(`[onclick="toggleFullscreen()"]`);
const gameMusic = new Audio(gameMusicSrc);
const avatars = document.querySelectorAll(`[alt="avatar"]`);
const playerNamerDisplay = document.getElementById("gamerID");
const signInBtn = document.getElementById("signBtn");
const blackScreen = document.querySelector(".blackScreen");
const startPage = document.querySelector(".startPage");
export const container = document.querySelector(".container");
const loadingContainer = document.querySelector(".loadingContainer");
const loadingAvatars = document.querySelectorAll(`[alt="loadingLoop"]`);
const scoreBoard = document.querySelector(".scoreBoard");
const scoreCards = document.querySelectorAll(".scoreCard");
const scoreBoardColors = [
    "#EE6352",
    "#08B2E3",
    "#EFE9F4",
    "#57A773",
    "#484D6D",
];
const YogisCreditContainer = document.querySelector(".yogisCredit");
let musicValue = localStorage.getItem("pxlrshmscvl") ?? true;
let avatarIndex = localStorage.getItem("pxlrshavatarindexvalue") ?? 0;
let loadingLoopIndex = 0;
export let avatar = localStorage.getItem("pxlrshavatarvalue") ?? "ninja";
let YogisCredit = true;
let fullscreen = true;

gameMusic.loop = true;
const loadingLoopInterval = setInterval(() => {
    loadingAvatars[loadingLoopIndex % 4].style.display = "none";
    loadingAvatars[++loadingLoopIndex % 4].style.display = "block";
}, 500);
window.onload = () => {
    clearInterval(loadingLoopInterval);
    loadingContainer.style.display = "none";
    blackScreen.animate({ opacity: 0 }, { duration: 2000, fill: "forwards" });
};
export const throwError = (err) => {
    new Audio(errAudio).play();
    // new Audio("/pixelrush/Assets/Sfx/err.wav").play();
    document.querySelector(".errContainer").remove();
    const errBox = document.createElement("div");
    errBox.className = "errContainer";
    errBox.innerHTML = `<img src=${errImg} class="errIcon"/>${err}`;
    errBox.style.animation = "errAnimation 3s";
    document.body.appendChild(errBox);
};
export const playGameMusic = () => {
    if (localStorage.getItem("pxlrshmscvl") == "true" ? true : false) {
        gameMusic.play();
    }
};
export const toggleMusic = (game) => {
    musicValue = !musicValue;
    localStorage.setItem("pxlrshmscvl", musicValue ? "false" : "true");
    let key = localStorage.getItem("pxlrshmscvl") == "true" ? true : false;
    gameMusic[key && game ? "play" : "pause"]();
    gameMusic.currentTime = key ? 0 : gameMusic.currentTime;
    musicIcon.setAttribute("off", !key ? "false" : "true");
};
musicIcon.setAttribute(
    "off",
    (localStorage.getItem("pxlrshmscvl") == "true" ? "true" : "false")
        ? "false"
        : "true"
);

document
    .querySelector(".startPage > div > div")
    .setAttribute("currentAvatar", avatars[avatarIndex].name);
avatars[avatarIndex].style.display = "block";
// document.body.requestFullscreen();
export const toggleFullscreen = () => {
    if ((fullscreen = !fullscreen)) {
        document.exitFullscreen();
    } else {
        document.documentElement.requestFullscreen();
    }
    fullscreenIcon.setAttribute("off", !fullscreen ? "false" : "true");
};
export const changeAvatar = (key) => {
    new Audio(touchAudio).play();
    const tempIndex =
        key == 0
            ? avatarIndex - 1 >= 0
                ? avatarIndex - 1
                : avatars.length - 1
            : avatarIndex + 1 < avatars.length
            ? avatarIndex + 1
            : 0;
    avatars[tempIndex].style.display = "block";
    avatars[avatarIndex].style.display = "none";
    document
        .querySelector(".startPage > div > div")
        .setAttribute("currentAvatar", avatars[tempIndex].name);
    avatar = avatars[tempIndex].name;
    avatarIndex = tempIndex;
    localStorage.setItem("pxlrshavatarindexvalue", tempIndex);
    localStorage.setItem("pxlrshavatarvalue", avatars[tempIndex].name);

    if (YogisCredit && avatarIndex == 3) {
        YogisCreditContainer.style.display = "block";
        YogisCredit = false;
    } else {
        YogisCreditContainer.style.display = "none";
    }
};
export const updateSignInInfo = (user) => {
    signInBtn.style.display = user ? "none" : "block";
    playerNamerDisplay.style.display = user ? "block" : "none";
    playerNamerDisplay.value = user.displayName;
};
export const uiTransition = (game) => {
    blackScreen.animate(
        [{ opacity: 0 }, { opacity: 1 }, { opacity: 1 }, { opacity: 0 }],
        {
            duration: 3000,
            fill: "forwards",
        }
    );
    startPage.animate(
        { height: game ? "0vh" : "100vh" },
        { duration: 0, fill: "forwards", delay: 1500 }
    );
    container.animate(
        {
            height: !game
                ? "0vh"
                : // : Math.min(dimension / 3, window.innerHeight) + "px",
                  window.innerHeight + "px",
            width: !game
                ? "0vh"
                : // : Math.min(dimension / 3, window.innerWidth) + "px",
                  window.innerWidth + "px",
        },
        { duration: 0, fill: "forwards", delay: 1500 }
    );
};

scoreCards.forEach((node, i) => {
    node.style.backgroundColor = scoreBoardColors[i];
});
export const updateScoreBoard = (scoreBoardData) => {
    // console.log("updatinf score board");
    // console.log(scoreBoardData);
    scoreCards.forEach((card) => {
        card.innerHTML = "";
        card.style.display = "none";
    });
    scoreBoardData.forEach((player, i) => {
        const currentScoreCard = document.querySelector(`.scoreCard${i + 1}`);
        currentScoreCard.style.display = "block";
        currentScoreCard.style.width = 10 - i + "rem";
        currentScoreCard.innerHTML = `${player[1]} - ${player[0]}`;
    });
};
