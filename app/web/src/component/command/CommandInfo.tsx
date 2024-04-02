import "./CommandInfo.css";

const CommandItem: React.FC<{
  title: string;
}> = ({ title, children }) => {
  return <div className="command-item command-info">
    <div className="command-info-title">{title}</div>
    {children}
  </div>
}

export default CommandItem;
