import { useState, useEffect } from "react";
import {
  Container,
  TextInput,
  Button,
  Modal,
  Table,
  Group,
  Space,
  Text,
  Textarea,
  Select,
  Divider,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import api from "../../config/axios";
import { ApiResponse } from "../../constants/types";

interface UserGetDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: string;
  userName: string;
  image: string;
  status: string;
  createdAt: string;
}

interface UserCreateDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type?: string;
  userName?: string;
  image?: string;
  status?: string;
  password: string;
}

interface UserUpdateDto extends UserCreateDto {}

export const Users = () => {
  const [users, setUsers] = useState<UserGetDto[]>([]);
  const [newUser, setNewUser] = useState<UserCreateDto>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    type: "user",
    userName: "",
    image: "",
    status: "active",
    password: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get<ApiResponse<UserGetDto[]>>("/api/users");
      setUsers(response.data.data);
    } catch (error) {
      showNotification({ message: "Failed to fetch users", color: "red" });
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await api.post<ApiResponse<UserGetDto>>(
        "/api/users",
        newUser
      );
      setUsers((prev) => [...prev, response.data.data]);
      setIsModalOpen(false);
      resetForm();
      showNotification({ message: "User created successfully", color: "green" });
    } catch (error) {
      showNotification({ message: "Error creating user", color: "red" });
    }
  };

  const handleUpdateUser = async () => {
    if (editingUserId === null) return;
    try {
      const response = await api.put<ApiResponse<boolean>>(
        `/api/users/${editingUserId}`,
        newUser
      );
      if (response.data.data) {
        fetchUsers();
        setIsEditModalOpen(false);
        showNotification({ message: "User updated", color: "green" });
      }
    } catch (error) {
      showNotification({ message: "Error updating user", color: "red" });
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await api.delete<ApiResponse<boolean>>(`/api/users/${id}`);
      setUsers(users.filter((u) => u.id !== id));
      showNotification({ message: "User deleted", color: "green" });
    } catch (error) {
      showNotification({ message: "Error deleting user", color: "red" });
    }
  };

  const openEditModal = (user: UserGetDto) => {
    setNewUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      type: user.type,
      userName: user.userName,
      image: user.image,
      status: user.status,
      password: "", // Do not prefill password
    });
    setEditingUserId(user.id);
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setNewUser({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      type: "user",
      userName: "",
      image: "",
      status: "active",
      password: "",
    });
  };

  return (
    <Container>
      <h1>Manage Users</h1>
      <Button onClick={() => setIsModalOpen(true)} color="blue">
        Create User
      </Button>

      <Modal opened={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create User">
        <TextInput label="First Name" value={newUser.firstName} onChange={(e) => setNewUser({ ...newUser, firstName: e.currentTarget.value })} required />
        <TextInput label="Last Name" value={newUser.lastName} onChange={(e) => setNewUser({ ...newUser, lastName: e.currentTarget.value })} required />
        <TextInput label="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.currentTarget.value })} required />
        <TextInput label="Phone" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.currentTarget.value })} />
        <TextInput label="Username" value={newUser.userName} onChange={(e) => setNewUser({ ...newUser, userName: e.currentTarget.value })} />
        <TextInput label="Password" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.currentTarget.value })} required />
        <TextInput label="Image URL" value={newUser.image} onChange={(e) => setNewUser({ ...newUser, image: e.currentTarget.value })} />
        <Select
          label="Type"
          value={newUser.type}
          onChange={(value) => setNewUser({ ...newUser, type: value || "user" })}
          data={[{ value: "user", label: "User" }, { value: "admin", label: "Admin" }]}
        />
        <Select
          label="Status"
          value={newUser.status}
          onChange={(value) => setNewUser({ ...newUser, status: value || "active" })}
          data={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]}
        />
        <Space h="md" />
        <Button onClick={handleCreateUser} color="green">Submit</Button>
      </Modal>

      <Modal opened={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User">
        <TextInput label="First Name" value={newUser.firstName} onChange={(e) => setNewUser({ ...newUser, firstName: e.currentTarget.value })} required />
        <TextInput label="Last Name" value={newUser.lastName} onChange={(e) => setNewUser({ ...newUser, lastName: e.currentTarget.value })} required />
        <TextInput label="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.currentTarget.value })} required />
        <TextInput label="Phone" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.currentTarget.value })} />
        <TextInput label="Username" value={newUser.userName} onChange={(e) => setNewUser({ ...newUser, userName: e.currentTarget.value })} />
        <TextInput label="New Password" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.currentTarget.value })} />
        <TextInput label="Image URL" value={newUser.image} onChange={(e) => setNewUser({ ...newUser, image: e.currentTarget.value })} />
        <Select
          label="Type"
          value={newUser.type}
          onChange={(value) => setNewUser({ ...newUser, type: value || "user" })}
          data={[{ value: "user", label: "User" }, { value: "admin", label: "Admin" }]}
        />
        <Select
          label="Status"
          value={newUser.status}
          onChange={(value) => setNewUser({ ...newUser, status: value || "active" })}
          data={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]}
        />
        <Space h="md" />
        <Button onClick={handleUpdateUser} color="blue">Update</Button>
      </Modal>

      <Divider my="lg" />
      <Table highlightOnHover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.firstName} {user.lastName}</td>
              <td>{user.email}</td>
              <td>{user.type}</td>
              <td>{user.status}</td>
              <td>
                <Group>
                  <Button color="yellow" onClick={() => openEditModal(user)}>Edit</Button>
                  <Button color="red" onClick={() => handleDeleteUser(user.id)}>Delete</Button>
                </Group>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Users;
