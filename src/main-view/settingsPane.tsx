import React from "react";
import {Button, Form} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import {appliedVtlVersion, changeVtlVersion} from "../editor/editorSlice";
import {languageVersions, themes} from "../editor/settings";
import {appliedTheme, changeTheme} from "./viewSlice";
import {useClearEditCredentials, useProvideEditCredentials} from "../edit-client/credentialsService";
import {decisionDialog} from "./decision-dialog/decisionDialog";

export default function SettingsPane() {
    const dispatch = useDispatch();
    const vtlVersion = useSelector(appliedVtlVersion);
    const theme = useSelector((appliedTheme));
    const provideEditCredentials = useProvideEditCredentials();
    const clearEditCredentials = useClearEditCredentials();

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

    async function onChangeEditCredentials() {
        provideEditCredentials();
    }

    async function onClearEditCredentials() {
        try {
            const result = await decisionDialog({
                title: "Warning",
                text: `Do you really want to clear EDIT service credentials?`,
                buttons: [
                    {key: "yes", text: "Yes", color: "primary"},
                    {key: "no", text: "No", color: "secondary"}
                ]
            });
            if (result === "yes") clearEditCredentials();
        } catch {
        }
    }

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
        <Form.Group>
            <div className="group-container">
                <Form.Label>EDIT Service Credentials</Form.Label>
                <Button className="left-button" variant="secondary" onClick={onChangeEditCredentials}>
                    Change
                </Button>
                <Button className="right-button" variant="secondary" onClick={onClearEditCredentials}>
                    Clear
                </Button>
            </div>
        </Form.Group>
    </Form>)
}
