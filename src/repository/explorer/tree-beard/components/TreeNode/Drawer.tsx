import React from 'react';
import {VelocityTransitionGroup} from 'velocity-react';

type DrawerProps = {
    restAnimationInfo: any,
    children: any
}

const Drawer = ({restAnimationInfo, children}: DrawerProps) => (
    <VelocityTransitionGroup {...restAnimationInfo}>
        {children}
    </VelocityTransitionGroup>
);

export default Drawer;
