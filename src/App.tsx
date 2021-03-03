import 'bootstrap/dist/css/bootstrap.min.css';
import { SnackbarProvider } from "notistack";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Redirect, Route, Switch } from "react-router-dom";
import './App.scss';
import ManagementView from "./control/managementView";
import EditorView from "./editor/editorView";
import { decisionDialog } from "./main-view/decision-dialog/decisionDialog";
import Header from "./main-view/header/header";
import Navigation from "./main-view/navigation/navigation";
import { detailPaneVisible, sidePaneView, sidePaneVisible } from "./main-view/viewSlice";
import DirectoryPreview from "./repository/directoryPreview";
import FileVersions from "./repository/fileVersions";
import DiffEditor from "./repository/version-compare/diffEditor";
import { Agency } from "./sdmx/entity/Agency";
import { DataStructure, FinalStructureEnum } from "./sdmx/entity/DataStructure";
import { SdmxRegistry } from "./sdmx/entity/SdmxRegistry";
import { SdmxResult } from "./sdmx/entity/SdmxResult";
import SdmxDownloadScreen from "./sdmx/loading-screen/SdmxDownloadScreen";
import { SdmxStorage } from "./sdmx/SdmxStorage";
import SdmxView from "./sdmx/sdmxView";
import BrowserStorage, { getSdmxStoredValues, setSdmxStorageValue } from "./utility/browserStorage";
import { loggedIn } from "./utility/oidcSlice";

export default function App() {
    /*SDMX STATES */
    const [registry, setRegistry] = useState<SdmxRegistry | null>(null);
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [selectedAgencies, setSelectedAgencies] = useState<Agency[]>([]);
    const [finalType, setFinalType] = useState<FinalStructureEnum>(FinalStructureEnum.ALL);
    const [dataStructure, setDataStructure] = useState<DataStructure | undefined>(undefined);
    const [importDSD, setImportDSD] = useState<boolean>(false);
    const [sdmxResult, setSdmxResult] = useState<SdmxResult | undefined>(undefined);

    const detailPane = useSelector(detailPaneVisible);
    const sidePane = useSelector(sidePaneVisible);
    const sidePaneMode = useSelector(sidePaneView);
    const authenticated = useSelector(loggedIn);

    useEffect(() => {
        const decision = async (dst: DataStructure) => {
            const res = await decisionDialog({
                title: "Warning",
                text:
                    `In your previous session you imported ${dst.name} content. Do you want to import the data again?`,
                buttons: [
                    {key: "yes", text: "Yes", color: "primary"},
                    {key: "no", text: "No", color: "secondary"},
                    {
                        key: "cancel",
                        text: "No, don't ask again",
                        color: "secondary",
                        className: "default-button outline-button"
                    }
                ]
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
                setRegistry({id: sdmxStoredValues.registryId, name: "", url: ""});
                decision(sdmxStoredValues.dataStructure).then();
            }
        }
    }, []);

    useEffect(() => {
        if (sdmxResult?.dataStructure)
            setDataStructure(sdmxResult?.dataStructure);
    }, [sdmxResult])

    const getStyles = () => {
        let styling = "App";
        styling += sidePane ? ` open-${sidePaneMode}` : " hide-settings-nav";
        styling += detailPane ? "" : " hide-error-box";
        return styling;
    };

    const clearSdmxState = () => {
        setRegistry(null);
        setAgencies([]);
        setSelectedAgencies([]);
        setFinalType(FinalStructureEnum.ALL);
    }

    const errorBoxProps = {
        "dataStructureInfo": sdmxResult?.dataStructureInfo,
        registry,
        dataStructure
    };

    const editorViewProps = {
        sdmxResult,
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

    return (
        <SnackbarProvider maxSnack={2} transitionDuration={500} autoHideDuration={4000}
                          anchorOrigin={{vertical: "top", horizontal: "right"}} dense={true}>
            <div className={getStyles()}>
                <Header/>
                {authenticated
                    ? <>
                        <Navigation/>
                        <div id="middle-container" className={`middle-container`}>
                            <Switch>
                                <Route exact path="/sdmx">
                                    <SdmxView {...SDMXViewProps}/>
                                </Route>
                                <Route exact path="/diff">
                                    <DiffEditor/>
                                </Route>
                                <Route exact path="/versions">
                                    <FileVersions/>
                                </Route>
                                <Route exact path="/folder">
                                    <DirectoryPreview/>
                                </Route>
                                <Route exact path="/manage">
                                    <ManagementView/>
                                </Route>
                                <Route exact path="/">
                                    <EditorView {...editorViewProps}/>
                                </Route>
                                <Redirect to="/"/>
                            </Switch>
                        </div>
                        {/*{showOverlay ? <GuideOverlay/> : null}*/}
                        {importDSD ?
                            <SdmxDownloadScreen registry={registry} dataStructure={dataStructure!}
                                                showScreen={importDSD}
                                                setSdmxResult={setSdmxResult}/> : null}
                    </>
                    : null}
            </div>
            <BrowserStorage/>
        </SnackbarProvider>
    );
}