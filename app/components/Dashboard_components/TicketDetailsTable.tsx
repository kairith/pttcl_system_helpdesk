// app/components/Dashboard_components/TicketDetailsTable.tsx
import Card from "@/app/components/common/Card";

interface TicketData {
  id: number;
  ticket_id: string;
  status?: string;
  station_id: string;
  station_type: string;
  issue_description: string;
  issue_type: string;
}

interface TicketDetailsTableProps {
  ticketData: TicketData[];
}

const TicketDetailsTable: React.FC<TicketDetailsTableProps> = ({ ticketData }) => {
  return (
    <Card className="mt-6 sm:mt-8 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Ticket Details</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 rounded-xl">
              <th className="text-left p-2 sm:p-3 font-bold text-gray-800">No</th>
              <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Ticket ID</th>
              <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Station ID</th>
              <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Station Type</th>
              <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Issue Description</th>
              <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Issue Type</th>
              <th className="text-left p-2 sm:p-3 font-bold text-gray-800">Status</th>
            </tr>
          </thead>
          <tbody>
            {ticketData.map((ticket) => (
              <tr key={ticket.id} className="border-b border-gray-200">
                <td className="p-2 sm:p-3 text-gray-700">{ticket.id}</td>
                <td className="p-2 sm:p-3 text-gray-700">{ticket.ticket_id}</td>
                <td className="p-2 sm:p-3 text-gray-700">{ticket.station_id}</td>
                <td className="p-2 sm:p-3 text-gray-700">{ticket.station_type}</td>
                <td className="p-2 sm:p-3 text-gray-700">{ticket.issue_description}</td>
                <td className="p-2 sm:p-3 text-gray-700">{ticket.issue_type}</td>
                <td className="p-2 sm:p-3 text-gray-700">{ticket.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TicketDetailsTable;