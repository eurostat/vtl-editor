import styled from '@emotion/styled';

// @ts-ignore
export const Div = styled('div', {shouldForwardProp: prop => ['className', 'children'].indexOf(prop) !== -1})((({style}) => style));

// @ts-ignore
export const Ul = styled('ul', {shouldForwardProp: prop => ['className', 'children'].indexOf(prop) !== -1})((({style}) => style));
