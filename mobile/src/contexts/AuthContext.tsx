import { createContext, ReactNode, useState, useEffect } from "react";
import * as Google from "expo-auth-session/providers/google"
import * as AuthSession from "expo-auth-session"
import * as WebBrowser from "expo-web-browser"
import { api } from '../services/api'

import { GOOGLE_CLIENT_ID } from '@env';

WebBrowser.maybeCompleteAuthSession();

interface UserProps {
    name: string;
    avatarUrl: string;
}

export interface AuthContextDataProps {
    user: UserProps;
    isUserLoading: boolean;
    signIn: () => Promise<void>;
}
export const AuthContext = createContext({} as AuthContextDataProps);

interface AuthProviderProps {
    children: ReactNode;
}
export function AuthContextProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<UserProps>({} as UserProps)
    const [isUserLoading, setIsUserLoading] = useState(false);

    console.log(AuthSession.makeRedirectUri({ useProxy: true }))
    console.log(GOOGLE_CLIENT_ID)
    
    const [request, response, promatAsync] = Google.useAuthRequest({
         clientId: GOOGLE_CLIENT_ID, 
        redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
        scopes: ['profile', 'email']
    })


    async function signIn() {
        try {
            setIsUserLoading(true);
            await promatAsync();

        } catch (error) {
            console.log({ error });
        } finally {
            setIsUserLoading(false)
        }
    }

    async function signInWithGoogle(access_token: string) {
        try {

            setIsUserLoading(true);

            const tokenResponse = await api.post('/users', { access_token })

            api.defaults.headers.common['Authorization'] = `Bearer ${tokenResponse.data.token}`
            console.log(api.defaults.headers.common['Authorization'])
            const userInfoResponse = await api.get('/me');

            setUser(userInfoResponse.data.user)
        } catch (error) {
            console.log({ error });
            throw error;
        } finally {
            setIsUserLoading(false);
        }
    }

    useEffect(() => {
        if (response?.type === "success" && response.authentication?.accessToken) {
            
            signInWithGoogle(response.authentication.accessToken)
        }
    }, [response])

    return (
        <AuthContext.Provider value={{
            signIn,
            isUserLoading,
            user
        }}>
            {children}
        </AuthContext.Provider>
    )
}