import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import CommonHeader from "../../components/CommonHeader/CommonHeader";
import { API_BASE_URL } from "../../Config/API";

export default function EmailFormPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    if (!name || !email || !subject || !message) {
      Alert.alert("Validation Error", "Please fill all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Validation Error", "Please enter a valid email address");
      return;
    }

    try {
      const response = await fetch(
            `${API_BASE_URL}/customer/inquiry`,
            {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            subject,
            message,
          }),
        }
      );
// console.log("Response:", response)
      const data = await response.text();
      console.log("Data:", data)

      if (response.ok) {
        Alert.alert("Success", "Your inquiry has been sent successfully!");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        Alert.alert("Error", data.message || "Something went wrong");
      }
    } catch (error) {
      Alert.alert("Error", "Unable to connect to the server");
      console.log("API Error:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <CommonHeader title="Contact Us" subtitle="We'd love to hear from you" />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          {/* Name Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Icon name="person" size={16} color="#4b79a1" /> Full Name
            </Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#999"
            />
          </View>

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Icon name="email" size={16} color="#4b79a1" /> Email Address
            </Text>
            <TextInput
              style={styles.input}
              placeholder="john@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>

          {/* Subject Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Icon name="subject" size={16} color="#4b79a1" /> Subject
            </Text>
            <TextInput
              style={styles.input}
              placeholder="What is this regarding?"
              value={subject}
              onChangeText={setSubject}
              placeholderTextColor="#999"
            />
          </View>

          {/* Message Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Icon name="message" size={16} color="#4b79a1" /> Your Message
            </Text>
            <TextInput
              style={[styles.input, styles.messageBox]}
              placeholder="Type your message here..."
              multiline
              numberOfLines={6}
              value={message}
              onChangeText={setMessage}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
            <Text style={styles.charCount}>
              {message.length}/500 characters
            </Text>
          </View>

          {/* Send Button */}
          <TouchableOpacity onPress={handleSend} activeOpacity={0.9}>
            <LinearGradient
              colors={["#4b79a1", "#283e51"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Icon name="send" size={22} color="#fff" />
              <Text style={styles.buttonText}>Send Message</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Note */}
          <View style={styles.noteContainer}>
            <Icon name="info" size={16} color="#666" />
            <Text style={styles.noteText}>
              Your message will open in your default email app
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#283e51",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b79a1",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#e1e5e9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
    color: "#333",
  },
  messageBox: {
    minHeight: 140,
    maxHeight: 200,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 6,
    marginRight: 4,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: "#4b79a1",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
    padding: 12,
    backgroundColor: "#f0f7ff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1e7ff",
  },
  noteText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    fontStyle: "italic",
  },
});
