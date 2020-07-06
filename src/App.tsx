import 'bootstrap/dist/css/bootstrap.min.css';
import {editor, Position} from "monaco-editor";
import {SnackbarProvider} from "notistack";
import React, {useEffect, useState} from 'react';
import './App.scss';
import OpenDialog from "./component/dialog/openDialog";
import GuideOverlay from "./component/GuideOverlay";
import Header from "./component/Header";
import Navigation from "./component/Navigation";
import {languageVersions} from "./editor/settings";
import EditorView from "./component/EditorView";
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import SDMXView from "./component/SDMXView/SDMXView";
import {ISdmxResult} from "./models/api/ISdmxResult";
import {SdmxRegistry} from "./models/api/SdmxRegistry";
import {Agency} from "./models/api/Agency";
import {FinalStructureEnum} from "./models/api/DataStructure";

const getTheme = (): string => {
    const item = window.localStorage.getItem("theme");
    return item ? JSON.parse(item) : "vtl";
};

function App() {
    const [showDialog, setShowDialog] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showErrorBox, setShowErrorBox] = useState(false);
    const [code, setCode] = useState("");
    const [codeChanged, setCodeChanged] = useState(false);
    const [fileName, setFileName] = useState("untitled.vtl");
    const [theme, setTheme] = useState(getTheme());
    const [languageVersion, setLanguageVersion] = useState(languageVersions[languageVersions.length - 1].code);
    const [cursorPosition, setCursorPosition] = useState(new Position(0, 0));
    const [tempCursor, setTempCursor] = useState(new Position(0, 0));
    const [errors, setErrors] = useState([] as editor.IMarkerData[]);
    const [errorBoxSize, setErrorBoxSize] = useState(0);
    /*SDMX STATES */
    const [registry, setRegistry] = useState<SdmxRegistry | null>(null);
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [selectedAgencies, setSelectedAgencies] = useState<Agency[]>([]);
    const [finalType, setFinalType] = useState<FinalStructureEnum>(FinalStructureEnum.ALL);
    const [sdmxResult, setSdmxResult] = useState<ISdmxResult | null>(null);



    useEffect(() => {
        retrieveFromLocalStorage("code", setCode);
        retrieveFromLocalStorage("codeChanged", setCodeChanged);
        retrieveFromLocalStorage("theme", setTheme);
        retrieveFromLocalStorage("showErrorBox", setShowErrorBox);
        retrieveFromLocalStorage("fileName", setFileName);
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
        updateFileName(fileName);
    };

    const updateFileName = (fileName: string) => {
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

    const createNewFile = () => {
        updateCode("");
        updateCodeChanged(false);
        updateFileName("untitled.vtl")
    };

    const clearSdmxState = () => {
        setRegistry(null);
        setAgencies([]);
        setSelectedAgencies([]);
        setFinalType(FinalStructureEnum.ALL);
    }

    const VtlEditorProps = {
        "resizeLayout": [showMenu, showErrorBox, errorBoxSize],
        code,
        "setCode": updateCode,
        "setCodeChanged": updateCodeChanged,
        theme,
        languageVersion,
        setCursorPosition,
        tempCursor,
        setErrors,
        sdmxResult
    };

    const NavigationProps = {
        "showDialog": setShowDialog,
        "changeMenu": changeMenuState,
        code,
        setCodeChanged,
        codeChanged,
        fileName,
        createNewFile,
        "settingsNavProps": {theme, "setTheme": updateTheme, languageVersion, setLanguageVersion},
    };

    const UploadDialogProps = {
        "onClose": setShowDialog,
        "onLoad": updateFiles,
        codeChanged
    };

    const ErrorBoxProps = {
        showErrorBox,
        changeErrorBoxState,
        setErrorBoxSize,
        languageVersion,
        cursorPosition,
        errors,
        setTempCursor
    };

    const EditorViewProps = {
        fileName,
        codeChanged,
        VtlEditorProps,
        ErrorBoxProps
    };

    const SDMXViewProps = {
        registry,
        setRegistry,
        agencies,
        setAgencies,
        selectedAgencies,
        setSelectedAgencies,
        finalType,
        setFinalType,
        setSdmxResult,
        clearSdmxState
    }

    return (
        //TODO check if it is working without router here
        <Router>
            <SnackbarProvider
                maxSnack={2}
                transitionDuration={500}
                autoHideDuration={4000}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right"
                }}
                dense={true}
            >
                <div className={getStyles()}>
                    <Header/>
                    <Navigation {...NavigationProps}/>
                    <div id="middle-container" className={`middle-container ${theme}`}>
                        <Switch>
                            <Route exact path="/sdmx">
                                <SDMXView {...SDMXViewProps}/>
                            </Route>
                            <Route exact path="/">
                                <EditorView {...EditorViewProps}/>
                            </Route>
                            <Redirect to="/"/>
                        </Switch>
                    </div>
                    {showDialog ?
                        <OpenDialog {...UploadDialogProps}/> : null}
                    {false ? <GuideOverlay/> : null}
                </div>
            </SnackbarProvider>
        </Router>
    );
}

export default App;