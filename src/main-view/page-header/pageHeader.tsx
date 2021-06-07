import React from "react";
import "./pageHeader.scss";

type PageHeaderProps = {
    title: string
}

const PageHeader = ({title}: PageHeaderProps) => {
    return (<div className="page-header">
        <h3>{title}</h3>
    </div>)
}

export default PageHeader;