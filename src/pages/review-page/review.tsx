import { useState, useEffect } from "react";
import {
  Container,
  Text,
  Button,
  Modal,
  Textarea,
  Rating,
  Space,
  Card,
  Select,
  Flex,
  Grid,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import api from "../../config/axios";
import {
  ApiResponse,
  ReviewGetDto,
  ReviewCreateUpdateDto,
  EventGetDto,
} from "../../constants/types";
import { createStyles } from "@mantine/emotion";

const Reviews = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentReview, setCurrentReview] = useState<ReviewGetDto | null>(null);
  const [events, setEvents] = useState<EventGetDto[]>([]);
  const [reviews, setReviews] = useState<ReviewGetDto[]>([]);
  const { classes } = useStyles();
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState<string>("");

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
      const response = await api.get<ApiResponse<ReviewGetDto[]>>("/api/reviews");
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

  const handleReviewSubmit = async () => {
    if (!selectedEvent || !rating || !reviewComment.trim()) {
      showNotification({ message: "Please complete all fields", color: "red" });
      return;
    }

    const event = events.find((event) => event.id === selectedEvent);

    if (event && new Date(event.endDate) > new Date()) {
      showNotification({
        message: "You can only review events that have already ended.",
        color: "red",
      });
      return;
    }

    const newReview: ReviewCreateUpdateDto = {
      eventId: selectedEvent,
      rating,
      comments: reviewComment,
    };

    try {
      const response = await api.post<ApiResponse<ReviewGetDto>>("/api/reviews", newReview);
      if (response.data.data) {
        setReviews((prev) => [...prev, response.data.data]);
        showNotification({
          message: "Review submitted successfully!",
          color: "green",
        });
        resetForm();
        setIsModalOpen(false);
      } else {
        showNotification({ message: "Error submitting review", color: "red" });
      }
    } catch (error) {
      showNotification({
        message: "Network error while submitting review",
        color: "red",
      });
    }
  };

  const handleReviewUpdate = async () => {
    if (!currentReview || !reviewComment.trim() || !rating) {
      showNotification({ message: "Please complete all fields", color: "red" });
      return;
    }

    const updatedReview: ReviewCreateUpdateDto = {
      eventId: currentReview.eventId,
      rating,
      comments: reviewComment,
    };

    try {
      const response = await api.put<ApiResponse<ReviewGetDto>>(
        `/api/reviews/${currentReview.id}`,
        updatedReview
      );
      if (response.data.data) {
        setReviews((prev) =>
          prev.map((review) => (review.id === currentReview.id ? response.data.data : review))
        );
        showNotification({ message: "Review updated successfully!", color: "green" });
        resetForm();
        setIsModalOpen(false);
        setIsEditing(false);
      } else {
        showNotification({ message: "Error updating review", color: "red" });
      }
    } catch (error) {
      showNotification({ message: "Network error while updating review", color: "red" });
    }
  };

  const handleReviewDelete = async (id: number) => {
    try {
      const response = await api.delete<ApiResponse<boolean>>(`/api/reviews/${id}`);
      if (response.data.data) {
        setReviews((prev) => prev.filter((review) => review.id !== id));
        showNotification({ message: "Review deleted successfully!", color: "green" });
      } else {
        showNotification({ message: "Error deleting review", color: "red" });
      }
    } catch (error) {
      showNotification({ message: "Network error while deleting review", color: "red" });
    }
  };

  const resetForm = () => {
    setSelectedEvent(null);
    setRating(null);
    setReviewComment("");
    setCurrentReview(null);
  };

  const openEditModal = (review: ReviewGetDto) => {
    setCurrentReview(review);
    setReviewComment(review.comments);
    setRating(review.rating);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  return (
    <div className={classes.root}>
    <Container className={classes.content}>
      <div >
        <Text size="xl" fw={700} style={{ marginBottom: "10px" }} c="white">
          Review Your Experience
        </Text>
        <Space h="md" />
        <Select
          style={{
            background: "#1A1B1E"
          }}
          placeholder="Choose an event to review"
          data={events.map((event) => ({
            value: event.id.toString(),
            label: event.title,
          }))}
          value={selectedEvent ? selectedEvent.toString() : null}
          onChange={(value) => setSelectedEvent(value ? parseInt(value, 10) : null)}
          searchable
          clearable
          maxDropdownHeight={200}
        />
        <Space h="md" />

        {selectedEvent && (
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            
            style={{
              background: "#1A1B1E",
              color: "white",
            }}
          >
            <Text size="lg" fw={500}>
              {events.find((event) => event.id === selectedEvent)?.title}
            </Text>
            <Space h="md" />
            <Text size="sm" fw={500}>
              Rate this event:
            </Text>
            <Rating value={Rating.value} onChange={setRating} size="lg" />
            <Space h="md" />
            <Textarea
              placeholder="Write your review..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.currentTarget.value)}
              minRows={3}
              autosize
            />
            <Space h="md" />
            <Flex justify="flex-end">
              <Button variant="filled" color="blue" onClick={handleReviewSubmit}>
                Submit Review
              </Button>
            </Flex>
          </Card>
        )}
      </div>

      <Space h="xl" />

      <div>
        <Text size="md" fw={500} c= "white" style={{ marginBottom: "10px" }}>
          Submitted Reviews
        </Text>
        <Grid gutter="lg">
          {reviews.map((review) => (
            <Grid.Col span={4} key={review.id}>
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                style={{
              
                    backgroundColor: "#1A1B1E", // Dark theme
                    color: "white",
                    border: "1px solid #2C2F33",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-closely",
                 
                }}
              >
                <Text fw={600}>
                  {events.find((event) => event.id === review.eventId)?.title || "Unknown Event"}
                </Text>
                <Space h="xs" />
                <Rating value={review.rating} readOnly size="sm" />
                <Space h="xs" />
                <Text>{review.comments || "No comments available"}</Text>
                <Space h="md" />
                <Flex justify="flex-end" gap={"10px"}>
                  <Button
                    radius="md"
                    variant="filled"
                    color="green"
                    onClick={() => openEditModal(review)}
                    size="xs"
                    style={{
                      flex: 1,
                      textAlign: "center",
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    color="red"
                    radius="md"
                    onClick={() => handleReviewDelete(review.id)}
                    variant="light"
                    size="xs"
                  >
                    Delete
                  </Button>
                </Flex>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </div>

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Edit Review" : "Create Review"}
      >
        <Textarea
          label="Edit Comment"
          value={reviewComment}
          onChange={(e) => setReviewComment(e.currentTarget.value)}
          minRows={3}
          autosize
        />
        <Space h="md" />
        <Text size="sm" fw={500}>
          Rating
        </Text>
        <Rating value={Rating.value} onChange={setRating} size="md" />
        <Space h="md" />
        <Flex justify="flex-end">
          <Button
            onClick={isEditing ? handleReviewUpdate : handleReviewSubmit}
            variant="filled"
            color="blue"
          >
            Save Changes
          </Button>
        </Flex>
      </Modal>
    </Container>
    </div>
  );
};

const useStyles = createStyles((theme) => ({
  root: {
    backgroundColor: "#11284b",
    padding: 0,
    margin: 0,
    height: "90vh",
    position: "relative",
    boxSizing: "border-box",
    overflow: "hidden", 

  },

  content: {
    paddingTop: theme.spacing.xl,
  },


}))

export default Reviews;
