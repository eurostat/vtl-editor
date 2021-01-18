This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Before you start

Take notice that the project is supposed to be run on Weblogic or Tomcat servlet containers.
To make it work it's important to take into an account during the development that proper
routing has to be maintained.

See:
```xml
<configuration>
    <environmentVariables>
        <PUBLIC_URL>${deploy.host}:${deploy.port}/${deploy.path}</PUBLIC_URL>
        <REACT_APP_ROUTER_BASE>/${deploy.path}</REACT_APP_ROUTER_BASE>
    </environmentVariables>
</configuration>
```

This configuration specified the address of web application, incl. the context address which is
project property indicating deploy path.
Specific Maven profiles have to be run, to make the application work on specific environment,
see *profiles* section in *pom.xml*.

If you're going to use *BrowserRouter* in the project remember to act accordingly, i.e.:
```html
<BrowserRouter basename={process.env.REACT_APP_ROUTER_BASE || ''}>
```
Whereas *REACT_APP_ROUTER_BASE* is specified as context path in *pom.xml*.

**Build options are for deployment (production) tests only!**
For regular development use webpack dev server as usual.

## Synchronizing version number between pom.xml and package.json

VRM uses `sync-pom-version-to-package` to keep version number synchronized between `pom.xml` and `package.json` configurations.
Synchronization script is run at post-install stage of the npm lifecycle:

```
"scripts": {
  ...
  "postinstall": "sync-pom-version",
  ...
}
```

To run it explicitly use this command:
```
npm run postinstall
```

> **Warning**: `sync-pom-version-to-package` is incompatible with versioning scheme of XX.YY.ZZ. If this is required synchronization has to be done manually. 

## Available Maven build configurations
The host 

### mvn clean install -Pdev-tomcat
Build for local Tomcat testing, address: http://127.0.0.1:8080/vrm

### mvn clean install -Pdev-weblogic
Build for local WebLogic testing, address: http://127.0.0.1:7001/vrm

### mvn clean install -Pprod-tomcat
Build for local Tomcat testing, address: http://ec.europa.eu:8080/vrm

### mvn clean install -Pprod-weblogic
Build for local WebLogic testing, address: http://ec.europa.eu:7001/vrm

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
