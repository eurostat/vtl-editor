## Version 0.7.0.201016-a
Date: 2020-10-16

### New Features
- Import SDMX feature allows user to import Data Structure Definition from a SDMX registry and use elements from the definition in edited VTL script.
  User can choose one of registries configured in the application to see available DSDs. [VRM-199]
  It is possible to filter list of DSDs by agency name and final status. A detailed preview of specific DSD is available in the list. [VRM-214]
  When user selects desired DSD and confirms import, the DSD contents are downloaded to the application.
  The details of the imported DSD, including codelist contents can be viewed in the bottom pane of the VTL Editor.
  Information about recently used DSD is saved in the browser local storage, and the DSD can be automatically imported again
  when application is reopened. [VRM-218]
  Elements from imported DSD are available in the VTL Editor as suggestions in autocomplete window and are highlighted in the edited code. [VRM-234][VRM-242]
- Repository feature allows user to store edited VTL script in their personal space in the VRM repository. [VRM-245]
  Using the File Explorer available in the Navigation side bar it is possible to create, rename, and delete folders and files.
  Additional information about folder contents, such as dates of creation and last update, or script authors, can be seen in Detailed List for the folder.
  Edited VTL script can be saved in a chosen folder in the repository using Upload File icon in the VTL Editor toolbar. Saved files are listed
  in the File Explorer and can be opened there using context menu option. [VRM-250]
  Each save of the script creates a new version with subsequent number. All previous versions are preserved in the repository.
  Version list can be displayed in File Explorer using Versions view. This view allows to open any version, to restore it as most recent one,
  and to compare contents of two selected versions. [VRM-251]

### Improvements
- New File, Open File and Save File buttons are moved to the toolbar at the top of the VTL Editor. [VRM-250]
- VTL Editor works more smoothly, without delays when user is rapidly entering or removing characters. [VRM-270]
- If user tries to create or open file when current one is unsaved and decides to save edited file on disk, additional prompt is displayed,
  that allows user to abort the create/open operation if save is canceled in the browser download window.
- The non-functional Log out button is removed from the VRM application page header.

### Technical Details
- The VRM frontend application now communicates through REST API with VRM backend application, that relays information from SDMX registries [VRM-131]
  and hosts repository storage for VTL script files. [VRM-211]
- Currently there are three SDMX registries configured in the VRM: Euro SDMX Registry, Global SDMX Registry and Fusion registry 10. [VRM-131]

### Fixes
- Editor contents are no longer selected after opening the application. [VRM-270]
- Fixed typos in "errorlevel", "keys" and "Value" keywords in the autocomplete suggestions. [VRM-267]
- After user changes VTL grammar version in Settings, editor contents are parsed and syntax errors are listed immediately
  instead of only after the first change in the edited VTL script. [VRM-270]
- Version 3.0 of the VTL grammar has number changed to 2.1 as per official numbering.

### Known Issues
- When application is deployed in WebLogic Server 12c, weblogic.servlet.utils.fileupload.Multipart implementation doesn't recognize
  multipart/form-data request correctly, throwing an exception. The multipart/form-data requests are used to upload VTL script file contents
  from VRM frontend to backend application. The issue prevents the VRM backend application from saving VTL script file contents
  in the repository. The error doesn't appear when application is deployed in Tomcat server. [VRM-288]
- Euro SDMX Registry configured in the VRM is currently unavailable, because it requires authentication.

## Version 0.6.0.200710-a
Date: 2020-07-10

### New Features
- Application package now contains complete documentation in PDF format: User Manual, Administrator Guide and Release Notes. [VRM-93][VRM-96]

### Technical Details
- Documentation for the user and administrator of VRM is generated automatically from XML sources at build time using Docbkx Maven plugin.
  Target formats are PDF and in case of User Manual also HTML. [VRM-93][VRM-96]


## Version 0.5.0.200518-a
Date: 2020-05-18

### New Features
- New file icon in the side menu allows to create new file.
- Added tooltips to the menu items and bottom bar. [VRM-22]
- Help icon in the side menu opens a new window with a user manual. [VRM-97]

### Improvements
- If current file has unsaved changes when you create new or open another file, you are prompted to save the current file, discard changes or cancel the action. [VRM-41]
- Error box can now be resized with mouse drag. [VRM-19]
- Keyboard shortcuts for creating new file, saving file, opening new file and opening documentation. [VRM-22]


## Version 0.4.0.200427-a
Date: 2020-04-27

### New Features
- Errors found in the VTL code are listed in the error panel at the bottom of the screen. [VRM-19]
- For specific VTL functions autocomplete feature inserts snippets (whole syntax with related keywords and parentheses) into the edited code. [VRM-17]
- You can select VTL grammar version (2.0 or 3.0) in the settings panel. [VRM-21]

### Improvements
- Editor now supports version 3.0 of VTL grammar. [VRM-21]
- Autocomplete suggestions now contain detailed syntax and short description of keyword or function. [VRM-16]
- Editor remembers its configuration and contents after you close or refresh the page.

### Fixes
- Round and angle brackets are now colorized properly. [VRM-14]
- Brackets pairs are matched properly.

### Technical Details
- Autocomplete items are listed in static source files for each existing grammar providing extra details and help content. [VRM-16]
- For new grammars when there aren't static files autocomplete items are created automatically from grammar file. [VRM-18]
- Editor configuration and contents are preserved in the local storage in the browser.


## Version 0.3.0.200415-a
Date: 2020-04-15

### New Features
- Edited VTL code can be saved in a file on local disk. [VRM-42]
- Text file with VTL code can be loaded from local disk into the editor. [VRM-41]
- Icons in the side menu (on the left) allow to save and open file, and to display settings. [VRM-22]
- Editor has four color schemes to choose from in the settings panel.

### Technical Details
- Added configuration for deployment on WebLogic and Tomcat application servers. [VRM-85][VRM-87]


## Version 0.2.0.200325-a
Date: 2020-03-25

### New Features
- Editor shows autocomplete suggestions for keywords and functions. [VRM-16]

### Improvements
- All VTL code elements are highlighted. [VRM-14]

### Technical Details
- Items for autocomplete feature are loaded from VTL grammar. [VRM-18]
- Keywords and operators for highlighting feature are loaded from VTL grammar. [VRM-15]


## Version 0.1.0.200313-a
Date: 2020-03-13

### New Features
- Integrated Monaco editor allows to edit VTL code. [VRM-68]
- Syntax of entered code is validated against VTL grammar. [VRM-19]
- Basic user interface with top banner and bar and side menu mock. [VRM-22]
- Monaco minimap enabled for easier navigation in the file. [VRM-22]
- Some VTL code elements are highlighted as per their category. [VRM-14]

### Technical Details
- Base application generated with Create React App. [VRM-70]
- Parsing classes for VTL grammar generated with Antlr4. [VRM-21]
- Monaco editor connected with Antlr4 parsing classes for VTL syntax validation. [VRM-19]