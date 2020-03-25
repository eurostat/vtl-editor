import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.scss';
import VtlEditor from './editor/VtlEditor';
import Form from 'react-bootstrap/Form'
import Header from "./component/Header";
import Navigation from "./component/Navigation";
import ErrorBox from "./component/ErrorBox";
import VersionChooser from "./component/VersionChooser";

function App() {
    return (
        <div className="App">
            <Header/>
            <Navigation/>
            <div className="top-bar">
                <span>File_name.vtl</span>
                <VersionChooser/>
            </div>
            <div className="vtl-container">
                <VtlEditor/>
            </div>
            <ErrorBox/>
        </div>
    );
}

export default App;
