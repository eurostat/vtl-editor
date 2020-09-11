import React from "react";


type DropdownMenuProps = {
    currentElement: any,
    children: any[]
}

const DropdownMenu = ({currentElement, children}: DropdownMenuProps) => {
    return (
        <div className="nav flex-column nav-pills left-nav settings-nav" aria-orientation="vertical">
            {children.find(child => child.props.title === currentElement)?.props.children || undefined}
        </div>
    )
};


export default DropdownMenu;