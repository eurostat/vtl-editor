import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Redirect, Route, Switch } from "react-router-dom";
import App from "./App";
import Documentation from "./documentation/documentation";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import store from "./utility/store";

if (process.env.NODE_ENV !== "production") {
    localStorage.setItem("debug", "VRM:*");
}

ReactDOM.render(
    <Provider store={store}>
        <Router basename={process.env.REACT_APP_ROUTER_BASE || ''}>
            <Switch>
                <Route exact path="/manual" component={Documentation}/>
                <Route path="/" component={App}/>
                <Redirect to="/"/>
            </Switch>
        </Router>
    </Provider>,
    document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
