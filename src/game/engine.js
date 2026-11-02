export const COLORS = ["pink", "lavender", "blue", "sage"];

let nextId = 0;

function card(color, value) {
  return { id: ++nextId, color, value };
}

export function shuffle(cards) {
  const result = [...cards];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export function createDeck() {
  const deck = [];

  for (const color of COLORS) {
    deck.push(card(color, "0"));

    for (let number = 1; number <= 9; number++) {
      deck.push(card(color, String(number)));
      deck.push(card(color, String(number)));
    }

    for (const action of ["+2", "↻", "⊘"]) {
      deck.push(card(color, action));
      deck.push(card(color, action));
    }
  }

  for (let i = 0; i < 4; i++) {
    deck.push(card("wild", "✿"));
    deck.push(card("wild", "+4"));
  }

  return shuffle(deck);
}

export function startGame() {
  const deck = createDeck();
  const hands = [[], [], [], []];

  for (let i = 0; i < 7; i++) {
    for (const hand of hands) {
      hand.push(deck.pop());
    }
  }

  const startingIndex = deck.findIndex(
    (c) => c.color !== "wild" && /^[0-9]$/.test(c.value)
  );

  const [firstCard] = deck.splice(startingIndex, 1);

  return {
    hands,
    deck,
    discard: [firstCard],
    activeColor: firstCard.color,
    currentPlayer: 0,
    direction: 1,
    winner: null,
    status: "Your turn! ♡",
    pendingWild: null,
    unoCalled: false,
  };
}

export function canPlay(card, game) {
  const top = game.discard.at(-1);

  return (
    card.color === "wild" ||
    card.color === game.activeColor ||
    card.value === top.value
  );
}

export function nextPlayer(current, direction, steps = 1) {
  return (current + direction * steps + 16) % 4;
}

function takeCards(game, player, count) {
  const hands = game.hands.map((hand) => [...hand]);
  const deck = [...game.deck];
  let discard = [...game.discard];

  for (let i = 0; i < count; i++) {
    if (!deck.length && discard.length > 1) {
      const top = discard.at(-1);
      deck.push(...shuffle(discard.slice(0, -1)));
      discard = [top];
    }

    if (!deck.length) break;

    hands[player].push(deck.pop());
  }

  return {
    ...game,
    hands,
    deck,
    discard,
  };
}

export function callUno(game) {
  if (
    game.winner !== null ||
    game.currentPlayer !== 0 ||
    game.pendingWild ||
    game.hands[0].length !== 2 ||
    game.unoCalled
  ) {
    return game;
  }

  return {
    ...game,
    unoCalled: true,
    status: "UNO called! ♡",
  };
}

export function drawCard(game) {
  if (game.winner !== null || game.pendingWild) {
    return game;
  }

  const player = game.currentPlayer;
  const next = takeCards(game, player, 1);

  return {
    ...next,
    currentPlayer: nextPlayer(player, game.direction),
    unoCalled: false,
    status:
      player === 0
        ? "You drew a card. Next turn! ♡"
        : `Bot ${player} drew a card.`,
  };
}

export function playCard(game, cardId, chosenColor = null) {
  if (game.winner !== null) return game;

  const player = game.currentPlayer;
  const selected = game.hands[player].find(
    (card) => card.id === cardId
  );

  if (!selected || !canPlay(selected, game)) {
    return game;
  }

  if (selected.color === "wild" && !chosenColor) {
    return { ...game, pendingWild: cardId };
  }

  if (
    selected.color === "wild" &&
    !COLORS.includes(chosenColor)
  ) {
    return game;
  }

  const hands = game.hands.map((hand) => [...hand]);

  hands[player] = hands[player].filter(
    (card) => card.id !== cardId
  );

  let next = {
    ...game,
    hands,
    discard: [...game.discard, selected],
    activeColor:
      selected.color === "wild"
        ? chosenColor
        : selected.color,
    pendingWild: null,
  };

  if (hands[player].length === 0) {
    return {
      ...next,
      winner: player,
      unoCalled: false,
      status:
        player === 0
          ? "You won! ♡"
          : `Bot ${player} won!`,
    };
  }

  let penaltyApplied = false;

  if (
    player === 0 &&
    hands[player].length === 1 &&
    !game.unoCalled
  ) {
    next = takeCards(next, 0, 2);
    penaltyApplied = true;
  }

  let direction = game.direction;
  let steps = 1;

  if (selected.value === "↻") {
    direction *= -1;
  }

  if (selected.value === "⊘") {
    steps = 2;
  }

  next.direction = direction;

  const target = nextPlayer(player, direction);

  if (
    selected.value === "+2" ||
    selected.value === "+4"
  ) {
    next = takeCards(
      next,
      target,
      selected.value === "+2" ? 2 : 4
    );

    steps = 2;
  }

  next.currentPlayer = nextPlayer(
    player,
    direction,
    steps
  );

  next.unoCalled = false;

  next.status = penaltyApplied
    ? "You forgot to call UNO! Draw 2 cards ♡"
    : player === 0
      ? "Card played! ♡"
      : `Bot ${player} played ${selected.value}.`;

  return next;
}

export function chooseBotColor(hand) {
  const counts = Object.fromEntries(
    COLORS.map((color) => [color, 0])
  );

  for (const card of hand) {
    if (card.color !== "wild") {
      counts[card.color]++;
    }
  }

  return [...COLORS].sort(
    (a, b) => counts[b] - counts[a]
  )[0];
}

export function chooseBotCard(game) {
  const player = game.currentPlayer;
  const hand = game.hands[player];
  const playable = hand.filter((card) => canPlay(card, game));

  if (!playable.length) return null;

  const next = nextPlayer(player, game.direction);
  const nextPlayerCards = game.hands[next].length;

  const colorCounts = Object.fromEntries(
    COLORS.map((color) => [color, 0])
  );

  for (const card of hand) {
    if (card.color !== "wild") {
      colorCounts[card.color]++;
    }
  }

  function scoreCard(card) {
    let score = 0;

    if (card.color !== "wild") {
      score += colorCounts[card.color] * 3;
    } else {
      score -= 15;
    }

    if (card.value === "+2") {
      score += nextPlayerCards <= 3 ? 18 : 7;
    }

    if (card.value === "⊘") {
      score += nextPlayerCards <= 3 ? 17 : 5;
    }

    if (card.value === "↻") {
      score += nextPlayerCards <= 3 ? 12 : 3;
    }

    if (card.value === "+4") {
      score += nextPlayerCards <= 2 ? 25 : -8;
    }

    if (card.value === "✿") {
      score += hand.length <= 3 ? 5 : -5;
    }

    if (hand.length <= 2) {
      score += card.color === "wild" ? 12 : 5;
    }

    score += Math.random() * 2;

    return score;
  }

  return [...playable].sort(
    (a, b) => scoreCard(b) - scoreCard(a)
  )[0];
}
