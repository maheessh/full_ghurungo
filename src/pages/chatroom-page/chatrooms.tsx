import { useState, useEffect } from "react";
import {
  Paper,
  Title,
  Button,
  TextInput,
  Space,
  Select,
  Card,
  Text,
  Group,
  Container,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";
import { ApiResponse } from "../../constants/types";
import { showNotification } from "@mantine/notifications";
import { createStyles } from "@mantine/emotion";

interface ChatRoomCreateDto {
  name: string;
  eventId: number;
}

interface ChatRoomGetDto extends ChatRoomCreateDto {
  id: number;
  createdAt: string;
}

interface EventDto {
  id: number;
  title: string;
  imageUrl: string;
}

export const ChatRooms = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoomGetDto[]>([]);
  const [newChatRoom, setNewChatRoom] = useState<ChatRoomCreateDto>({
    name: "",
    eventId: 0,
  });
  const [events, setEvents] = useState<EventDto[]>([]);
  const navigate = useNavigate();
  const { classes } = useStyles();

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
      const response = await api.get<ApiResponse<EventDto[]>>("/api/events");
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

  const handleEnterChatRoom = (chatRoomId: number) => {
    navigate(`/chatroom/${chatRoomId}`);
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        padding: "40px",
        backgroundColor: "#11284b",
      }}
    >
      {/* Left Side: Form */}
      <Container size={420} my={40} style={{ flex: 1 }}>
        <Title ta="center" c="white">
          Create a Chat Room
        </Title>
        <Text c="white" size="sm" ta="center" mt={5}>
          Join your favorite chat room and talk about your favorite event.
        </Text>
        <Paper
          withBorder
          shadow="md"
          p={30}
          mt={30}
          radius="md"
          style={{
            backgroundColor: "#1A1B1E",
            color: "white",
          }}
        >
          <TextInput
            label="Chat Room Name"
            placeholder="Enter chat room name"
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
              setNewChatRoom({
                ...newChatRoom,
                eventId: parseInt(value || "0"),
              })
            }
            required
          />
          <Space h="xl" />
          <Button fullWidth onClick={handleCreateChatRoom}>
            Create
          </Button>
        </Paper>
      </Container>

      {/* Divider */}
      <div
        style={{ width: "2px", background: "lightgray", margin: "0 20px" }}
      ></div>

      {/* Right Side: Chat Room Cards */}
      <div
        style={{
          flex: 2,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {chatRooms.length > 0 ? (
          chatRooms.map((room) => {
            const event = events.find((e) => e.id === room.eventId);
            return (
              <Card
                key={room.id}
                className={classes.card}
                style={{
                  backgroundImage: `url(${
                    event?.imageUrl ||
                    "https://d2vrvpw63099lz.cloudfront.net/benefits-of-live-chat/header.png"
                  })`,
                }}
              >
                <div className={classes.overlay}>
                  <Title order={4} className={classes.title}>
                    {room.name}
                  </Title>
                  <Text size="sm" c ="orange">
                    {event?.title || "Unknown Event"}
                  </Text>
                  <Button
                    size="md"
                    variant="filled"
                    color="green"
                    className={classes.button}
                    onClick={() => handleEnterChatRoom(room.id)}
                  >
                    Enter Chat Room
                  </Button>
                </div>
              </Card>
            );
          })
        ) : (
          <Text size="sm" color="dimmed">
            No chat rooms found.
          </Text>
        )}
      </div>
    </div>
  );
};

const useStyles = createStyles((theme) => ({
  card: {
    position: "relative",
    height: "240px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: theme.radius.md,
    overflow: "hidden",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
      transform: "scale(1.05)",
      boxShadow: theme.shadows.md,
      border: `2px solid white`,
    },
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3))",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.md,
    color: theme.white,
  },
  title: {
    fontSize: theme.fontSizes.md,
    fontWeight: 700,
    marginBottom: theme.spacing.xs,
    textAlign: "center",
  },
  button: {
    marginTop: theme.spacing.sm,
  },
}));

export default ChatRooms;
