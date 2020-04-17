import { Lexer, Parser } from 'antlr4ts';
import { VocabularyPack } from './vocabularyPack';

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
    PlusAssign = "+=",
    Identifier = "i",
    Label = "l",
    Operator = "o",
    Rule = "r",
    Unknown = "u"
}

export enum MultiplyMode {
    None,
    Optional,
    Onemore,
    Zeromore
}

interface TokenizerContext {
    tokens: RuleToken[];
    parens: RuleToken[];
    operand: string[];
    modifier: TokenType | undefined;
}

export class RuleTokenizer<L extends Lexer, P extends Parser> {
    private vocabulary: VocabularyPack<L, P>;
    private readonly context: TokenizerContext = {tokens: [], parens: [], operand: [], modifier: undefined};

    constructor(vocabulary: VocabularyPack<L, P>) {
        this.vocabulary = vocabulary;
    }

    public tokenize(declaration: string): RuleToken[] {
        this.clearContext();
        Array.from(declaration).forEach((value, index) => {
            if (!(this.isOperand(value, index)
                || this.isModifier(value, index))) {
                switch (value) {
                    case TokenType.Lparen: {
                        const token = new RuleToken(TokenType.Lparen, this.context.parens.length);
                        this.context.parens.push(token);
                        this.context.tokens.push(token);
                        break;
                    }
                    case TokenType.Rparen: {
                        const lparen = this.context.parens.pop();
                        if (lparen) {
                            const lindex = this.context.tokens.indexOf(lparen);
                            if (lindex !== this.context.tokens.length - 2) {
                                const rparen = new RuleToken(TokenType.Rparen, this.context.parens.length);
                                lparen.sibling = rparen;
                                rparen.sibling = lparen;
                                this.context.tokens.push(rparen);
                            } else {
                                const last = this.lastToken();
                                if (last) last.nested--;
                                this.context.tokens.splice(lindex, 1);
                            }
                        } else this.unexpected(value, index);
                        break;
                    }
                    case TokenType.Pipe: {
                        this.addToken(value);
                        break;
                    }
                    case TokenType.Assign: {
                        const last = this.lastToken([TokenType.Unknown]);
                        if (last) {
                            last.type = TokenType.Identifier;
                            this.addToken(value);
                            console.warn("Unknown operand token " + last.name + " recognized as identifier");
                        }
                        break;
                    }
                    case TokenType.Hash: {
                        this.addToken(value);
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
        return this.context.tokens;
    }

    private isOperand(value: string, index: number): boolean {
        if (/[a-zA-Z_0-9]/.test(value)) {
            this.context.operand.push(value);
            return true;
        }
        this.finishOperand(index);
        return false;
    }

    private isModifier(value: string, index: number): boolean {
        // TODO: add plus assign and multipliers stacking
        if (/[*+?]/.test(value)) {
            const last = this.lastToken([TokenType.Operator, TokenType.Rule, TokenType.Rparen, TokenType.Unknown]);
            if (this.context.modifier) {
                if (value === TokenType.Question && last) last.greedy = false;
                else this.unexpected(value, index);
                this.finishModifier();
            } else {
                if (last) {
                    last.multiply(value);
                    this.context.modifier = value as any;
                } else this.unexpected(value, index);
            }
            return true;
        }
        this.finishModifier();
        return false;
    }

    private addToken(type: TokenType) {
        this.context.tokens.push(new RuleToken(
            type,
            this.context.parens.length
        ));
    }

    private finishOperand(index: number) {
        if (this.context.operand.length > 0) {
            const name: string = this.context.operand.join("");
            let value: string | undefined = undefined;
            index = index - this.context.operand.length;
            const last = this.lastToken([TokenType.Hash]);
            let type: TokenType;
            if (last) {
                type = TokenType.Label;
            } else if (this.vocabulary.symbolicNames.includes(name)){
                type = TokenType.Operator;
                value = this.vocabulary.operandNames[this.vocabulary.symbolicNames.indexOf(name)];
            }
            else if (name in Lexer) {
                type = TokenType.Operator;
            } else if (this.vocabulary.ruleNames.includes(name)) {
                type = TokenType.Rule;
            } else {
                type = TokenType.Unknown;
                console.warn("Unknown operand token " + name + " at " + index);
            }

            this.context.tokens.push(new RuleToken(
                type,
                this.context.parens.length,
                name,
                value
            ));
            this.context.operand.length = 0;
        }
    }

    private finishModifier() {
        this.context.modifier = undefined;
    }

    private unexpected(token: string, index: number) {
        console.error("Unexpected token " + token + " at " + index);
    }

    private clearContext() {
        this.context.tokens = [];
        this.context.parens = [];
        this.context.operand = [];
        this.context.modifier = undefined;
    }

    private lastToken(filter?: TokenType[]): RuleToken | undefined {
        if (this.context.tokens.length > 0) {
            const last = this.context.tokens[this.context.tokens.length - 1];
            if (last && (!filter || filter.includes(last.type))) return last;
        }
        return undefined;
    }

    public ruleName(declaration: string, index: number): string {
        const ruleNames = this.vocabulary.ruleNames;
        let rgx = new RegExp(ruleNames[index].replace(rgxEscape, rgxReplace), "g");
        if (rgx.test(declaration)) {
            return ruleNames[index];
        } else {
            console.warn("Mismatched rule " + index + " name. Looking for alternatives.");
            ruleNames.forEach((ruleName, index) => {
                rgx = new RegExp(ruleName.replace(rgxEscape, rgxReplace), "g");
                if (rgx.test(declaration)) {
                    console.warn("Matched name of rule " + index + ".");
                    return ruleName;
                }
            });
            console.error("No alternative for mismatched rule name.")
        }
        return declaration;
    }

    public static alternatives(tokens: RuleToken[]): RuleToken[][] {
        let pipeIndex = -1;
        let statement: RuleToken[] = [];
        return tokens.reduce((statements: RuleToken[][], token, index, tokens) => {
            if (token.nested === 0 && token.type === TokenType.Pipe) {
                statement = tokens.slice(pipeIndex + 1, index);
                if (statement.length !== 0) statements.push(statement);
                pipeIndex = index;
            } else if (index === tokens.length - 1) {
                statement = tokens.slice(pipeIndex + 1);
                if (statement.length !== 0) statements.push(statement);
            }
            return statements;
        }, []);
    }

    public static parentheses(tokens: RuleToken[]): RuleToken[][] {
        let parenIndex = -1;
        let statement: RuleToken[] = [];
        return tokens.reduce((statements: RuleToken[][], token, index, tokens) => {
            if (token.nested === 0 && (token.type === TokenType.Lparen || token.type === TokenType.Rparen)) {
                statement = tokens.slice(
                    parenIndex,
                    index + (token.type === TokenType.Rparen ? 1 : 0));
                if (statement.length !== 0) statements.push(statement);
                parenIndex = index;
            } else if (index === tokens.length - 1) {
                statement = tokens.slice(parenIndex + 1);
                if (statement.length !== 0) statements.push(statement);
            }
            return statements;
        }, []);
    }

    static unnest(tokens: RuleToken[]) {
        if (!tokens) return [];
        const left = tokens[0];
        const right = tokens[tokens.length - 1];
        if (left.type === TokenType.Lparen && right.type === TokenType.Rparen
            && left.sibling === right) {
            tokens.pop();
            tokens.shift();
            tokens.forEach((token) => token.nested--);
        }
        return tokens;
    }
}

export class RuleToken {
    public type: TokenType;
    public name: string | undefined;
    public value: string | undefined;
    public identifier: string | undefined;
    public nested: number = 0;
    public multiplied: MultiplyMode = MultiplyMode.None;
    public greedy: boolean = true;
    public sibling: RuleToken | undefined;

    constructor(type: TokenType, nested?: number, name?: string, value?: string) {
        this.type = type;
        if (nested) this.nested = nested;
        if (name) this.name = name;
        if (value) this.value = value;
    }

    multiply(type: string) {
        let multiplied = MultiplyMode.None;
        switch (type) {
            case TokenType.Question:
                multiplied = MultiplyMode.Optional;
                break;
            case TokenType.Plus:
                multiplied = MultiplyMode.Onemore;
                break;
            case TokenType.Star:
                multiplied = MultiplyMode.Zeromore;
                break;
            default:
                return;
        }
        if (this.multiplied === multiplied) return;
        this.multiplied = this.multiplied === MultiplyMode.None
            ? multiplied
            : MultiplyMode.Zeromore;
    }

    label(identifier: string | undefined) {
        this.identifier = identifier;
    }

    isAssign() {
        return this.type === TokenType.Assign || this.type === TokenType.PlusAssign;
    }

    isAtom() {
        return this.type === TokenType.Rule || this.type === TokenType.Operator || this.type === TokenType.Unknown;
    }
}