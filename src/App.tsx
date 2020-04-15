import React, {useEffect, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.scss';
import VtlEditor from './editor/VtlEditor';
import Header from "./component/Header";
import Navigation from "./component/Navigation";
import ErrorBox from "./component/ErrorBox";
import UploadDialog from "./component/upload/UploadDialog";
import {SnackbarProvider} from "notistack";
import {languageVersions, VTL_VERSION} from "./editor/settings";


const defaultText = `ds_PY := lag ( na_main, 1 ) over ( order by time );

ds_L_CY := na_main [ sub prices = "L" ] ;
ds_L_PY := ds_PY [ sub prices = "L" ] ;
ds_V_PY := ds_PY [ sub prices = "V" ] ;
ds_Y_CY := na_main [ sub prices = "Y" ] ;


ErrB:= check((abs(ds_Y_CY-(ds_L_CY / ds_L_PY[ filter obs_value <> 0 ] * ds_V_PY)) / ds_Y_CY [ filter obs_value <> 0 ]) < 0.001, 
    errorcode("The observation values do not comply with the Y(t)= L(t) * V(t-1) / L(t-1) relation"), 
    errorlevel("Error") );

ErrB`;

function App() {
    const [files, setFiles] = useState([] as string[]);
    const [showDialog, setShowDialog] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [code, setCode] = useState(defaultText);
    const [codeChanged, setCodeChanged] = useState(false);
    const [fileName, setFileName] = useState("newFile.vtl");
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

    const VtlEditorProps = {
        "browsedFiles": files,
        showMenu,
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
            <div className={showMenu ? "App" : "App hide-settings-nav"}>
                <Header/>
                <Navigation {...NavigationProps}/>
                <div className={`middle-container ${theme}`}>
                    <div className="top-bar">
                        <span>{fileName}</span>
                    </div>
                    <div className="vtl-container">
                        <VtlEditor {...VtlEditorProps}/>
                    </div>
                    <ErrorBox/>
                </div>
                {showDialog ?
                    <UploadDialog {...UploadDialogProps}/> : null}
            </div>
        </SnackbarProvider>
    );
}

export default App;