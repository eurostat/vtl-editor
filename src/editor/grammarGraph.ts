import { Lexer, Parser } from 'antlr4ts';
import { rgxEscape, rgxReplace, RuleToken, RuleTokenizer, TokenType } from './ruleTokenizer';

export class GrammarGraph<L extends Lexer, P extends Parser> {
    private lexer: L;
    private parser: P;
    private tokenizer: RuleTokenizer<L, P>;
    private readonly rules = new Map<string, GrammarRule>();
    private root: GrammarRule | undefined;

    constructor(lexer: L, parser: P, grammar: string) {
        this.lexer = lexer;
        this.parser = parser;
        this.tokenizer = new RuleTokenizer(lexer, parser);
        if (grammar && grammar.length > 0) this.processRaw(grammar);
    }

    private processRaw(grammar: string) {
        // Strip import wrapping, comments, newlines and tabulators
        let processed = grammar
            .replace(/^export default "|\/\*.*?\*\/|(\\[rnt])+|";$/g, " ");

        // Replace literal tokens with names from vocabulary
        let vocabulary = this.lexer.vocabulary;
        this.lexer.ruleNames.forEach((value, index) => {
            const literal = vocabulary.getLiteralName(index);
            if (!!literal && processed.includes(literal)) {
                // Escape all RegExp special characters first
                processed = processed
                    .replace(new RegExp(literal.replace(rgxEscape, rgxReplace), "g"), value);
            }
        });

        // Split grammar into rules
        processed.split(";")
            .filter((value) => value.includes(":"))
            .forEach((value, index, array) => {
                let colon = value.indexOf(":");
                const name = this.tokenizer.ruleName(value.substr(0, colon).trim(), index);
                const tokens = this.tokenizer.tokenize(value.substr(++colon).trim().replace(/ +/g, " "));
                this.rules.set(name, new GrammarRule(name, tokens));
            });
        this.root = this.rules.get(this.parser.ruleNames[0]);
    }

    public rootName() {
        return !!this.root ? this.root.name : undefined;
    }
}

class GrammarNode {
    protected readonly alternatives: GrammarStatement[] = [];

    protected processTokens(tokens: RuleToken[]) {
        const statements = RuleTokenizer.alternatives(tokens);
        if (statements.length > 0) {
            statements.forEach((statement) =>
                this.alternatives.push(new GrammarStatement(statement)));
        } else {

        }
    }
}

export class GrammarRule extends GrammarNode {
    private readonly _name: string = "";
    private primary: boolean = false;


    private readonly tokens: GrammarToken[] = [];

    constructor(name: string, tokens: RuleToken[]) {
        super();
        this._name = name;
        this.processTokens(tokens);
    }



    get name(): string {
        return this._name;
    }
}

export class GrammarStatement extends GrammarNode {
    private primary: boolean = false;

    constructor(tokens: RuleToken[]) {
        super();
        this.processTokens(tokens);
    }

}

export class GrammarToken {

}
