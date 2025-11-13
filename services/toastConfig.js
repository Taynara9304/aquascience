import { BaseToast, ErrorToast } from 'react-native-toast-message';

export const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#4CAF50', backgroundColor: '#E8F5E9' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 17,
        fontWeight: 'bold',
        color: '#2E7D32'
      }}
      text2Style={{
        fontSize: 15,
        color: '#388E3C'
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#F44336', backgroundColor: '#FFEBEE' }}
      text1Style={{
        fontSize: 17,
        fontWeight: 'bold',
        color: '#D32F2F'
      }}
      text2Style={{
        fontSize: 15,
        color: '#F44336'
      }}
    />
  ),
};