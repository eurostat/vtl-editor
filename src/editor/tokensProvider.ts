import monarchDefinition from '../grammar/vtl-2.0/monarchDefinition.json';
import {VtlLexer} from '../grammar/vtl-2.0/VtlLexer';
import {keywordRgx} from './vocabularyPack';
import {CodeListDetails} from "../models/api/CodeList";
import {ISdmxResult} from "../models/api/ISdmxResult";

export class TokensProvider {
    private readonly definition: any;

    constructor() {
        this.definition = JSON.parse(JSON.stringify(monarchDefinition), rgxReviver);
        this.createCategories();
        this.addTokens();
    }

    private createCategories() {
        this.createCategory("keywords");
        this.createCategory("operators");
        this.createCategory("specials");
        this.createCategory("variables");
    }

    private createCategory(category: string) {
        if (!(category in this.definition) || !(this.definition.keywords instanceof Array)) {
            (this.definition)[category] = new Array<string>();
        }
    }

    private addTokens() {
        let vocabulary = VtlLexer.VOCABULARY;
        let ruleNames = VtlLexer.ruleNames;
        ruleNames.forEach((token, index) => {
            let tokenName = vocabulary.getLiteralName(++index);
            if (tokenName) {
                tokenName = tokenName.replace(/^'+|'+$/g, '');
                if (keywordRgx.test(tokenName)) {
                    this.definition.keywords.push(tokenName);
                } else if (vocabulary.getSymbolicName(index)) {
                    this.definition.specials.push(tokenName);
                } else {
                    this.definition.operators.push(tokenName);
                }
            }
        });
    }

    public monarchLanguage(version: string): any {
        return this.definition;
    }

    public addDsdContent(dsdContent: ISdmxResult | null): any {
        if (dsdContent) {
            dsdContent.codeLists.forEach(codeList => this.definition.dsdContents.push(codeList.structureId))
            dsdContent.texts.forEach(codeList => this.definition.dsdContents.push(codeList.id));
            this.definition.dsdContents.push(dsdContent.primaryMeasure);
            this.definition.dsdContents.push(dsdContent.timeDimension);
        }
        return this;
    }

    public addVariables() {
        this.definition.variables.push("ds_L_CY", "ErrB", "ds_V_PY");
    }
}

const rgxPrefix = "_RGX_";
const rgxRgx = /\/(.*)\/(.*)?/;

function rgxReviver(key: string, value: any) {
    const strValue = value.toString();
    if (strValue.indexOf(rgxPrefix) === 0) {
        const matchArray = strValue.split(rgxPrefix)[1].match(rgxRgx);
        return new RegExp(matchArray[1], matchArray[2] || "");
    }
    return value;
}