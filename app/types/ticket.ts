export interface Ticket {
  id: number;
  ticket_id: string;
  station_id: string;
  station_name: string;
  station_type: number;
  province: number;
  issue_description: string;
  issue_type: string;
  status: number;
  users_id: number;
  ticket_open: Date | string;
  ticket_on_hold: Date | string | null;
  ticket_in_progress: Date | string | null;
  ticket_pending_vendor: Date | string | null;
  ticket_close: Date | string | null;
  ticket_time: Date | string;
  comment: string | null;
  user_create_ticket: number;
  issue_type_id: number;
}