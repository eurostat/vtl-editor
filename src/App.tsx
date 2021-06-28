import 'bootstrap/dist/css/bootstrap.min.css';
import {SnackbarProvider} from "notistack";
import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Redirect, Route, Switch} from "react-router-dom";
import './App.scss';
import Authorized, {useManagerRole, useUserRole} from "./control/authorized";
import {fetchProfileRoles} from "./control/controlService";
import ManagementView from "./control/managementView";
import Profile from "./control/profile/profile";
import EditorView from "./editor/editorView";
import {decisionDialog} from "./main-view/decision-dialog/decisionDialog";
import Header from "./main-view/header/header";
import Navigation from "./main-view/navigation/navigation";
import {detailPaneVisible, sidePaneVisible} from "./main-view/viewSlice";
import DirectoryPreview from "./repository/directoryPreview";
import FileVersions from "./repository/fileVersions";
import DiffEditor from "./repository/diffEditor";
import {Agency} from "./sdmx/entity/Agency";
import {DataStructure, FinalStructureEnum} from "./sdmx/entity/DataStructure";
import {SdmxRegistry} from "./sdmx/entity/SdmxRegistry";
import {SdmxResult} from "./sdmx/entity/SdmxResult";
import SdmxDownloadScreen from "./sdmx/loading-screen/SdmxDownloadScreen";
import {SdmxStorage} from "./sdmx/SdmxStorage";
import SdmxView from "./sdmx/sdmxView";
import {loggedIn, provideRoles} from "./utility/authSlice";
import BrowserStorage, {getSdmxStoredValues, setSdmxStorageValue} from "./utility/browserStorage";
import DomainFolderDetails from "./repository/domain-repo/domainFolderDetails";
import DomainScriptVersions from "./repository/domain-repo/domainScriptVersions";
import EditClientView from "./edit-client/editClientView";

export default function App() {
    /*SDMX STATES */
    const [registry, setRegistry] = useState<SdmxRegistry | null>(null);
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [selectedAgencies, setSelectedAgencies] = useState<Agency[]>([]);
    const [finalType, setFinalType] = useState<FinalStructureEnum>(FinalStructureEnum.ALL);
    const [dataStructure, setDataStructure] = useState<DataStructure | undefined>(undefined);
    const [importDSD, setImportDSD] = useState<boolean>(false);
    const [sdmxResult, setSdmxResult] = useState<SdmxResult | undefined>(undefined);

    const sidePaneShown = useSelector(sidePaneVisible);
    const detailPaneShown = useSelector(detailPaneVisible);
    const authenticated = useSelector(loggedIn);
    const dispatch = useDispatch();

    const forManager = useManagerRole();
    const forUser = useUserRole();

    const loadRoles = useCallback(async () => {
        try {
            dispatch(provideRoles(await fetchProfileRoles()));
        } catch {
        }
    }, [dispatch]);

    useEffect(() => {
        if (authenticated) loadRoles().then();
    }, [authenticated, loadRoles]);

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
        if (authenticated && sdmxStoredValues) {
            if (sdmxStoredValues.dataStructure && sdmxStoredValues.registryId) {
                setDataStructure({...sdmxStoredValues.dataStructure});
                setRegistry({id: sdmxStoredValues.registryId, name: "", url: ""});
                decision(sdmxStoredValues.dataStructure).then();
            }
        }
    }, [authenticated]);

    useEffect(() => {
        if (sdmxResult?.dataStructure)
            setDataStructure(sdmxResult?.dataStructure);
    }, [sdmxResult])

    const getStyles = () => {
        let styling = "App";
        styling += !sidePaneShown ? " hide-settings-nav" : "";
        styling += detailPaneShown ? "" : " hide-error-box";
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
                          anchorOrigin={{vertical: "top", horizontal: "center"}} dense={true}>
            <div className={getStyles()}>
                <Header/>
                <Authorized>
                    <Navigation/>
                    <div id="middle-container" className={`middle-container`}>
                        <Switch>
                            <Route exact path="/"><EditorView {...editorViewProps}/></Route>
                            <Route exact path="/sdmx"><SdmxView {...SDMXViewProps}/></Route>
                            {forUser(<Route exact path="/folder"><DirectoryPreview/></Route>)}
                            {forUser(<Route exact path="/versions"><FileVersions/></Route>)}
                            <Route exact path="/domainfolder"><DomainFolderDetails/></Route>
                            <Route exact path="/domainversions"><DomainScriptVersions/></Route>
                            {forUser(<Route exact path="/diff"><DiffEditor/></Route>)}
                            {forUser(<Route exact path="/editclient"><EditClientView/></Route>)}
                            {forManager(<Route exact path="/manage"><ManagementView/></Route>)}
                            <Route exact path="/profile"><Profile/></Route>
                            <Redirect to="/"/>
                        </Switch>
                    </div>
                    {/*{showOverlay ? <GuideOverlay/> : null}*/}
                    {
                        importDSD ?
                            <SdmxDownloadScreen registry={registry} dataStructure={dataStructure!}
                                                showScreen={importDSD}
                                                setSdmxResult={setSdmxResult}/>
                            : null
                    }
                </Authorized>
            </div>
            <BrowserStorage/>
        </SnackbarProvider>
    );
}
