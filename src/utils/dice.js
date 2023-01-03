function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function rollDice(dice, modifier = 0) {
  let numDice = dice.split("d")[0];
  let dieType = dice.split("d")[1];
  let rolls = [];

  for (let i = 0; i < numDice; i++) {
    let roll = random(1, dieType);
    rolls.push(roll);
  }

  return {
    rolls: rolls,
    modifier: modifier,
    total: rolls.reduce((sum, a) => sum + a) + modifier,
  };
}

export function findModifier(stat) {
  if (stat == 10 || stat == 11) {
    return 0;
  } else if (stat == 12 || stat == 13) {
    return 1;
  } else if (stat == 14 || stat == 13) {
    return 2;
  } else if (stat == 16 || stat == 15) {
    return 3;
  } else if (stat == 18 || stat == 17) {
    return 4;
  } else if (stat == 8 || stat == 9) {
    return -1;
  } else if (stat == 6 || stat == 7) {
    return -2;
  } else if (stat == 4 || stat == 5) {
    return -3;
  }
}
