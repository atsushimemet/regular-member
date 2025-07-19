import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthContextType, Couple } from '../types';
import { apiClient } from '../utils/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [couple, setCouple] = useState<Couple | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback((): void => {
    setToken(null);
    setCouple(null);
    
    // ローカルストレージから削除
    localStorage.removeItem('token');
    localStorage.removeItem('couple');
  }, []);

  useEffect(() => {
    // 初期化時にローカルストレージからトークンを取得し、検証
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedCouple = localStorage.getItem('couple');

      if (storedToken && storedCouple) {
        try {
          setToken(storedToken);
          
          // トークンの有効性を確認
          const verifyResult = await apiClient.verifyToken();
          if (verifyResult.valid) {
            setCouple(verifyResult.couple);
          } else {
            // 無効なトークンの場合はクリア
            logout();
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [logout]);

  const login = async (coupleId: string, password: string): Promise<void> => {
    try {
      const response = await apiClient.login(coupleId, password);
      
      setToken(response.token);
      setCouple(response.couple);
      
      // ローカルストレージに保存
      localStorage.setItem('token', response.token);
      localStorage.setItem('couple', JSON.stringify(response.couple));
    } catch (error) {
      throw error;
    }
  };

  const register = async (coupleId: string, coupleName: string, password: string): Promise<void> => {
    try {
      const response = await apiClient.register(coupleId, coupleName, password);
      
      setToken(response.token);
      setCouple(response.couple);
      
      // ローカルストレージに保存
      localStorage.setItem('token', response.token);
      localStorage.setItem('couple', JSON.stringify(response.couple));
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    couple,
    token,
    login,
    register,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};