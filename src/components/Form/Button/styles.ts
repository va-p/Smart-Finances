import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';

export type TypeProps = 'primary' | 'secondary';

type ContainerProps = {
  type: TypeProps;
}

export const Container = styled(RectButton) <ContainerProps>`
  width: 100%;
  align-items: center;
  padding: 18px;
  margin-top: 10px;
  background-color: ${({ theme, type }) => type === 'primary' ? theme.colors.shape : theme.colors.secondary};
  border-radius: 10px;
`;

export const Title = styled.Text <ContainerProps>`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(14)}px;
  color: ${({ theme, type }) => type === 'primary' ? theme.colors.text_dark : theme.colors.shape};
`;

export const Load = styled.ActivityIndicator.attrs<ContainerProps>(({ type, theme }) => ({
  color: type === 'primary' ? theme.colors.secondary : theme.colors.shape
}))``;