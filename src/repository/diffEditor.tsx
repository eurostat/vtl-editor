import * as EditorApi from "monaco-editor";
import React, {useEffect, useRef, useState} from "react";
import {Container} from "react-bootstrap";
import {MonacoDiffEditor} from "react-monaco-editor";
import {useSelector} from "react-redux";
import PageHeader from "../main-view/page-header/pageHeader";
import {getVersionContent} from "./personal-repo/personalRepoService";
import {comparedVersions} from "./personal-repo/personalRepoSlice";
import "./diffEditor.scss";
import {fetchScriptVersionContent} from "./domain-repo/domainRepoService";
import {RepositoryType} from "./entity/repositoryType";
import {useSnackbar} from "notistack";

const DiffEditor = () => {
    const compare = useSelector(comparedVersions);
    const [leftContent, setLeftContent] = useState("");
    const [rightContent, setRightContent] = useState("");
    const monacoRef = useRef<MonacoDiffEditor>(null);
    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {
        if (compare && compare.file && compare.versions.length === 2) {
            let call;
            switch (compare.repository) {
                case RepositoryType.PERSONAL: {
                    call = getVersionContent;
                    break;
                }
                case RepositoryType.DOMAIN: {
                    call = fetchScriptVersionContent;
                    break;
                }
                default: {
                    return;
                }
            }
            Promise.all([call(compare.file, compare.versions[0].version), call(compare.file, compare.versions[1].version)])
                .then((content) => {
                    setLeftContent(content[0]);
                    setRightContent(content[1]);
                })
                .catch(() => enqueueSnackbar(`Failed to load versions.`, {variant: "error"}));
        }
    }, [compare, enqueueSnackbar]);

    useEffect(() => {
        if (monacoRef?.current?.editor) {
            const originalModel = EditorApi.editor.createModel(leftContent);
            const modifiedModel = EditorApi.editor.createModel(rightContent);
            monacoRef.current.editor.setModel({original: originalModel, modified: modifiedModel});
        }
    }, [leftContent, rightContent]);

    const editorDidMount = (editor: EditorApi.editor.IStandaloneDiffEditor,
                            monaco: typeof EditorApi) => {
        // const originalModel = monaco.editor.createModel(leftContent);
        // const modifiedModel = monaco.editor.createModel(rightContent);
        // editor.setModel({original: originalModel, modified: modifiedModel});
    }

    const filename = compare?.file?.name || "";
    const leftVersion = compare?.versions[0]?.version.toString() || "";
    const rightVersion = compare?.versions[1]?.version.toString() || "";
    const title = filename ? `Compare "${filename}" versions ${leftVersion} and ${rightVersion}` : `Compare versions`;
    return (
        <div className="diff-editor-container">
            <PageHeader title={title}/>
            <Container className="diff-editor-box">
                <MonacoDiffEditor ref={monacoRef} height="100%" editorDidMount={editorDidMount}/>
            </Container>
        </div>
    );
}

export default DiffEditor;