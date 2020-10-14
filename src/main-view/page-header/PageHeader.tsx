import React from "react";

type PageHeaderType = {
    name: string
}
const PageHeader = ({name}: PageHeaderType) => {
    return (<div className="view-name-container">
        <h3>{name}</h3>
    </div>)
}


export default PageHeader;