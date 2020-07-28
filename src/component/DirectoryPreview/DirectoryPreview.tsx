import React, {useState} from "react";
import PageHeader from "../PageHeader/PageHeader";
import {Container} from "react-bootstrap";
import MaterialTable from "material-table";
import {directoryPreviewTableColumns} from "./directoryPreviewTableColumns";
import {mockData} from "./directoryMockData";
import "./directoryPreview.scss"

type DirectoryPreviewProps = {
    name?: string,
    files?: any
}

const DirectoryPreview = ({name}: DirectoryPreviewProps) => {
    const [files, setFiles] = useState(mockData);
    return (
        <div className="directory-preview-container">
            <PageHeader name={`File: ${name}`}/>
            <Container className="directory-preview-box">
                <MaterialTable
                    columns={directoryPreviewTableColumns}
                    data={files}
                    options={{
                        showTitle: false
                    }}
                />
            </Container>
        </div>)
};

export default DirectoryPreview;