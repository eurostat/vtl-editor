import { CancellationToken, editor, languages, Position } from 'monaco-editor';

export class AutocompleteProvider implements languages.CompletionItemProvider {
    private suggestions: languages.CompletionItem[];

    constructor(suggestions: languages.CompletionItem[]) {
        this.suggestions = suggestions;
    }

    provideCompletionItems(model: editor.ITextModel,
                           position: Position,
                           context: languages.CompletionContext,
                           token: CancellationToken): languages.ProviderResult<languages.CompletionList> {
        // find out if we are completing a property in the 'dependencies' object.
        const textUntilPosition = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column
        });
        const word = model.getWordUntilPosition(position);
        const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
        };

        let uniquetext = Array.from(new Set(textUntilPosition.replace(/"(.*?)"/g, "")
            .replace(/[^a-zA-Z_]/g, " ")
            .split(" ").filter(w => w !== "")).values());
        // const suggestionList = suggestions(range, grammar);
        this.suggestions.forEach((item) => item.range = range);
        uniquetext = this.removeLanguageSyntaxFromList(uniquetext, this.suggestions);
        const array = uniquetext.map(w => {
            return {
                label: w,
                kind: languages.CompletionItemKind.Variable,
                insertText: w
            } as languages.CompletionItem
        });

        return {
            suggestions: [...this.suggestions, ...array]
        };
    }

    removeLanguageSyntaxFromList(vars: string[], suggestions: languages.CompletionItem[]) {
        const suggestionsLabels = suggestions.map(suggestion => {
            if (typeof(suggestion.label) === "string") return suggestion.label.toLowerCase();
            else return suggestion.label.name;
        });
        return vars.filter(t => !suggestionsLabels.includes(t.toLowerCase()))
    }


}