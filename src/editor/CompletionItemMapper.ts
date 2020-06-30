import {IRange, languages} from 'monaco-editor/esm/vs/editor/editor.api';
import {ICodeListDetails} from "../models/api/ICodeList";
import {KEYWORD} from "./constants";
import {ISdmxResult} from "../models/api/ISdmxResult";
import {IBaseStruct} from "../models/api/IDataStructureDefinition";


export const fromISdmxResult = (source: ISdmxResult, range: IRange): languages.CompletionItem[] => {
    const codeLists = source.codeLists.map(cl => fromICodeDetail(cl, range));
    const texts = source.texts.map(text => fromIBaseStruct(text, range));
    return [...codeLists, ...texts,
        fromString(source.timeDimension, "Time Dimenstion", range),
        fromString(source.primaryMeasure, "Primary measure", range)]
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

const fromIBaseStruct = (source: IBaseStruct, range: IRange): languages.CompletionItem => {
    return {
        label: source.id,
        kind: KEYWORD,
        insertText: source.id,
        range: range,
        documentation: {
            value: source.name
        }
    }
}

const fromString = (id: string, type: string, range: IRange): languages.CompletionItem => {
    return {
        label: id,
        kind: KEYWORD,
        insertText: id,
        range: range,
        documentation: {
            value: type
        }
    }
}