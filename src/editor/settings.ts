import "./vtl-editor/vtlEditor.css";

export enum VtlVersion {
    VTL_2_0 = "vtl-2.0",
    VTL_2_1 = "vtl-2.1"
}

export const defaultVtlVersion = VtlVersion.VTL_2_1;

export interface VersionType {
    name: string,
    code: VtlVersion
}

export const themes = [
    {name: "VTL", code: "vtl"},
    {name: "Light", code: "vs"},
    {name: "Dark", code: "vs-dark"},
    {name: "High Contrast Dark", code: "hc-black"},
];

export const defaultTheme = themes[0];

export const languageVersions: VersionType[] = [
    {name: "2.0", code: VtlVersion.VTL_2_0},
    {name: "2.1", code: VtlVersion.VTL_2_1},
];

