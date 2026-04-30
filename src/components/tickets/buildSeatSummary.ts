import type { Seat } from "@/components/tickets/ticketFlowTypes";

export function buildSeatSummary(seats: Seat[]) {
  if (!seats.length) {
    return "No ticket seats";
  }

  const firstSeat = seats[0];
  const sameRow = seats.every((seat) => seat.row === firstSeat.row);
  const sameSection = seats.every((seat) => seat.section === firstSeat.section);

  if (sameRow && sameSection) {
    return `Sec ${firstSeat.section}, Row ${firstSeat.row}`;
  }

  if (sameSection) {
    return `Sec ${firstSeat.section}`;
  }

  return `${seats.length} Ticket Seats`;
}
