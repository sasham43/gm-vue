export function isHighlightedMove(tile, row, col, playerX, playerY, speed) {
  let isWithinSpeed = false;
  let xClose, yClose;

  if (tile === 0) return false;

  if (col > playerX) {
    xClose = Math.abs(col - playerX);
  } else {
    xClose = Math.abs(playerX - col);
  }
  if (row > playerY) {
    yClose = Math.abs(row - playerY);
  } else {
    yClose = Math.abs(playerY - row);
  }

  if (xClose <= speed && yClose <= speed) {
    isWithinSpeed = true;
  }

  return isWithinSpeed;
}

export function isHighlightedAttack(
  type,
  tileX,
  tileY,
  originX,
  originY,
  range
) {
  if (type === "melee") {
    let xClose, yClose;

    if (tileY > originY) {
      yClose = Math.abs(tileY - originY);
    } else {
      yClose = Math.abs(originY - tileY);
    }
    if (tileX > originX) {
      xClose = Math.abs(tileX - originX);
    } else {
      xClose = Math.abs(originX - tileX);
    }

    if (xClose == 1 && yClose == 0) {
      return true;
    } else if (yClose == 1 && xClose == 0) {
      return true;
    } else {
      return false;
    }
  } else if (type === "ranged") {
    return isHighlightedTile(tileX, tileY, originX, originY, range);
  }
}

function isHighlightedTile(tileX, tileY, originX, originY, range) {
  let xClose, yClose;
  let isWithinRange = false;

  if (tileY > originY) {
    yClose = Math.abs(tileY - originY);
  } else {
    yClose = Math.abs(originY - tileY);
  }
  if (tileX > originX) {
    xClose = Math.abs(tileX - originX);
  } else {
    xClose = Math.abs(originX - tileX);
  }

  if (xClose <= range && yClose <= range) {
    isWithinRange = true;
  }

  return isWithinRange;
}
