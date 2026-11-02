const animationTime = 480;

function getCenter(element) {
  const rect = element.getBoundingClientRect();

  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function createFlyingCard(source) {
  const rect = source.getBoundingClientRect();
  const clone = source.cloneNode(true);

  clone.classList.add("flying-card");

  Object.assign(clone.style, {
    position: "fixed",
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: "0",
    zIndex: "9999",
    pointerEvents: "none",
    transformOrigin: "center center",
  });

  document.body.appendChild(clone);

  return clone;
}

export function animateCard(source, destination, options = {}) {
  if (!source || !destination) {
    return Promise.resolve();
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return Promise.resolve();
  }

  const start = getCenter(source);
  const end = getCenter(destination);
  const clone = createFlyingCard(source);

  const differenceX = end.x - start.x;
  const differenceY = end.y - start.y;

  const destinationRect = destination.getBoundingClientRect();
  const sourceRect = source.getBoundingClientRect();

  const scale = Math.min(
    destinationRect.width / sourceRect.width,
    destinationRect.height / sourceRect.height
  );

  const rotation = options.rotation ?? -8;

  const animation = clone.animate(
    [
      {
        transform: "translate(0, 0) scale(1) rotate(0deg)",
        opacity: 1,
      },
      {
        transform: `translate(${differenceX * 0.5}px, ${
          differenceY * 0.5 - 45
        }px) scale(${(1 + scale) / 2}) rotate(${rotation}deg)`,
        opacity: 1,
        offset: 0.5,
      },
      {
        transform: `translate(${differenceX}px, ${differenceY}px) scale(${scale}) rotate(0deg)`,
        opacity: 1,
      },
    ],
    {
      duration: animationTime,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "forwards",
    }
  );

  return animation.finished
    .catch(() => {})
    .then(() => {
      clone.remove();
    });
}

export function animateDraw(source, destination) {
  return animateCard(source, destination, {
    rotation: 12,
  });
}
