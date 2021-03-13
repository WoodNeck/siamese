import React, { useState } from "react";
import ReactTooltip from "react-tooltip";

import "./NameInput.css";

const NameInput: React.FC<{
  name: string;
  onUpdate: (newName: string) => any;
}> = ({ name, onUpdate }) => {
  const [editing, setEditing] = useState(false);

  return editing
    ? <>
        <input type="text" maxLength={10}
          onBlur={e => {
            const newName = e.target.value;
            if (newName !== name) {
              onUpdate(newName);
            }
            setEditing(false);
          }}
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
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
