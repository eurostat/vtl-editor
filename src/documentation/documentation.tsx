import React from "react";
import docbook from "./contents/docbook.module.css";
// @ts-ignore
import html from "./contents/userManual.html";

const htmlDoc = {__html: html};

const Documentation = () => {
    return (<div dangerouslySetInnerHTML={htmlDoc}/>)
};

export default Documentation;