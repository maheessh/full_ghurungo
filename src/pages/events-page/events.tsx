import { useState, useEffect, useRef } from "react";
import { DatePickerInput, TimeInput } from "@mantine/dates";
import {
  Container,
  Text,
  TextInput,
  Textarea,
  Button,
  Modal,
  Space,
  Table,
  Group,
  Card,
  ActionIcon,
  rem,
  Divider,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import api from "../../config/axios";
import { ApiResponse } from "../../constants/types";
import { IconClock } from "@tabler/icons-react";

interface EventCreateDto {
  title: string;
  description: string;
  date: Date | null;
  time: string;
  location: string;
  organizationId: number;
  createdBy: number;
  imageUrl: string; // New field for the image URL
}

interface EventGetDto extends EventCreateDto {
  id: number;
  createdAt: string;
}

export const Events = () => {
  const [events, setEvents] = useState<EventGetDto[]>([]);
  const [newEvent, setNewEvent] = useState<EventCreateDto>({
    title: "",
    description: "",
    date: null,
    time: "",
    location: "",
    organizationId: 1,
    createdBy: 1,
    imageUrl: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateCardOpen, setIsUpdateCardOpen] = useState(false);
  const [currentEventId, setCurrentEventId] = useState<number | null>(null);
  const [currentEvent, setCurrentEvent] = useState<EventGetDto | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchEvents();
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
      console.error("Error fetching events:", error);
    }
  };

  const handleCreateEvent = async () => {
    try {
      const response = await api.post<ApiResponse<EventGetDto>>(
        "/api/events",
        newEvent
      );
      if (response.data.data) {
        setEvents((prevEvents) => [...prevEvents, response.data.data]);
        showNotification({
          message: "Event created successfully!",
          color: "green",
        });
        setNewEvent({
          title: "",
          description: "",
          date: null,
          time: "",
          location: "",
          organizationId: 1,
          createdBy: 1,
          imageUrl: "",
        });
        setIsModalOpen(false);
      } else {
        showNotification({ message: "Error creating event", color: "red" });
      }
    } catch (error) {
      showNotification({
        message: "Network error while creating event",
        color: "red",
      });
      console.error("Error creating event:", error);
    }
  };

  const openUpdateCard = (event: EventGetDto) => {
    console.log("Opening update card for event:", event); // Debugging

    const parsedDate =
      typeof event.date === "string" ? new Date(event.date) : event.date;

    setCurrentEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description,
      date: parsedDate,
      time: event.time,
      location: event.location,
      organizationId: event.organizationId,
      createdBy: event.createdBy,
      imageUrl: event.imageUrl,
    });
    setCurrentEventId(event.id);
    setIsUpdateCardOpen(true);
  };

  const handleUpdateEvent = async () => {
    if (currentEventId === null) return;

    try {
      const timeParts = newEvent.time.split(":");
      if (
        timeParts.length !== 3 ||
        timeParts.some((part) => isNaN(Number(part))) ||
        Number(timeParts[0]) > 23 ||
        Number(timeParts[1]) > 59 ||
        Number(timeParts[2]) > 59
      ) {
        showNotification({
          message: "Invalid time format. Use HH:mm:ss",
          color: "red",
        });
        return;
      }

      const timeSpan = `${timeParts[0].padStart(
        2,
        "0"
      )}:${timeParts[1].padStart(2, "0")}:${timeParts[2].padStart(2, "0")}`;

      const response = await api.put<ApiResponse<EventGetDto>>(
        `/api/events/${currentEventId}`,
        {
          ...newEvent,
          time: timeSpan,
        }
      );

      if (response.data.data) {
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === currentEventId ? response.data.data : event
          )
        );
        showNotification({
          message: "Event updated successfully!",
          color: "green",
        });
        setIsUpdateCardOpen(false);
        setCurrentEventId(null);
        setCurrentEvent(null);
      } else {
        showNotification({ message: "Error updating event", color: "red" });
      }
    } catch (error) {
      showNotification({
        message: "Network error while updating event",
        color: "red",
      });
      console.error("Error updating event:", error);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    try {
      const response = await api.delete<ApiResponse<boolean>>(
        `/api/events/${id}`
      );
      if (response.status === 200) {
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event.id !== id)
        );
        showNotification({
          message: "Event deleted successfully!",
          color: "green",
        });
      } else {
        showNotification({ message: "Error deleting event", color: "red" });
      }
    } catch (error) {
      showNotification({
        message: "Network error while deleting event",
        color: "red",
      });
      console.error("Error deleting event:", error);
    }
  };

  return (
    <Container>
      <h1>Manage Events</h1>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="filled"
        color="blue"
      >
        Create Event
      </Button>

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create a New Event"
      >
        <TextInput
          label="Title"
          value={newEvent.title}
          onChange={(e) =>
            setNewEvent({ ...newEvent, title: e.currentTarget.value })
          }
          required
        />
        <Space h="md" />
        <Textarea
          label="Description"
          value={newEvent.description}
          onChange={(e) =>
            setNewEvent({ ...newEvent, description: e.currentTarget.value })
          }
          required
        />
        <Space h="md" />
        <DatePickerInput
          clearable
          label="Date"
          placeholder="Pick date"
          value={newEvent.date}
          onChange={(value) => setNewEvent({ ...newEvent, date: value })}
          required
        />
        <Space h="md" />
        <TimeInput
          withSeconds
          label="Event Time"
          value={newEvent.time}
          onChange={(e) =>
            setNewEvent({ ...newEvent, time: e.currentTarget.value })
          }
          required
        />
        <Space h="md" />
        <TextInput
          label="Location"
          value={newEvent.location}
          onChange={(e) =>
            setNewEvent({ ...newEvent, location: e.currentTarget.value })
          }
          required
        />
        <Space h="md" />
        <TextInput
          label="Image URL"
          placeholder="Enter image URL for the event"
          value={newEvent.imageUrl}
          onChange={(e) =>
            setNewEvent({ ...newEvent, imageUrl: e.currentTarget.value })
          }
        />
        <Space h="md" />
        <Button onClick={handleCreateEvent} variant="filled" color="green">
          Submit
        </Button>
      </Modal>

      <Space h="xl" />

      <h2>Existing Events</h2>
      <Table highlightOnHover>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td>{event.title}</td>
              <td>{event.description}</td>
              <td>
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt={event.title} width="50" />
                ) : (
                  "N/A"
                )}
              </td>
              <td>
                <Group>
                  <Button
                    color="yellow"
                    onClick={() => openUpdateCard(event)}
                    style={{ marginRight: "8px" }}
                  >
                    Update
                  </Button>
                  <Button
                    color="red"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    Delete
                  </Button>
                </Group>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal
        opened={isUpdateCardOpen}
        onClose={() => setIsUpdateCardOpen(false)}
        title="Update Event"
      >
        <TextInput
          label="Title"
          value={newEvent.title}
          onChange={(e) =>
            setNewEvent({ ...newEvent, title: e.currentTarget.value })
          }
          required
        />
        <Space h="md" />
        <Textarea
          label="Description"
          value={newEvent.description}
          onChange={(e) =>
            setNewEvent({ ...newEvent, description: e.currentTarget.value })
          }
          required
        />
        <Space h="md" />
        <DatePickerInput
          label="Event Date"
          placeholder="Pick a date"
          value={newEvent.date}
          onChange={(value) => setNewEvent({ ...newEvent, date: value })}
          required
        />
        <Space h="md" />
        <TimeInput
          withSeconds
          label="Event Time"
          value={newEvent.time}
          onChange={(e) =>
            setNewEvent({ ...newEvent, time: e.currentTarget.value })
          }
          required
        />
        <Space h="md" />
        <TextInput
          label="Location"
          value={newEvent.location}
          onChange={(e) =>
            setNewEvent({ ...newEvent, location: e.currentTarget.value })
          }
          required
        />
        <Space h="md" />
        <TextInput
          label="Image URL"
          value={newEvent.imageUrl}
          onChange={(e) =>
            setNewEvent({ ...newEvent, imageUrl: e.currentTarget.value })
          }
        />
        <Space h="md" />
        <Button onClick={handleUpdateEvent} variant="filled" color="blue">
          Update
        </Button>
      </Modal>
      <Divider style={{topMargin: "20px"}}></Divider>
      <h3>Test Event Image Link:</h3>
      <p>Career Fair: https://lionsroarnews.com/wp-content/uploads/2024/08/@@@IMG_1021-1200x800.jpg</p>
    </Container>
  );
};

export default Events;
