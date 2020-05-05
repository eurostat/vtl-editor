import React from "react";

// @ts-ignore

import html from '../documentation.html';
var htmlDoc = {__html: html};

const Documentation = () => {
    return (<div dangerouslySetInnerHTML={htmlDoc}/>)
};


export default Documentation;