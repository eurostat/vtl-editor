import 'bootstrap/dist/css/bootstrap.min.css';
import { SnackbarProvider } from "notistack";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter as Router, Redirect, Route, Switch } from "react-router-dom";
import './App.scss';
import { buildFile, StoredFile } from "./editor/editorFile";
import EditorView from "./editor/EditorView";
import { loadFile } from "./editor/loaderSlice";
import { languageVersions } from "./editor/settings";
import { VtlEditorProps } from "./editor/vtl-editor/VtlEditor";
import { decisionModal } from "./main-view/decision-dialog/DecisionModal";
import Header from "./main-view/header/Header";
import { MenuOption } from "./main-view/MenuOption";
import Navigation from "./main-view/navigation/Navigation";
import OpenDialog from "./main-view/open-dialog/OpenDialog";
import HistoricalVersions from "./repository/file-versions/HistoricalVersions";
import DirectoryPreview from "./repository/folder-details/DirectoryPreview";
import DiffEditor from "./repository/version-compare/DiffEditor";
import { Agency } from "./sdmx/entity/Agency";
import { DataStructure, FinalStructureEnum } from "./sdmx/entity/DataStructure";
import { SdmxRegistry } from "./sdmx/entity/SdmxRegistry";
import { SdmxResult } from "./sdmx/entity/SdmxResult";
import SdmxDownloadScreen from "./sdmx/loading-screen/SdmxDownloadScreen";
import { SdmxStorage } from "./sdmx/SdmxStorage";
import SDMXView from "./sdmx/SDMXView";
import {
    getEditorStoredValues,
    getSdmxStoredValues,
    setEditorStorageValue,
    setSdmxStorageValue
} from "./utility/localStorage";

const getTheme = (): string => {
    const item = getEditorStoredValues();
    return item?.theme || "vtl";
};

type DropdownMenuStatus = {
    option: MenuOption,
    visible: boolean
}

function App() {
    const [showDialog, setShowDialog] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [dropdownMenuStatus, setDropdownMenuStatus] = useState<DropdownMenuStatus>({
        option: MenuOption.NONE,
        visible: false
    });
    const [showErrorBox, setShowErrorBox] = useState(false);
    const [theme, setTheme] = useState(getTheme());
    const [languageVersion, setLanguageVersion] = useState(languageVersions[languageVersions.length - 1].code);
    const [errorBoxSize, setErrorBoxSize] = useState(0);
    /*SDMX STATES */
    const [registry, setRegistry] = useState<SdmxRegistry | null>(null);
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [selectedAgencies, setSelectedAgencies] = useState<Agency[]>([]);
    const [finalType, setFinalType] = useState<FinalStructureEnum>(FinalStructureEnum.ALL);
    const [dataStructure, setDataStructure] = useState<DataStructure | undefined>(undefined);
    const [importDSD, setImportDSD] = useState<boolean>(false);
    const [sdmxResult, setSdmxResult] = useState<SdmxResult | undefined>(undefined);

    const dispatch = useDispatch();

    useEffect(() => {
        const editorStoredValues: StoredFile = getEditorStoredValues();
        if (editorStoredValues) {
            const storedFile = buildFile(editorStoredValues.name,
                editorStoredValues.content,
                editorStoredValues.edited);
            dispatch(loadFile(storedFile));
            setValue(editorStoredValues.showErrorBox, setShowErrorBox);
            setValue(editorStoredValues.theme, setTheme);
        }
    });

    useEffect(() => {
        const decision = async (dataStructure: DataStructure) => {
            const res = await decisionModal({
                title: "Warning!",
                text:
                    `In your previous session you imported ${dataStructure.name} content. Do you want to import data again?`
            });
            if (res === "yes") {
                setImportDSD(true);
            } else if (res === "cancel") {
                setSdmxStorageValue({});
            }
        }
        const sdmxStoredValues: SdmxStorage = getSdmxStoredValues();
        if (sdmxStoredValues) {
            if (sdmxStoredValues.dataStructure && sdmxStoredValues.registryId) {
                setDataStructure({...sdmxStoredValues.dataStructure});
                setRegistry({id: sdmxStoredValues.registryId!, name: "", url: ""});
                decision(sdmxStoredValues.dataStructure);
            }
        }
    }, []);

    useEffect(() => {
        if (sdmxResult?.dataStructure)
            setDataStructure(sdmxResult?.dataStructure);
    }, [sdmxResult])

    const setValue = (value: any, setter: (value: any) => any) => {
        if (value) {
            setter(value);
        }
    }

    const openFile = (newFiles: string[], fileName: string) => {
        const loadedFile = buildFile(fileName, newFiles[0], false);
        dispatch(loadFile(loadedFile));
    };

    const updateTheme = (theme: string) => {
        setTheme(theme);
        setEditorStorageValue({theme: theme});
    };

    const changeMenuState = (menuOption: MenuOption) => {
        setDropdownMenuStatus({
            option: menuOption,
            visible: menuOption !== dropdownMenuStatus.option || !dropdownMenuStatus.visible
        });
        setShowMenu(!showMenu);
    }

    const changeErrorBoxState = () => {
        setShowErrorBox(!showErrorBox);
        setEditorStorageValue({showErrorBox: !showErrorBox})
    };

    const getStyles = () => {
        let styling = "App";
        styling += dropdownMenuStatus.visible ? ` open-${dropdownMenuStatus.option}` : " hide-settings-nav";
        styling += showErrorBox ? "" : " hide-error-box";
        return styling;
    };

    const createNewFile = () => {
        const loadedFile = buildFile();
        dispatch(loadFile(loadedFile));
    };

    const clearSdmxState = () => {
        setRegistry(null);
        setAgencies([]);
        setSelectedAgencies([]);
        setFinalType(FinalStructureEnum.ALL);
    }

    const vtlEditorProps = {
        "resizeLayout": [showMenu, showErrorBox, errorBoxSize],
        theme,
        languageVersion,
        sdmxResult
    } as VtlEditorProps;

    const NavigationProps = {
        "showDialog": setShowDialog,
        "changeMenu": changeMenuState,
        createNewFile,
        "settingsNavProps": {theme, "setTheme": updateTheme, languageVersion, setLanguageVersion},
    };

    const errorBoxProps = {
        showErrorBox,
        changeErrorBoxState,
        setErrorBoxSize,
        languageVersion,
        "dataStructureInfo": sdmxResult?.dataStructureInfo,
        registry,
        dataStructure
    };

    const editorViewProps = {
        vtlEditorProps,
        errorBoxProps
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
    console.log("app render");
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
                            <Route exact path="/diff">
                                <DiffEditor/>
                            </Route>
                            <Route exact path="/historical">
                                <HistoricalVersions/>
                            </Route>
                            <Route exact path="/directory">
                                <DirectoryPreview/>
                            </Route>
                            <Route exact path="/">
                                <EditorView {...editorViewProps}/>
                            </Route>
                            <Redirect to="/"/>
                        </Switch>
                    </div>
                    {showDialog ?
                        <OpenDialog onClose={setShowDialog} onLoad={openFile}/> : null}
                    {/*{showOverlay ? <GuideOverlay/> : null}*/}
                    {importDSD ?
                        <SdmxDownloadScreen registry={registry} dataStructure={dataStructure!} showScreen={importDSD}
                                            setSdmxResult={setSdmxResult}/> : null}
                </div>
            </SnackbarProvider>
        </Router>
    );
}

export default App;