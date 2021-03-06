import styled from 'styled-components/native';

import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

type IconProps = {
  icon: string;
}

export const Container = styled(RectButton).attrs({
  activeOpacity: 0.7
})`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 10px;
`;

export const Description = styled.View`
  flex-direction: row;
`;

export const Title = styled.Text`
  margin-right: 10px;
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;  
`;

export const Icon = styled(Ionicons) <IconProps>`
  font-size: ${RFValue(20)}px;
`;

export const IconChevronDown = styled(Ionicons)`
  font-size: ${RFValue(20)}px;
  color: ${({ theme }) => theme.colors.text};
`;