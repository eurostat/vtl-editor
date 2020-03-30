import { Lexer, Parser } from 'antlr4ts';
import { GrammarStatement } from './grammarGraph';

export const rgxEscape = /[-\/\\^$*+?.()|[\]{}]/g;
export const rgxReplace = "\\$&";

export enum TokenType {
    Space = " ",
    Lparen = "(",
    Rparen = ")",
    Question = "?",
    Star = "*",
    Plus = "+",
    Pipe = "|",
    Hash = "#",
    Assign = "=",
    Identifier = "i",
    Label = "l",
    Operand = "o"
}

export class RuleTokenizer<L extends Lexer, P extends Parser> {
    private readonly lexer: L;
    private readonly parser: P;
    private readonly tokens: RuleToken[] = [];
    private readonly parens: RuleToken[] = [];
    private readonly operand: string[] = [];
    private modifier: TokenType | undefined;

    constructor(lexer: L, parser: P) {
        this.lexer = lexer;
        this.parser = parser;
    }

    public tokenize(declaration: string): RuleToken[] {
        this.clear();
        Array.from(declaration).forEach((value, index) => {
            if (!(this.isOperand(value, index)
                || this.isModifier(value, index))) {
                switch (value) {
                    case TokenType.Lparen: {
                        const token = new RuleToken(TokenType.Lparen, index, this.parens.length);
                        this.parens.push(token);
                        this.tokens.push(token);
                        break;
                    }
                    case TokenType.Rparen: {
                        const lparen = this.parens.pop();
                        if (lparen) {
                            const lindex = this.tokens.indexOf(lparen);
                            if (lindex !== this.tokens.length - 2) {
                                const rparen = new RuleToken(TokenType.Rparen, index, this.parens.length);
                                lparen.sibling = rparen;
                                rparen.sibling = lparen;
                                this.tokens.push(rparen);
                            } else {
                                const last = this.lastToken();
                                if (last) last.nested--;
                                this.tokens.splice(lindex, 1);
                            }
                        } else this.unexpected(value, index);
                        break;
                    }
                    case TokenType.Pipe: {
                        this.addToken(value, index);
                        break;
                    }
                    case TokenType.Assign: {
                        const last = this.lastToken([TokenType.Operand]);
                        if (last) {
                            last.type = TokenType.Identifier;
                            this.addToken(value, index);
                        }
                        break;
                    }
                    case TokenType.Hash: {
                        this.addToken(value, index);
                        break;
                    }
                    case TokenType.Space: {
                        this.finishOperand(index);
                        break;
                    }
                    default : {
                        this.unexpected(value, index);
                    }
                }
            }
        });
        this.finishOperand(declaration.length);
        return this.tokens;
    }

    private isOperand(value: string, index: number): boolean {
        if (/[a-zA-Z_0-9]/.test(value)) {
            this.operand.push(value);
            return true;
        }
        this.finishOperand(index);
        return false;
    }

    private isModifier(value: string, index: number): boolean {
        if (/[*+?]/.test(value)) {
            const last = this.lastToken([TokenType.Operand, TokenType.Rparen]);
            if (this.modifier) {
                if (value === TokenType.Question && last) last.nongreedy = true;
                else this.unexpected(value, index);
                this.finishModifier();
            } else {
                if (last) {
                    last.modifier(value);
                    this.modifier = <any>value;
                } else this.unexpected(value, index);
            }
            return true;
        }
        this.finishModifier();
        return false;
    }

    private addToken(type: TokenType, index: number) {
        this.tokens.push(new RuleToken(
            type,
            index,
            this.parens.length
        ));
    }

    private finishOperand(index: number) {
        if (this.operand.length > 0) {
            const last = this.lastToken([TokenType.Hash]);
            const type = !!last ? TokenType.Label : TokenType.Operand;
            this.tokens.push(new RuleToken(
                type,
                index - this.operand.length,
                this.parens.length,
                this.operand.join("")));
            this.operand.length = 0;
        }
    }

    private finishModifier() {
        this.modifier = undefined;
    }

    private unexpected(token: string, index: number) {
        console.error("Unexpected token " + token + " at " + index);
    }

    private clear() {
        this.tokens.length = 0;
        this.parens.length = 0;
        this.operand.length = 0;
        this.modifier = undefined;
    }

    private lastToken(filter?: TokenType[]): RuleToken | undefined {
        if (this.tokens.length > 0) {
            const last = this.tokens[this.tokens.length - 1];
            if (last && (!filter || filter.includes(last.type))) return last;
        }
        return undefined;
    }

    public ruleName(declaration: string, index: number): string {
        const ruleNames = this.parser.ruleNames;
        let rgx = new RegExp(ruleNames[index].replace(rgxEscape, rgxReplace), "g");
        if (rgx.test(declaration)) {
            return ruleNames[index];
        } else {
            console.warn("Mismatched rule " + index + " name. Looking for alternatives.");
            ruleNames.forEach((value, index) => {
                rgx = new RegExp(value.replace(rgxEscape, rgxReplace), "g");
                if (rgx.test(declaration)) {
                    console.warn("Matched name of rule " + index + ".");
                    return value;
                }
            });
            console.error("No alternative for mismatched rule name.")
        }
        return declaration;
    }

    public static alternatives(tokens: RuleToken[]) {
        let pipeIndex = -1;
        return tokens.reduce((statements: RuleToken[][], token, index, tokens) => {
            if (token.nested === 0 && token.type === TokenType.Pipe) {
                statements.push(tokens.slice(pipeIndex + 1, index));
                pipeIndex = index;
            } else if (index === tokens.length - 1) {
                statements.push(tokens.slice(pipeIndex + 1));
            }
            return statements;
        }, []);
    }
}

export class RuleToken {
    public type: TokenType;
    public value: string = "";
    public index: number = -1;
    public nested: number = 0;
    public optional: boolean = false;
    public zeromore: boolean = false;
    public onemore: boolean = false;
    public nongreedy: boolean = false;
    public sibling: RuleToken | undefined;

    constructor(type: TokenType, index: number, nested?: number, value?: string) {
        this.type = type;
        this.index = index;
        if (nested) this.nested = nested;
        if (value) this.value = value;
    }

    modifier(type: string) {
        switch (type) {
            case TokenType.Question:
                this.optional = true;
                break;
            case TokenType.Plus:
                this.onemore = true;
                break;
            case TokenType.Star:
                this.zeromore = true;
                break;
        }
    }
}