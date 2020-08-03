import React from 'react';

import {Ul} from '../common';

type LoadingProps = {
    decorators: any,
    style: any
}

const Loading = ({style, decorators}:LoadingProps) => (
    <Ul style={style.subtree}>
        <li>
            <decorators.Loading style={style.loading}/>
        </li>
    </Ul>
);


export default Loading;
