## Version 0.2.0.200325-a
Date: 2020-03-25
### New Features
- Editor shows autocomplete suggestions for keywords and functions
### Improvements
- All VTL code elements are highlighted [VRM-24]
### Technical details
- Items for autocomplete feature are loaded from VTL grammar
- Keywords and operators for highlighting feature are loaded from VTL grammar
## Version 0.1.0.200313-a
Date: 2020-03-13
### New Features
- Integrated Monaco editor allows to edit VTL code
- Syntax of entered code is validated against VTL grammar
- Basic user interface with top banner and bar and side menu mock
- Monaco minimap enabled for easier navigation in the file
- Some VTL code elements are highlighted as per their category [VRM-24]
### Technical Details
- Base application generated with Create React App
- Parsing classes for VTL grammar generated with Antlr4
- Monaco editor connected with Antlr4 parsing classes for VTL syntax validation