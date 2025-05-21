import { useState, useEffect } from "react";
import {
  Container,
  ScrollArea,
  Text,
  Group,
  Menu,
  ActionIcon,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconDots } from "@tabler/icons-react";
import api from "../../config/axios";
import {
  ApiResponse,
  ChatMessageCreateDto,
  ChatMessageGetDto,
  ChatRoomGetDto,
} from "../../constants/types";
import { useParams } from "react-router-dom";

const ChatRoomDetail = () => {
  const [messages, setMessages] = useState<ChatMessageGetDto[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [editMessage, setEditMessage] = useState<ChatMessageGetDto | null>(
    null
  );
  const [chatRoom, setChatRoom] = useState<ChatRoomGetDto | null>(null);
  const [eventTitle, setEventTitle] = useState<string>("Unknown Event");
  const { chatRoomId } = useParams<{ chatRoomId: string }>();

  useEffect(() => {
    fetchChatRoomDetails();
    fetchMessages();
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, [chatRoomId]);

  const fetchChatRoomDetails = async () => {
    try {
      const response = await api.get<ApiResponse<ChatRoomGetDto>>(
        `/api/chatrooms/${chatRoomId}`
      );
      if (response.data.data) {
        setChatRoom(response.data.data);
        fetchEventName(response.data.data.eventId);
      } else {
        showNotification({
          message: "Error fetching chat room details",
          color: "red",
        });
      }
    } catch (error) {
      showNotification({
        message: "Network error while fetching chat room details",
        color: "red",
      });
      console.error("Error fetching chat room details:", error);
    }
  };

  const fetchEventName = async (eventId: number) => {
    try {
      const response = await api.get<
        ApiResponse<{ id: number; title: string }>
      >(`/api/events/${eventId}`);
      if (response.data.data) {
        setEventTitle(response.data.data.title);
      }
    } catch (error) {
      showNotification({ message: "Error fetching event name", color: "red" });
      console.error("Error fetching event name:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get<ApiResponse<ChatMessageGetDto[]>>(
        `/api/chat-messages?chatRoomId=${chatRoomId}`
      );
      if (response.data.data) {
        setMessages(response.data.data);
      } else {
        showNotification({
          message: "Error fetching chat messages",
          color: "red",
        });
      }
    } catch (error) {
      showNotification({
        message: "Network error while fetching chat messages",
        color: "red",
      });
      console.error("Error fetching chat messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      showNotification({ message: "Please enter a message", color: "red" });
      return;
    }

    if (editMessage) {
      try {
        const response = await api.put<ApiResponse<ChatMessageGetDto>>(
          `/api/chat-messages/${editMessage.id}`,
          { message: newMessage }
        );
        if (response.data.data) {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === editMessage.id
                ? { ...msg, message: newMessage }
                : msg
            )
          );
          setNewMessage("");
          setEditMessage(null);
          showNotification({ message: "Message updated!", color: "green" });
        }
      } catch (error) {
        showNotification({
          message: "Error updating message",
          color: "red",
        });
      }
    } else {
      const messageData: ChatMessageCreateDto = {
        message: newMessage,
        userId: 1,
        chatRoomId: parseInt(chatRoomId || "0", 10),
        createdBy: "UserName",
      };

      try {
        const response = await api.post<ApiResponse<ChatMessageGetDto>>(
          "/api/chat-messages",
          messageData
        );
        if (response.data.data) {
          setMessages((prevMessages) => [...prevMessages, response.data.data]);
          setNewMessage("");
          showNotification({ message: "Message sent!", color: "green" });
        }
      } catch (error) {
        showNotification({
          message: "Error sending message",
          color: "red",
        });
      }
    }
  };

  const handleEditMessage = (msg: ChatMessageGetDto) => {
    setEditMessage(msg);
    setNewMessage(msg.message);
  };

  const handleDeleteMessage = async (msgId: number) => {
    try {
      await api.delete(`/api/chat-messages/${msgId}`);
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== msgId)
      );
      showNotification({ message: "Message deleted!", color: "green" });
    } catch (error) {
      showNotification({
        message: "Error deleting message",
        color: "red",
      });
    }
  };



  return (
    <div
      style={{
        backgroundColor: "#11284b",
        height: "100vh",
        padding: "20px",
      }}
    >
      <Container>
        {chatRoom ? (
          <>
            <Text size="xl" fw={600} c= "white">
              {chatRoom.name}
            </Text>
            <Text size="sm" c= "orange" style={{ marginBottom: "20px" }}>
              {eventTitle}
            </Text>
          </>
        ) : (
          <Text size="lg" fw={500}>
            Loading chat room details...
          </Text>
        )}

        <ScrollArea style={{ height: "60vh", marginBottom: "20px" }}>
          {messages.map((msg) => (
            <Group
              key={msg.id}
              style={{
                justifyContent: "flex-start",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
                  display: "flex",
                  padding: "10px 15px",
                  borderRadius: "20px",
                  position: "relative",
                  color: "#11284b",
                  gap: "10px", 
                  justifyContent: "space-between", 
                  alignItems: "center"
                }}
              >
                <Text style={{ margin: "0", wordBreak: "break-word" }}>
                  <strong>User {msg.userId}:</strong> {msg.message}
                </Text>
                <Menu>
                  <Menu.Target>
                    <ActionIcon
                      style={{
                        position: "relative",
                        right: "auto",
                        cursor: "pointer",
                      }}
                    >
                      <IconDots size={14} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item onClick={() => handleEditMessage(msg)}>Edit</Menu.Item>
                    <Menu.Item color="red" onClick={() => handleDeleteMessage(msg.id)}>Delete</Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </div>
            </Group>
          ))}
        </ScrollArea>
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type="text"
            placeholder="Type your message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.currentTarget.value)}
            style={{
              width: "100%",
              padding: "10px",
              paddingRight: "50px",
              fontSize: "16px",
              boxSizing: "border-box",
              backgroundColor: "white",
              color: "black",
              border: "1px solid #222",
              borderRadius: "4px",
            }}
          />
          <button
            onClick={handleSendMessage}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: "#2196f3",
              color: "white",
              border: "none",
              padding: "5px 10px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
      </Container>
    </div>
  );
};

export default ChatRoomDetail;
