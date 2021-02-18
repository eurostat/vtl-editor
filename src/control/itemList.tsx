import { ListSubheader, Tooltip } from "@material-ui/core";
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import { Backspace, Edit } from "@material-ui/icons";
import React from 'react';
import "./managementView.scss"

export interface ItemListProps {
    singularTitle: string,
    pluralTitle: string,
    data?: any[],
    setData?: (data: any[]) => void,
    editData?: () => void,
    captionField?: string,
    identifierField?: string,
    dense?: boolean,
}

ItemList.defaultProps = {
    title: "Item List",
    data: [],
    dense: false,
}

export default function ItemList({
                                     singularTitle,
                                     pluralTitle,
                                     data,
                                     setData,
                                     editData,
                                     captionField,
                                     identifierField,
                                     dense
                                 }: ItemListProps) {

    const removeItem = (item: any) => {
        if (data && setData) {
            const index = data.indexOf(item);

            if (index !== -1) {
                const newData = [...data];
                newData.splice(index, 1);
                setData(newData);
            }
        }
    }

    const editList = () => {
        if (editData) editData();
    }

    const listItem = (item: any) => {
        return (
            <ListItem className="list-item" key={identifierField ? item[identifierField] : item} role={undefined} dense button>
                <ListItemText id={`item-list-label-${identifierField ? item[identifierField] : item}`}
                              primary={captionField ? item[captionField] : item}/>
                {setData
                    ? <ListItemSecondaryAction>
                        <Tooltip title="Remove" placement="bottom" arrow>
                            <IconButton edge="end" aria-label="delete" onClick={() => removeItem(item)}>
                                <Backspace/>
                            </IconButton>
                        </Tooltip>
                    </ListItemSecondaryAction>
                    : null}
            </ListItem>
        );
    }

    const emptyListItem = () => {
        return (
            <ListItem className="list-item list-item-none" key={"empty"} role={undefined} dense button>
                <ListItemText id="item-list-label-empty" primary={"None"}/>
            </ListItem>
        );
    }

    const header = () => {
        return (
            <ListSubheader className="item-list-header" component="div" id="item-list-header">
                <div className="list-title">
                    <span>{data?.length || "0"}</span>
                    <span>{data?.length === 1 ? singularTitle : pluralTitle}</span>
                    {editData
                        ? <Tooltip title="Edit" placement="bottom" arrow>
                            <IconButton edge="end" aria-label="edit" onClick={() => editList()}>
                                <Edit/>
                            </IconButton>
                        </Tooltip>
                        : null}
                </div>
            </ListSubheader>
        );
    }

    return (
        <List className="item-list" subheader={header()} dense={dense}>
            {data?.length === 0 ? emptyListItem() : null}
            {data?.map((item) => listItem(item))}
        </List>
    );
}