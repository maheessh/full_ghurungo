import { useState, useEffect } from "react";
import {
  Paper,
  Title,
  Button,
  Modal,
  TextInput,
  Space,
  Table,
  Text,
  Group,
  Select,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import api from "../../config/axios";
import { ApiResponse } from "../../constants/types";
import { useNavigate } from "react-router-dom";

interface ChatRoomCreateDto {
  name: string;
  eventId: number;
}

interface ChatRoomGetDto extends ChatRoomCreateDto {
  id: number;
  createdAt: string;
}

export const ChatRoomsDashboard = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoomGetDto[]>([]);
  const [newChatRoom, setNewChatRoom] = useState<ChatRoomCreateDto>({
    name: "",
    eventId: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [currentChatRoom, setCurrentChatRoom] = useState<ChatRoomGetDto | null>(
    null
  );
  const [events, setEvents] = useState<{ id: number; title: string }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChatRooms();
    fetchEvents();
  }, []);

  const fetchChatRooms = async () => {
    try {
      const response = await api.get<ApiResponse<ChatRoomGetDto[]>>(
        "/api/chatrooms"
      );
      if (response.data.data) {
        setChatRooms(response.data.data);
      } else {
        showNotification({
          message: "Error fetching chat rooms",
          color: "red",
        });
      }
    } catch (error) {
      showNotification({
        message: "Network error while fetching chat rooms",
        color: "red",
      });
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await api.get<
        ApiResponse<{ id: number; title: string }[]>
      >("/api/events");
      if (response.data.data) {
        setEvents(response.data.data);
      } else {
        showNotification({ message: "Error fetching events", color: "red" });
      }
    } catch (error) {
      showNotification({
        message: "Network error while fetching events",
        color: "red",
      });
    }
  };

  const handleCreateChatRoom = async () => {
    if (!newChatRoom.name || newChatRoom.eventId === 0) {
      showNotification({ message: "Please fill out all fields", color: "red" });
      return;
    }

    try {
      const response = await api.post<ApiResponse<ChatRoomGetDto>>(
        "/api/chatrooms",
        newChatRoom
      );
      if (response.data.data) {
        setChatRooms((prev) => [...prev, response.data.data]);
        showNotification({
          message: "Chat room created successfully!",
          color: "green",
        });
        setNewChatRoom({ name: "", eventId: 0 });
        setIsModalOpen(false);
      } else {
        showNotification({ message: "Error creating chat room", color: "red" });
      }
    } catch (error) {
      showNotification({
        message: "Network error while creating chat room",
        color: "red",
      });
    }
  };

  const handleUpdateChatRoom = async () => {
    if (!currentChatRoom) return;

    try {
      const response = await api.put<ApiResponse<ChatRoomGetDto>>(
        `/api/chatrooms/${currentChatRoom.id}`,
        { name: newChatRoom.name }
      );
      if (response.data.data) {
        setChatRooms((prev) =>
          prev.map((room) =>
            room.id === currentChatRoom.id ? response.data.data : room
          )
        );
        showNotification({
          message: "Chat room updated successfully!",
          color: "green",
        });
        setIsUpdateModalOpen(false);
        setCurrentChatRoom(null);
        setNewChatRoom({ name: "", eventId: 0 });
      } else {
        showNotification({ message: "Error updating chat room", color: "red" });
      }
    } catch (error) {
      showNotification({
        message: "Network error while updating chat room",
        color: "red",
      });
    }
  };

  const handleDeleteChatRoom = async (id: number) => {
    try {
      await api.delete<ApiResponse<boolean>>(`/api/chatrooms/${id}`);
      setChatRooms((prev) => prev.filter((room) => room.id !== id));
      showNotification({
        message: "Chat room deleted successfully!",
        color: "green",
      });
    } catch (error) {
      showNotification({
        message: "Network error while deleting chat room",
        color: "red",
      });
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // background: "url(https://images.unsplash.com/photo-1484242857719-4b9144542727?auto=format&fit=crop&w=1280&q=80) no-repeat center center",
        backgroundSize: "cover",
        padding: "20px",
      }}
    >
      <Paper
        style={{
          maxWidth: "500px",
          width: "100%",
          padding: "30px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: "10px",
        }}
      >
        <Title order={2} style={{ color: "darkgreen" }} mb="lg">
          Manage Chat Rooms
        </Title>

        <Button fullWidth onClick={() => setIsModalOpen(true)} mb="lg">
          Create Chat Room
        </Button>

        <Table highlightOnHover>
          <thead style={{ color: "black" }}>
            <tr>
              <th>Name</th>
              <th>Event</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody style={{ color: "black" }}>
            {chatRooms.length > 0 ? (
              chatRooms.map((room) => (
                <tr key={room.id}>
                  <td color="black">{room.name}</td>
                  <td>
                    {events.find((event) => event.id === room.eventId)?.title ||
                      "Unknown"}
                  </td>
                  <td>
                    <Group>
                      <Button
                        size="xs"
                        onClick={() => navigate(`/chatroom/${room.id}`)}
                      >
                        Enter
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          setCurrentChatRoom(room);
                          setNewChatRoom({
                            name: room.name,
                            eventId: room.eventId,
                          });
                          setIsUpdateModalOpen(true);
                        }}
                      >
                        Update
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        color="red"
                        onClick={() => handleDeleteChatRoom(room.id)}
                      >
                        Delete
                      </Button>
                    </Group>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} align="center">
                  <Text>No chat rooms found</Text>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Paper>

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create a Chat Room"
        centered
      >
        <TextInput
          label="Chat Room Name"
          value={newChatRoom.name}
          onChange={(e) =>
            setNewChatRoom({ ...newChatRoom, name: e.currentTarget.value })
          }
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
          value={newChatRoom.eventId ? newChatRoom.eventId.toString() : ""}
          onChange={(value) =>
            setNewChatRoom({ ...newChatRoom, eventId: parseInt(value || "0") })
          }
          required
        />
        <Space h="md" />
        <Button fullWidth onClick={handleCreateChatRoom}>
          Submit
        </Button>
      </Modal>

      <Modal
        opened={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Update Chat Room"
        centered
      >
        <TextInput
          label="Chat Room Name"
          value={newChatRoom.name}
          onChange={(e) =>
            setNewChatRoom({ ...newChatRoom, name: e.currentTarget.value })
          }
          required
        />
        <Space h="md" />
        <Button fullWidth onClick={handleUpdateChatRoom}>
          Update
        </Button>
      </Modal>
    </div>
  );
};

export default ChatRoomsDashboard;
