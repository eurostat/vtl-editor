import {VTL_VERSION} from "../settings";
import {getSuggestions as getSuggestions2_0} from "../../grammar/vtl-2.0/suggestionsV2-0";
import {getSuggestions as getSuggestions3_0} from "../../grammar/vtl-3.0/suggestionsV3-0";


export const getSuggestionsForVersion = (version: VTL_VERSION, range: any) => {
    switch (version) {
        case VTL_VERSION.VTL_1_0:
            return getSuggestions2_0(range);
        case VTL_VERSION.VTL_1_1:
            return getSuggestions2_0(range);
        case VTL_VERSION.VTL_2_0:
            return getSuggestions2_0(range);
        case VTL_VERSION.VTL_3_0:
            return getSuggestions3_0(range);
    }
};

