import {
    changeAvatar,
    avatar,
    throwError,
    toggleMusic,
    uiTransition,
    updateSignInInfo,
    updateScoreBoard,
} from "./ui";
import {
    block,
    clearCanvas,
    defaultLands,
    dimension,
    directions,
    drawHero,
    drawLands,
    drawTrail,
    extendLands,
    moveCanvas,
    resetScore,
    score,
} from "./canvas";
import { initializeApp } from "firebase/app";
import {
    GoogleAuthProvider,
    getAuth,
    onAuthStateChanged,
    signInWithPopup,
} from "firebase/auth";
import {
    get,
    getDatabase,
    onDisconnect,
    onValue,
    ref,
    remove,
    set,
    update,
} from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyBzwPN6QA-Kyk4TmMfUwgiFr_eav5oiiuU",
    authDomain: "pixel-rush-bf2a3.firebaseapp.com",
    projectId: "pixel-rush-bf2a3",
    storageBucket: "pixel-rush-bf2a3.appspot.com",
    messagingSenderId: "1013182695715",
    appId: "1:1013182695715:web:4038aa3725e51590d52496",
    databaseURL:
        "https://pixel-rush-bf2a3-default-rtdb.asia-southeast1.firebasedatabase.app",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase();
const scoresRef = ref(db, "scores");
window.up = [0, -1];
window.down = [0, 1];
window.left = [-1, 0];
window.right = [1, 0];
let player;
let playerID;
let playerName;
let playerRef;
let lobbyRef;
let game = false;
let heroPosX;
let heroPosY;
let direction = directions[Math.round(Math.random() * 3)];
let [xVel, yVel] = window[direction];
let trails = {};
let lands = {};
let musicValue = true;
let comingback = false;
let initialX;
let initialY;
let diffX;
let diffY;

const randomPosition = () => {
    return (
        Math.round((Math.random() * (dimension - block * 5)) / block) * block +
        block * 2
    );
};
heroPosX = randomPosition();
heroPosY = randomPosition();

window.toggleMusic = () => toggleMusic((musicValue = !musicValue), game);
window.changeAvatar = (key) => changeAvatar(key);
window.signIn = () => {
    signInWithPopup(auth, new GoogleAuthProvider());
};
const checkWalls = (x, y, max) => {
    if (x < 0 || x >= max || y < 0 || y >= max) {
        game = false;
        update(playerRef, {
            defeatedBy: "watch Walls",
        });
        clearInterval(gameInterval);
    }
};
const landingTrails = () => {
    if (lands[`${heroPosX},${heroPosY}`] && comingback) {
        let xValues = [];
        let yValues = [];
        Object.keys(trails).forEach((trail) => {
            const [, x, y] = /(-?\d+),(-?\d+)/.exec(trail);
            xValues.push(x);
            yValues.push(y);
            lands[trail] = "TomRI is awesome!";
        });
        extendLands(comingback, xValues, yValues, trails, lands);
        update(playerRef, { lands });
        comingback = false;
    } else if (!lands[`${heroPosX},${heroPosY}`] && !comingback) {
        comingback = true;
    }
    if (lands[`${heroPosX},${heroPosY}`]) {
        trails = {};
    }
};
const checkDefeat = (data, x, y) => {
    if (data.playerID != playerID && trails[`${x},${y}`]) {
        game = false;
        update(playerRef, {
            defeatedBy: `killed by ${data.playerName}`,
        });
    }
};
const initGame = (lobbyName) => {
    trails = {};
    lands = {};
    heroPosX = randomPosition();
    heroPosY = randomPosition();
    clearCanvas();
    // moveCanvas(heroPosX, heroPosY);

    lobbyRef = ref(db, `lobbies/${lobbyName}`);
    lobbyRef = ref(db, `lobbies/${lobbyName}/players`);
    playerRef = ref(db, `lobbies/${lobbyName}/players/${playerID}`);

    defaultLands(lands, heroPosX, heroPosY);

    set(playerRef, {
        playerID,
        defeatedBy: "notYet",
        avatar,
        position: `${heroPosX},${heroPosY}`,
        lands,
        trails,
        direction,
        playerName,
        score,
    });
    set(scoresRef, { [playerID]: score });
    window.onkeydown = (e) => {
        if (game) {
            switch (e.keyCode) {
                case 38:
                    xVel = 0;
                    yVel = -1;
                    direction = "up";

                    break;
                case 40:
                    xVel = 0;
                    yVel = 1;
                    direction = "down";

                    break;
                case 37:
                    xVel = -1;
                    yVel = 0;
                    direction = "left";

                    break;
                case 39:
                    xVel = 1;
                    yVel = 0;
                    direction = "right";
                    break;
                default:
                    break;
            }
        }
    };
    window.ontouchstart = (e) => {
        initialX = e.touches[0].pageX;
        initialY = e.touches[0].pageY;
    };
    window.ontouchend = (e) => {
        // console.log(e);
        diffX = e.changedTouches[0].pageX - initialX;
        diffY = e.changedTouches[0].pageY - initialY;

        if (Math.abs(diffY) > Math.abs(diffX)) {
            if (diffY < 0) {
                xVel = 0;
                yVel = -1;
                direction = "up";
            } else {
                xVel = 0;
                yVel = 1;
                direction = "down";
            }

            // diffX > 0 ? console.log("right") : console.log("left");
        } else {
            if (diffX < 0) {
                xVel = -1;
                yVel = 0;
                direction = "left";
            } else {
                xVel = 1;
                yVel = 0;
                direction = "right";
            }
            // diffY > 0 ? console.log("down") : console.log("up");
        }
    };

    const gameInterval = setInterval(() => {
        const scoreBoardData = [];
        heroPosX += block * xVel;
        heroPosY += block * yVel;
        trails[`${heroPosX},${heroPosY}`] = "TomRI is awesome right";
        checkWalls(heroPosX, heroPosY, dimension);
        update(playerRef, {
            direction,
            position: `${heroPosX},${heroPosY}`,
            trails,
            // lands,
            score,
        });
        landingTrails();
        get(playerRef).then((currentPlayerData) => {
            if (currentPlayerData.val().defeatedBy == "notYet") {
                get(lobbyRef).then((allPlayersData) => {
                    const playersArray = [];
                    clearCanvas();
                    allPlayersData.forEach((rawPlayerData) => {
                        const data = rawPlayerData.val();
                        const [, x, y] = /(-?\d+),(-?\d+)/.exec(data.position);
                        moveCanvas(x, y, data, playerID);
                        checkDefeat(data, x, y);
                        // drawTrail(data);
                        // drawLands(data);
                        // drawHero(x, y, data);
                        playersArray.push(data);
                        scoreBoardData.push([data.playerName, data.score]);
                    });
                    playersArray.forEach((playerData) =>
                        drawLands(
                            playerID,
                            lands,
                            playerData,
                            update,
                            ref,
                            db,
                            lobbyName,
                            playerRef
                        )
                    );
                    playersArray.forEach((playerData) => drawTrail(playerData));
                    playersArray.forEach((playerData) => drawHero(playerData));
                    updateScoreBoard(
                        scoreBoardData.sort((a, b) => b[1] - a[1])
                    );
                });
            } else {
                clearInterval(gameInterval);
                throwError(currentPlayerData.val().defeatedBy);
                toggleMusic(musicValue, game);
                remove(playerRef);
                uiTransition(game);
                updateScoreBoard([]);
                resetScore();
            }
        });
    }, 100);

    // onDisconnect();
    // remove()
    onDisconnect(playerRef).remove(playerRef);
};
const gameMode = (lobbyName) => {
    game = true;
    uiTransition(game);
    toggleMusic(musicValue, game);
    setTimeout(() => {
        initGame(lobbyName);
    }, 1750);
};
const lobbyInputCheck = (lobbyName) => {
    if (!player) {
        throwError("bitch ur not logged in");
        return false;
    }
    if (lobbyName.trim().length <= 0) {
        throwError("Lobby name can not be empty");
        return false;
    }
    return true;
};
window.joinLobby = async (e, lobbyName) => {
    e.preventDefault();
    if (lobbyInputCheck(lobbyName)) {
        get(ref(db, `lobbies/${lobbyName}`)).then((snap) => {
            if (snap.size <= 0) {
                throwError("lobby not found");
                return;
            }
            if (snap.size >= 5) {
                throwError("lobby is full");
                return;
            }
            gameMode(lobbyName);
        });
    }
};
window.createLobby = (e, lobbyName) => {
    e.preventDefault();
    if (lobbyInputCheck(lobbyName)) {
        get(ref(db, `lobbies/${lobbyName}`)).then((snap) => {
            if (snap.size > 0) {
                throwError("lobby already exists");
                return;
            }
            gameMode(lobbyName);
        });
    }
};

onAuthStateChanged(auth, (user) => {
    updateSignInInfo(user);
    if (user) {
        player = user;
        playerID = user.uid;
        playerName = user.displayName;
    } else {
        game = false;
    }
});
