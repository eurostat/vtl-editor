import React, {MutableRefObject, useEffect, useRef} from "react";
import {Motion, spring} from "react-motion";
import "./contextMenu.scss";
import useContextMenu from "./useContextMenu";
import {hasMenu} from "./nodeType";

type ContextMenuProps = {
    menu: any,
    node?: any,
    domElementRef: MutableRefObject<any>
}

const ContextMenu = ({menu, node, domElementRef}: ContextMenuProps) => {
    const {xPos, yPos, showMenu} = useContextMenu({domElementRef});
    const menuRef = useRef(null);
    const menuYPos = useRef<number>(0);

    useEffect(() => {
        if (menuRef.current) {
            // @ts-ignore
            const menuHeight = menuRef?.current?.scrollHeight;
            const documentHeight = document.body.getBoundingClientRect().height;
            menuYPos.current = (yPos + menuHeight > documentHeight)
                ? documentHeight - menuHeight
                : yPos;
        }
    })

    return !node || hasMenu(node)
        ? (
            <Motion
                defaultStyle={{opacity: 0}}
                style={{opacity: !showMenu ? spring(0) : spring(1)}}
            >
                {(interpolatedStyle) => (
                    <>
                        {showMenu
                            ? (<div ref={menuRef} className="menu-container"
                                    style={{
                                        top: `${menuYPos.current}px`,
                                        left: `${xPos}px`,
                                        opacity: interpolatedStyle.opacity
                                    }}>
                                {menu}
                            </div>)
                            : (<></>)}
                    </>
                )}
            </Motion>
        )
        : null;
};

export default ContextMenu;