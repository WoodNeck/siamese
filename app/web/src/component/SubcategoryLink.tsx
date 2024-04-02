import React from "react";
import { useDispatch } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import { toggleHamburger } from "../redux/actions";

import "./SubcategoryLink.css";

const Subcategory: React.FC<{
  to: string;
  className?: string;
}> = ({ to, className, children }) => {
  const dispatch = useDispatch();
  const location = useLocation();

  return <NavLink to={to} className={`subcategory-item ${className ? className : ""}`} activeClassName="selected"
    isActive={() => location.pathname.startsWith(to)}
    onClick={() => dispatch(toggleHamburger())}
  >
    { children }
  </NavLink>
}

export default Subcategory;
