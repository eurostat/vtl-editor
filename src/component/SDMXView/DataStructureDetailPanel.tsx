import React, {useEffect, useState} from "react";
import {IBaseStruct, IDataStructureDefinition, IStructureType} from "../../models/api/IDataStructureDefinition";

type DataStructureDetailPanelProps = {
    retrieveItemFunction: () => Promise<IDataStructureDefinition>,

}

const DataStructureDetailPanel = ({retrieveItemFunction}: DataStructureDetailPanelProps) => {
    const [dataStructureDefinition, setDataStructureDefinition] = useState<IDataStructureDefinition | null>(null);
    const [codeLists, setCodeLists] = useState<IStructureType[]>([]);
    const [loadingDataStructureDefinition, setLoadingDataStructureDefinition] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setLoadingDataStructureDefinition(true);
            const dsd: IDataStructureDefinition = await retrieveItemFunction();
            const cls: IStructureType[] = (dsd.attributes as IBaseStruct[]).concat(dsd.dimensions as IBaseStruct[])
                .map(struct => struct.structureType).filter(cl => cl.type === "codelist");
            setCodeLists(cls);
            setDataStructureDefinition(dsd);
            setLoadingDataStructureDefinition(false);
        }
        fetch();
    }, [])

    return (
        <div style={{minHeight: "100px"}}>
            {loadingDataStructureDefinition ? <span>Loading...</span> : null}
            {codeLists.map(codeList =>
                <p>{`agencyId:${codeList.agencyId} id:${codeList.id} version:${codeList.version}`}</p>)}
        </div>
    )
}


export default DataStructureDetailPanel;