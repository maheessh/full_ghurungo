import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  Input,
  Select,
  Group,
  Space,
} from "@mantine/core";
import { useParams } from "react-router-dom";
import { showNotification } from "@mantine/notifications";
import api from "../../config/axios";
import {
  ApiResponse,
  MemberGetDto,
  OrganizationGetDto,
  User,
} from "../../constants/types";

export const MemberDashboard = () => {
  const { organizationId } = useParams<{ organizationId: string }>(); // Get organizationId from URL
  const [members, setMembers] = useState<MemberGetDto[]>([]);
  const [organization, setOrganization] = useState<OrganizationGetDto | null>(
    null
  );
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [editMember, setEditMember] = useState<MemberGetDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (organizationId) {
      fetchOrganization(Number(organizationId));
      fetchMembers(Number(organizationId));
    }
    fetchLoggedInUser();
  }, [organizationId]);

  const fetchLoggedInUser = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
      const response = await api.get<ApiResponse<User>>(`/api/users/${userId}`);
      if (response.data.data) {
        setLoggedInUser(response.data.data);
      }
    } catch (error) {
      showNotification({ message: "Error fetching user data", color: "red" });
    }
  };

  const fetchOrganization = async (id: number) => {
    try {
      const response = await api.get<ApiResponse<OrganizationGetDto>>(
        `/api/organizations/${id}`
      );
      if (response.data.data) {
        setOrganization(response.data.data);
      }
    } catch (error) {
      showNotification({
        message: "Error fetching organization",
        color: "red",
      });
    }
  };

  const fetchMembers = async (id: number) => {
    try {
      const response = await api.get<ApiResponse<MemberGetDto[]>>(
        `/api/member?organizationId=${id}`
      );
      if (response.data.data) {
        setMembers(response.data.data);
      } else {
        setMembers([]); // Clear members if none found
      }
    } catch (error) {
      showNotification({ message: "Error fetching members", color: "red" });
    }
  };

  const handleEditMember = (member: MemberGetDto) => {
    setEditMember(member);
    setIsModalOpen(true);
  };

  const handleUpdateMember = async () => {
    if (!editMember) return;

    try {
      const response = await api.put<ApiResponse<MemberGetDto>>(
        `/api/member/${editMember.id}`,
        editMember
      );
      if (response.data.data) {
        setMembers((prev) =>
          prev.map((m) => (m.id === editMember.id ? response.data.data : m))
        );
        showNotification({
          message: "Member updated successfully!",
          color: "green",
        });
        setIsModalOpen(false);
      } else {
        showNotification({
          message: "Error updating member",
          color: "red",
        });
      }
    } catch (error) {
      showNotification({
        message: "Network error while updating member",
        color: "red",
      });
    }
  };

  const handleDeleteMember = async (memberId: number) => {
    try {
      const response = await api.delete<ApiResponse<boolean>>(
        `/api/member/${memberId}`
      );
      if (response.status === 200) {
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        showNotification({
          message: "Member deleted successfully!",
          color: "green",
        });
      } else {
        showNotification({
          message: "Error deleting member",
          color: "red",
        });
      }
    } catch (error) {
      showNotification({
        message: "Network error while deleting member",
        color: "red",
      });
    }
  };

  return (
    <Container>
      <h2>
        Member Dashboard :{" "}
        {organization?.name || "Unknown Organization"}
      </h2>
      <Table highlightOnHover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.length > 0 ? (
            members.map((member) => (
              <tr key={member.id}>
                <td>{member.name}</td>
                <td>{member.role}</td>
                <td>
                  <Group>
                    <Button
                      size="xs"
                      onClick={() => handleEditMember(member)}
                      color="blue"
                    >
                      Edit
                    </Button>
                    <Button
                      size="xs"
                      onClick={() => handleDeleteMember(member.id)}
                      color="red"
                    >
                      Delete
                    </Button>
                  </Group>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>No members found for this organization.</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Edit Member Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Member"
      >
        {editMember && (
          <>
            <Input
              placeholder="Name"
              value={typeof editMember?.name === "string" ? editMember.name : ""}
              onChange={(e) =>
                setEditMember({ ...editMember, name: e.target.value })
              }
              required
            />
            <Space h="md" />
            <Select
              label="Role"
              data={[
                { value: "member", label: "Member" },
                { value: "admin", label: "Admin" },
              ]}
              value={editMember.role || ""}
              onChange={(value) =>
                setEditMember({
                  ...editMember,
                  role: value || "member",
                })
              }
              required
            />
            <Space h="md" />
            <Button fullWidth onClick={handleUpdateMember}>
              Update
            </Button>
          </>
        )}
      </Modal>
    </Container>
  );
};

export default MemberDashboard;
