# Antlr Editor

[![ci](https://github.com/eurostat/vtl-editor/actions/workflows/ci.yaml/badge.svg?branch=main)](https://github.com/eurostat/vtl-editor/actions/workflows/ci.yaml)
[![npm version](https://badge.fury.io/js/vtl-editor.svg)](https://badge.fury.io/js/vtl-editor)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

See example into deployed [Storybook](https://eurostat.github.io/vtl-editor/index.html)

## Usage

### Install

```bash
yarn typescript add @eurostat/vtl-editor antlr4ts monaco-editor react-monaco-editor
```

### VTLEditor for VTL

```bash
yarn add
```

```javascript
import React, { useState } from "react";
import { VTLEditor } from "@eurostat/vtl-editor";
import * as VTLTools from "vtl-2-0-antlr-tools-ts";
import { getSuggestions } from "./custom-suggestions";

const Editor = ({}) => {
    const [script, setScript] = useState("");
    const [errors, setErrors] = useState([]);
    const customTools = { ...VTLTools, getSuggestionsFromRange: getSuggestions };
    return (
        <>
            <VTLEditor
                script={script}
                setScript={setScript}
                languageVersion="my-language"
                setErrors={setErrors}
                variables={{}}
                variableURLs={[]}
                tools={customTools}
            />
            {errors.length > 0 && <div>{`Errors: ${errors.join(" - ")}`}</div>}
        </>
    );
};

export default Editor;
```

### VTLEditor Props

| Name            |      Type       | Default value |
| --------------- | :-------------: | :-----------: |
| script          |     string      |       -       |
| setScript       |    Function     |       -       |
| languageVersion |     string      |       -       |
| setErrors       |    Function     |       -       |
| tools           |    Tools \*     |       -       |
| theme           |     string      |    vs-dark    |
| variables       |  Variables \*   |      { }      |
| variableURLs    | VariableURLs \* |      [ ]      |
| options         |   Options \*    |      {}       |

See details about \* props below

### Props

#### `tools`

`tools` has to be mainly antlr4 auto-generated Lexer & Parser.

| Name                    |     Type      | Default value |
| ----------------------- | :-----------: | :-----------: |
| id                      |    string     |       -       |
| initialRule             |    string     |       -       |
| grammar                 |    string     |       -       |
| Lexer                   | Antlr4 Lexer  |       -       |
| Parser                  | Antlr4 Parser |       -       |
| getSuggestionsFromRange |     func      |   () => []    |

Have a look to [VTL 2.0 Antlr Tools](https://github.com/NicoLaval/vtl-2-0-antlr-tools-ts) for example.

#### `variables`

`variables` enable to pass an object to provide auto-suggestion.

The shape of this object is:

```json
const obj = {
    "var1": {"type": "STRING", "role": "IDENTIFIER"},
    "var2": {"type": "INTEGER", "role": "MEASURE"},
}
```

#### `variableURLs`

`variableURLs` enable to pass an array of string to fetch to provide auto-suggestion:

```json
["http://metadata/1", "http://metadata/2"]
```

The shape of each fetched resources has to be:

```json
[
    { "name": "var1", "type": "STRING", "role": "IDENTIFIER" },
    { "name": "var2", "type": "INTEGER", "role": "MEASURE" }
]
```

#### Options

The shape of `options` props has to be:

```json
{
    "minimap": "Values: true | false - Default: true",
    "theme": "Values: 'vs-dark' | 'vs-light - Default: 'vs-dark'",
    "hideLines": "Values: true | false - Default: false",
    "style": {
        "cssProperty": "value",
        ...
        // Style props are applied to editor container
    }
}
```
