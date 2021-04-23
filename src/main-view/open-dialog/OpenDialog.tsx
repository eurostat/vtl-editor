import { Dialog } from "@material-ui/core";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { useSnackbar } from "notistack";
import React, { useCallback, useState } from "react";
import { Button } from "react-bootstrap";
import { useDropzone } from 'react-dropzone';
import "./openDialog.scss";

const OpenDialog = ({onClose, onLoad}: any) => {
    const [open] = useState(true);
    const [files, setFiles] = useState([] as any[]);
    const {enqueueSnackbar} = useSnackbar();

    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        if (acceptedFiles.length > 1) {
            enqueueSnackbar("Only one selected file can be loaded.", {
                variant: "warning"
            });
        }
        if (acceptedFiles.length > 0) {
            let acceptedFile = acceptedFiles[0];
            enqueueSnackbar(`Selected file ${acceptedFile.name}.`, {
                variant: "info"
            });
            setFiles([acceptedFile]);
        }
        if (rejectedFiles.length > 0) {
            const rejected = rejectedFiles.map((f: File) => f.name).reduce((n1: string, n2: string) => n1 + ", " + n2);
            enqueueSnackbar(`Rejected files: ${rejected}`, {
                variant: "warning"
            });
        }
    }, []);

    const {getRootProps, getInputProps} = useDropzone({onDrop, accept: ".vtl"});

    const file = files.map((file: File) => (
        <li key={file.name}>
            {file.name}
        </li>
    ));

    const handleClose = () => {
        onClose(false);
    };

    function getFileContents(file: File) {
        return new Promise((resolve, reject) => {
            let contents: any = "";
            const reader = new FileReader();
            reader.onloadend = function(e) {
                if (e != null && e.target != null) {
                    contents = e.target.result;
                }
                resolve(contents)
            };
            reader.onerror = function(e) {
                reject(e)
            };
            reader.readAsText(file);
        })
    }

    const resolveAllFiles = () => {
        return Promise.all(files.map(file => getFileContents(file)));
    };

    const handleAddFiles = async () => {
        if (files.length > 0) {
            resolveAllFiles().then(result => onLoad(result, files[0].name));
            enqueueSnackbar(`File "${files[0].name}" opened successfully.`, {variant: "success"});
            handleClose();
        } else {
            enqueueSnackbar(`Please select the file first.`, {
                variant: "warning"
            });
        }
    };

    return (
        <div>
            <Dialog open={open} onClose={handleClose}
                    disableBackdropClick={true} aria-labelledby="form-dialog-title">
                <div className="dialog-container">
                    <DialogTitle id="form-dialog-title">Open File</DialogTitle>
                    <DialogContent>
                        <div>
                            <section className="">
                                <div {...getRootProps({className: 'dropzone'})}>
                                    <input {...getInputProps()} />
                                    <p>Drag 'n' drop some files here, or click to select files</p>
                                </div>
                                <aside>
                                    <span>Selected file:</span>
                                    <ul>{file}</ul>
                                </aside>
                            </section>
                        </div>
                    </DialogContent>

                    <DialogActions>
                        <button onClick={handleAddFiles} className="btn btn-primary default-button">
                            <span>Open File</span>
                        </button>
                        <Button onClick={handleClose} className="outline-button" color="primary">
                            Cancel
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>

        </div>
    );
};

export default OpenDialog;