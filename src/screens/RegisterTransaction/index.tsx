import React, { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import {
  Container,
  Form,
  Fields,
  TransactionsTypes,
} from './styles';

import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import SelectDropdown from 'react-native-select-dropdown';
import { useFocusEffect } from '@react-navigation/native';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';

import { TransactionTypeButton } from '@components/Form/TransactionTypeButton';
import { CategorySelectButton } from '@components/Form/CategorySelectButton';
import { ControlledInput } from '@components/Form/ControlledInput';
import { CategoryProps } from '@components/CategoryListItem';
import { AccountProps } from '@components/AccountListItem';
import { ModalView } from '@components/ModalView';
import { Button } from '@components/Form/Button';
import { Header } from '@components/Header';
import { Load } from '@components/Load';

import { CategorySelect } from '@screens/CategorySelect';

import { selectUserTenantId } from '@slices/userSlice';

import { COLLECTION_TRANSACTIONS } from '@configs/database';

import api from '@api/api';

import theme from '../../global/styles/theme';

type FormData = {
  description: string;
  amount: string;
}

/* Validation Form - Start */
const schema = Yup.object().shape({
  description: Yup
    .string()
    .required("Descrição é obrigatório"),
  amount: Yup
    .number()
    .typeError("Informe um valor númerico")
    .positive("O valor não pode ser negativo")
    .required("O valor é obrigatório")
});
/* Validation Form - End */

export function RegisterTransaction({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const tenantId = useSelector(selectUserTenantId);
  const [transactionType, setTransactionType] = useState('');
  const [date, setDate] = useState(new Date());
  const [modeDatePicker, setModeDatePicker] = useState('date');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShowDatePicker(false);
    setDate(currentDate);
  };
  const showMode = (currentMode: string) => {
    setShowDatePicker(true);
    setModeDatePicker(currentMode);
  };
  const showDatepicker = () => {
    showMode('date');
  };
  const showTimepicker = () => {
    showMode('time');
  };
  const [accounts, setAccounts] = useState([]);
  const [accountSelected, setAccountSelected] = useState<AccountProps>();
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categorySelected, setCategorySelected] = useState({
    id: '',
    name: 'Categoria'
  } as CategoryProps);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({ resolver: yupResolver(schema) });
  const [buttonIsLoading, setButtonIsLoading] = useState(false);

  async function fetchAccounts() {
    setLoading(true);

    try {
      const { data } = await api.get('account', {
        params: {
          tenant_id: tenantId
        }
      });
      if (!data) {
      } else {
        const accountsFormatted = data
          .map((account: AccountProps) => account.name);
        setAccounts(accountsFormatted);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Contas", "Não foi possível buscar as suas contas. Verifique sua conexão com a internet e tente novamente.");
    }
  };

  function handleTransactionsTypeSelect(type: 'income' | 'outcome' | 'transfer') {
    setTransactionType(type);
  };

  function handleOpenSelectCategoryModal() {
    setCategoryModalOpen(true);
  };

  function handleCloseSelectCategoryModal() {
    setCategoryModalOpen(false);
  };

  async function handleTransactionRegister(form: FormData) {
    setButtonIsLoading(true);

    if (!transactionType)
      return Alert.alert("Cadastro de Transação", "Selecione o tipo da transação", [{
        text: "OK", onPress: () => setButtonIsLoading(false)
      }]);

    if (accountSelected === undefined)
      return Alert.alert("Cadastro de Transação", "Selecione a conta da transação", [{
        text: "OK", onPress: () => setButtonIsLoading(false)
      }]);

    if (categorySelected.id === '')
      return Alert.alert("Cadastro de Transação", "Selecione a categoria da transação", [{
        text: "OK", onPress: () => setButtonIsLoading(false)
      }]);

    try {
      const accountDataResponse = await api.get('single_account', {
        params: {
          tenant_id: tenantId,
          name: accountSelected
        }
      });
      if (accountDataResponse.status !== 200) {
        Alert.alert("Conta", "Não foi possível buscar as suas contas. Verifique sua conexão com a internet e tente novamente.")
      }

      const newTransaction = {
        created_at: date,
        description: form.description,
        amount: form.amount,
        type: transactionType,
        account_id: accountDataResponse.data.id,
        category_id: categorySelected.id,
        tenant_id: tenantId
      }

      const { status } = await api.post('transaction', newTransaction);
      if (status === 200) {
        Alert.alert("Cadastro de Transação", "Transação cadastrada com sucesso!", [{ text: "Cadastrar nova transação" }, { text: "Voltar para a home", onPress: () => navigation.navigate('Timeline') }]);

        reset();
        setTransactionType('')
        setAccountSelected({
          created_at: '',
          id: '',
          name: '',
          currency: '',
          simbol: '',
          amount: 0,
          tenant_id: ''
        });
        setCategorySelected({
          id: '',
          created_at: '',
          name: 'Categoria',
          icon: {
            id: '',
            title: '',
            name: '',
          },
          color: {
            id: '',
            name: '',
            hex: '',
          },
          tenant_id: ''
        });
      };

      const data = await AsyncStorage.getItem(COLLECTION_TRANSACTIONS);
      const currentData = data ? JSON.parse(data) : [];

      const dataFormatted = [
        ...currentData,
        newTransaction
      ];
      await AsyncStorage.setItem(COLLECTION_TRANSACTIONS, JSON.stringify(dataFormatted));

      setButtonIsLoading(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Transação", "Não foi possível cadastrar a transação. Verifique sua conexão com a internet e tente novamente.");
    }
  }

  useEffect(() => {
    fetchAccounts();
    reset();
  }, [])

  useFocusEffect(useCallback(() => {
    fetchAccounts();
  }, []));

  if (loading) {
    return <Load />
  }

  return (
    <Container>
      <Header title='Cadastro de transação' />

      <Form>
        <Fields>
          <ControlledInput
            type='primary'
            placeholder='Descrição'
            autoCapitalize='sentences'
            autoCorrect={false}
            defaultValue=''
            name='description'
            control={control}
            error={errors.description}
          />

          <ControlledInput
            type='primary'
            placeholder='Valor'
            keyboardType='numeric'
            defaultValue=''
            name='amount'
            control={control}
            error={errors.amount}
          />

          <TransactionsTypes>
            <TransactionTypeButton
              type='up'
              title='Entrada'
              onPress={() => handleTransactionsTypeSelect('income')}
              isActive={transactionType === 'income'}
            />
            <TransactionTypeButton
              type='down'
              title='Saída'
              onPress={() => handleTransactionsTypeSelect('outcome')}
              isActive={transactionType === 'outcome'}
            />
          </TransactionsTypes>

          <Button
            type='primary'
            title='Selecione a data'
            onPress={showDatepicker}
          />
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode={modeDatePicker}
              is24Hour={true}
              onChange={onChangeDate}
              display='spinner'
            />
          )}

          <SelectDropdown
            data={accounts}
            onSelect={(selectedItem) => {
              setAccountSelected(selectedItem);
            }}
            buttonTextAfterSelection={(selectedItem) => {
              return selectedItem
            }}
            rowTextForSelection={(item) => {
              return item
            }}
            defaultButtonText="Selecione a conta"
            buttonStyle={{
              width: '100%',
              marginTop: 10,
              marginBottom: 10,
              backgroundColor: theme.colors.shape,
              borderRadius: 10
            }}
          />

          <CategorySelectButton
            title={categorySelected.name}
            icon={categorySelected.icon?.name}
            onPress={handleOpenSelectCategoryModal}
          />
        </Fields>

        <Button
          type='secondary'
          title="Cadastrar transação"
          isLoading={buttonIsLoading}
          onPress={handleSubmit(handleTransactionRegister)}
        />
      </Form>

      <ModalView
        visible={categoryModalOpen}
        closeModal={handleCloseSelectCategoryModal}
        title='Categorias'
      >
        <CategorySelect
          category={categorySelected}
          setCategory={setCategorySelected}
          closeSelectCategory={handleCloseSelectCategoryModal}
        />
      </ModalView>
    </Container>
  );
}