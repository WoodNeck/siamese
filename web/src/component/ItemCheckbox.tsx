import { Checkbox } from "pretty-checkbox-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleIconChecked } from "../redux/actions";
import { RootState } from "../redux/reducers";

import "./ItemCheckbox.css";

const ItemCheckbox: React.FC<{
  id: string;
}> = ({ id }) => {
  const icon = useSelector((state: RootState) => state.icon[id]);
  const dispatch = useDispatch();

  return <div className="icon-item-checkbox-container" onClickCapture={e => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleIconChecked(id));
  }}>
    <Checkbox color="danger" animation="jelly" bigger shape="curve" variant="thick" className="icon-item-checkbox"
      style={{ pointerEvents: "none" }}
      icon={<svg className="icon-checkbox-icon"><use xlinkHref={`${process.env.PUBLIC_URL}/icons/cancel.svg#icon`} /></svg>}
      checked={Boolean(icon && icon.checked)} readOnly={true}
    />
  </div>
}

export default ItemCheckbox;
