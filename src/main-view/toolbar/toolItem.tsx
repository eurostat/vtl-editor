import { IconDefinition } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@material-ui/core";
import React, { forwardRef } from "react";
import { Link } from "react-router-dom";

export type ToolItemSettings = {
    title: string,
    key: string,
    className?: string,
    faIcon?: IconDefinition,
    matIcon?: React.ReactElement,
    onClick?: () => void,
    link?: string
    tooltip?: TooltipSettings
}

export type TooltipSettings = {
    placement?: any,
    arrow?: boolean
}

type ToolItemProps = {
    itemSettings: ToolItemSettings
}

const ToolItem = ({itemSettings}: ToolItemProps) => {
    const {title, className, faIcon, matIcon, onClick, link = "", tooltip = {}} = itemSettings;
    const {placement = "right", arrow = true} = tooltip;

    const afterClick = () => {
        if (onClick) onClick();
    };

    return (
        <Tooltip title={title} placement={placement} arrow={arrow}>
            <LinkWrapper link={link}
                         wrapper={(children: any, ref: any, tooltipProps: any) =>
                             <Link ref={ref} to={link} {...tooltipProps}>{children}</Link>}
                         afterClick={afterClick} faIcon={faIcon} matIcon={matIcon} className={className}/>
        </Tooltip>
    )
};

const LinkWrapper = forwardRef(function LinkWrapper(props: any, ref: any) {
    const {
        link, wrapper, afterClick, faIcon, matIcon, className,
        onBlur, onFocus, onMouseLeave, onMouseOver, onTouchEnd, onTouchStart
    } = props;
    const tooltipProps = {onBlur, onFocus, onMouseLeave, onMouseOver, onTouchEnd, onTouchStart};
    const buttonProps = {className, afterClick, faIcon, matIcon, tooltipProps};
    const children = <ButtonComponent {...buttonProps} ref={!link ? ref : undefined}/>;
    return link ? wrapper(children, ref, tooltipProps) : children;
});

const ButtonComponent = forwardRef(function ButtonComponent(props: any, ref) {
    const {className, afterClick, faIcon, matIcon, tooltipProps} = props;
    return (
        <button ref={ref} className={className} onClick={afterClick} {...tooltipProps} >
            {faIcon !== undefined
                ? <FontAwesomeIcon icon={faIcon}/>
                : matIcon !== undefined
                    ? matIcon
                    : null}
        </button>
    );
});

export default ToolItem;