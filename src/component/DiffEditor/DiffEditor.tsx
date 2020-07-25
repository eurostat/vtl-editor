import React from "react";
import {MonacoDiffEditor} from "react-monaco-editor";
import PageHeader from "../PageHeader/PageHeader";
import {Container} from "react-bootstrap";
import "./diffEditor.scss";

type DiffEditorType = {
    currentText?: string,
    previousText?: string
}


const DiffEditor = ({currentText, previousText}: DiffEditorType) => {
    const code1 = "// your original code...";
    const code2 = "// a different version...";

    return (<div className="diff-editor-container">
        <PageHeader name="Compare versions"/>
        <Container className="diff-editor-box">
            <MonacoDiffEditor
                height="100%"
                original={code1}
                value={code2}
            />
        </Container>
    </div>);
}


export default DiffEditor;