const React = require('react');
const { Text, TextInput, TouchableOpacity, View } = require('react-native');

module.exports = {
  __esModule: true,
  AuthProvider: ({ children }) => children,
  Button: function Button({
    accessibilityLabel,
    children,
    onPress,
    title,
    ...rest
  }) {
    return React.createElement(
      TouchableOpacity,
      { accessibilityLabel, accessibilityRole: 'button', onPress, ...rest },
      children || React.createElement(Text, null, title || 'Button'),
    );
  },
  Input: function Input(props) {
    const {
      className = '',
      inputClassName = '',
      label,
      onChangeText = () => {},
      placeholder = '',
      value = '',
    } = props || {};
    const children = [];
    if (label) {
      children.push(
        React.createElement(Text, { className: 'mb-1', key: 'label' }, label),
      );
    }
    children.push(
      React.createElement(TextInput, {
        className: inputClassName,
        key: 'input',
        onChangeText,
        placeholder,
        value,
      }),
    );
    return React.createElement(View, { className }, children);
  },
  useAuth: () => ({
    session: { user: { id: 'test-user' } },
    supabase: { auth: {} },
  }),
};
