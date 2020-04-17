import { Lexer, Parser } from 'antlr4ts';
import { VtlLexer } from '../grammar/vtl-2.0/VtlLexer';

export const keywordRgx: RegExp = /[a-z_$][\w$]*/;

export class VocabularyPack<L extends Lexer, P extends Parser> {
    private lexer: L;
    private parser: P;
    readonly ruleNames:  Array<string>;
    readonly symbolicNames: Array<string | undefined>;
    readonly literalNames: Array<string | undefined>;
    readonly operandNames: Array<string | undefined>;

    constructor(lexer: L, parser: P) {
        this.lexer = lexer;
        this.parser = parser;
        this.ruleNames = Array.from(parser.ruleNames);
        const count = lexer.vocabulary.maxTokenType;
        this.symbolicNames = new Array<string|undefined>(count);
        this.literalNames = new Array<string|undefined>(count);
        this.operandNames = new Array<string|undefined>(count);
        if (lexer instanceof VtlLexer) {
            const vtlLexer = <VtlLexer>lexer;
            const vocabulary = vtlLexer.vocabulary;
            VtlLexer.ruleNames.forEach((ruleName) => {
               if (ruleName in VtlLexer) {
                   const index = VtlLexer[ruleName as keyof typeof VtlLexer];
                   if (typeof index === "number" && Number.isInteger(index)
                       && index > 0 && index <= count) {
                       this.symbolicNames[index] = ruleName;
                       this.literalNames[index] = vocabulary.getLiteralName(index);
                       this.operandNames[index] = this.literalNames[index]?.replace(/^'+|'+$/g, '');
                   }
               }
            });
        }
    }


}