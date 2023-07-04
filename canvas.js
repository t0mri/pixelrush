import { container } from "./ui";
import * as avatars from "./avatars";

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
export const block = 20;
export const dimension = 400;
export const directions = ["up", "down", "left", "right"];
export let score = 0;
let newLands = {};

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

export const extendLands = (comingback, xValues, yValues, trails, lands) => {
    if (!comingback) return;

    newLands = {};
    let nonNewLands = {};
    let trailCount = 0;
    let newLandCount = 0;

    xValues.sort((a, b) => a - b);
    yValues.sort((a, b) => a - b);

    Object.keys(trails).forEach((trail) => {
        trailCount++;
        const [, x, y] = /(-?\d+),(-?\d+)/.exec(trail);
        if (
            lands[`${+x},${+y}`] &&
            lands[`${+x + block},${+y}`] &&
            lands[`${+x},${+y + block}`] &&
            !lands[`${+x + block},${+y + block}`]
        ) {
            // nonNewLands = {};
            floodFill(
                lands,
                newLands,
                nonNewLands,
                +x + block,
                +y + block,
                xValues[0],
                yValues[0],
                xValues[xValues.length - 1],
                yValues[yValues.length - 1]
            );
        }
        if (
            lands[`${+x},${+y}`] &&
            lands[`${+x - block},${+y}`] &&
            lands[`${+x},${+y - block}`] &&
            !lands[`${+x - block},${+y - block}`]
        ) {
            // nonNewLands = {};
            floodFill(
                lands,
                newLands,
                nonNewLands,
                +x - block,
                +y - block,
                xValues[0],
                yValues[0],
                xValues[xValues.length - 1],
                yValues[yValues.length - 1]
            );
        }
    });
    Object.keys(newLands).forEach((key) => {
        if (!nonNewLands[key]) {
            newLandCount++;
            lands[key] = "TomRI is awesome!";
        }
    });
    score += Math.round(trailCount / 5 + ((trailCount / 5) * newLandCount) / 5);
};
const floodFill = (
    lands,
    newLands,
    nonNewLands,
    x,
    y,
    minX,
    minY,
    maxX,
    maxY
) => {
    if (
        (x == minX || x == maxX || y == minY || y == maxY) &&
        !lands[`${x},${y}`]
    ) {
        // Object.keys(newLands).forEach((key) => {
        //     nonNewLands[key] = "this should be skipped";
        // });
        // newLands = {};
        return;
    }
    if (
        x <= minX ||
        x >= maxX ||
        y <= minY ||
        y >= maxY ||
        lands[`${x},${y}`] ||
        newLands[`${x},${y}`] ||
        nonNewLands[`${x},${y}`]
    ) {
        return;
    }
    newLands[`${x},${y}`] = "new lands!!!";
    floodFill(
        lands,
        newLands,
        nonNewLands,
        x + block,
        y,
        minX,
        minY,
        maxX,
        maxY
    );
    floodFill(
        lands,
        newLands,
        nonNewLands,
        x,
        y + block,
        minX,
        minY,
        maxX,
        maxY
    );
    floodFill(
        lands,
        newLands,
        nonNewLands,
        x - block,
        y,
        minX,
        minY,
        maxX,
        maxY
    );
    floodFill(
        lands,
        newLands,
        nonNewLands,
        x,
        y - block,
        minX,
        minY,
        maxX,
        maxY
    );
};
export const resetScore = () => (score = 0);
