import { ConnectedRouter } from "connected-react-router";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { Redirect, Route, Switch } from "react-router-dom";
import { OidcProvider } from 'redux-oidc';
import App from "./App";
import Documentation from "./documentation/documentation";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import Callback from "./utility/callback";
import store, { browserHistory } from "./utility/store";
import userManager from "./utility/userManager";

if (process.env.NODE_ENV !== "production") {
    localStorage.setItem("debug", "VRM:*");
}

ReactDOM.render(
    <Provider store={store}>
        <OidcProvider store={store} userManager={userManager}>
            <ConnectedRouter history={browserHistory}>
                <Switch>
                    <Route exact path="/manual" component={Documentation}/>
                    <Route path="/callback" component={Callback}/>
                    <Route path="/" component={App}/>
                    <Redirect to="/"/>
                </Switch>
            </ConnectedRouter>
        </OidcProvider>
    </Provider>,
    document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
