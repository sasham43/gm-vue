import _ from "lodash";

import { findDistance } from "./highlight";

export function highlightMovementTiles(
  tiles = [],
  start,
  range,
  openList = [],
  closedList = [],
  iteration = 0
) {
  // console.log('start', start, start.distanceFromStart)
  start.pos = `${start.x},${start.y}`;
  start.distanceFromStart =
    start.distanceFromStart == undefined ? 0 : start.distanceFromStart;
  // get tiles N, E, S, W of actor, push to array
  let neighboringTiles = findNeighboringTiles(start, tiles)
    .map((tile) => {
      return {
        pos: `${tile.x},${tile.y}`,
        ...tile,
        distanceFromStart: start.distanceFromStart + 1,
      };
    })
    .filter((tile) => {
      let exists = closedList.find((closed) => {
        return tile.pos === closed.pos;
      });
      return !exists;
    });

  openList = _.uniqBy([...openList, ...neighboringTiles], "pos");
  closedList = _.uniqBy([...closedList, start], "pos");

  if (start.distanceFromStart > range) {
    console.log("reached limit");
    return closedList.filter((tile) => {
      return tile.distanceFromStart > 0 && tile.distanceFromStart <= range;
    });
  } else {
    let nextTile = openList.shift();

    return highlightMovementTiles(tiles, nextTile, range, openList, closedList);
  }

  // if(iteration <= range){
  //   neighboringTiles.forEach(tile => {

  //     // return highlightMovementTiles(tiles, tile, range, iteration+1)
  //   })
  // } else {
  //   return neighboringTiles
  // }

  // return
}

export function pathfinding(
  tiles = [],
  start,
  target,
  openList = [],
  closedList = [],
  loopNumber = 0
) {
  // make sure compatible values are set
  start.pos = `${start.x},${start.y}`;
  start.distanceFromStart =
    start.distanceFromStart == undefined ? 0 : start.distanceFromStart;
  target.pos = `${target.x},${target.y}`;
  // get tiles N, E, S, W of actor, push to array
  let neighboringTiles = findNeighboringTiles(start, tiles);
  neighboringTiles = neighboringTiles.map((tile) => {
    let distanceToTarget = findDistance(
      tile.x,
      tile.y,
      target.x,
      target.y
    ).total;

    return {
      pos: `${tile.x},${tile.y}`,
      ...tile,
      distanceToTarget,
      distanceFromStart: start.distanceFromStart + 1,
    };
  });

  // A* pathfinding
  // openList will be all available 'first moves' from a given origin (starting with actor starting point)
  openList = _.uniqBy([...openList, ...neighboringTiles], "pos");
  closedList = _.uniqBy([...closedList, start], "pos");

  // after tiles have been added to openList, calculate F as G + H (G = cost of moving into tile, distance from start; H = simple distance from target, e.g. playerDistance)
  openList = openList.map((tile) => {
    let totalScore = tile.distanceFromStart + tile.distanceToTarget;
    return {
      ...tile,
      totalScore,
    };
  });
  //   openList.sort(this.chooseLowestTotalScore);
  openList = _.sortBy(openList, "totalScore");

  // choose  tile from openList lowest F score, add to closedList, retrieve adjacent squares from it
  let nextTile = openList.shift();

  // check if tile contains target
  if (nextTile.x == target.x && nextTile.y == target.y) {
    return findShortestPath([...closedList, nextTile]).reverse();
  } else {
    return pathfinding(
      tiles,
      nextTile,
      target,
      openList,
      closedList,
      loopNumber + 1
    );
  }
}

export function findNeighboringTiles(actor, tiles) {
  let neighbors = [];

  // console.log('y tho', tiles, actor)

  if (tiles[actor.y][actor.x + 1]) {
    neighbors.push({
      x: actor.x + 1,
      y: actor.y,
    });
  }
  if (tiles[actor.y][actor.x - 1]) {
    neighbors.push({
      x: actor.x - 1,
      y: actor.y,
    });
  }
  if (tiles[actor.y + 1] != undefined && tiles[actor.y + 1][actor.x]) {
    neighbors.push({
      x: actor.x,
      y: actor.y + 1,
    });
  }
  if (tiles[actor.y - 1] != undefined && tiles[actor.y - 1][actor.x]) {
    neighbors.push({
      x: actor.x,
      y: actor.y - 1,
    });
  }

  return neighbors;
}

export function findShortestPath(list) {
  let sorted = _.sortBy(list, "distanceFromStart").reverse();
  let start = sorted.shift();
  let path = findNextPathStep(start, [], list);
  return path;
}

export function findNextPathStep(start, pathList, closedList) {
  let nextSteps = closedList.filter((tile) => {
    return tile.distanceFromStart == start.distanceFromStart - 1;
  });

  let next = nextSteps.find((step) => {
    let distance = findDistance(start.x, start.y, step.x, step.y).total;
    return distance === 1;
  });

  pathList.push(start);
  if (next.distanceFromStart === 0) {
    return pathList;
  } else {
    return findNextPathStep(next, pathList, closedList);
  }
}
