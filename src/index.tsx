import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import Documentation from "./component/Documentation";

if (process.env.NODE_ENV !== "production") {
    localStorage.setItem("debug", "VRM:*");
}

ReactDOM.render(
    <Router basename={process.env.REACT_APP_ROUTER_BASE || ''}>
        <Switch>
            <Route exact path="/documentation" component={Documentation}/>
            <Route exact path="/" component={App}/>
            <Redirect to="/"/>
        </Switch>
    </Router>,
    document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
