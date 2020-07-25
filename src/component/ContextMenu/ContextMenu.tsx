import React, {Component, MutableRefObject, useEffect, useRef, useState} from "react";
import useContextMenu from "./useContextMenu";
import {Motion, spring} from "react-motion";
import "./contextMenu.scss";
import {dom} from "@fortawesome/fontawesome-svg-core";

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
            const domBounding = domElementRef.current.getBoundingClientRect();
            const elBottom = domBounding.height + domBounding.top;
            console.log(menuHeight, documentHeight,elBottom);
            console.log(documentHeight - menuHeight - elBottom);
            if (elBottom + menuHeight > documentHeight) {
                setMenuYPos(`${documentHeight - menuHeight}px`);
            } else {
                setMenuYPos(yPos)
            }
        }
        console.log(menuRef)
    })


    return (
        <Motion
            defaultStyle={{opacity: 0}}
            style={{opacity: !showMenu ? spring(0) : spring(1)}}
        >
            {(interpolatedStyle) => (
                <>
                    {showMenu ? (
                        <div
                            ref={menuRef}
                            className="menu-container"
                            style={{
                                top: menuYPos,
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