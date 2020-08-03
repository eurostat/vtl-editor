import React from "react";
import docbook from "../documentation/docbook.module.css";
// @ts-ignore
import html from "../../documentation/userManual.html";

const htmlDoc = {__html: html};

const Documentation = () => {
    return (<div dangerouslySetInnerHTML={htmlDoc}/>)
};

export default Documentation;