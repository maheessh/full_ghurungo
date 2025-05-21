import { Button, Container, Flex, Space, TextInput } from "@mantine/core";
import { useForm, FormErrors } from "@mantine/form";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";
import { showNotification } from "@mantine/notifications";
import { ApiResponse, OrganizationCreateUpdateDto, OrganizationGetDto } from "../../constants/types";
import { routes } from "../../routes";

export const OrganizationCreate = () => {
  const navigate = useNavigate();
  const mantineForm = useForm<OrganizationCreateUpdateDto>({
    initialValues: {
      name: "",
      description: "",
      createdBy: "", // Replace with actual user authentication logic
      createdAt: new Date(),
    },
  });

  const submitOrganization = async (values: OrganizationCreateUpdateDto) => {
    const response = await api.post<ApiResponse<OrganizationGetDto>>("/api/organizations", values);

    if (response.data.hasErrors) {
      const formErrors: FormErrors = response.data.errors.reduce(
        (prev, curr) => {
          return Object.assign(prev, { [curr.property]: curr.message });
        },
        {} as FormErrors
      );
      mantineForm.setErrors(formErrors);
    }

    if (response.data.data) {
      showNotification({ message: "Organization successfully created", color: "green" });
      navigate(routes.organization);
    }
  };

  return (
    <Container>
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
    </Container>
  );
};

export default OrganizationCreate;
