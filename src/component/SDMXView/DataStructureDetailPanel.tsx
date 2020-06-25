import React, {useEffect, useState} from "react";
import {IBaseStruct, IDataStructureDefinition, IStructureType} from "../../models/api/IDataStructureDefinition";

type DataStructureDetailPanelProps = {
    retrieveItemFunction: () => Promise<IDataStructureDefinition>,

}

const DataStructureDetailPanel = ({retrieveItemFunction}: DataStructureDetailPanelProps) => {
    const [dataStructureDefinition, setDataStructureDefinition] = useState<IDataStructureDefinition | null>(null);
    const [codeLists, setCodeLists] = useState<IStructureType[]>([]);
    const [structures, setStructures] = useState<IBaseStruct[]>([]);
    const [loadingDataStructureDefinition, setLoadingDataStructureDefinition] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setLoadingDataStructureDefinition(true);
            const dsd: IDataStructureDefinition = await retrieveItemFunction();
            const structs: IBaseStruct[] = (dsd.attributes as IBaseStruct[] || [] ).concat(dsd.dimensions as IBaseStruct[] || [])
                .filter(dsd => dsd.structureType.type === "codelist");
            setStructures(structs);
            setDataStructureDefinition(dsd);
            setLoadingDataStructureDefinition(false);
        }
        fetch();
    }, [])

    return (
        <div style={{minHeight: "100px"}}>
            {loadingDataStructureDefinition ? <span>Loading...</span> : null}
            {structures.map(struct =>
                <p key={struct.id}>{`name: ${struct.name} agencyId:${struct.structureType.agencyId} id:${struct.structureType.id} version:${struct.structureType.version}`}</p>)}
        </div>
    )
}


export default DataStructureDetailPanel;