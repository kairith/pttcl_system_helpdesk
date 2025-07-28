export interface TelegramInputs {
  botName: string;
  username: string;
  chatId: string; // Explicitly string
  threadId: number; // Explicitly number
  status: string;
  assigner: string;
  stationId: string;
  stationName: string;
  ticketId: string;
  issueType: string; // Numeric string (e.g., "36")
  issueDescription: string;
}