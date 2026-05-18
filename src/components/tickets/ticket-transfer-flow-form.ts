import type { DeliveryMode, RecipientFormState } from "@/components/tickets/ticketFlowTypes";

export const emptyRecipientForm: RecipientFormState = {
  destination: "",
  firstName: "",
  lastName: "",
  note: "",
};

export function inferDeliveryModeFromDestination(
  value: string,
): DeliveryMode | null {
  if (!value.length) {
    return null;
  }

  return value.includes("@") ? "email" : "mobile";
}

export function validateRecipientForm(
  form: RecipientFormState,
  deliveryMode?: DeliveryMode,
): Partial<RecipientFormState> {
  const errors: Partial<RecipientFormState> = {};

  if (!form.firstName.trim()) {
    errors.firstName = "First name is required";
  }

  if (!form.lastName.trim()) {
    errors.lastName = "Last name is required";
  }

  const destination = form.destination.trim();
  if (!destination) {
    errors.destination = "Recipient contact is required";
  } else if (deliveryMode === "email" || (!deliveryMode && destination.includes("@"))) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(destination)) {
      errors.destination = "Invalid email format";
    }
  } else {
    const phoneRegex = /^\+?[\d\s-]{7,}$/;
    if (!phoneRegex.test(destination)) {
      errors.destination = "Invalid phone format";
    }
  }

  return errors;
}
