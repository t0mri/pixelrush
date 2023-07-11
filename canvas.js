import { container } from "./ui";
import * as avatars from "./avatars";

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
export const block = 20;
export const dimension = 1000;
export const directions = ["up", "down", "left", "right"];

canvas.width = dimension;
canvas.height = dimension;
canvas.style.backgroundSize = `${block * 2}px ${block * 2}px`;
canvas.style.backgroundPosition = `0 0,0 ${block}px,${block}px ${-block}px,${block}px 0 `;

export const defaultLands = (land, x, y) => {
    for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
            land[`${x - block * j},${y - block * i}`] = "TomRI is awesome!";
        }
    }
};
export const clearCanvas = () => {
    ctx.clearRect(0, 0, dimension, dimension);
};
export const moveCanvas = (x, y, data, playerID) => {
    if (data.playerID != playerID) {
        return;
    }
    canvas.style.transform = `translate(${-x + container.clientWidth / 2}px,${
        -y + container.clientHeight / 2
    }px)`;
};
export const drawHero = (data) => {
    const [, x, y] = /(-?\d+),(-?\d+)/.exec(data.position);
    ctx.drawImage(avatars[data.avatar][data.direction], x, y - 5);
};
export const drawTrail = (data) => {
    Object.keys(data.trails ?? {}).forEach((trail) => {
        const [, x, y] = /(-?\d+),(-?\d+)/.exec(trail);
        ctx.globalAlpha = 0.5;
        ctx.drawImage(avatars[data.avatar].pattern, x, y);
        ctx.globalAlpha = 1;
    });
};
export const drawLands = (
    currentPlayerID,
    currentPlayerLands,
    data,
    update,
    ref,
    db,
    lobbyName,
    currentPlayerRef
) => {
    let tempLands = { ...data.lands };

    Object.keys(data.lands ?? {}).forEach((land) => {
        let [, x, y] = /(-?\d+),(-?\d+)/.exec(land);

        // if (
        //     currentPlayerID != data.playerID &&
        //     currentPlayerLands[`${x},${y}`]
        // ) {
        //     delete tempLands[`${x},${y}`];
        // } else {
        ctx.drawImage(avatars[data.avatar].pattern, x, y);
        // }
    });

    // if (
    //     currentPlayerID != data.playerID &&
    //     Object.keys(data.lands).length != Object.keys(tempLands).length
    // ) {
    //     update(ref(db, `lobbies/${lobbyName}/players/${data.playerID}`), {
    //         lands: tempLands,
    //     });
    //     // update(currentPlayerRef, {
    //     //     lands: currentPlayerLands,
    //     // });
    // }
};

export const resetScore = () => (score = 0);
