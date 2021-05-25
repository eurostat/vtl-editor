import {IconDefinition} from "@fortawesome/free-regular-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Tooltip} from "@material-ui/core";
import React, {forwardRef} from "react";
import {Link} from "react-router-dom";

export type ToolItemSettings = {
    title: string,
    key: string,
    className?: string,
    faIcon?: IconDefinition,
    matIcon?: React.ReactElement,
    onClick?: () => void,
    link?: string,
    target?: string,
    rel?: string,
    tooltip?: TooltipSettings
}

export type TooltipSettings = {
    placement?: any,
    arrow?: boolean
}

export type AuthorizedItem = {
    authCheck?: (item: any) => any;
}

export type AuthorizedToolItemSettings = ToolItemSettings & AuthorizedItem;

type ToolItemProps = {
    itemSettings: ToolItemSettings
}

const ToolItem = ({itemSettings}: ToolItemProps) => {
    const {title, className, faIcon, matIcon, onClick, link = "", target, rel, tooltip = {}} = itemSettings;
    const {placement = "right", arrow = true} = tooltip;

    const afterClick = () => {
        if (onClick) onClick();
    };

    return (
        <Tooltip title={title} placement={placement} arrow={arrow}>
            <LinkWrapper link={link} target={target} rel={rel}
                         linkComponent={(props: any, ref: any) => <LinkComponent {...props} ref={ref}/>}
                         afterClick={afterClick} faIcon={faIcon} matIcon={matIcon} className={className}/>
        </Tooltip>
    )
};

const LinkWrapper = forwardRef(function LinkWrapper(props: any, ref: any) {
    const {
        link, linkComponent, target, rel,
        afterClick, faIcon, matIcon, className,
        onBlur, onFocus, onMouseLeave, onMouseOver, onTouchEnd, onTouchStart
    } = props;
    const tooltipProps = {onBlur, onFocus, onMouseLeave, onMouseOver, onTouchEnd, onTouchStart};
    const buttonProps = {className, afterClick, faIcon, matIcon, tooltipProps};
    const children = <ButtonComponent {...buttonProps} ref={!link ? ref : undefined}/>;
    const linkProps = {link, target, rel, children, tooltipProps};
    return link ? linkComponent(linkProps, ref) : children;
});

const LinkComponent = forwardRef(function LinkComponent(props: any, ref: any) {
    const {link, target, rel, children, tooltipProps} = props;
    return (
        <Link ref={ref} to={link} target={target} rel={rel} {...tooltipProps}>{children}</Link>
    );
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
