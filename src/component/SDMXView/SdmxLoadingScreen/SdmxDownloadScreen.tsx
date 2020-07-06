import {Box, CircularProgress, Typography} from "@material-ui/core";
import React from "react";

type SdmxDownloadScreenProps = {
    codeListProgress: number,
    codeListTotal: number
}
const SdmxDownloadScreen = ({codeListProgress, codeListTotal}: SdmxDownloadScreenProps) => {
    const progress = Math.round(codeListProgress / codeListTotal * 100) || 0;
    return (
        <div className="sdmx-loading-screen">
            <div className="sdmx-loading-content-area">
                <Box>
                    <CircularProgress variant="static" value={progress} size={60}/>
                    <Box
                        top={-45}
                        left={0}
                        bottom={0}
                        right={0}
                        position="absolute"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Typography variant="caption" component="div"
                                    color="textSecondary">{`${progress}%`}</Typography>
                    </Box>
                </Box>
                <p>Downloading code lists...</p>
            </div>
        </div>
    )
}

export default SdmxDownloadScreen;