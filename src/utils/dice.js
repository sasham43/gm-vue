function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function rollDice(dice) {
  let numDice = dice.split("d")[0];
  let dieType = dice.split("d")[1];
  let rolls = [];

  for (let i = 0; i < numDice; i++) {
    let roll = random(1, dieType);
    rolls.push(roll);
  }

  return {
    rolls: rolls,
    total: rolls.reduce((sum, a) => sum + a),
  };
}
