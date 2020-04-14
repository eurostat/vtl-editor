// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import vtl_2_0_txt from 'raw-loader!../../grammar/vtl-2.0/Vtl.g4';
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import vtl_3_0_txt from 'raw-loader!../../grammar/vtl-3.0/Vtl.g4';
import {VTL_VERSION} from "../settings";


export function getGrammarByVersion(version: VTL_VERSION) {
    const {VTL_2_0, VTL_1_1, VTL_1_0, VTL_3_0} = VTL_VERSION;
    switch (version) {
        case VTL_1_0:
            return vtl_2_0_txt;
        case VTL_1_1:
            return vtl_2_0_txt;
        case VTL_2_0:
            return vtl_2_0_txt;
        case VTL_3_0:
            return vtl_3_0_txt;
        default:
            return "";
    }
}


