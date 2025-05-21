import { useState, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Text,
  Space,
  Group,
  Modal,
  Alert,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useParams } from "react-router-dom";
import api from "../../config/axios";
import { ApiResponse, MemberGetDto } from "../../constants/types";
import { IconAlertCircle } from "@tabler/icons-react";

const OrganizationManagement = () => {
  const { id } = useParams<{ id: string }>();
  const [members, setMembers] = useState<MemberGetDto[]>([]);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<{ role: string } | null>(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    open: boolean;
    memberId: number | null;
  }>({ open: false, memberId: null });

  useEffect(() => {
    fetchOrganization();
    fetchMembers();
    fetchLoggedInUser();
  }, []);

  const fetchOrganization = async () => {
    try {
      const response = await api.get<ApiResponse<{ name: string }>>(
        `/api/organizations/${id}`
      );
      if (response.data.data) {
        setOrganizationName(response.data.data.name);
      } else {
        showNotification({ message: "Error fetching organization details", color: "red" });
      }
    } catch (error) {
      console.error("Error fetching organization details:", error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.get<ApiResponse<MemberGetDto[]>>(
        `/api/organizations/${id}/member`
      );
      if (response.data.data) {
        setMembers(response.data.data);
      } else {
        showNotification({ message: "Error fetching members", color: "red" });
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const fetchLoggedInUser = async () => {
    try {
      const response = await api.get<ApiResponse<{ role: string }>>("/api/users/me");
      if (response.data.data) {
        setLoggedInUser(response.data.data);
      } else {
        showNotification({ message: "Error fetching user data", color: "red" });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleApproveMember = async (memberId: number) => {
    try {
      const response = await api.put<ApiResponse<MemberGetDto>>(
        `/api/organization-members/${memberId}/approve`,
        {}
      );
      if (response.data.data) {
        setMembers((prev) =>
          prev.map((member) =>
            member.id === memberId ? { ...member, role: "approved" } : member
          )
        );
        showNotification({ message: "Member approved successfully!", color: "green" });
      } else {
        showNotification({ message: "Error approving member", color: "red" });
      }
    } catch (error) {
      console.error("Error approving member:", error);
    }
  };

  const handleDeleteMember = async (memberId: number) => {
    try {
      const response = await api.delete<ApiResponse<boolean>>(
        `/api/organization-members/${memberId}`
      );
      if (response.status === 200) {
        setMembers((prev) => prev.filter((member) => member.id !== memberId));
        showNotification({ message: "Member deleted successfully!", color: "green" });
        setConfirmDeleteModal({ open: false, memberId: null });
      } else {
        showNotification({ message: "Error deleting member", color: "red" });
      }
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };

  return (
    <Container>
      <h1>Manage Organization: {organizationName}</h1>
      <Space h="md" />
      <Table highlightOnHover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Joined At</th>
            {loggedInUser?.role === "admin" && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {members.length > 0 ? (
            members.map((member) => (
              <tr key={member.id}>
                <td>{member.name}</td>
                <td>{member.role}</td>
                <td>{new Date(member.joinedAt).toLocaleDateString()}</td>
                {loggedInUser?.role === "admin" && (
                  <td>
                    {member.role !== "approved" && (
                      <Button
                        color="green"
                        onClick={() => handleApproveMember(member.id)}
                        size="xs"
                        style={{ marginRight: "8px" }}
                      >
                        Approve
                      </Button>
                    )}
                    <Button
                      color="red"
                      size="xs"
                      onClick={() => setConfirmDeleteModal({ open: true, memberId: member.id })}
                    >
                      Remove
                    </Button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>
                <Alert color="gray" icon={<IconAlertCircle size={16} />}>
                  No members found.
                </Alert>
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Confirm Delete Modal */}
      <Modal
        opened={confirmDeleteModal.open}
        onClose={() => setConfirmDeleteModal({ open: false, memberId: null })}
        title="Confirm Deletion"
      >
        <Text>Are you sure you want to remove this member?</Text>
        <Group mt="md">
          <Button
            color="gray"
            onClick={() => setConfirmDeleteModal({ open: false, memberId: null })}
          >
            Cancel
          </Button>
          <Button color="red" onClick={() => handleDeleteMember(confirmDeleteModal.memberId!)}>
            Confirm
          </Button>
        </Group>
      </Modal>
    </Container>
  );
};

export default OrganizationManagement;
