import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Text,
  Image,
  Button,
  Group,
  Modal,
  Input,
  Select,
  Space,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import api from "../../config/axios";
import {
  ApiResponse,
  OrganizationGetDto,
  MemberCreateDto,
  User,
} from "../../constants/types";
import { createStyles } from "@mantine/emotion";

export const OrgMain = () => {
  const { classes } = useStyles();
  const [organizations, setOrganizations] = useState<OrganizationGetDto[]>([]);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMember, setNewMember] = useState<MemberCreateDto>({
    userId: 0,
    name: "",
    role: "member",
    organizationId: 0,
    joinedAt: new Date(),
    createdAt: new Date(),
  });
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId && !isNaN(parseInt(userId, 10))) {
      fetchLoggedInUser(parseInt(userId, 10));
      setNewMember((prev) => ({ ...prev, userId: parseInt(userId, 10) }));
    }
    fetchOrganizations();
  }, []);

  const fetchLoggedInUser = async (userId: number) => {
    try {
      const response = await api.get<ApiResponse<User>>(`/api/users/${userId}`);
      if (response.data.data) {
        setLoggedInUser(response.data.data);
      }
    } catch (error) {
      showNotification({ message: "Error fetching user data", color: "red" });
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await api.get<ApiResponse<OrganizationGetDto[]>>(
        "/api/organizations"
      );
      if (response.data.data) {
        setOrganizations(response.data.data);
      } else {
        showNotification({
          message: "Error fetching organizations",
          color: "red",
        });
      }
    } catch (error) {
      showNotification({
        message: "Network error while fetching organizations",
        color: "red",
      });
    }
  };

  const handleRegister = async () => {
    if (!newMember.name.trim() || !newMember.organizationId) {
      showNotification({ message: "Please fill out all fields", color: "red" });
      return;
    }

    try {
      const response = await api.post<ApiResponse<MemberCreateDto>>(
        "/api/member",
        newMember
      );
      if (response.data.data) {
        showNotification({
          message: `Successfully registered as a member of ${selectedOrganization}!`,
          color: "green",
        });
        setIsModalOpen(false);
        setNewMember((prev) => ({
          ...prev,
          organizationId: 0,
          name: "",
          role: "member",
        }));
        setSelectedOrganization("");
      } else {
        showNotification({ message: "Error registering as a member", color: "red" });
      }
    } catch (error) {
      showNotification({
        message: "Network error while registering",
        color: "red",
      });
    }
  };

  return (
    <div className={classes.layout}>
      <Container>
        <h2 className={classes.sectionTitle}>Organizations</h2>
        <Group gap="lg" className={classes.orgGroup}>
          {organizations.map((org) => (
            <Card
              key={org.id}
              shadow="sm"
              radius="md"
              withBorder
              style={{
                backgroundColor: "#1A1B1E", // Dark theme
                color: "white",
                border: "1px solid #2C2F33",
                display: "flex",
                flexDirection: "column",
                
              }}
            >
              <Card.Section>
                <Image
                  src={
                    org.logoUrl ||
                    "https://images.collegexpress.com/blog/get-involved-unique-clubs-join-school.jpg"
                  }
                  height={160}
                  alt={org.name}
                />
              </Card.Section>
              <Text fw={500} mt="sm">
                {org.name}
              </Text>
              <Text size="sm" color="dimmed">
                {org.description || "No description available"}
              </Text>
              <Button
                fullWidth
                mt="md"
                variant="light"
                onClick={() => {
                  setIsModalOpen(true);
                  setNewMember((prev) => ({ ...prev, organizationId: org.id }));
                  setSelectedOrganization(org.name);
                }}
              >
                Register as Member
              </Button>
            </Card>
          ))}
        </Group>
      </Container>

      {/* Register Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register to an Organization"
        size="lg"
      >
        <Text size="sm" color="dimmed" mb="xs">
          Organization: <strong>{selectedOrganization}</strong>
        </Text>
        <Input
          placeholder="Enter your name"
          value={newMember.name}
          onChange={(e) =>
            setNewMember({ ...newMember, name: e.target.value })
          }
          required
        />
        <Space h="md" />
        <Select
          label="Select Role"
          placeholder="Choose your role"
          data={[{ value: "member", label: "Member" }]}
          value={newMember.role}
          onChange={(value) =>
            setNewMember({ ...newMember, role: value || "member" })
          }
          required
        />
        <Space h="md" />
        <Button onClick={handleRegister} variant="filled" color="green">
          Submit
        </Button>
      </Modal>
    </div>
  );
};



const useStyles = createStyles((theme) => ({
  layout: {
    backgroundColor: "#11284b",
    display: "flex",
    height: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "left",
    padding: theme.spacing.sm,
    
  },

  orgGroup: {
    display: "flex",
    flexDirection: "row",
    margin: theme.spacing.xl,
    gap: theme.spacing.md,
  },

  sectionTitle: {
    fontSize: "1.8rem",
    fontWeight: 500,
    justifyContent: "center",
    color: theme.white,
    marginLeft: theme.spacing.xl,
    
  },
}));

export default OrgMain;