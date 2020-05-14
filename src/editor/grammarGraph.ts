// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import grammar from 'raw-loader!../grammar/vtl-2.0/Vtl.g4';
import { VtlLexer } from '../grammar/vtl-2.0/VtlLexer';

export class GrammarGraph {
    private readonly rawGrammar: string;
    private processedGrammar!: string;
    private statements: string[] = [];

    constructor() {
        this.rawGrammar = grammar;
        this.processRaw();
    }

    private processRaw() {
        this.processedGrammar = this.rawGrammar
            .replace(/^export default "|\/\*.*?\*\/|(\\[rnt])+|";$/g, " ");
        const vocabulary = VtlLexer.VOCABULARY;
        VtlLexer.ruleNames.forEach((value, index) => {
            const literal = vocabulary.getLiteralName(index);
            if (!!literal && this.processedGrammar.includes(literal)) {
                console.log(value + "/" + index + ": " + literal + " " + this.processedGrammar.includes(literal));
                this.processedGrammar = this.processedGrammar
                    .replace(new RegExp(literal.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "g"), value);
            }
        });
        let statements = this.processedGrammar.split(";")
            .filter((value) => value.includes(":"));
        let rules = new Map();
        statements.forEach((value, index, array) => {
            let statement = value.replace(/ +/g, " ");
            let colon = value.indexOf(":");
            rules.set(value.substr(0, colon).trim(), value.substr(++colon).trim());
        });
        console.log("PROCESSED");
        console.log(this.processedGrammar);
        console.log(statements);
        console.log(rules);
    }
}