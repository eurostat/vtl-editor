import React, {MutableRefObject, useCallback, useEffect, useState} from "react";

type useContextMenuProps = {
    domElementRef: MutableRefObject<any>
}

const useContextMenu = ({domElementRef}: useContextMenuProps) => {
    const [xPos, setXPos] = useState("0px");
    const [yPos, setYPos] = useState("0px");
    const [showMenu, setShowMenu] = useState(false);

    const handleContextMenu = useCallback(
        (e) => {
            e.preventDefault();
            setXPos(`${e.clientX}px`);
            setYPos(`${e.clientY}px`);
            setShowMenu(true);
        },
        [setXPos, setYPos]
    );

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