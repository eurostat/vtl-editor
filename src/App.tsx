import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.scss';
import VtlEditor from './editor/VtlEditor';
import logo from './assets/european-logo.png';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faQuestionCircle, faSave,} from '@fortawesome/free-regular-svg-icons'
import {faUpload,} from '@fortawesome/free-solid-svg-icons';
import Form from 'react-bootstrap/Form'

function App() {
    return (
        <div className="App">
            <nav className="navbar navbar-expand-lg  static-top">
                <div className="header-container">

                        <img className="logo" src={logo} alt=""/>

                    <h1 className="title">Validation Rule Manager</h1>
                    <div className="nav-button">
                        <button className="btn btn-primary default-button">
                            <span>Log out</span>
                        </button>
                    </div>
                </div>
            </nav>
            <hr className="bar"/>
            <div className="nav flex-column nav-pills left-nav" aria-orientation="vertical">
                <FontAwesomeIcon icon={faSave}/>
                <FontAwesomeIcon icon={faUpload}/>
                <FontAwesomeIcon icon={faQuestionCircle}/>
            </div>
            <div className="top-bar">
                <span>File_name.vtl</span>
                <div className="version-container">
                    <span style={{float:"left"}}>Language version:</span>
                    <Form.Control className="select-version" as="select">
                        <option>1.0</option>
                        <option>1.1</option>
                        <option>2.0</option>
                    </Form.Control>
                </div>
            </div>
            <div className="vtl-container">
                <VtlEditor/>
            </div>
            <hr className="error-hr"/>
            <div className="error-container">


            </div>
        </div>
    );
}

export default App;
