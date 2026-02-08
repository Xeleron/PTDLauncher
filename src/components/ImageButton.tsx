import { useState } from 'react';
import './ImageButton.css';

interface ImageButtonProps {
  defaultSrc: string;
  hoverSrc: string;
  pressedSrc: string;
  alt: string;
  onClick?: () => void;
  className?: string;
}

export function ImageButton({
  defaultSrc,
  hoverSrc,
  pressedSrc,
  alt,
  onClick,
  className = '',
}: ImageButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const currentSrc = isPressed ? pressedSrc : isHovered ? hoverSrc : defaultSrc;

  return (
    <button
      className={`image-button ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={onClick}
      title={alt}
    >
      <img src={currentSrc} alt={alt} draggable={false} />
      <span className="image-button-label">{alt}</span>
    </button>
  );
}
