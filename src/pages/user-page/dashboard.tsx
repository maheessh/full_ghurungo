import {
  Container,
  Grid,
  Card,
  Text,
  Space,
  Select,
  Button,
  Textarea,
  Rating,
  Flex,
  Table,
  Group,
  Modal,
  Alert,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { showNotification } from "@mantine/notifications";
import api from "../../config/axios";
import {
  ApiResponse,
  EventGetDto,
  EventParticipantGetDto,
  ReviewGetDto,
  ReviewCreateUpdateDto,
  EventParticipantCreateDto,
  User,
} from "../../constants/types";
import { IconAlertCircle } from "@tabler/icons-react";
import { createStyles } from "@mantine/emotion";

export const Dashboard = () => {
  const [events, setEvents] = useState<EventGetDto[]>([]);
  const [participants, setParticipants] = useState<EventParticipantGetDto[]>(
    []
  );
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState<string>("");
  const { classes } = useStyles();
  const [reviews, setReviews] = useState<ReviewGetDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentReview, setCurrentReview] = useState<ReviewGetDto | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [participantToUpdate, setParticipantToUpdate] =
    useState<EventParticipantGetDto | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
    fetchReviews();
    fetchParticipants();
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchLoggedInUser(parseInt(userId, 10));
    }
  }, []);

  const fetchLoggedInUser = async (userId: number) => {
    try {
      const response = await api.get<ApiResponse<User>>(`/api/users/${userId}`);
      if (response.data.data) {
        setLoggedInUser(response.data.data);
      }
    } catch (error) {
      showNotification({ message: "Error fetching user data", color: "red" });
      console.error("Error fetching user data:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await api.get<ApiResponse<EventGetDto[]>>("/api/events");
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
      console.error("Error fetching events:", error);
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await api.get<ApiResponse<EventParticipantGetDto[]>>(
        "/api/event-participants"
      );
      if (response.data.data) {
        setParticipants(response.data.data);
      } else {
        showNotification({
          message: "Error fetching participants",
          color: "red",
        });
      }
    } catch (error) {
      showNotification({
        message: "Network error while fetching participants",
        color: "red",
      });
      console.error("Error fetching participants:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get<ApiResponse<ReviewGetDto[]>>(
        "/api/reviews"
      );
      if (response.data.data) {
        setReviews(response.data.data);
      } else {
        showNotification({ message: "Error fetching reviews", color: "red" });
      }
    } catch (error) {
      showNotification({
        message: "Network error while fetching reviews",
        color: "red",
      });
      console.error("Error fetching reviews:", error);
    }
  };

  return (
    <div className={classes.root}>
      <Container className={classes.content}>
        <Text size="xl" fw={700} style={{ marginBottom: "20px" }}>
          Welcome to Dashboard
        </Text>

        <Space h="md" />

        {/* Grid for Cards */}
        <Grid>
          <Grid.Col span={4}>
            <Card
              shadow="sm"
              className={classes.card}
              padding="lg"
              radius="md"
              withBorder
              style={{
                transition: "transform 0.3s",
                cursor: "pointer",
                backgroundColor: "#1A1B1E",
              }}
              onClick={() => navigate("/organization")}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <Text size="lg" fw={600}>
                Manage Organization
              </Text>
              <Space h="md" />
              <Text size="sm" color="dimmed">
                Manage your organization from creating events to handling other
                things.
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={4}>
            <Card
              shadow="sm"
              className={classes.card}
              padding="lg"
              radius="md"
              withBorder
              style={{
                transition: "transform 0.3s",
                cursor: "pointer",
                backgroundColor: "#1A1B1E",
              }}
              onClick={() => navigate("/events")}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <Text size="lg" fw={600}>
                Manage Events
              </Text>
              <Space h="md" />
              <Text size="sm" color="dimmed">
                Register your organization first, and then create events where
                users can engage.
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={4}>
            <Card
              shadow="sm"
              className={classes.card}
              padding="lg"
              radius="md"
              withBorder
              style={{
                transition: "transform 0.3s",
                cursor: "pointer",
                backgroundColor: "#1A1B1E",
              }}
              onClick={() => navigate("/chatdashboard")}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <Text size="lg" fw={600}>
                Manage ChatRoom
              </Text>
              <Space h="md" />
              <Text size="sm" color="dimmed">
                Create a chatroom for the events you will be attending to find
                similar people.
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={4}>
            <Card
              shadow="sm"
              className={classes.card}
              padding="lg"
              radius="md"
              withBorder
              style={{
                transition: "transform 0.3s",
                cursor: "pointer",
                backgroundColor: "#1A1B1E",
              }}
              onClick={() => navigate("/eparticipants")}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <Text size="lg" fw={600}>
                Manage Event RSVP
              </Text>
              <Space h="md" />
              <Text size="sm" color="dimmed">
                Register yourself to your favourite events now! 😉
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={4}>
            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              className={classes.card}
              withBorder
              style={{
                transition: "transform 0.3s",
                cursor: "pointer",
                backgroundColor: "#1A1B1E",
              }}
              onClick={() => navigate("/rdashboard")}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <Text size="lg" fw={600}>
                Manage Reviews
              </Text>
              <Space h="md" />
              <Text size="sm" color="dimmed">
                Edit, update, and reviews, nobody gonna know! ⭐
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        <Space h="xl" />
      </Container>
    </div>
  );
};

const useStyles = createStyles((theme) => ({
  root: {
    backgroundColor: "#11284b",
    position: "relative",
    boxSizing: "border-box",
    overflow: "hidden",
    height: "100vh",
  },
  content: {
    marginTop: theme.spacing.sm,
  },
  card: {
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    "&:hover": {
      transform: "scale(1.05)",
      boxShadow: theme.shadows.md,
      border: `2px solid white`,
    },
  },
}));

export default Dashboard;
