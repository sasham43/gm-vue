export function isHighlightedTile(tile, row, col, playerX, playerY, speed) {
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
