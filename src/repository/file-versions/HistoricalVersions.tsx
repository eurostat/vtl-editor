import React, {useState} from "react";
import PageHeader from "../../main-view/page-header/PageHeader";
import {Container} from "react-bootstrap";
import MaterialTable from "material-table";
import {historicalVersionsTableColumns} from "./historicalVersionsTableColumns";
import "./historicalVersions.scss";

const filesMockData = [
    {date: "15/07/2020 12:10", version: "1.0.5", author: "example author"},
    {date: "13/07/2020 16:33", version: "1.0.4", author: "example author"},
    {date: "10/07/2020 10:43", version: "1.0.3", author: "example author"},
    {date: "9/07/2020 13:11", version: "1.0.2", author: "example author"},
    {date: "7/07/2020 9:18", version: "1.0.1", author: "example author"}
]


type HistoricalVersionsProps = {}

const HistoricalVersions = ({}: HistoricalVersionsProps) => {
    const [files, setFiles] = useState(filesMockData);

    return (<div className="historical-versions-container">
        <PageHeader name="Historical versions"/>
        <Container className="historical-versions-box">
            <MaterialTable
                columns={historicalVersionsTableColumns}
                data={files}
            />
        </Container>
    </div>)
}


export default HistoricalVersions;