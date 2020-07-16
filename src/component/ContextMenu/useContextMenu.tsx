import React, {MutableRefObject, useCallback, useEffect, useState} from "react";

type useContextMenuProps = {
    domElementRef: MutableRefObject<any>
}

const useContextMenu = ({domElementRef}: useContextMenuProps) => {
    const [xPos, setXPos] = useState("0px");
    const [yPos, setYPos] = useState("0px");
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        console.log(domElementRef);
    })

    const handleContextMenu = useCallback(
        (e) => {
            e.preventDefault();
            setXPos(`${e.layerX}px`);
            setYPos(`${e.layerY}px`);
            setShowMenu(true);
        },
        [setXPos, setYPos]
    );

    const handleClick = useCallback(() => {
        showMenu && setShowMenu(false);
    }, [showMenu]);

    const test = (e: MouseEvent) => {

        showMenu && setShowMenu(false);
        if (e.target === domElementRef.current) {
            setShowMenu(true);
        }
    }

    useEffect(() => {
        document.addEventListener("click", handleClick);
        document.addEventListener("contextmenu", test);
        domElementRef?.current?.addEventListener("contextmenu", handleContextMenu);
        return () => {
            document.removeEventListener("click", handleClick);
            document.removeEventListener("contextmenu", test);
            domElementRef?.current?.removeEventListener("contextmenu", handleContextMenu);
        };
    });

    return {xPos, yPos, showMenu};
};

export default useContextMenu;