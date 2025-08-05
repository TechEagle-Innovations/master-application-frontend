import Logo from "@/assets/images/logo.svg";
import Button from "@/components/auth/Button";
import EmailInput from '@/components/auth/EmailInput';
import PasswordInput from '@/components/auth/PasswordInput';
import { Error } from "@/components/Error";
import { ERROR_MESSAGES } from '@/utils/api/config';
import { authService } from '@/utils/api/services/AuthService';
import { useAuth } from '@/utils/auth/AuthContext';
import authNavigation from '@/utils/auth/navigation';
import { useState } from 'react';
import { 
  KeyboardAvoidingView, 
  Platform, 
  Text, 
  TouchableOpacity, 
  View, 
  ScrollView,
  StyleSheet,
  Dimensions 
} from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ApiError {
  message: string;
}

export default function Login() {
  const insets = useSafeAreaInsets();
  const windowHeight = Dimensions.get('window').height;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: authLogin } = useAuth();

  const handleLogin = async () => {
    if (!validateInputs()) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login({ email, password });
      const currlocation=response.user.curLocation;
      response.user.curLocation=response.user.location
      response.user.location=currlocation;
      await authLogin(response);
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateInputs = () => {
    setError(null);
    
    if (!email.trim() || !password.trim()) {
      setError('Please fill all fields');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    return true;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? -insets.bottom : 0}
    >
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContainer, 
          { minHeight: windowHeight - insets.top - insets.bottom }
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Logo width={161} height={41} />
          </View>

          <View style={styles.formContainer}>
            <EmailInput
              label="Email"
              value={email}
              onChangeText={(text: string) => {
                setEmail(text);
                setError(null);
              }}
              placeholder="Enter your email"
            />

            <PasswordInput
              label="Password"
              value={password}
              onChangeText={(text: string) => {
                setPassword(text);
                setError(null);
              }}
              placeholder="Enter your password"
            />

            {error && (
              <View style={styles.errorContainer}>
                <Error error={error} />
              </View>
            )}

            <Button 
              loading={loading} 
              actionFunction={handleLogin} 
              buttonText="Login" 
              buttonTextLoading="Logging in..." 
            />

            <TouchableOpacity
              onPress={authNavigation.goToForgotPassword}
              style={styles.forgotPassword}
            >
              <Text style={styles.forgotPasswordText}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 50, // Extra space at bottom for keyboard
  },
  content: {
    paddingHorizontal: 28,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Dimensions.get('window').height * 0.1, // 10% of screen height
  },
  formContainer: {
    width: '100%',
    gap: 16,
  },
  errorContainer: {
    marginBottom: 8,
  },
  forgotPassword: {
    marginTop: 8,
  },
  forgotPasswordText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#000',
  },
});