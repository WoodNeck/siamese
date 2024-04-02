import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux"
import { createStore } from "redux";

import "./index.css";
import Main from "./Main";
import reportWebVitals from "./reportWebVitals";

import rootReducer from "./redux/reducers";

const store = createStore(rootReducer);

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Main />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
