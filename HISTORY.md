## Version 0.4.0.200427-a
Date: 2020-04-27

### New Features
- Errors found in the VTL code are listed in the error panel at the bottom of the screen [VRM-19]
- For specific VTL functions autocomplete feature inserts snippets (whole syntax with related keywords and parentheses) into the edited code [VRM-17]
- You can select VTL grammar version (2.0 or 3.0) in the settings panel [VRM-21]

### Improvements
- Editor now supports version 3.0 of VTL grammar [VRM-21]
- Autocomplete suggestions now contain detailed syntax and short description of keyword or function [VRM-16]
- Editor remembers its configuration and contents after you close or refresh the page

### Fixes
- Round and angle brackets are now colorized properly [VRM-14]

### Technical details
- Autocomplete items are listed in static source files for each existing grammar providing extra details and help content [VRM-16]
- For new grammars when there aren't static files autocomplete items are created automatically from grammar file [VRM-18]
- Editor configuration and contents are preserved in the local storage in the browser

## Version 0.3.0.200415-a
Date: 2020-04-15

### New Features
- Edited VTL code can be saved in a file on local disk [VRM-42]
- Text file with VTL code can be loaded from local disk into the editor [VRM-41]
- Icons in the side menu (on the left) allow to save and open file, and to display settings [VRM-22]
- Editor has four color schemes to choose from in the settings panel

### Technical details
- Added configuration for deployment on WebLogic and Tomcat application servers [VRM-85][VRM-87]


## Version 0.2.0.200325-a
Date: 2020-03-25

### New Features
- Editor shows autocomplete suggestions for keywords and functions [VRM-16]

### Improvements
- All VTL code elements are highlighted [VRM-14]

### Technical details
- Items for autocomplete feature are loaded from VTL grammar [VRM-18]
- Keywords and operators for highlighting feature are loaded from VTL grammar [VRM-15]


## Version 0.1.0.200313-a
Date: 2020-03-13

### New Features
- Integrated Monaco editor allows to edit VTL code [VRM-68]
- Syntax of entered code is validated against VTL grammar [VRM-19]
- Basic user interface with top banner and bar and side menu mock [VRM-22]
- Monaco minimap enabled for easier navigation in the file [VRM-22]
- Some VTL code elements are highlighted as per their category [VRM-14]

### Technical Details
- Base application generated with Create React App [VRM-70]
- Parsing classes for VTL grammar generated with Antlr4 [VRM-21]
- Monaco editor connected with Antlr4 parsing classes for VTL syntax validation [VRM-19]