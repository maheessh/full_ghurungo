import { Button, Container, Flex, Space, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import api from "../../config/axios";
import { ApiResponse, OrganizationGetDto, OrganizationCreateUpdateDto } from "../../constants/types";
import { useNavigate, useParams } from "react-router-dom";
import { showNotification } from "@mantine/notifications";
import { useForm, FormErrors } from "@mantine/form";
import { routes } from "../../routes";

export const OrganizationUpdate = () => {
  const [organization, setOrganization] = useState<OrganizationGetDto | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  console.log("Organization ID from URL params:", id);

  const mantineForm = useForm<OrganizationCreateUpdateDto>({
    initialValues: {
      name: "",
      description: "",
      createdBy: "", // Ensure this is set properly
      createdAt: new Date(),
    },
  });

  useEffect(() => {
    if (id) {
      fetchOrganization();
    } else {
      console.error("No ID found in URL params");
      setLoading(false);
    }

    async function fetchOrganization() {
      try {
        const response = await api.get<ApiResponse<OrganizationGetDto>>(`/api/organizations/${id}`);
        console.log("API response for organization:", response.data);

        if (response.data.hasErrors) {
          showNotification({ message: "Error finding organization", color: "red" });
        } else if (response.data.data) {
          setOrganization(response.data.data);
          mantineForm.setValues(response.data.data);
          mantineForm.resetDirty();
          console.log("Organization data set successfully");
        } else {
          console.warn("No data found for the organization");
        }
      } catch (error) {
        console.error("Error fetching organization:", error);
        showNotification({ message: "Network error while fetching organization", color: "red" });
      } finally {
        setLoading(false);
      }
    }
  }, [id]);

  const submitOrganization = async (values: OrganizationCreateUpdateDto) => {
    try {
      const response = await api.put<ApiResponse<OrganizationGetDto>>(`/api/organizations/${id}`, values);
      console.log("API response for update:", response.data);

      if (response.data.hasErrors) {
        const formErrors: FormErrors = response.data.errors.reduce(
          (prev, curr) => {
            return Object.assign(prev, { [curr.property]: curr.message });
          },
          {} as FormErrors
        );
        mantineForm.setErrors(formErrors);
        return;
      }

      if (response.data.data) {
        showNotification({ message: "Organization successfully updated", color: "green" });
        navigate(routes.organization);
      }
    } catch (error) {
      console.error("Error updating organization:", error);
      showNotification({ message: "Network error while updating organization", color: "red" });
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <Container>
      {organization ? (
        <form onSubmit={mantineForm.onSubmit(submitOrganization)}>
          <TextInput {...mantineForm.getInputProps("name")} label="Name" withAsterisk />
          <TextInput {...mantineForm.getInputProps("description")} label="Description" withAsterisk />
          <TextInput {...mantineForm.getInputProps("createdBy")} label="Created By" withAsterisk />
          <Space h={18} />
          <Flex direction="row">
            <Button type="submit">Submit</Button>
            <Button
              type="button"
              onClick={() => {
                navigate(routes.organization);
              }}
              variant="outline"
            >
              Cancel
            </Button>
          </Flex>
        </form>
      ) : (
        <p>No organization data available.</p>
      )}
    </Container>
  );
};

export default OrganizationUpdate;
