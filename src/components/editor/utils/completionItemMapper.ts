import { IRange, languages } from "monaco-editor/esm/vs/editor/editor.api";
import { ENUM, PROPERTY } from "./constants";
import { BaseStruct, CodeListDetails, SdmxResult } from "../../../model";

export const fromISdmxResult = (source: SdmxResult, range: IRange): languages.CompletionItem[] => {
    const codeLists = source.dimension.codeLists
        .concat(source.attribute.codeLists)
        .map(cl => fromICodeDetail(cl, range));
    const texts = source.dimension.texts
        .concat(source.attribute.texts)
        .map(text => fromIBaseStruct(text, range));
    return [
        ...codeLists,
        ...texts,
        fromString(source.timeDimension, "Time Dimension", range),
        fromString(source.primaryMeasure, "Primary measure", range),
    ];
};

const fromICodeDetail = (source: CodeListDetails, range: IRange): languages.CompletionItem => {
    return {
        label: source.structureId,
        kind: ENUM,
        insertText: source.structureId,
        range: range,
        documentation: {
            value: source.name,
        },
    };
};

const fromIBaseStruct = (source: BaseStruct, range: IRange): languages.CompletionItem => {
    return {
        label: source.id,
        kind: PROPERTY,
        insertText: source.id,
        range: range,
        documentation: {
            value: source.name,
        },
    };
};

const fromString = (id: string, type: string, range: IRange): languages.CompletionItem => {
    return {
        label: id,
        kind: PROPERTY,
        insertText: id,
        range: range,
        documentation: {
            value: type,
        },
    };
};
