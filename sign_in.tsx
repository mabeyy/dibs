import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image, Button, Alert, TouchableOpacity, TextInput } from "react-native";
import { useState } from "react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👁️ Password Visibility State

  const handlePress = (message: string) => {
    Alert.alert(message);
  };

  return (
    <View style={styles.container}>
      {/* Logo Image */}
      <Image testID="logo" source={require("./assets/logo.png")} style={styles.logo} />

      {/* Sign-in Text */}
      <Text style={styles.title}>Sign In</Text>
      <Text style={styles.subtitle}>Hi there! Nice to ssee you again.</Text>

      {/* Email Input */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password Input with Show/Hide Feature */}
      <Text style={styles.label}>Password</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Enter your password"
          placeholderTextColor="#888"
          secureTextEntry={!showPassword} // 👁️ Toggles visibility
          autoCapitalize="none"
          autoComplete="password"
          value={password}
          onChangeText={setPassword}
        />
        {/* Toggle Password Visibility Button */}
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
          <Text style={styles.eyeText}>{showPassword ? "𓁹" : "𓁹"}</Text>
        </TouchableOpacity>
      </View>

      {/* Sign In Button */}
      <TouchableOpacity style={styles.button} onPress={() => handlePress('Signing in with ${email}')}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      {/* Additional Actions */}
      <View style={styles.buttonContainer}>
        <Button title="Forgot Password?" onPress={() => handlePress("Forgot Password Clicked!")} color="lightgray" />
        <Button title="Sign Up" onPress={() => handlePress("Sign Up Clicked!")} color="#28A745" />
      </View>

      <StatusBar style="auto" /> 
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 40,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    alignSelf: "flex-start",
    marginLeft: 40,
    marginBottom: 5,
  },
  input: {
    width: "80%",
    height: 50,
    borderBottomWidth: 1, // Only bottom border
    borderBottomColor: "#ccc", // Light gray underline
    paddingHorizontal: 5,
    fontSize: 16,
    marginBottom: 15,
  },
  passwordContainer: {
    width: "80%",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1, // Only bottom border
    borderBottomColor: "#ccc",
    paddingHorizontal: 5,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  eyeButton: {
    padding: 10,
  },
  eyeText: {
    fontSize: 18,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#28A745",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row", // Align buttons in a row
    justifyContent: "space-between", // Distribute space
    width: "80%", // Ensure proper width
    marginTop: 90,
  },
});