import * as React from 'react';
import {useEffect, useRef} from 'react';
import MonacoEditor from "react-monaco-editor";
import {GrammarGraph} from './grammarGraph';
import {TokensProvider} from './tokensProvider';
import * as ParserFacade from './ParserFacade';
import * as EditorApi from 'monaco-editor/esm/vs/editor/editor.api';
//import {AutoSuggestionsGenerator} from '../auto-suggest/AutoSuggestionsGenerator';
import './vtlEditor.css';
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import {languageVersions} from "./settings";
import {getEditorWillMount, getSuggestions, getVtlTheme} from "./provider/providers";
import {VTL_VERSION} from "./settings";

declare const window: any;


const defaultText = `ds_PY := lag ( na_main, 1 ) over ( order by time );

ds_L_CY := na_main [ sub prices = "L" ] ;
ds_L_PY := ds_PY [ sub prices = "L" ] ;
ds_V_PY := ds_PY [ sub prices = "V" ] ;
ds_Y_CY := na_main [ sub prices = "Y" ] ;


ErrB:= check((abs(ds_Y_CY-(ds_L_CY / ds_L_PY[ filter obs_value <> 0 ] * ds_V_PY)) / ds_Y_CY [ filter obs_value <> 0 ]) < 0.001, 
    errorcode("The observation values do not comply with the Y(t)= L(t) * V(t-1) / L(t-1) relation"), 
    errorlevel("Error") );

ErrB`;

type VtlEditorProps = {
    browsedFiles: string[],
    showMenu: boolean;
    showErrorBox:boolean,
    code: string,
    setCode: (value: string) => void,
    setCodeChanged: (value: boolean) => void,
    theme: string,
    languageVersion: VTL_VERSION
}

const VtlEditor = ({browsedFiles, showMenu,showErrorBox, code, setCode, setCodeChanged, theme, languageVersion}: VtlEditorProps) => {
    const tokensProvider: TokensProvider = new TokensProvider();
    const grammarGraph: GrammarGraph = new GrammarGraph();
    // const [code, setCode] = useState(defaultText);
    const monacoRef = useRef(null);
    let monacoLang = useRef();
    useEffect(() => {
        console.log("USE EFFECT");
        console.log(browsedFiles.length);
        if (browsedFiles.length > 0) {
            console.log("if statement");
            setCode(browsedFiles[0]);
        }
    }, [browsedFiles]);

    useEffect(() => {
        if (monacoRef && monacoRef.current) {
            // @ts-ignore
            monacoRef.current.editor.layout();
        }
    }, [showMenu, showErrorBox]);

    const editorWillMount = (monaco: typeof EditorApi) => {

        monaco.editor.defineTheme('vtl', getVtlTheme());
        languageVersions.forEach(version => {
            monaco.languages.register({id: version.code});
            monaco.languages.setMonarchTokensProvider(version.code, tokensProvider.monarchLanguage(version.code));
            monaco.languages.registerCompletionItemProvider(version.code, {
                provideCompletionItems: getSuggestions(version.code, monaco)
            });
        });
        console.log("edit will mount", monaco);

    };


    const didMount = (editor: any, monaco: typeof EditorApi) => {
        console.log("DID MOUNT");
        let to: NodeJS.Timeout;
        let onDidChangeTimout = (e: any) => {
            to = setTimeout(() => onDidChange(e), 2000);
        };

        let onDidChange = (e: any) => {
            let syntaxErrors = ParserFacade.validate(code);
            let monacoErrors = [];
            for (let e of syntaxErrors) {
                monacoErrors.push({
                    startLineNumber: e.startLine,
                    startColumn: e.startCol,
                    endLineNumber: e.endLine,
                    endColumn: e.endCol,
                    message: e.message,
                    severity: monaco.MarkerSeverity.Error
                });
            }

            window.syntaxErrors = syntaxErrors;
            let model = monaco.editor.getModels()[0];
            monaco.editor.setModelMarkers(model, "owner", monacoErrors);
        };
        editor.onDidChangeModelContent((e: any) => {
            if (to) clearTimeout(to);
            onDidChangeTimout(e);
        });
    };

    const onChange = (newValue: string, e: EditorApi.editor.IModelContentChangedEvent) => {
        console.log("ON CHANGE");
        setCode(newValue);
        setCodeChanged(true);

    };

    const options = {
        minimap: {
            enabled: true
        },
        automaticLayout: true
    };
    return (
        <div className="editor-container">
            <MonacoEditor
                ref={monacoRef}
                editorWillMount={editorWillMount}
                editorDidMount={didMount}
                height="100%"
                language={languageVersion}
                theme={theme}
                defaultValue=''
                options={options}
                value={code}
                onChange={onChange}/>
        </div>)
};

export default VtlEditor;