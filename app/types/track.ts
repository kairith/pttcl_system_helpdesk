
// in admin/track/page.tsx use the type for track ticket 

interface Ticket {
  id: number;
  ticket_id: string;
  station_id: string;
  station_name: string;
  station_type: string;
  province: string;
  issue_description: string;
  issue_type: string;
  status: string;
  users_id: string;
  ticket_open: string | null;
  ticket_on_hold: string | null;
  ticket_in_progress: string | null;
  ticket_pending_vendor: string | null;
  ticket_close: string | null;
  ticket_time: string | null;
  comment: string | null;
  user_create_ticket: string;
  issue_type_id: number;
}
