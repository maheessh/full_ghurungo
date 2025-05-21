import { useState, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  Select,
  Space,
  Text,
  Group,
  Alert,
  Input,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import api from "../../config/axios";
import {
  ApiResponse,
  EventGetDto,
  EventParticipantCreateDto,
  EventParticipantGetDto,
  User,
} from "../../constants/types";
import { IconAlertCircle } from "@tabler/icons-react";

export const EventParticipants = () => {
  const [participants, setParticipants] = useState<EventParticipantGetDto[]>([]);
  const [events, setEvents] = useState<EventGetDto[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const statusLabels: Record<string, string> = {
    interested: "Interested",
    attending: "Attending",
    not_attending: "Not Attending",
  };
  const [newParticipant, setNewParticipant] = useState<EventParticipantCreateDto>({
    userId: 1,
    name: "",
    eventId: 0,
    status: "interested",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState<EventGetDto | null>(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    open: boolean;
    participantId: number | null;
  }>({
    open: false,
    participantId: null,
  });
  const [participantToUpdate, setParticipantToUpdate] = useState<EventParticipantGetDto | null>(
    null
  );

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchLoggedInUser(parseInt(userId, 10));
      setNewParticipant((prev) => ({ ...prev, userId: parseInt(userId, 10) }));
    }
    fetchParticipants();
    fetchEvents();
    fetchUsers();
  }, []);

  const fetchLoggedInUser = async (userId: number) => {
    try {
      const response = await api.get<ApiResponse<User>>(`/api/users/${userId}`);
      if (response.data.data) {
        setLoggedInUser(response.data.data);
        console.log("Logged in user fetched:", response.data.data);
      }
    } catch (error) {
      showNotification({ message: "Error fetching user data", color: "red" });
      console.error("Error fetching user data:", error);
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await api.get<ApiResponse<EventParticipantGetDto[]>>(
        "/api/event-participants"
      );
      if (response.data.data) {
        setParticipants(response.data.data);
        console.log("Participants fetched successfully:", response.data.data);
      } else {
        showNotification({ message: "Error fetching participants", color: "red" });
      }
    } catch (error) {
      showNotification({ message: "Network error while fetching participants", color: "red" });
      console.error("Error fetching participants:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await api.get<ApiResponse<EventGetDto[]>>("/api/events");
      if (response.data.data) {
        setEvents(response.data.data);
        console.log("Events fetched successfully:", response.data.data);
      } else {
        showNotification({ message: "Error fetching events", color: "red" });
      }
    } catch (error) {
      showNotification({ message: "Network error while fetching events", color: "red" });
      console.error("Error fetching events:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get<ApiResponse<User[]>>("/api/users");
      if (response.data.data) {
        setUsers(response.data.data);
        console.log("Users fetched successfully:", response.data.data);
      } else {
        showNotification({ message: "Error fetching users", color: "red" });
      }
    } catch (error) {
      showNotification({ message: "Network error while fetching users", color: "red" });
      console.error("Error fetching users:", error);
    }
  };

  const handleCreateParticipant = async () => {
    console.log("Creating participant with data:", newParticipant);

    if (
      !newParticipant.eventId ||
      newParticipant.status.trim() === "" ||
      newParticipant.name.trim() === ""
    ) {
      showNotification({
        message: "Please enter your name, select an event, and a status",
        color: "red",
      });
      return;
    }

    try {
      const response = await api.post<ApiResponse<EventParticipantGetDto>>(
        "/api/event-participants",
        newParticipant
      );
      if (response.data.data) {
        setParticipants((prev) => [...prev, response.data.data]);
        showNotification({ message: "RSVP successful!", color: "green" });
        setIsModalOpen(false);
        setNewParticipant((prev) => ({
          ...prev,
          eventId: 0,
          name: "",
          status: "interested",
        }));
        console.log("RSVP successful:", response.data.data);
      } else {
        showNotification({ message: "Error RSVPing for event", color: "red" });
      }
    } catch (error) {
      showNotification({ message: "Network error while RSVPing", color: "red" });
      console.error("Error RSVPing for event:", error);
    }
  };



  const handleUpdateParticipant = async () => {
    if (!participantToUpdate) return;

    try {
      const response = await api.put<ApiResponse<EventParticipantGetDto>>(
        `/api/event-participants/${participantToUpdate.id}`,
        {
          name: participantToUpdate.name,
          status: participantToUpdate.status,
          eventId: participantToUpdate.eventId,
        }
      );
      if (response.data.data) {
        setParticipants((prev) =>
          prev.map((participant) =>
            participant.id === participantToUpdate.id ? response.data.data : participant
          )
        );
        showNotification({ message: "Participant updated successfully!", color: "green" });
        setIsUpdateModalOpen(false);
        setParticipantToUpdate(null);
      } else {
        showNotification({ message: "Error updating participant", color: "red" });
      }
    } catch (error) {
      showNotification({ message: "Network error while updating participant", color: "red" });
      console.error("Error updating participant:", error);
    }
  };

  const handleDeleteParticipant = async () => {
    if (confirmDeleteModal.participantId === null) return;

    try {
      const response = await api.delete<ApiResponse<boolean>>(
        `/api/event-participants/${confirmDeleteModal.participantId}`
      );
      if (response.status === 200) {
        setParticipants((prev) =>
          prev.filter(
            (participant) => participant.id !== confirmDeleteModal.participantId
          )
        );
        showNotification({ message: "Participant removed successfully!", color: "green" });
        console.log("Participant removed with ID:", confirmDeleteModal.participantId);
        setConfirmDeleteModal({ open: false, participantId: null });
      } else {
        showNotification({ message: "Error removing participant", color: "red" });
      }
    } catch (error) {
      showNotification({ message: "Network error while removing participant", color: "red" });
      console.error("Error removing participant:", error);
    }
  };

  const handleEventDetails = (eventId: number) => {
    const event = events.find((e) => e.id === eventId);
    if (event) {
      setSelectedEventDetails(event);
    }
  };

  const handleOpenUpdateModal = (participant: EventParticipantGetDto) => {
    setParticipantToUpdate(participant);
    setIsUpdateModalOpen(true);
  };

  return (
    <Container>
      <h2>Event Participants</h2>
      {loggedInUser && (
        <Text>
          Logged in as: <strong>{loggedInUser.username}</strong>
        </Text>
      )}
      <Button onClick={() => setIsModalOpen(true)} variant="filled" color="blue">
        RSVP to Event
      </Button>

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="RSVP to Event"
        size="lg"
      >
        <div>
          <Text size="sm" fw={500} mb={4}>
            Your Name
          </Text>
          <Input
            placeholder="Enter your name"
            value={newParticipant.name}
            onChange={(event) => {
              setNewParticipant({
                ...newParticipant,
                name: event.currentTarget.value,
              });
            }}
            required
          />
        </div>

        <Space h="md" />

        <Select
          label="Event"
          placeholder="Select an event"
          data={events.map((event) => ({
            value: event.id.toString(),
            label: event.title,
          }))}
          value={newParticipant.eventId ? newParticipant.eventId.toString() : ""}
          onChange={(value) => {
            if (value !== null) {
              setNewParticipant({
                ...newParticipant,
                eventId: parseInt(value, 10),
              });
            }
          }}
          required
        />

        <Space h="md" />

        <Select
          label="Status"
          placeholder="Select status"
          data={[
            { value: "interested", label: "Interested" },
            { value: "attending", label: "Attending" },
            { value: "not_attending", label: "Not Attending" },
          ]}
          value={newParticipant.status || ""}
          onChange={(value) => {
            if (value !== null) {
              setNewParticipant({ ...newParticipant, status: value });
            }
          }}
          required
        />

        <Space h="md" />

        <Button onClick={handleCreateParticipant} variant="filled" color="green">
          Submit
        </Button>
      </Modal>

      <Modal
        opened={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Update Participant"
        size="lg"
      >
        {participantToUpdate && (
          <div>
            <Text size="sm" fw={500} mb={4}>
              Your Name
            </Text>
            <Input
              placeholder="Enter your name"
              value={participantToUpdate.name}
              onChange={(event) => {
                setParticipantToUpdate({
                  ...participantToUpdate,
                  name: event.currentTarget.value,
                });
              }}
              required
            />

            <Space h="md" />

            <Select
              label="Event"
              placeholder="Select an event"
              data={events.map((event) => ({
                value: event.id.toString(),
                label: event.title,
              }))}
              value={participantToUpdate.eventId.toString()}
              onChange={(value) => {
                if (value !== null) {
                  setParticipantToUpdate({
                    ...participantToUpdate,
                    eventId: parseInt(value, 10),
                  });
                }
              }}
              required
            />

            <Space h="md" />

            <Select
              label="Status"
              placeholder="Select status"
              data={[
                { value: "interested", label: "Interested" },
                { value: "attending", label: "Attending" },
                { value: "not_attending", label: "Not Attending" },
              ]}
              value={participantToUpdate.status || ""}
              onChange={(value) => {
                if (value !== null) {
                  setParticipantToUpdate({ ...participantToUpdate, status: value });
                }
              }}
              required
            />

            <Space h="md" />

            <Button onClick={handleUpdateParticipant} variant="filled" color="green">
              Update
            </Button>
          </div>
        )}
      </Modal>

      {selectedEventDetails && (
        <Modal
          opened={!!selectedEventDetails}
          onClose={() => setSelectedEventDetails(null)}
          title={selectedEventDetails.title}
        >
          <Text size="sm">{selectedEventDetails.description}</Text>
        </Modal>
      )}

      <Modal
        opened={confirmDeleteModal.open}
        onClose={() => setConfirmDeleteModal({ open: false, participantId: null })}
        title="Confirm Deletion"
      >
        <Text>Are you sure you want to remove this participant?</Text>
        <Group mt="md">
          <Button color="gray" onClick={() => setConfirmDeleteModal({ open: false, participantId: null })}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteParticipant}>
            Confirm
          </Button>
        </Group>
      </Modal>

      <Space h="xl" />

      <Table highlightOnHover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Event</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {participants.length > 0 ? (
            participants.map((participant) => (
              <tr key={participant.id}>
                <td>{participant.name}</td>
                <td>
                  <Button variant="subtle" onClick={() => handleEventDetails(participant.eventId)}>
                    {events.find((event) => event.id === participant.eventId)?.title || "Unknown Event"}
                  </Button>
                </td>
                <td>{statusLabels[participant.status] || "Unknown Status"}</td>
                <td>{new Date(participant.createdAt).toLocaleString()}</td>
                <td>
                  <Group gap="xs">
                    <Button
                      color="blue"
                      onClick={() => handleOpenUpdateModal(participant)}
                      size="xs"
                    >
                      Update
                    </Button>
                    
                    <Button
                      color="red"
                      onClick={() => setConfirmDeleteModal({ open: true, participantId: participant.id })}
                      size="xs"
                    >
                      Remove
                    </Button>
                  </Group>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>
                <Alert color="gray" icon={<IconAlertCircle size={16} />}>
                  No participants found.
                </Alert>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default EventParticipants;