import React from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { toggleHamburger } from "../redux/actions";

import "./SubcategoryLink.css";

const Subcategory: React.FC<{
  to: string;
  className?: string;
}> = ({ to, className, children }) => {
  const dispatch = useDispatch();

  return <Link to={to} className={`subcategory-item ${className ? className : ""}`}
    onClick={() => dispatch(toggleHamburger())}
  >
    { children }
  </Link>
}

export default Subcategory;
