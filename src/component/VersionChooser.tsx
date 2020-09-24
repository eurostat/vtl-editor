import Form from "react-bootstrap/Form";
import React from "react";


const VersionChooser = () => {
    return (
        <div className="version-container">
            <span style={{float: "left"}}>Language version:</span>
            <Form.Control className="select-version" as="select">
                <option>1.0</option>
                <option>1.1</option>
                <option>2.0</option>
            </Form.Control>
        </div>
    );
};


export default VersionChooser;