import React, { useCallback, useState } from "react";
import ReactTooltip from "react-tooltip";

import "./NameInput.css";

const NameInput: React.FC<{
  name: string;
  onUpdate: (newName: string) => any;
}> = ({ name, onUpdate }) => {
  const [editing, setEditing] = useState(false);

  const updateName = useCallback((newName: string) => {
    if (newName !== name) {
      onUpdate(newName);
    }
    setEditing(false);
  }, [name, onUpdate]);

  return editing
    ? <>
        <input type="text" maxLength={10}
          onBlur={e => updateName(e.target.value)}
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === "Escape") {
              updateName(e.currentTarget.value);
            }
          }}
          defaultValue={name} autoFocus={true}
          className="icon-item-name editing" />
        <svg key={1} className="icon-item-icon icon-edit-finish-icon" onClick={e => {
          e.stopPropagation();
          e.preventDefault();
        }}>
          <use xlinkHref={`${process.env.PUBLIC_URL}/icons/approve.svg#icon`} />
        </svg>
      </>
    : <>
      <span className="icon-item-name">{name}</span>
      <svg key={2} className="icon-item-icon icon-edit-icon" onClick={e => {
        e.stopPropagation();
        e.preventDefault();
        setEditing(true);
      }} data-tip data-for="icon-edit-tooltip">
        <use xlinkHref={`${process.env.PUBLIC_URL}/icons/edit.svg#icon`} />
      </svg>
      <ReactTooltip id="icon-edit-tooltip" place="right" type="light" effect="solid">
        <span>이름 변경하기</span>
      </ReactTooltip>
    </>;
};

export default NameInput;
