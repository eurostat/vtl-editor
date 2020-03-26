import { Lexer, Parser } from 'antlr4ts';

export class GrammarGraph<L extends Lexer, P extends Parser> {
    private readonly rawGrammar: string;
    private processedGrammar!: string;
    private lexer: L;
    private parser: P;
    private root: GrammarRule | undefined;
    private readonly rules = new Map<string, GrammarRule>();

    constructor(lexer: L, parser: P, grammar: string) {
        this.rawGrammar = grammar;
        this.lexer = lexer;
        this.parser = parser;
        this.processRaw();
    }

    private processRaw() {
        this.processedGrammar = this.rawGrammar
            .replace(/^export default "|\/\*.*?\*\/|(\\[rnt])+|";$/g, " ");
        const vocabulary = this.lexer.vocabulary;
        this.lexer.ruleNames.forEach((value, index) => {
            const literal = vocabulary.getLiteralName(index);
            if (!!literal && this.processedGrammar.includes(literal)) {
                console.log(value + "/" + index + ": " + literal + " " + this.processedGrammar.includes(literal));
                this.processedGrammar = this.processedGrammar
                    .replace(new RegExp(literal.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "g"), value);
            }
        });

        this.processedGrammar.split(";")
            .filter((value) => value.includes(":"))
            .forEach((value, index, array) => {
                let colon = value.indexOf(":");
                const name = value.substr(0, colon).trim();
                const rule = new GrammarRule(name, value.substr(++colon).trim().replace(/ +/g, " "));
                this.rules.set(name, rule);
                if (index === 0) this.root = rule;
            });
        console.log("PROCESSED");
        console.log(this.processedGrammar);
        console.log(this.rules);
    }

    public rootName() {
        return !!this.root ? this.root.name : undefined;
    }
}

enum TokenizeMode {
    None,
    Identifier,
    Assign,
    Modifier
}

enum TokenType {
    Space= " ",
    Lparen = "(",
    Rparen = ")",
    Question = "?",
    Star = "*",
    Plus = "+",
    Pipe = "|",
    Hash = "#",
    Assign = "=",
    Under = "_",
    Identifier = "i",
    Label = "l",
    Operand = "o"
}

export class GrammarRule {
    private readonly _name: string = "";
    private readonly raw: string = "";

    private primary: boolean = false;
    private secondary: boolean = false;
    private statements: GrammarStatement[] = [];

    constructor(name: string, raw: string) {
        this._name = name;
        this.raw = raw;
        this.processRaw(raw);
    }

    private processRaw(raw: string) {
        const chars = new RuleTokenizer().tokenize(Array.from(raw));

    }

    get name(): string {
        return this._name;
    }

}

class RuleTokenizer {
    private mode: TokenizeMode = TokenizeMode.None;
    private readonly tokens: RuleToken[] = [];
    private readonly parens: RuleToken[] = [];
    private readonly identifier: string[] = [];

    public tokenize(chars: string[]) {
        chars.forEach((value, index) => {
            switch (value) {
                case TokenType.Lparen: {
                    this.finishIdentifier(index);
                    const token = new RuleToken(TokenType.Lparen, index);
                    this.parens.push(token);
                    this.tokens.push(token);
                    break;
                }
                case TokenType.Rparen: {
                    this.finishIdentifier(index);
                    const lparen = this.parens.pop();
                    if (lparen) {
                        const rparen = new RuleToken(TokenType.Rparen, index);
                        lparen.sibling = rparen;
                        rparen.sibling = lparen;
                    } else {
                        this.unexpected(value, index);
                    }
                    break;
                }

                case TokenType.Space: {
                    this.finishIdentifier(index);
                    break;
                }
                default : {
                    if(/[a-zA-Z_]/.test(value)) {
                        this.identifier.push(value);
                    }
                    this.unexpected(value, index);
                }
            }
        })
    }

    private unexpected(token: string, index: number) {
        console.log("Unexpected token " + token + " at " + index);
    }

    private finishIdentifier(index: number) {
        if (this.identifier.length > 0) {
            this.tokens.push(new RuleToken(
                TokenType.Identifier,
                index - this.identifier.length,
                this.parens.length,
                this.identifier.toString()));
            this.identifier.length = 0;
        }
    }
}

class RuleToken {
    public type: TokenType;
    public nested: number = 0;
    public index: number = -1;
    public optional: boolean = false;
    public zeromore: boolean = false;
    public onemore: boolean = false;
    public sibling: RuleToken | undefined;

    constructor(type: TokenType, index: number, nested?: number, value?: string) {
        this.type = type;
        this.index = index;
        if (nested) this.nested = nested;
    }

}

export class GrammarStatement {
    private keyword = "";
    private tokens: GrammarToken[] = [];
}

export class GrammarToken {

}
