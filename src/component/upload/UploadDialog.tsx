import React, {useCallback, useState} from "react";
import {useDropzone} from 'react-dropzone';
import {Dialog} from "@material-ui/core";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import "./uploadDialog.scss";
import {useSnackbar} from "notistack";


const UploadDialog = ({onClose, onLoad}: any) => {
    const [open, setOpen] = useState(true);
    const [files, setFiles] = useState([] as any[]);
    const {enqueueSnackbar} = useSnackbar();
    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        if (acceptedFiles.length > 1) {
            enqueueSnackbar("You can only load one file!", {
                variant: "error"
            });

        }
        if (acceptedFiles.length > 0) {
            let acceptedFile = acceptedFiles[0];
            enqueueSnackbar(`File with name ${acceptedFile.name} loaded successfully!`, {
                variant: "success"
            });
            setFiles([acceptedFile]);
        }
        if (rejectedFiles.length > 0) {
            const rejected = rejectedFiles.map((f: File) => f.name).reduce((n1: string, n2: string) => n1 + ", " + n2);
            enqueueSnackbar(`Rejected files: ${rejected}`, {
                variant: "error"
            });
        }

    }, []);
    const {acceptedFiles, getRootProps, getInputProps} = useDropzone({onDrop, accept: ".vtl"});
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
            reader.onloadend = function (e) {
                if (e != null && e.target != null) {
                    contents = e.target.result;
                }
                resolve(contents)
            };
            reader.onerror = function (e) {
                reject(e)
            };
            reader.readAsText(file)
        })
    }

    const resolveAllFiles = () => {
        return Promise.all(files.map(file => getFileContents(file)));
    };

    const handleAddFiles = async () => {
        if(files.length>0) {
            resolveAllFiles().then(result => onLoad(result, files[0].name));
            handleClose();
        }else{
            enqueueSnackbar(`You did not add any file`, {
                variant: "warning"
            });
        }
    };


    return (
        <div>
            <Dialog
                open={open}
                onClose={handleClose}
                disableBackdropClick={true}
                aria-labelledby="form-dialog-title">
                <div className="dialog-container">
                    <DialogTitle id="form-dialog-title">Open File</DialogTitle>
                    <DialogContent>
                        <div>
                            <section className="">
                                <div {...getRootProps({className: 'dropzone'})}>
                                    <input {
                                               ...getInputProps()} />
                                    <p>Drag 'n' drop some files here, or click to select files</p>
                                </div>
                                <aside>
                                    <h5>Selected file:</h5>
                                    <ul>{file}</ul>
                                </aside>
                            </section>
                        </div>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                        <button onClick={handleAddFiles} className="btn btn-primary default-button">
                            <span>Add file</span>
                        </button>
                    </DialogActions>
                </div>
            </Dialog>

        </div>
    );
};

export default UploadDialog;