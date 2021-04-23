import React, { MutableRefObject, useCallback, useEffect, useState } from "react";

type useContextMenuProps = {
    domElementRef: MutableRefObject<any>
}

const useContextMenu = ({domElementRef}: useContextMenuProps) => {
    const [xPos, setXPos] = useState(0);
    const [yPos, setYPos] = useState(0);
    const [showMenu, setShowMenu] = useState(false);

    const handleContextMenu = useCallback((e: MouseEvent) => {
        if (!e.defaultPrevented) {
            e.preventDefault();
            setXPos(e.clientX);
            setYPos(e.clientY);
            setShowMenu(true);
        }
    }, [setXPos, setYPos]);

    const handleClick = useCallback((e: MouseEvent) => {
        if (e.defaultPrevented || !showMenu) return;
        showMenu && setShowMenu(false);
    }, [showMenu]);

    const preventHidingContext = (e: MouseEvent) => {
        showMenu && setShowMenu(false);
        if (e.target === domElementRef.current) {
            setShowMenu(true);
        }
    }

    useEffect(() => {
        document.addEventListener("click", handleClick);
        document.addEventListener("contextmenu", preventHidingContext);
        domElementRef?.current?.addEventListener("contextmenu", handleContextMenu);
        return () => {
            document.removeEventListener("click", handleClick);
            document.removeEventListener("contextmenu", preventHidingContext);
            domElementRef?.current?.removeEventListener("contextmenu", handleContextMenu);
        };
    });

    return {xPos, yPos, showMenu};
};

export default useContextMenu;