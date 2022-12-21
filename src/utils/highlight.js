export function isHighlightedTile(tile, row, col, playerX, playerY, speed) {
  let isWithinSpeed = false;
  //   if (this.mode === "player-move") {
  let xClose, yClose;

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
  //   }
  return isWithinSpeed;
}
