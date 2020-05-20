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

function App() {
    const [files, setFiles] = useState([] as string[]);
    const [showDialog, setShowDialog] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showErrorBox, setShowErrorBox] = useState(false);
    const [code, setCode] = useState("");
    const [codeChanged, setCodeChanged] = useState(false);
    const [fileName, setFileName] = useState("untitled.vtl");
    const [theme, setTheme] = useState("vtl");
    const [languageVersion, setLanguageVersion] = useState(languageVersions[languageVersions.length - 1].code as VTL_VERSION);
    useEffect(() => {

    }, [files]);


    const updateFiles = (newFiles: string[], fileName: string) => {
        setCodeChanged(false);
        setFiles(newFiles);
        setFileName(fileName)
    };

    const changeMenuState = () => {
        setShowMenu(!showMenu);
    };

    const changeErrorBoxState = () => {
        console.log("change error box");
        setShowErrorBox(!showErrorBox);
    };

    const getStyles = () => {
        let styling = "App";
        styling += showMenu ? "" : " hide-settings-nav";
        styling += showErrorBox ? "" : " hide-error-box";
        return styling;
    }

    const VtlEditorProps = {
        "browsedFiles": files,
        showMenu,
        showErrorBox,
        code,
        setCode,
        setCodeChanged,
        theme,
        languageVersion
    };

    const NavigationProps = {
        "showDialog": setShowDialog,
        "changeMenu": changeMenuState,
        code,
        setCodeChanged,
        codeChanged,
        fileName,
        "settingsNavProps": {theme, setTheme, languageVersion, setLanguageVersion}
    };

    const UploadDialogProps = {
        "onClose": setShowDialog,
        "onLoad": updateFiles,
        codeChanged
    };

    const ErrorBoxProps = {
        changeErrorBoxState
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
                        <span>{fileName}</span>
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