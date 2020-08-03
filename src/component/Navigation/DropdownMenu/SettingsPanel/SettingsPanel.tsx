import React from "react";
import {Form} from "react-bootstrap";
import {languageVersions, themes, VTL_VERSION} from "../../../../editor/settings";

type SettingsPanelProps = {
    languageVersion: VTL_VERSION,
    setLanguageVersion: (value: VTL_VERSION) => void,
    theme: string,
    setTheme: (value: string) => void
}

const SettingsPanel = ({languageVersion, setLanguageVersion, theme, setTheme}: SettingsPanelProps) => {
    const onChangeVersion = (event: any) => {
        return setLanguageVersion(findElementByName(languageVersions, event.target.value));
    };

    const onChangeTheme = (event: any) => {
        return setTheme(findElementByName(themes, event.target.value));
    };

    const getDefaultLanguageVersion = () => {
        return findElementByCode(languageVersions, languageVersion);
    };

    const getDefaultThemeVersion = () => {
        return findElementByCode(themes, theme);
    };

    const findElementByName = (array: any[], value: string) => {
        return array.find(e => e.name === value).code;
    };
    const findElementByCode = (array: any[], value: string) => {
        return array.find(e => e.code === value).name || "";
    };
    return (<Form>
        <Form.Group controlId="version-select">
            <div className="group-container">
                <Form.Label>VTL Grammar Version</Form.Label>
                <Form.Control as="select" custom onChange={onChangeVersion}
                              defaultValue={getDefaultLanguageVersion()}>
                    {languageVersions.map(v =>
                        <option key={v.name}>{v.name}</option>
                    )}
                </Form.Control>
            </div>
        </Form.Group>
        <Form.Group controlId="theme-select">
            <div className="group-container">
                <Form.Label>Color Theme</Form.Label>
                <Form.Control as="select" custom onChange={onChangeTheme}
                              defaultValue={getDefaultThemeVersion()}>
                    {themes.map(v =>
                        <option key={v.name}>{v.name}</option>
                    )}
                </Form.Control>
            </div>
        </Form.Group>
    </Form>)
}

export default SettingsPanel