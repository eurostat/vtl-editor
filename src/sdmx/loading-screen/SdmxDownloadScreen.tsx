import {Box, CircularProgress, Typography} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import { setSdmxStorageValue } from "../../utility/browserStorage";
import { ApiCache } from "../apiCache";
import {DataStructure} from "../entity/DataStructure";
import {SdmxRegistry} from "../entity/SdmxRegistry";
import {SDMX_CODELIST, SDMX_DSD} from "../../web-api/apiConsts";
import {BaseStruct, DataStructureDefinition, StructureType} from "../entity/DataStructureDefinition";
import {CodeList, CodeListDetails} from "../entity/CodeList";
import {SdmxResult} from "../entity/SdmxResult";
import {useHistory} from "react-router-dom";
import {useSnackbar} from "notistack";
import { fetchCodeList, fetchDataStructureDefinition } from "../sdmxService";

type SdmxDownloadScreenPropsNew = {
    registry: SdmxRegistry | null,
    dataStructure: DataStructure,
    showScreen: boolean,
    setSdmxResult: (result: SdmxResult) => void
}
const requestCache = ApiCache.getInstance();
const SdmxDownloadScreen = ({registry, dataStructure, showScreen, setSdmxResult}: SdmxDownloadScreenPropsNew) => {
    const [codeListProgress, setCodeListProgress] = useState<number>(0);
    const [codeListTotal, setCodeListTotal] = useState<number>(0);
    const [show, setShow] = useState<boolean>(showScreen);
    const history = useHistory();
    const {enqueueSnackbar} = useSnackbar();
    const progress = Math.round(codeListProgress / codeListTotal * 100) || 0;


    const fetchCodeLists = async (structureTypes: StructureType[]) => {
        const codeListsResponses = await Promise.all(structureTypes.map(structureType =>
            requestCache.checkIfExistsInMapOrAdd(SDMX_CODELIST(registry!.id, structureType.agencyId!, structureType.id!, structureType.version!), () => fetchCodeList(registry!, structureType)))
            .map(promise => {
                promise.then(() => setCodeListProgress(prevState => prevState += 1));
                return promise;
            })
        );
        return codeListsResponses.filter(response => response);
    }

    const onCodeListsFetch = () => {
        const fetch = async () => {
            setCodeListProgress(0);
            const dsd = await requestCache.checkIfExistsInMapOrAdd(SDMX_DSD(registry!.id, dataStructure!.agencyId, dataStructure!.id, dataStructure!.version),
                async () => await fetchDataStructureDefinition(registry!, dataStructure!));
            const structuresFromDSD: BaseStruct[] = getCodeListsFromDSD(dsd);
            setCodeListTotal(structuresFromDSD.length);
            const disStructureTypes = distinctStructureTypes(structuresFromDSD.map(structure => structure.structureType));

            const codeLists = await requestCache.checkIfExistsInMapOrAdd(`CODE LISTS: ${SDMX_DSD(registry!.id, dataStructure!.agencyId, dataStructure!.id, dataStructure!.version)}`,
                () => fetchCodeLists(disStructureTypes));
            let result = createSdmxResult(dataStructure!, dsd, codeLists);
            setSdmxResult(result);
            enqueueSnackbar(`${codeLists.length} ${codeLists.length > 1 ? "unique code lists" : "code list"} downloaded!`, {
                variant: "success"
            });
            setShow(false);
            history.push("/");
            saveStateToLocaleStorage(registry!, dataStructure!);
        }
        if (dataStructure) {
            fetch();
        }
    }

    useEffect(() => {
        if (registry && dataStructure) {
            onCodeListsFetch();
        }
    }, [showScreen])


    const getTextFromAttributes = (dsd: DataStructureDefinition): BaseStruct[] => {
        return getTypeFromBaseStruct(dsd.attributes, "text");
    }

    const getTextFromDimensions = (dsd: DataStructureDefinition): BaseStruct[] => {
        return getTypeFromBaseStruct(dsd.dimensions, "text");
    }

    const getCodeListFromAttributes = (dsd: DataStructureDefinition): BaseStruct[] => {
        return getTypeFromBaseStruct(dsd.attributes, "codelist");
    }

    const getCodeListFromDimensions = (dsd: DataStructureDefinition): BaseStruct[] => {
        return getTypeFromBaseStruct(dsd.dimensions, "codelist");
    }

    const getTypeFromBaseStruct = (array: BaseStruct[], type: "codelist" | "text") => {
        return array.filter(base => base.structureType.type === type);
    }

    const getCodeListsFromDSD = (dsd: DataStructureDefinition): BaseStruct[] => {
        return getListByType(dsd, "codelist");
    }

    const getListByType = (dsd: DataStructureDefinition, type: "codelist" | "text"): BaseStruct[] => {
        return (dsd.dimensions as BaseStruct[] || []).concat(dsd?.attributes as BaseStruct[] || [])
            .filter(base => base.structureType.type === type);
    }

    const mapICodeDetails = (structures: BaseStruct[], codeLists: CodeList[]): CodeListDetails[] => {
        const codeListsMap = codeLists.reduce((map: { [key: string]: CodeList }, obj) => {
            map[obj.id!] = obj;
            return map;
        }, {});

        return structures.filter(structure => codeListsMap[structure.structureType.id!]).map(structure => Object.assign(
            {
                structureId: structure.id,
                name: structure.name
            }, codeListsMap[structure.structureType.id!]
        ));
    }
    const saveStateToLocaleStorage = (registry: SdmxRegistry, ds: DataStructure) => {
        setSdmxStorageValue({registryId: registry.id, dataStructure: ds});
    }

    const distinctStructureTypes = (list: StructureType[]): StructureType[] => {
        return list.filter((s, i, arr) =>
            arr.findIndex(t => t.id === s.id && t.agencyId === s.agencyId && t.version === s.version) === i);
    }

    const createSdmxResult = (ds: DataStructure, dsd: DataStructureDefinition, codeLists: CodeList[]): SdmxResult => {
        return {
            dataStructure: ds,
            dataStructureInfo: {id: dsd.id, name: dsd.name},
            dimension: {
                texts: getTextFromDimensions(dsd),
                codeLists: mapICodeDetails(getCodeListFromDimensions(dsd), codeLists)
            },
            attribute: {
                texts: getTextFromAttributes(dsd),
                codeLists: mapICodeDetails(getCodeListFromAttributes(dsd), codeLists)
            },
            timeDimension: dsd.timeDimension,
            primaryMeasure: dsd.primaryMeasure
        }
    }

    return (
        show ?
            <div className="sdmx-loading-screen">
                <div className="sdmx-loading-content-area">
                    <Box>
                        <CircularProgress variant="static" value={progress} size={60}/>
                        <Box
                            top={-45}
                            left={0}
                            bottom={0}
                            right={0}
                            position="absolute"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Typography variant="caption" component="div"
                                        color="textSecondary">{`${progress}%`}</Typography>
                        </Box>
                    </Box>
                    <p>Downloading code lists...</p>
                </div>
            </div>
            : null
    )
}

export default SdmxDownloadScreen;