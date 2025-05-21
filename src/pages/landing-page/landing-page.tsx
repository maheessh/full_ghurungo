import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Text,
  Button,
  Image,
  Card,
  Group,
  Badge,
  Rating,
  Title,
  Space,
  Divider,
  Modal,
  Select,
  Input,
  Stack,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconCalendar,
  IconClock,
  IconLocation,
  IconPin,
} from "@tabler/icons-react";
import { createStyles } from "@mantine/emotion";
import { showNotification } from "@mantine/notifications";
import api from "../../config/axios";
import { ApiResponse } from "../../constants/types";
import { useNavigate } from "react-router-dom";
import { FooterLinks } from "../../components/footer/footer";

interface EventGetDto {
  imageUrl: string;
  id: number;
  title: string;
  description: string;
  date: Date | null;
  time: string;
  location: string;
  organizationId: number;
  createdBy: number;
  createdAt: string;
}

interface ReviewGetDto {
  id: number;
  eventId: number;
  rating: number;
  comments: string;
}

interface EventParticipantCreateDto {
  userId: number;
  name: string;
  eventId: number;
  status: string;
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { classes } = useStyles();
  const [events, setEvents] = useState<EventGetDto[]>([]);
  const [reviews, setReviews] = useState<ReviewGetDto[]>([]);
  const [activeCommentIndex, setActiveCommentIndex] = useState<{
    [key: number]: number;
  }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const eventListRef = useRef<HTMLDivElement>(null);
  const [rsvpDetails, setRsvpDetails] = useState<EventParticipantCreateDto>({
    userId: 1, // Assuming a logged-in user with ID 1 for demonstration
    name: "",
    eventId: 0,
    status: "interested",
  });

  useEffect(() => {
    fetchEvents();
    fetchReviews();
  }, []);

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
    }
  };

  const handleRSVP = (eventId: number) => {
    setRsvpDetails((prev) => ({ ...prev, eventId }));
    setIsModalOpen(true);
  };

  const submitRSVP = async () => {
    if (
      !rsvpDetails.name.trim() ||
      !rsvpDetails.eventId ||
      !rsvpDetails.status
    ) {
      showNotification({
        message: "Please fill all the fields.",
        color: "red",
      });
      return;
    }

    try {
      const response = await api.post<ApiResponse<EventParticipantCreateDto>>(
        "/api/event-participants",
        rsvpDetails
      );
      if (response.data.data) {
        showNotification({ message: "RSVP successful!", color: "green" });
        setIsModalOpen(false);
        setRsvpDetails({
          userId: 1,
          name: "",
          eventId: 0,
          status: "interested",
        });
      } else {
        showNotification({ message: "Error RSVPing for event", color: "red" });
      }
    } catch (error) {
      showNotification({
        message: "Network error while RSVPing",
        color: "red",
      });
    }
  };

  const getCommentsForEvent = (eventId: number) => {
    return reviews
      .filter((review) => review.eventId === eventId)
      .map((r) => r.comments);
  };

  const getAverageRating = (eventId: number) => {
    const eventReviews = reviews.filter((review) => review.eventId === eventId);
    if (eventReviews.length === 0) return 0;
    const totalRating = eventReviews.reduce((sum, r) => sum + r.rating, 0);
    return totalRating / eventReviews.length;
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "N/A";
    const eventDate = new Date(date);

    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    };

    return new Intl.DateTimeFormat("en-US", options).format(eventDate);
  };

  const formatTime = (time: string): string => {
    if (!time) return "N/A";
    const timeParts = time.split(":");
    if (timeParts.length >= 2) {
      const hours = parseInt(timeParts[0], 10);
      const minutes = timeParts[1];
      const period = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12; // Handle 0 as 12
      return `${formattedHours}:${minutes} ${period}`; // Formats as "12:30 PM"
    }
    return "N/A";
  };

  const scrollToEventList = () => {
    eventListRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const calculateDaysRemaining = (eventDate: Date | null) => {
    if (!eventDate) return "N/A";
    const today = new Date();
    const eventDay = new Date(eventDate);
    const diffTime = eventDay.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days left` : "Event Passed";
  };

  const handleAddToCalendar = (eventId: number) => {
    window.open(`https://calendar.google.com/calendar/`, "_blank");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCommentIndex((prevIndexes) => {
        const updatedIndexes = { ...prevIndexes };
        events.forEach((event) => {
          const comments = getCommentsForEvent(event.id);
          if (comments.length > 0) {
            updatedIndexes[event.id] = (updatedIndexes[event.id] || 0) + 1;
            if (updatedIndexes[event.id] >= comments.length) {
              updatedIndexes[event.id] = 0;
            }
          }
        });
        return updatedIndexes;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [events, reviews]);

  return (
    <div className={classes.root}>
      <Container size="lg">
        {/* Hero Section */}
        <div className={classes.heroContainer}>
          <div className={classes.heroContent}>
            <Title className={classes.heroTitle}>
              Stay Connected with{" "}
              <Text
                component="span"
                inherit
                variant="gradient"
                gradient={{ from: "pink", to: "yellow" }}
              >
                CampusEvents
              </Text>
            </Title>
            <Text className={classes.heroDescription}>
              Discover upcoming campus events, from workshops and social
              gatherings to key campus announcements.
            </Text>
            <Group className={classes.heroButton}>
              <Button
                size="lg"
                variant="gradient"
                gradient={{ from: "pink", to: "yellow" }}
                onClick={scrollToEventList}
              >
                Explore
              </Button>
              <Button
                size="lg"
                variant="outline"
                color="gray"
                onClick={() => navigate("/orgmember")}
              >
                Join Organization
              </Button>
            </Group>
          </div>
        </div>

        <Space h="xl" />
        <Divider color="grey" my="sm" />

        {/* Event List */}
        <Container className={classes.eventsList} ref={eventListRef}>
          <Text className={classes.sectionTitle}>Upcoming Events</Text>
          <Group
            className={classes.eventsGroup}
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "20px",
              alignItems: "flex-start",
            }}
          >
            {events.length > 0 ? (
              events.map((event) => {
                const comments = getCommentsForEvent(event.id);
                const activeComment =
                  comments.length > 0
                    ? comments[activeCommentIndex[event.id] || 0]
                    : "No comments available";

                function navigateToReview(id: number): void {
                  throw new Error("Function not implemented.");
                }

                return (
                  <Card
                    key={event.id}
                    radius="lg"
                    shadow="lg"
                    padding="md"
                    className={classes.card}
                  >
                    <div className={classes.cardTop}>
                      {/* Calendar Option */}
                      <Tooltip
                        label="Add to calendar"
                        withArrow
                        position="top"
                        color="green"
                      >
                        <ActionIcon
                          color="blue"
                          variant="light"
                          radius="xl"
                          style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            padding: "5px",
                            zIndex: 1,
                          }}
                          onClick={() => handleAddToCalendar(event.id)}
                        >
                          <IconCalendar size={25} />
                        </ActionIcon>
                      </Tooltip>
                      {/* Remaining Days */}
                      <Text
                        size="sm"
                        fw={500}
                        c="dimmed"
                        style={{ position: "absolute", top: 10, left: 10 }}
                      >
                        {calculateDaysRemaining(event.date)}
                      </Text>
                    </div>
                    {/* Image Section */}
                    <Card.Section style={{ marginTop: 25 }}>
                      <Image
                        src={
                          event.imageUrl || "https://via.placeholder.com/400"
                        }
                        alt={event.title}
                        height={170}
                        fit="cover"
                      />
                    </Card.Section>

                    {/* Title and Location */}
                    <Group
                      justify="apart"
                      mt="md"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text fw={700} size="lg" truncate>
                        {event.title}
                      </Text>
                      <Badge
                        size="sm"
                        variant="filled"
                        style={{
                          backgroundColor: "#3A84D8",
                          display: "flex",
                          alignItems: "center",
                          fontWeight: 500,
                          justifyContent: "center",
                        }}
                      >
                        <IconPin
                          size={10}
                          style={{ marginRight: "5px", padding: 0 }}
                        />
                        {event.location || "Location Unknown"}
                      </Badge>
                    </Group>

                    {/* Description */}
                    <Text mt="xs" size="sm" color="dimmed" truncate>
                      {event.description}
                    </Text>

                    {/* Ratings and Comments */}
                    <Group mt="sm" justify="apart">
                      <Rating value={getAverageRating(event.id)} readOnly />
                      <Text size="xs" color="dimmed">
                        (
                        {
                          reviews.filter(
                            (review) => review.eventId === event.id
                          ).length
                        }{" "}
                        reviews)
                      </Text>
                    </Group>
                    <div
                      style={{
                        marginTop: "10px",
                        padding: "10px",
                        backgroundColor: "#242526",
                        borderRadius: "8px",
                        color: "#FFFFFF",
                        fontSize: "0.85rem",
                        textAlign: "center",
                      }}
                    >
                      "{activeComment || "No comments available"}"
                    </div>

                    <Divider
                      style={{
                        marginTop: "10px",
                      }}
                    ></Divider>
                    {/* Date and Time Section */}
                    <Stack mt="md" gap="sm" style={{ alignItems: "center" }}>
                      <Group
                        gap="lg"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        <Group align="center" gap="xs">
                          <IconCalendar size={19} /> {/* Calendar Icon */}
                          <Text size="sm" fw="500">
                            {formatDate(event.date)}
                          </Text>{" "}
                        </Group>

                        <Group align="center" gap="xs">
                          <IconClock size={19} /> {/* Clock Icon */}
                          <Text size="sm" fw="500">
                            {formatTime(event.time)}
                          </Text>{" "}
                        </Group>
                      </Group>
                    </Stack>

                    {/* Buttons */}
                    <Group mt="lg" justify="center" gap="md">
                      {event.date && new Date(event.date) > new Date() ? (
                        <Button
                          radius="md"
                          variant="filled"
                          color="green"
                          onClick={() => handleRSVP(event.id)}
                          style={{
                            flex: 1,
                            textAlign: "center",
                          }}
                        >
                          RSVP
                        </Button>
                      ) : (
                        <Button
                          radius="md"
                          variant="filled"
                          color="orange"
                          onClick={() => navigate("/review")}
                          style={{
                            flex: 1,
                            textAlign: "center",
                          }}
                        >
                          Review
                        </Button>
                      )}
                      <Button
                        radius="md"
                        variant="light"
                        color="blue"
                        onClick={() => {
                          const eventUrl = `${window.location.origin}/events/${event.id}`;
                          navigator.clipboard.writeText(eventUrl); // Copy to clipboard
                          showNotification({
                            message: "Event URL copied to clipboard!",
                            color: "green",
                          });
                        }}
                        style={{
                          flex: 1,
                          textAlign: "center",
                        }}
                      >
                        Share
                      </Button>
                    </Group>
                  </Card>
                );
              })
            ) : (
              <Text color="dimmed">No upcoming events available.</Text>
            )}
          </Group>
        </Container>
      </Container>
      <FooterLinks></FooterLinks>

      {/* RSVP Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`RSVP to ${
          events.find((e) => e.id === rsvpDetails.eventId)?.title || "Event"
        }`}
      >
        <div>
          <Text size="sm" fw={500}>
            Your Name
          </Text>
          <Input
            placeholder="Enter your name"
            value={rsvpDetails.name}
            onChange={(e) =>
              setRsvpDetails({ ...rsvpDetails, name: e.target.value })
            }
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
            value={rsvpDetails.status}
            onChange={(value) =>
              setRsvpDetails({ ...rsvpDetails, status: value || "interested" })
            }
          />
          <Space h="md" />
          <Button onClick={submitRSVP} fullWidth variant="filled" color="green">
            Submit
          </Button>
        </div>
      </Modal>
    </div>
  );
};

const useStyles = createStyles((theme) => ({
  root: {
    backgroundColor: "#11284b",
    padding: 0,
    margin: 0,
    position: "relative",
    overflowX: "hidden",
    backgroundImage:
      "linear-gradient(250deg, rgba(130, 201, 30, 0) 0%, #062343 70%), url(https://events.utk.edu/wp-content/uploads/sites/65/2019/01/eclipse.jpg)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 1,
    },
    "& > *": {
      position: "relative",
      zIndex: 2,
    },
  },

  heroContainer: {
    position: "relative",
    width: "100%",
    height: "90vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  heroContent: {
    textAlign: "center",
    padding: theme.spacing.xl,
    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      padding: theme.spacing.lg,
    },
  },

  heroTitle: {
    fontSize: "3rem",
    fontWeight: 900,
    color: theme.white,
    marginBottom: theme.spacing.md,
    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      fontSize: "2.5rem",
    },
  },
  heroDescription: {
    fontSize: "1.2rem",
    color: theme.colors.gray[3],
    marginBottom: theme.spacing.md,
    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      fontSize: "1rem",
    },
  },
  heroButton: {
    display: "flex",
    gap: theme.spacing.md,
    justifyContent: "center",
  },
  eventsList: {
    marginTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: "1.8rem",
    fontWeight: 500,
    color: theme.white,
    marginBottom: theme.spacing.md,
    textAlign: "left",
  },
  eventsGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing.md,
    justifyContent: "center",
  },
  cardTop: {
    marginTop: theme.spacing.xs,
    padding: 0,
  },
  card: {
    maxWidth: 340,
    width: "100%",
    borderRadius: theme.radius.md,
    backgroundColor: "#1A1B1E",
    color: theme.white,
    border: "1px solid #2C2F33",
    transition: "transform 0.2s ease-in-out",
    "&:hover": {
      transform: "scale(1.02)",
    },
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-closely",
  },
  commentSection: {
    marginTop: "10px",
    padding: theme.spacing.sm,
    backgroundColor: "#242526",
    borderRadius: theme.radius.sm,
    color: theme.white,
    textAlign: "center",
  },
  footer: {
    marginTop: theme.spacing.xl,
    color: theme.colors.gray[3],
    textAlign: "center",
  },
}));

export default LandingPage;
