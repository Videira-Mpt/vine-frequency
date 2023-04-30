import { View, Center, VStack, Text, Icon, Image } from "native-base";
import { Fontisto } from '@expo/vector-icons';
import { useAuth } from "../hooks/useAuth";

import { Button } from './../components/Button';
import { ImageBackground, StyleSheet } from 'react-native';

const imageBg = { uri: "https://mahotaservicos.com/wp-content/uploads/2022/11/backgroung-app.png" };

export function SignIn() {
  const { signIn, isUserLoading } = useAuth()

  return (
    <View style={styles.container}  bgColor="purple.500" >

      <ImageBackground source={imageBg} resizeMode="cover" style={styles.image}>
        <VStack space={10} alignItems="center" marginBottom={40} >
          <Image source={{ uri: 'https://mahotaservicos.com/wp-content/uploads/2022/11/logo2.png' }} alt=""
            style={{ width: 300, height: 120 }} />
        </VStack>
        <VStack alignItems="center"  p={7} >
        <Button
          title="ENTRAR COM GOOGLE"
          type="SECONDARY"
          leftIcon={<Icon as={Fontisto} name="google" color="white" size="md" />}
          mt={12}
          onPress={signIn}
          isLoading={isUserLoading}
          _loading={{ _spinner: { color: 'white' } }}
          marginTop={30}
          
        />

        <Text color="white" textAlign="center" mt={4}>
          Não utilizamos nenhuma informação além {'\n'}do seu e-mail para criação de sua conta.
        </Text>
        </VStack>
      </ImageBackground>



    </View >
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    justifyContent: "center"
  },
  text: {
    color: "white",
    fontSize: 42,
    lineHeight: 84,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#000000c0"
  }
});