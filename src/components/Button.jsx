import React from 'react';

const Button = ({
  text,
  onClick,
  type = "button",
  variant = "primary",
  className = ""
}) => {

  const buttonClass =
    variant === "primary" ? "btn-fill" : "btn-line";

  return (
    <button
      type={type}
      className={`${buttonClass} ${className}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default Button;