const colors = {
  pink: "#F5B9D7",
  lavender: "#C9B6F1",
  blue: "#B6D9FA",
  sage: "#C6E4D0",
  wild: "#E9CDE0",
};

export default function UnoCard({
  color = "pink",
  value = "7",
  faceDown = false,
  small = false,
  onClick,
}) {
  const cardColor = colors[color] || colors.pink;

  return (
    <button
      className={[
        "uno-card",
        faceDown ? "face-down" : "",
        small ? "small-card" : "",
      ].join(" ")}
      style={{ "--card-color": cardColor }}
      onClick={onClick}
      type="button"
      aria-label={faceDown ? "Face-down card" : `${color} ${value}`}
    >
      <span className="card-decoration corner-top">❧</span>
      <span className="card-decoration corner-bottom">❧</span>

      <span className="card-corner top">
        {faceDown ? "♡" : value}
      </span>
      <span className="card-corner bottom">
        {faceDown ? "♡" : value}
      </span>

      <span className="card-sparkle sparkle-one">✧</span>
      <span className="card-sparkle sparkle-two">✦</span>
      <span className="card-sparkle sparkle-three">✧</span>

      <span className="card-heart heart-one">♡</span>
      <span className="card-heart heart-two">♥</span>
      <span className="card-heart heart-three">♡</span>

      <span className="card-oval">
        <span className="card-symbol">
          {faceDown ? "♡" : value}
        </span>

        <span className="card-message">
          {faceDown ? "my love" : "for you"}
        </span>
      </span>
    </button>
  );
}
