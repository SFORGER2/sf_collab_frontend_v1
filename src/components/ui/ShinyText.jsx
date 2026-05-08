import "./style/ShinyText.css";

const ShinyText = ({
  text,
  children,
  disabled = false,
  speed = 5,
  className = "",
  fontStyle,
}) => {
  const animationDuration = `${speed}s`;
  const content = text ?? children;

  return (
    <div
      className={`shiny-text ${disabled ? "disabled" : ""} ${className}`}
      style={{ animationDuration, fontFamily: fontStyle }}
    >
      {content}
    </div>
  );
};

export default ShinyText;
