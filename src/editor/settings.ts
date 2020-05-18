import './vtlEditor.css';

export enum VTL_VERSION {
    VTL_1_0 = "vtl-1.0",
    VTL_1_1 = "vtl-1.1",
    VTL_2_0 = "vtl-2.0",
    VTL_3_0 = "vtl-3.0"
}

export interface VersionType {
    name: string,
    code: VTL_VERSION
}

export const themes = [
    {name: "VTL", code: "vtl"},
    {name: "Light", code: "vs"},
    {name: "Dark", code: "vs-dark"},
    {name: "High Contrast Dark", code: "hc-black"},
];
export const languageVersions: VersionType[] = [
    {name: "1.0", code: VTL_VERSION.VTL_1_0},
    {name: "1.1", code: VTL_VERSION.VTL_1_1},
    {name: "2.0", code: VTL_VERSION.VTL_2_0},
    {name: "3.0", code: VTL_VERSION.VTL_3_0},
];

