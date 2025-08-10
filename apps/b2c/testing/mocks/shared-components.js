const React = require('react');
const { Text, TextInput, View, TouchableOpacity } = require('react-native');

module.exports = {
  __esModule: true,
  AuthProvider: ({ children }) => children,
  useAuth: () => ({ session: { user: { id: 'test-user' } }, supabase: { auth: {} } }),
  Button: function Button({ onPress, children, title, accessibilityLabel, ...rest }) {
    return React.createElement(
      TouchableOpacity,
      { onPress, accessibilityRole: 'button', accessibilityLabel, ...rest },
      children || React.createElement(Text, null, title || 'Button')
    );
  },
  Input: function Input(props) {
    const { value = '', onChangeText = () => {}, placeholder = '', label, className = '', inputClassName = '' } = props || {};
    const children = [];
    if (label) {
      children.push(React.createElement(Text, { key: 'label', className: 'mb-1' }, label));
    }
    children.push(
      React.createElement(TextInput, { key: 'input', value, onChangeText, placeholder, className: inputClassName })
    );
    return React.createElement(View, { className }, children);
  },
};


