import { useState, useEffect } from "react";
import {
  Container,
  Text,
  TextInput,
  Textarea,
  Button,
  Modal,
  Space,
  Table,
  Card,
  Group,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import api from "../../config/axios";
import { ApiResponse } from "../../constants/types";
import { useNavigate } from "react-router-dom";

interface OrganizationCreateDto {
  name: string;
  description: string;
  createdBy: string;
  createdAt: Date;
}

interface OrganizationGetDto extends OrganizationCreateDto {
  id: number;
}

export const Organizations = () => {
  const [organizations, setOrganizations] = useState<OrganizationGetDto[]>([]);
  const [newOrganization, setNewOrganization] = useState<OrganizationCreateDto>(
    {
      name: "",
      description: "",
      createdBy: "",
      createdAt: new Date(),
    }
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateCardOpen, setIsUpdateCardOpen] = useState(false);
  const [currentOrganizationId, setCurrentOrganizationId] = useState<
    number | null
  >(null);
  const [currentOrganization, setCurrentOrganization] =
    useState<OrganizationGetDto | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizations();
  }, []);

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
      console.error("Error fetching organizations:", error);
    }
  };

  const handleCreateOrganization = async () => {
    try {
      const response = await api.post<ApiResponse<OrganizationGetDto>>(
        "/api/organizations",
        newOrganization
      );

      if (response.data.data) {
        setOrganizations((prev) => [...prev, response.data.data]);
        showNotification({
          message: "Organization created successfully!",
          color: "green",
        });
        setNewOrganization({
          name: "",
          description: "",
          createdBy: "",
          createdAt: new Date(),
        });
        setIsModalOpen(false);
      } else {
        showNotification({
          message: "Error creating organization",
          color: "red",
        });
      }
    } catch (error) {
      showNotification({
        message: "Network error while creating organization",
        color: "red",
      });
      console.error("Error creating organization:", error);
    }
  };

  const handleUpdateOrganization = async () => {
    if (currentOrganizationId === null) return;

    try {
      const response = await api.put<ApiResponse<OrganizationGetDto>>(
        `/api/organizations/${currentOrganizationId}`,
        newOrganization
      );

      if (response.data.data) {
        setOrganizations((prev) =>
          prev.map((org) =>
            org.id === currentOrganizationId ? response.data.data : org
          )
        );
        showNotification({
          message: "Organization updated successfully!",
          color: "green",
        });
        setIsUpdateCardOpen(false);
        setCurrentOrganizationId(null);
        setCurrentOrganization(null);
      } else {
        showNotification({
          message: "Error updating organization",
          color: "red",
        });
      }
    } catch (error) {
      showNotification({
        message: "Network error while updating organization",
        color: "red",
      });
      console.error("Error updating organization:", error);
    }
  };

  const openUpdateCard = (organization: OrganizationGetDto) => {
    setCurrentOrganization(organization);
    setNewOrganization({
      name: organization.name,
      description: organization.description,
      createdBy: organization.createdBy,
      createdAt: organization.createdAt,
    });
    setCurrentOrganizationId(organization.id);
    setIsUpdateCardOpen(true);
  };

  const handleDeleteOrganization = async (id: number) => {
    try {
      const response = await api.delete<ApiResponse<boolean>>(
        `/api/organizations/${id}`
      );
      if (response.status === 200) {
        setOrganizations((prev) => prev.filter((org) => org.id !== id));
        showNotification({
          message: "Organization deleted successfully!",
          color: "green",
        });
      } else {
        showNotification({
          message: "Error deleting organization",
          color: "red",
        });
      }
    } catch (error) {
      showNotification({
        message: "Network error while deleting organization",
        color: "red",
      });
      console.error("Error deleting organization:", error);
    }
  };

  const handleMangeOraganization = (organizationId: number) => {
    navigate(`/memberdashboard/${organizationId}`);
  };

  return (
    <Container>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", margin: "20px 0" }}>
        Manage Organizations
      </h1>

      <Button
        onClick={() => setIsModalOpen(true)}
        variant="filled"
        color="blue"
      >
        Create Organization
      </Button>

      {/* Create Organization Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create a New Organization"
        size="lg"
      >
        <TextInput
          label="Name"
          value={newOrganization.name}
          onChange={(e) =>
            setNewOrganization({
              ...newOrganization,
              name: e.currentTarget.value,
            })
          }
          required
        />
        <Space h="md" />
        <Textarea
          label="Description"
          value={newOrganization.description}
          onChange={(e) =>
            setNewOrganization({
              ...newOrganization,
              description: e.currentTarget.value,
            })
          }
          required
        />
        <Space h="md" />
        <TextInput
          label="Created By"
          value={newOrganization.createdBy}
          onChange={(e) =>
            setNewOrganization({
              ...newOrganization,
              createdBy: e.currentTarget.value,
            })
          }
          required
        />
        <Space h="md" />
        <Button
          onClick={handleCreateOrganization}
          variant="filled"
          color="green"
        >
          Submit
        </Button>
      </Modal>

      {/* Update Organization Card */}
      {isUpdateCardOpen && currentOrganization && (
        <Card shadow="sm" padding="lg" style={{ marginTop: "20px" }}>
          <Text size="lg" mb="md">
            Update Organization: {currentOrganization.name}
          </Text>
          <Group grow>
            <TextInput
              label="Name"
              value={newOrganization.name}
              onChange={(e) =>
                setNewOrganization({
                  ...newOrganization,
                  name: e.currentTarget.value,
                })
              }
              required
            />
            <Textarea
              label="Description"
              value={newOrganization.description}
              onChange={(e) =>
                setNewOrganization({
                  ...newOrganization,
                  description: e.currentTarget.value,
                })
              }
              required
            />
            <TextInput
              label="Created By"
              value={newOrganization.createdBy}
              onChange={(e) =>
                setNewOrganization({
                  ...newOrganization,
                  createdBy: e.currentTarget.value,
                })
              }
              required
            />
            <Button
              onClick={handleUpdateOrganization}
              variant="filled"
              color="blue"
            >
              Update
            </Button>
            <Button
              onClick={() => setIsUpdateCardOpen(false)}
              variant="outline"
              color="red"
            >
              Cancel
            </Button>
          </Group>
        </Card>
      )}

      <Space h="xl" />

      {/* Display List of Organizations */}
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
        Existing Organizations
      </h2>
      <Table highlightOnHover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Created By</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {organizations.length > 0 ? (
            organizations.map((organization) => (
              <tr key={organization.id}>
                <td>{organization.name}</td>
                <td>{organization.description}</td>
                <td>{organization.createdBy}</td>
                <td>{new Date(organization.createdAt).toLocaleDateString()}</td>
                <td>
                  <Button
                    color="blue"
                    onClick={() => handleMangeOraganization(organization.id)}
                    style={{ marginRight: "8px" }}
                  >
                    Manage
                  </Button>
                  <Button
                    color="yellow"
                    onClick={() => openUpdateCard(organization)}
                    style={{ marginRight: "8px" }}
                  >
                    Update
                  </Button>
                  <Button
                    color="red"
                    onClick={() => handleDeleteOrganization(organization.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>
                <Text>No organizations found.</Text>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default Organizations;
