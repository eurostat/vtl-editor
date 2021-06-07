import {ListSubheader, Tooltip} from "@material-ui/core";
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import {Backspace, Edit} from "@material-ui/icons";
import React from 'react';
import "./managementView.scss"

export interface IdentifiedItem {
    id: number | string,
}

export interface ItemListProps<T extends IdentifiedItem> {
    singularTitle: string,
    pluralTitle: string,
    data?: T[],
    setData?: (data: T[]) => void,
    editData?: () => void,
    captionField?: string,
    captionGet?: (item: T) => string,
    dense?: boolean,
}

ItemList.defaultProps = {
    title: "Item List",
    data: [],
    dense: false,
}

export default function ItemList<T extends IdentifiedItem>({
                                                               singularTitle,
                                                               pluralTitle,
                                                               data,
                                                               setData,
                                                               editData,
                                                               captionField,
                                                               captionGet,
                                                               dense
                                                           }: ItemListProps<T>) {

    const removeItem = (item: T) => {
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

    const renderCaption = (item: T) => {
        if (!!captionField) return item[captionField as keyof T];
        if (!!captionGet) return captionGet(item);
        return item;
    }

    const listItem = (item: T) => {
        return (
            <ListItem className="list-item" key={item.id} role={undefined} component={"li"} dense button>
                <ListItemText id={`item-list-label-${item.id}`}
                              primary={renderCaption(item)}/>
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
            <ListItem className="list-item list-item-none" key={"empty"} role={undefined} component="li" dense button>
                <ListItemText id="item-list-label-empty" primary={"None"}/>
            </ListItem>
        );
    }

    const header = () => {
        return (
            <ListSubheader className="item-list-header" id="item-list-header">
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
            <ul className="sub-list">
                {data?.length === 0 ? emptyListItem() : null}
                {data?.map((item) => listItem(item))}
            </ul>
        </List>
    );
}