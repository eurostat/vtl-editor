import React from "react";


type SidePaneProps = {
    currentElement: any,
    children: any[]
}

const SidePane = ({currentElement, children}: SidePaneProps) => {
    return (
        <div className="nav flex-column nav-pills left-nav settings-nav" aria-orientation="vertical">
            {children.find(child => child.props.title === currentElement)?.props.children || undefined}
        </div>
    )
};


export default SidePane;