import ReactTooltip from "react-tooltip";

import "./CommandItem.css";

interface Command {
  CMD: string;
  DESC: string;
  USAGE?: string;
  ALIAS?: readonly string[];
}

const CommandItem: React.FC<{
  command: Command;
  parent?: {
    CMD: string;
  };
  voiceOnly?: boolean;
}> = ({ command, parent, children, voiceOnly = false }) => {
  const commandName = parent ? `${parent.CMD} ${command.CMD}` : command.CMD;

  return <div className="command-item">
    <div className="command-header">
      <div className="command-title">
        {voiceOnly &&
          <>
            <svg className="command-voice-icon" data-tip data-for="voice-channel-tooltip">
              <use xlinkHref={`${process.env.PUBLIC_URL}/icons/volume-up.svg#icon`} />
            </svg>
            <ReactTooltip id="voice-channel-tooltip" place="top" type="dark" effect="solid">
              <span>음성 채널에서만 사용 가능한 명령어입니다.</span>
            </ReactTooltip>
          </>
        }
        { commandName }
        {command.ALIAS &&
        <div className="command-alias">
          <div>or...</div>
          {
            command.ALIAS.map(alias => (<div key={alias} className="command-alias-item">{alias}</div>))
          }
        </div>
      }
      </div>
      {command.USAGE &&
        <div className="command-usage">사용법: 샴 {commandName} {command.USAGE}</div>
      }
    </div>
    {children}
  </div>
}

export default CommandItem;
