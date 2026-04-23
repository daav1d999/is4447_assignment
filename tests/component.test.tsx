//adapted from week 12 tutorial

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import FormField from '../components/ui/form-field';

describe('FormField', () => {
  it('renders the label and fires onChangeText', () => {
    const onChangeTextMock = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <FormField label="Name" value="" onChangeText={onChangeTextMock} placeholder="Enter name" />
    );

    expect(getByText('Name')).toBeTruthy();
    expect(getByPlaceholderText('Enter name')).toBeTruthy();

    fireEvent.changeText(getByPlaceholderText('Enter name'), 'Drink Water');
    expect(onChangeTextMock).toHaveBeenCalledWith('Drink Water');
  });
});