import { Lexer } from "antlr4ts";
import { SdmxResult } from "../../../model";
import { keywordRgx } from "./vocabularyPack";

export class TokensProvider {
    private readonly definition: any;

    constructor(tools: any) {
        const { lexer, monarchDefinition } = tools;
        this.definition = JSON.parse(JSON.stringify(monarchDefinition), rgxReviver);
        this.createCategories();
        this.addTokens(lexer);
    }

    private createCategories() {
        this.createCategory("keywords");
        this.createCategory("operators");
        this.createCategory("specials");
        this.createCategory("variables");
        this.createCategory("attributes");
        this.createCategory("dimensions");
        this.createCategory("primaryMeasures");
    }

    private createCategory(category: string) {
        if (!(category in this.definition) || !(this.definition.keywords instanceof Array)) {
            this.definition[category] = new Array<string>();
        }
    }

    private addTokens(lexer: Lexer) {
        // @ts-ignore
        const vocabulary = lexer.VOCABULARY;
        const ruleNames = lexer.ruleNames;
        ruleNames.forEach((_: any, index: number) => {
            let tokenName = vocabulary.getLiteralName(++index);
            if (tokenName) {
                tokenName = tokenName.replace(/^'+|'+$/g, "");
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

    public monarchLanguage(): any {
        return this.definition;
    }

    public addDsdContent(dsdContent: SdmxResult | undefined): any {
        if (dsdContent) {
            dsdContent.attribute.codeLists.forEach(codeList =>
                this.definition.attributes.push(codeList.structureId),
            );
            dsdContent.attribute.texts.forEach(text => this.definition.attributes.push(text.id));
            dsdContent.dimension.codeLists.forEach(codeList =>
                this.definition.dimensions.push(codeList.structureId),
            );
            dsdContent.dimension.texts.forEach(text => this.definition.dimensions.push(text.id));
            this.definition.dimensions.push(dsdContent.timeDimension);
            this.definition.primaryMeasures.push(dsdContent.primaryMeasure);
        }
        return this;
    }

    public addVariables() {
        this.definition.variables.push("ds_L_CY", "ErrB", "ds_V_PY");
    }
}

const rgxPrefix = "_RGX_";
const rgxRgx = /\/(.*)\/(.*)?/;

function rgxReviver(_: string, value: any) {
    const strValue = value.toString();
    if (strValue.indexOf(rgxPrefix) === 0) {
        const matchArray = strValue.split(rgxPrefix)[1].match(rgxRgx);
        return new RegExp(matchArray[1], matchArray[2] || "");
    }
    return value;
}
