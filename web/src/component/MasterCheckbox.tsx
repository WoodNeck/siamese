import { Checkbox } from "pretty-checkbox-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectAllIcons, unselectAllIcons } from "../redux/actions";
import { RootState } from "../redux/reducers";

import "./ItemCheckbox.css";

const MasterCheckbox: React.FC = () => {
  const icons = useSelector((state: RootState) => state.icon);
  const dispatch = useDispatch();
  const [allChecked, setAllChecked] = useState(false);

  useEffect(() => {
    setAllChecked(Object.values(icons).every(icon => icon.checked))
  }, [icons])

  return <div className="icon-item-checkbox-container" onClickCapture={e => {
    e.preventDefault();
    e.stopPropagation();

    if (allChecked) {
      dispatch(unselectAllIcons());
    } else {
      dispatch(selectAllIcons());
    }
  }}>
    <Checkbox color="danger" bigger shape="curve" variant="thick" className="icon-item-checkbox"
      icon={<svg className="icon-checkbox-icon"><use xlinkHref={`${process.env.PUBLIC_URL}/icons/cancel.svg#icon`} /></svg>}
      checked={allChecked} readOnly />
  </div>
}

export default MasterCheckbox;
