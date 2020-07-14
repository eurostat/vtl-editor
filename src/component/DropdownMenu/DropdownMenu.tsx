import React from "react";
import {Form} from "react-bootstrap";
import {languageVersions, themes, VTL_VERSION} from "../../editor/settings";


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