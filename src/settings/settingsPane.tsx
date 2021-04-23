import React from "react";
import { Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { appliedVtlVersion, changeVtlVersion } from "../editor/editorSlice";
import { languageVersions, themes } from "../editor/settings";
import { appliedTheme, changeTheme } from "../main-view/viewSlice";

const SettingsPane = () => {
    const dispatch = useDispatch();
    const vtlVersion = useSelector(appliedVtlVersion);
    const theme = useSelector((appliedTheme));

    const onChangeVersion = (event: any) => {
        return dispatch(changeVtlVersion(findElementByName(languageVersions, event.target.value)));
    };

    const onChangeTheme = (event: any) => {
        return dispatch(changeTheme(findElementByName(themes, event.target.value)));
    };

    const currentVtlVersion = () => {
        return findElementByCode(languageVersions, vtlVersion);
    };

    const currentTheme = () => {
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
                              defaultValue={currentVtlVersion()}>
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
                              defaultValue={currentTheme()}>
                    {themes.map(v =>
                        <option key={v.name}>{v.name}</option>
                    )}
                </Form.Control>
            </div>
        </Form.Group>
    </Form>)
}

export default SettingsPane