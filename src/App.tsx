import React, {useEffect, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.scss';
import VtlEditor from './editor/VtlEditor';
import Header from "./component/Header";
import Navigation from "./component/Navigation";
import ErrorBox from "./component/ErrorBox";
import OpenDialog from "./component/dialog/openDialog";
import {SnackbarProvider} from "notistack";
import {languageVersions, VTL_VERSION} from "./editor/settings";
import {editor, Position} from "monaco-editor";

const getTheme = (): string => {
    const item = window.localStorage.getItem("theme");
    return item ? JSON.parse(item) : "vtl";
};

function App() {
    const [files, setFiles] = useState([] as string[]);
    const [showDialog, setShowDialog] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showErrorBox, setShowErrorBox] = useState(false);
    const [code, setCode] = useState("");
    const [codeChanged, setCodeChanged] = useState(false);
    const [fileName, setFileName] = useState("untitled.vtl");
    const [theme, setTheme] = useState(getTheme());
    const [languageVersion, setLanguageVersion] = useState(languageVersions[languageVersions.length - 1].code as VTL_VERSION);
    const [cursorPosition, setCursorPosition] = useState(new Position(0, 0));
    const [tempCursor, setTempCursor] = useState(new Position(0, 0));
    const [errors, setErrors] = useState([] as editor.IMarkerData[]);

    useEffect(() => {
        retrieveFromLocalStorage("code", setCode);
        retrieveFromLocalStorage("codeChanged", setCodeChanged);
        retrieveFromLocalStorage("theme", setTheme);
        retrieveFromLocalStorage("showErrorBox", setShowErrorBox);
        retrieveFromLocalStorage("fileName", setFileName);
        console.log(getTheme());
    }, []);

    const retrieveFromLocalStorage = (key: string, setter: (v: any) => void): any => {
        const value = window.localStorage.getItem(key);
        if (value) {
            setter(JSON.parse(value));
        }
    };

    const saveToLocalStorage = (key: string, value: any) => {
        window.localStorage.setItem(key, JSON.stringify(value));
    };

    const updateFiles = (newFiles: string[], fileName: string) => {
        updateCodeChanged(false);
        // @ts-ignore
        //document.getElementsByClassName("logo")[0].focus();
        updateCode(newFiles[0]);
        //setFiles(newFiles);
        saveToLocalStorage("fileName", fileName);
        setFileName(fileName)
    };

    const updateCode = (val: string) => {
        saveToLocalStorage("code", val);
        setCode(val);
    };

    const updateTheme = (theme: string) => {
        setTheme(theme);
        saveToLocalStorage("theme", theme);
    };

    const updateCodeChanged = (val: boolean) => {
        saveToLocalStorage("codeChanged", val);
        setCodeChanged(val);
    };

    const changeMenuState = () => {
        setShowMenu(!showMenu);
    };

    const changeErrorBoxState = () => {
        saveToLocalStorage("showErrorBox", !showErrorBox);
        setShowErrorBox(!showErrorBox);
    };

    const getStyles = () => {
        let styling = "App";
        styling += showMenu ? "" : " hide-settings-nav";
        styling += showErrorBox ? "" : " hide-error-box";
        return styling;
    };

    const VtlEditorProps = {
        showMenu,
        showErrorBox,
        code,
        "setCode": updateCode,
        "setCodeChanged": updateCodeChanged,
        theme,
        languageVersion,
        setCursorPosition,
        tempCursor,
        setErrors
    };

    const NavigationProps = {
        "showDialog": setShowDialog,
        "changeMenu": changeMenuState,
        code,
        setCodeChanged,
        codeChanged,
        fileName,
        "settingsNavProps": {theme, "setTheme": updateTheme, languageVersion, setLanguageVersion}
    };

    const UploadDialogProps = {
        "onClose": setShowDialog,
        "onLoad": updateFiles,
        codeChanged
    };

    const ErrorBoxProps = {
        changeErrorBoxState,
        languageVersion,
        cursorPosition,
        errors,
        setTempCursor
    };

    return (
        <SnackbarProvider
            maxSnack={2}
            transitionDuration={500}
            autoHideDuration={6000}
            anchorOrigin={{
                vertical: "top",
                horizontal: "right"
            }}
            dense={true}
        >
            <div className={getStyles()}>
                <Header/>
                <Navigation {...NavigationProps}/>
                <div className={`middle-container ${theme}`}>
                    <div className="top-bar">
                        <span>{fileName}&nbsp;{codeChanged ? "*" : ""}</span>
                    </div>
                    <div className="vtl-container">
                        <VtlEditor {...VtlEditorProps}/>
                    </div>
                    <ErrorBox {...ErrorBoxProps} />
                </div>
                {showDialog ?
                    <OpenDialog {...UploadDialogProps}/> : null}
            </div>
        </SnackbarProvider>
    );
}

export default App;