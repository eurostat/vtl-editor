import {IRange, languages} from 'monaco-editor/esm/vs/editor/editor.api';
import {ICodeListDetails} from "../models/api/ICodeList";
import {KEYWORD} from "./constants";


export const fromICodeDetails = (source: ICodeListDetails[], range: IRange): languages.CompletionItem[] => {
    return source.map(cl => fromICodeDetail(cl, range));
}

const fromICodeDetail = (source: ICodeListDetails, range: IRange): languages.CompletionItem => {
    return {
        label: source.structureId,
        kind: KEYWORD,
        insertText: source.structureId,
        range: range,
        documentation: {
            value: source.name
        }
    }
}