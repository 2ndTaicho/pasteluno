import { useEffect, useRef, useState } from "react";
import UnoCard from "./components/UnoCard";

import {
  COLORS,
  startGame,
  canPlay,
  playCard,
  drawCard,
  callUno,
  chooseBotCard,
  chooseBotColor,
} from "./game/engine";

import { playSound } from "./game/sounds";
import { animateCard, animateDraw } from "./game/animations";

import "./styles/cards.css";
import "./styles/game.css";
import "./styles/menu.css";
import "./styles/animations.css";
import "./styles/celebrations.css";

const HEARTS = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  left: `${(index * 37 + 11) % 100}%`,
  delay: `${(index * 0.31) % 3}s`,
  duration: `${3.2 + (index % 5) * 0.45}s`,
  size: `${15 + (index % 4) * 9}px`,
  symbol: ["♡", "♥", "✧", "✦"][index % 4],
}));

function Bot({ name, position, count, active, uno }) {
  return (
    <div
      className={[
        "bot",
        `bot-${position}`,
        active ? "bot-active" : "",
      ].join(" ")}
    >
      <div className="player-name">
        <span className="player-avatar">♡</span>
        <span>{name}</span>
        <span className="card-count">{count} cards</span>

        {active && <span className="turn-dot">●</span>}
      </div>

      {uno && <span className="bot-uno-badge">UNO!</span>}

      <div className="bot-hand">
        {Array.from(
          { length: Math.min(count, 12) },
          (_, index) => (
            <UnoCard key={index} faceDown small />
          )
        )}
      </div>
    </div>
  );
}

function Rules({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="game-modal">
        <h2>How to Play ♡</h2>

        <p>Match the color or symbol of the discard card.</p>
        <p>Skip (⊘) skips the next player.</p>
        <p>Reverse (↻) changes the direction.</p>
        <p>+2 and +4 make the next player draw cards and lose their turn.</p>
        <p>Wild (✿) lets you choose a new color.</p>
        <p>Drawing a card ends your turn.</p>
        <p>
          When you have two cards, press UNO before playing
          your second-to-last card. Forgetting costs two cards!
        </p>
        <p>Be the first to get rid of all your cards!</p>

        <button className="modal-button" onClick={onClose}>
          Got it ♡
        </button>
      </div>
    </div>
  );
}

function StartMenu({ onPlay, onRules, sound, onSoundChange }) {
  return (
    <main className="menu-page">
      <div className="menu-sparkle menu-sparkle-one">✧</div>
      <div className="menu-sparkle menu-sparkle-two">♡</div>
      <div className="menu-sparkle menu-sparkle-three">✦</div>
      <div className="menu-sparkle menu-sparkle-four">♡</div>

      <div className="menu-panel">
        <span className="menu-eyebrow">
          ♡ THE PASTEL EDITION ♡
        </span>

        <div className="menu-card-display" aria-hidden="true">
          <div className="menu-card menu-card-left">
            <UnoCard color="blue" value="2" />
          </div>

          <div className="menu-card menu-card-middle">
            <UnoCard color="pink" value="♡" />
          </div>

          <div className="menu-card menu-card-right">
            <UnoCard color="lavender" value="7" />
          </div>
        </div>

        <h1 className="menu-title">My Love, For You</h1>

        <p className="menu-subtitle">
          A little game made with love and a little luck.
        </p>

        <div className="menu-buttons">
          <button className="menu-play-button" onClick={onPlay}>
            Play Game ♡
          </button>

          <button
            className="menu-secondary-button"
            onClick={onRules}
          >
            How to Play
          </button>
        </div>

        <label className="menu-sound">
          <input
            type="checkbox"
            checked={sound}
            onChange={(event) =>
              onSoundChange(event.target.checked)
            }
          />
          <span>Sound effects {sound ? "On" : "Off"}</span>
        </label>

        <div className="menu-divider">♡</div>

        <p className="menu-footer">
          ONE PLAYER · THREE BOTS · ENDLESS LOVE
        </p>
      </div>
    </main>
  );
}

function UnoAnnouncement({ message }) {
  if (!message) return null;

  return (
    <div className="uno-announcement" aria-live="polite">
      <div className="uno-announcement-inner">
        <span className="announcement-sparkle">✧</span>
        <strong>{message}</strong>
        <span className="announcement-sparkle">♡</span>
      </div>
    </div>
  );
}

function Celebration({ winner, onPlayAgain, onMenu }) {
  const humanWon = winner === 0;

  return (
    <div className="modal-overlay celebration-overlay">
      <div className="heart-confetti" aria-hidden="true">
        {HEARTS.map((heart) => (
          <span
            key={heart.id}
            className="falling-heart"
            style={{
              left: heart.left,
              animationDelay: heart.delay,
              animationDuration: heart.duration,
              fontSize: heart.size,
            }}
          >
            {heart.symbol}
          </span>
        ))}
      </div>

      <div className="game-modal celebration-modal">
        <div className="celebration-crown">
          {humanWon ? "♡" : "✧"}
        </div>

        <span className="celebration-eyebrow">
          {humanWon ? "YOU DID IT!" : "GAME OVER"}
        </span>

        <h2>
          {humanWon
            ? "You Won, My Love!"
            : `Bot ${winner} Won!`}
        </h2>

        <p>
          {humanWon
            ? "A little luck and a lot of love. What a lovely win!"
            : "The cards weren't on your side this time. Try again ♡"}
        </p>

        <div className="celebration-stars" aria-hidden="true">
          ✧ ♡ ✦ ♡ ✧
        </div>

        <button
          className="modal-button"
          onClick={onPlayAgain}
        >
          Play Again ♡
        </button>

        <button
          className="modal-button menu-return-button"
          onClick={onMenu}
        >
          Main Menu
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [game, setGame] = useState(startGame);
  const [screen, setScreen] = useState("menu");
  const [showRules, setShowRules] = useState(false);
  const [sound, setSound] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [announcement, setAnnouncement] = useState(null);

  const previousWinner = useRef(null);
  const animationLock = useRef(false);
  const gameRef = useRef(game);
  const animationToken = useRef(0);
  const announcementId = useRef(0);

  gameRef.current = game;

  const playerTurn =
    screen === "game" &&
    game.currentPlayer === 0 &&
    game.winner === null &&
    !animating;

  const topCard = game.discard.at(-1);

  const canCallUno =
    playerTurn &&
    game.hands[0].length === 2 &&
    !game.unoCalled &&
    !game.pendingWild;

  function showAnnouncement(message) {
    announcementId.current += 1;

    setAnnouncement({
      id: announcementId.current,
      message,
    });
  }

  function lockAnimation() {
    if (animationLock.current) return false;

    animationLock.current = true;
    setAnimating(true);
    return true;
  }

  function unlockAnimation() {
    animationLock.current = false;
    setAnimating(false);
  }

  function cancelAnimations() {
    animationToken.current++;
    unlockAnimation();

    document.querySelectorAll(".flying-card").forEach(
      (element) => element.remove()
    );
  }

  useEffect(() => {
    if (!announcement) return;

    const timeout = setTimeout(() => {
      setAnnouncement((current) =>
        current?.id === announcement.id ? null : current
      );
    }, 1700);

    return () => clearTimeout(timeout);
  }, [announcement]);

  useEffect(() => {
    if (
      screen !== "game" ||
      game.winner !== null ||
      game.currentPlayer === 0 ||
      showRules ||
      animating
    ) {
      return;
    }

    const timeout = setTimeout(async () => {
      if (!lockAnimation()) return;

      const token = animationToken.current;
      const previous = gameRef.current;

      if (
        previous.currentPlayer === 0 ||
        previous.winner !== null
      ) {
        unlockAnimation();
        return;
      }

      const player = previous.currentPlayer;
      const chosen = chooseBotCard(previous);

      const position =
        player === 1
          ? "left"
          : player === 2
            ? "top"
            : "right";

      if (chosen) {
        const source = document.querySelector(
          `.bot-${position} .bot-hand .uno-card`
        );

        const destination = document.querySelector(
          ".discard-pile .uno-card"
        );

        await animateCard(source, destination);

        if (token !== animationToken.current) return;

        const color =
          chosen.color === "wild"
            ? chooseBotColor(previous.hands[player])
            : null;

        const next = playCard(previous, chosen.id, color);
        setGame(next);

        if (
          next.winner === null &&
          next.hands[player].length === 1
        ) {
          showAnnouncement(`Bot ${player} says UNO!`);
          playSound("uno", sound);
        }
      } else {
        const source = document.querySelector(
          ".draw-pile .uno-card"
        );

        const destination = document.querySelector(
          `.bot-${position} .bot-hand .uno-card`
        );

        await animateDraw(source, destination);

        if (token !== animationToken.current) return;

        setGame(drawCard(previous));
      }

      unlockAnimation();
    }, 1100);

    return () => clearTimeout(timeout);
  }, [game, screen, showRules, animating, sound]);

  useEffect(() => {
    if (
      screen === "game" &&
      game.winner !== null &&
      previousWinner.current === null
    ) {
      playSound("win", sound);
    }

    previousWinner.current = game.winner;
  }, [game.winner, screen, sound]);

  function startNewGame() {
    cancelAnimations();
    previousWinner.current = null;
    setAnnouncement(null);
    setGame(startGame());
    setShowRules(false);
    setScreen("game");
    playSound("start", sound);
  }

  async function finishCardPlay(cardId, source) {
    if (!lockAnimation()) return;

    const token = animationToken.current;
    const destination = document.querySelector(
      ".discard-pile .uno-card"
    );

    await animateCard(source, destination);

    if (token !== animationToken.current) return;

    setGame((previous) => playCard(previous, cardId));
    playSound("play", sound);
    unlockAnimation();
  }

  function handlePlay(card, event) {
    if (!playerTurn || game.pendingWild || showRules) return;
    if (!canPlay(card, game)) return;

    if (card.color === "wild") {
      setGame((previous) => playCard(previous, card.id));
      return;
    }

    finishCardPlay(card.id, event.currentTarget);
  }

  async function handleColorChoice(color) {
    if (!game.pendingWild || animationLock.current) return;
    if (!lockAnimation()) return;

    const token = animationToken.current;
    const cardId = game.pendingWild;

    const selected = game.hands[0].find(
      (card) => card.id === cardId
    );

    const source = [
      ...document.querySelectorAll(".player-hand .uno-card"),
    ].find(
      (element) =>
        element.getAttribute("aria-label") ===
        `wild ${selected?.value}`
    );

    const destination = document.querySelector(
      ".discard-pile .uno-card"
    );

    await animateCard(source, destination);

    if (token !== animationToken.current) return;

    setGame((previous) =>
      playCard(previous, cardId, color)
    );

    playSound("play", sound);
    unlockAnimation();
  }

  async function handleDraw() {
    if (!playerTurn || game.pendingWild || showRules) return;
    if (!lockAnimation()) return;

    const token = animationToken.current;

    const source = document.querySelector(
      ".draw-pile .uno-card"
    );

    const destination = document.querySelector(
      ".player-hand .uno-card:last-child"
    );

    await animateDraw(source, destination);

    if (token !== animationToken.current) return;

    setGame((previous) => drawCard(previous));
    playSound("draw", sound);
    unlockAnimation();
  }

  function handleUno() {
    if (!canCallUno) return;

    setGame((previous) => callUno(previous));
    showAnnouncement("UNO! ♡");
    playSound("uno", sound);
  }

  function returnToMenu() {
    cancelAnimations();
    setAnnouncement(null);
    setShowRules(false);
    setScreen("menu");
  }

  if (screen === "menu") {
    return (
      <>
        <StartMenu
          onPlay={startNewGame}
          onRules={() => setShowRules(true)}
          sound={sound}
          onSoundChange={setSound}
        />

        {showRules && (
          <Rules onClose={() => setShowRules(false)} />
        )}
      </>
    );
  }

  return (
    <main className="game-page">
      <header className="game-header">
        <span className="header-detail">
          ♡ THE PASTEL EDITION
        </span>

        <h1>My Love, For You</h1>

        <span className="header-detail">
          A LITTLE GAME MADE WITH LOVE
        </span>

        <div className="header-actions">
          <button onClick={startNewGame}>
            New Game ↻
          </button>

          <button onClick={() => setShowRules(true)}>
            How to Play ♡
          </button>

          <button onClick={returnToMenu}>
            Main Menu ♡
          </button>
        </div>
      </header>

      <section
        className={[
          "game-board",
          playerTurn ? "board-your-turn" : "",
        ].join(" ")}
      >
        <Bot
          name="Bot 2"
          position="top"
          count={game.hands[2].length}
          active={game.currentPlayer === 2}
          uno={game.hands[2].length === 1}
        />

        <Bot
          name="Bot 1"
          position="left"
          count={game.hands[1].length}
          active={game.currentPlayer === 1}
          uno={game.hands[1].length === 1}
        />

        <Bot
          name="Bot 3"
          position="right"
          count={game.hands[3].length}
          active={game.currentPlayer === 3}
          uno={game.hands[3].length === 1}
        />

        <div className="table-center">
          <div
            className={[
              "turn-label",
              playerTurn ? "turn-label-active" : "",
            ].join(" ")}
          >
            {game.winner !== null
              ? "♡ GAME OVER ♡"
              : playerTurn
                ? "♡ YOUR TURN ♡"
                : `♡ BOT ${game.currentPlayer}'S TURN ♡`}
          </div>

          <div className="play-piles">
            <div className="pile draw-pile">
              <UnoCard faceDown onClick={handleDraw} />

              <span>
                DRAW PILE ({game.deck.length})
              </span>
            </div>

            <div className="pile discard-pile">
              <UnoCard
                color={topCard.color}
                value={topCard.value}
              />

              <span>DISCARD PILE</span>
            </div>
          </div>

          <p className="table-message">
            {game.status}
          </p>

          <div className="active-color">
            Current color:
            <span
              className={`color-indicator ${game.activeColor}`}
            >
              {game.activeColor}
            </span>
          </div>
        </div>
      </section>

      <section
        className={[
          "player-area",
          playerTurn ? "player-area-active" : "",
        ].join(" ")}
      >
        <div className="player-info">
          <span className="player-avatar">♡</span>
          <span>You</span>

          <span className="card-count">
            {game.hands[0].length} cards
          </span>

          {playerTurn && (
            <span className="turn-dot">●</span>
          )}
        </div>

        <div className="player-hand">
          {game.hands[0].map((card) => (
            <div
              key={card.id}
              className={
                playerTurn && canPlay(card, game)
                  ? "playable-card"
                  : "unplayable-card"
              }
            >
              <UnoCard
                color={card.color}
                value={card.value}
                onClick={(event) =>
                  handlePlay(card, event)
                }
              />
            </div>
          ))}
        </div>

        <div className="player-actions">
          <button
            className="action-button uno-button"
            disabled={!canCallUno}
            onClick={handleUno}
          >
            {game.unoCalled
              ? "UNO Called ♡"
              : "UNO!"}
          </button>

          <button
            className="action-button draw-button"
            onClick={handleDraw}
            disabled={
              !playerTurn ||
              !!game.pendingWild
            }
          >
            Draw Card ♡
          </button>
        </div>
      </section>

      <footer className="game-footer">
        Made with love, played with a little luck ♡
      </footer>

      {announcement && game.winner === null && (
        <UnoAnnouncement
          key={announcement.id}
          message={announcement.message}
        />
      )}

      {game.pendingWild && (
        <div className="modal-overlay">
          <div className="game-modal">
            <h2>Choose your color ♡</h2>

            <p>Which color would you like to play?</p>

            <div className="color-choices">
              {COLORS.map((color) => (
                <button
                  key={color}
                  className={`color-choice ${color}`}
                  onClick={() => handleColorChoice(color)}
                  aria-label={`Choose ${color}`}
                >
                  ♡
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {game.winner !== null && (
        <Celebration
          winner={game.winner}
          onPlayAgain={startNewGame}
          onMenu={returnToMenu}
        />
      )}

      {showRules && (
        <Rules onClose={() => setShowRules(false)} />
      )}
    </main>
  );
}
