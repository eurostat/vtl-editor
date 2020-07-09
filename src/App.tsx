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
import {SdmxResult} from "./models/api/SdmxResult";
import {SdmxRegistry} from "./models/api/SdmxRegistry";
import {Agency} from "./models/api/Agency";
import {DataStructure, FinalStructureEnum} from "./models/api/DataStructure";
import {
    getEditorStoredValues,
    getSdmxStoredValues,
    setEditorStorageValue,
    setSdmxStorageValue
} from "./utility/localStorage";
import {EditorStorage} from "./models/storage/EditorStorage";
import {SdmxStorage} from "./models/storage/SdmxStorage";
import {DataStructureDefinition} from "./models/api/DataStructureDefinition";
import {decisionModal} from "./component/DecisionModal";
import SdmxDownloadScreen from "./component/SDMXView/SdmxLoadingScreen/SdmxDownloadScreen";

const getTheme = (): string => {
    const item = getEditorStoredValues();
    return item?.theme || "vtl";
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
    const [dataStructure, setDataStructure] = useState<DataStructure | undefined>(undefined);
    const [importDSD, setImportDSD] = useState<boolean>(false);
    const [sdmxResult, setSdmxResult] = useState<SdmxResult | undefined>(undefined);

    useEffect(() => {
        const editorStoredValues: EditorStorage = getEditorStoredValues();
        if (editorStoredValues) {
            setValue(editorStoredValues.code, setCode);
            setValue(editorStoredValues.codeChanged, setCodeChanged);
            setValue(editorStoredValues.fileName, setFileName);
            setValue(editorStoredValues.showErrorBox, setShowErrorBox);
            setValue(editorStoredValues.theme, setTheme);
        }
    }, [])

    useEffect(() => {
        const vtlContainer = document.getElementById("vtl-container");
        if (vtlContainer) {
            setTempCursor(new Position(1, 1));
        }
    }, [])

    useEffect(() => {
        const decision = async (dataStructure: DataStructure) => {
            const res = await decisionModal({
                title: "Warning!",
                text:
                    `In your previous session you imported ${dataStructure.name} content. Do you want to import data again?`
            });
            if (res === "yes") {
                setImportDSD(true);
            }
        }
        const sdmxStoredValues: SdmxStorage = getSdmxStoredValues();
        if (sdmxStoredValues) {
            if (sdmxStoredValues.dataStructure && sdmxStoredValues.registryId) {
                setDataStructure(sdmxStoredValues.dataStructure);
                setRegistry({id: sdmxStoredValues.registryId!, name: "", url: ""});
                decision(sdmxStoredValues.dataStructure);
            }
        }
    }, []);

    const setValue = (value: any, setter: (value: any) => any) => {
        if (value) {
            setter(value);
        }
    }

    const updateFiles = (newFiles: string[], fileName: string) => {
        updateCodeChanged(false);
        updateCode(newFiles[0]);
        updateFileName(fileName);
    };

    const updateFileName = (fileName: string) => {
        setFileName(fileName)
        setEditorStorageValue({fileName: fileName})
    };

    const updateCode = (code: string) => {
        setCode(code);
        setEditorStorageValue({code: code})
    };

    const updateTheme = (theme: string) => {
        setTheme(theme);
        setEditorStorageValue({theme: theme});
    };

    const updateCodeChanged = (codeChanged: boolean) => {
        setCodeChanged(codeChanged);
        setEditorStorageValue({codeChanged: codeChanged})
    };

    const changeMenuState = () => {
        setShowMenu(!showMenu);
    };

    const changeErrorBoxState = () => {
        setShowErrorBox(!showErrorBox);
        setEditorStorageValue({showErrorBox: !showErrorBox})
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
        setTempCursor,
        "dataStructureInfo": sdmxResult?.dataStructureInfo,
        registry,
        dataStructure
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
                    <div id="middle-container" className={`middle-container`}>
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
                    {importDSD ?
                        <SdmxDownloadScreen registry={registry} dataStructure={dataStructure} showScreen={importDSD}
                                            setSdmxResult={setSdmxResult}/> : null}
                </div>
            </SnackbarProvider>
        </Router>
    );
}

export default App;