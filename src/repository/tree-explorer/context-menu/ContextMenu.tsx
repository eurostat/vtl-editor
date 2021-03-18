import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import useContextMenu from "./useContextMenu";
import { Motion, spring } from "react-motion";
import "./contextMenu.scss";

type ContextMenuProps = {
    menu: any,
    domElementRef: MutableRefObject<any>
}

const ContextMenu = ({menu, domElementRef}: ContextMenuProps) => {
    const {xPos, yPos, showMenu} = useContextMenu({domElementRef});
    const [menuYPos, setMenuYPos] = useState(yPos)
    const menuRef = useRef(null);

    useEffect(() => {
        if (menuRef.current) {
            // @ts-ignore
            const menuHeight = menuRef?.current?.scrollHeight;
            const documentHeight = document.body.getBoundingClientRect().height;
            if (yPos + menuHeight > documentHeight) {
                setMenuYPos(documentHeight - menuHeight);
            } else {
                setMenuYPos(yPos)
            }
        }
    }, [yPos])

    return (
        <Motion
            defaultStyle={{opacity: 0}}
            style={{opacity: !showMenu ? spring(0) : spring(1)}}
        >
            {(interpolatedStyle) => (
                <>
                    {showMenu
                        ? (<div ref={menuRef} className="menu-container"
                                style={{top: `${menuYPos}px`, left: `${xPos}px`, opacity: interpolatedStyle.opacity}}>
                            {menu}
                        </div>)
                        : (<></>)}
                </>
            )}
        </Motion>
    );
};

export default ContextMenu;