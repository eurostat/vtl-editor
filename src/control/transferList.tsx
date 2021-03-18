import { ListSubheader } from "@material-ui/core";
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import _ from "lodash";
import React, { useEffect } from 'react';
import { IdentifiedItem } from "./itemList";
import "./managementView.scss";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            margin: 0,
            width: "100%",
        },
        button: {
            margin: theme.spacing(0.5, 0),
        },
    }),
);

function not(a: any[], b: any[]) {
    return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a: any[], b: any[]) {
    return a.filter((value) => b.indexOf(value) !== -1);
}

type TransferListProps<T extends IdentifiedItem> = {
    singularItem: string,
    pluralItem: string,
    selected: T[],
    commitSelected: (list: T[]) => void,
    available: T[],
    captionField?: string,
    captionGet?: (item: T) => string,
}

export default function TransferList<T extends IdentifiedItem>({
                                                                         singularItem,
                                                                         pluralItem,
                                                                         selected,
                                                                         commitSelected,
                                                                         available,
                                                                         captionField,
                                                                         captionGet,
                                                                     }: TransferListProps<T>) {
    const styles = useStyles();
    const [checked, setChecked] = React.useState<any[]>([]);
    const [left, setLeft] = React.useState<any[]>([]);
    const [right, setRight] = React.useState<any[]>([]);

    const leftChecked = intersection(checked, left);
    const rightChecked = intersection(checked, right);

    useEffect(() => {
        setLeft(_.cloneDeep(selected));
        setRight(_.cloneDeep(available));
    }, [selected, available])

    useEffect(() => {
        commitSelected(left);
    }, [left, commitSelected])

    const handleToggle = (value: any) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };

    const moveAllRight = () => {
        setRight(right.concat(left));
        setLeft([]);
    };

    const moveCheckedRight = () => {
        setRight(right.concat(leftChecked));
        setLeft(not(left, leftChecked));
        setChecked(not(checked, leftChecked));
    };

    const moveCheckedLeft = () => {
        setLeft(left.concat(rightChecked));
        setRight(not(right, rightChecked));
        setChecked(not(checked, rightChecked));
    };

    const moveAllLeft = () => {
        setLeft(left.concat(right));
        setRight([]);
    };

    const header = (items: any[], type: string) => {
        return (
            <ListSubheader className="item-list-header" component="div" id="item-list-header">
                <div className="list-title">
                    <span>{items?.length || "0"}</span>
                    <span>{`${type} ${items?.length === 1 ? singularItem : pluralItem}`}</span>
                </div>
            </ListSubheader>
        );
    }

    const renderCaption = (item: T) => {
        if (!!captionField) return item[captionField as keyof T];
        if (!!captionGet) return captionGet(item);
        return item;
    }

    const listItem = (item: T) => {
        const labelId = `transfer-list-label-${item.id}`;
        return (
            <ListItem key={item.id} role="listitem" button
                      onClick={handleToggle(item)}>
                <ListItemIcon>
                    <Checkbox
                        checked={checked.indexOf(item) !== -1}
                        tabIndex={-1}
                        disableRipple={true}
                        inputProps={{'aria-labelledby': labelId}}
                    />
                </ListItemIcon>
                <ListItemText id={labelId} primary={renderCaption(item)}/>
            </ListItem>
        );
    }

    const customList = (items: any[], type: string) => (
        <List className="transfer-list" dense component="div" role="list" subheader={header(items, type)}>
            {items.map((item: T) => listItem(item))}
        </List>
    );

    return (
        <Grid container spacing={2} justify="center" alignItems="center" className={styles.root}>
            <Grid item xs={5}>{customList(left, "Selected")}</Grid>
            <Grid item>
                <Grid container direction="column" alignItems="center">
                    <Button variant="outlined" size="small" className={styles.button}
                            onClick={moveCheckedLeft} disabled={rightChecked.length === 0}
                            aria-label="move selected left">
                        &lt;
                    </Button>
                    <Button variant="outlined" size="small" className={styles.button}
                            onClick={moveAllLeft} disabled={right.length === 0} aria-label="move all left">
                        ≪
                    </Button>
                    <Button variant="outlined" size="small" className={styles.button}
                            onClick={moveCheckedRight} disabled={leftChecked.length === 0}
                            aria-label="move selected right">
                        &gt;
                    </Button>
                    <Button variant="outlined" size="small" className={styles.button}
                            onClick={moveAllRight} disabled={left.length === 0} aria-label="move all right">
                        ≫
                    </Button>
                </Grid>
            </Grid>
            <Grid item xs={5}>{customList(right, "Available")}</Grid>
        </Grid>
    );
}
