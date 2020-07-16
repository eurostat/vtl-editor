import React, {MutableRefObject} from "react";
import useContextMenu from "./useContextMenu";
import {Motion, spring} from "react-motion";
import "./contextMenu.scss";

type ContextMenuProps = {
    menu: any,
    domElementRef: MutableRefObject<any>
}

const ContextMenu = ({menu,domElementRef}: ContextMenuProps) => {
    const {xPos, yPos, showMenu} = useContextMenu({domElementRef});
    return (
        <Motion
            defaultStyle={{opacity: 0}}
            style={{opacity: !showMenu ? spring(0) : spring(1)}}
        >
            {(interpolatedStyle) => (
                <>
                    {showMenu ? (
                        <div
                            className="menu-container"
                            style={{
                                top: yPos,
                                left: xPos,
                                opacity: interpolatedStyle.opacity,
                            }}
                        >
                            {menu}
                        </div>
                    ) : (
                        <></>
                    )}
                </>
            )}
        </Motion>
    );
};

export default ContextMenu;