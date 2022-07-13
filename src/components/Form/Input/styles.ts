import { TextInput } from 'react-native';
import styled, { css } from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';

export type TypeProps = 'primary' | 'secondary';

type Props = {
  type: TypeProps;
}

export const Label = styled.Text <Props>`
  font-size: ${RFValue(14)}px;
  ${({ theme, type }) => css`
    font-family: ${theme.fonts.regular};
    color: ${type === 'primary' ? theme.colors.title : theme.colors.shape};
  `};
`;

export const Container = styled(TextInput).attrs<Props>(({ theme, type }) => ({
  placeholderTextColor: theme.colors.title
})) <Props>`
  width: 100%;
  height: 56px;
  padding: 7px 0;
  padding-left: 20px;
  margin-top: 10px;
  font-size: ${RFValue(14)}px;
  ${({ theme, type }) => css`
  font-family: ${theme.fonts.regular};
  border: 1px solid ${theme.colors.shape};
  color: ${type === 'primary' ? theme.colors.title : theme.colors.title};
  `};
  background-color: ${({ theme }) => theme.colors.shape};
`;