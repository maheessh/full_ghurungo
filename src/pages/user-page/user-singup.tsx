import { useState } from "react";
import { ApiResponse } from "../../constants/types";
import api from "../../config/axios";
import { showNotification } from "@mantine/notifications";
import { Container, Space, Button, TextInput, useStyles } from "@mantine/core";
import { useNavigate } from "react-router-dom"; // Import useNavigate

interface UserCreateDto {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  role?: string;
}

export const UserSignUp = () => {
  const [user, setUser] = useState<UserCreateDto>({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
    role: "User",
  });

  const navigate = useNavigate(); // Initialize useNavigate for navigation

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await api.post<ApiResponse<UserCreateDto>>("/api/users", user);
      if (response.data.hasErrors) {
        showNotification({ message: "Error creating user", color: "red" });
      } else {
        showNotification({ message: "User created successfully!", color: "green" });
        setUser({
          firstName: "",
          lastName: "",
          userName: "",
          email: "",
          password: "",
          role: "User",
        });
        navigate("/home"); // Redirect to the home page after successful sign-up
      }
    } catch (error) {
      console.error("Error creating user:", error);
      showNotification({ message: "Network error while creating user", color: "red" });
    }
  };

  return (
    <Container>
      <header>Sign Up</header>
      <Space h="md" />
      <TextInput
        label="First Name"
        name="firstName"
        value={user.firstName}
        onChange={handleChange}
        required
      />
      <Space h="md" />
      <TextInput
        label="Last Name"
        name="lastName"
        value={user.lastName}
        onChange={handleChange}
        required
      />
      <Space h="md" />
      <TextInput
        label="Username"
        name="userName"
        value={user.userName}
        onChange={handleChange}
        required
      />
      <Space h="md" />
      <TextInput
        label="Email"
        name="email"
        type="email"
        value={user.email}
        onChange={handleChange}
        required
      />
      <Space h="md" />
      <TextInput
        label="Password"
        name="password"
        type="password"
        value={user.password}
        onChange={handleChange}
        required
      />
      <Space h="md" />
      
      <Space h="md" />
      <Button onClick={handleSubmit}>Sign Up</Button>
    </Container>
  );
};
