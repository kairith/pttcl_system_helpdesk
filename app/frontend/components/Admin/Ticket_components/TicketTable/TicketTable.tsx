"use client";

import React, { useState, useEffect, useRef, Fragment } from "react";
import { Ticket } from "@/app/backend/types/ticket";
import { PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import Card from "@/app/frontend/components/common/Card/Card";

interface TicketImage {
  id: string;
  ticket_id: string;
  image_path: string;
}

interface TicketTableProps {
  filteredTickets: (Ticket & { users_name: string; creator_name: string; images?: TicketImage[] })[];
  permissions: { add: boolean; edit: boolean; delete: boolean; list: boolean; listAssign: boolean };
}

export default function TicketTable({ filteredTickets, permissions }: TicketTableProps) {
  const router = useRouter();
  const [selectedTicket, setSelectedTicket] = useState<
    (Ticket & { users_name: string; creator_name: string; images?: TicketImage[] }) | null
  >(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteTicketId, setDeleteTicketId] = useState<string | null>(null);
  const [ticketImages, setTicketImages] = useState<{ [key: string]: TicketImage[] }>({});
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default to 10 rows
  const [currentPage, setCurrentPage] = useState(1); // Default to page 1
  const tableRef = useRef<HTMLDivElement>(null);

  // Reset currentPage to 1 when filteredTickets changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTickets]);

  // Fetch ticket images for all tickets
  useEffect(() => {
    const fetchImages = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to view ticket images.");
        router.push("/");
        return;
      }

      if (filteredTickets.length === 0) {
        setTicketImages({});
        return;
      }

      try {
        const ticketIds = filteredTickets.map((ticket) => ticket.ticket_id);
        const response = await fetch("/api/data/ticket_images/bulk", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ticket_ids: ticketIds }),
        });
        if (response.ok) {
          const images: TicketImage[] = await response.json();
          const imageMap = images.reduce((acc, image) => {
            acc[image.ticket_id] = acc[image.ticket_id] || [];
            acc[image.ticket_id].push(image);
            return acc;
          }, {} as { [key: string]: TicketImage[] });
          setTicketImages(imageMap);
        } else {
          const errorData = await response.json();
          setTicketImages({});
          toast.error(errorData.error || "Failed to fetch ticket images");
        }
      } catch (error) {
        setTicketImages({});
        toast.error("Failed to fetch ticket images");
      }
    };

    if (permissions.list) {
      fetchImages();
    }
  }, [filteredTickets, permissions.list, router]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTickets.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedTickets = filteredTickets.slice(startIndex, startIndex + rowsPerPage);

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.trim().toLowerCase();
    switch (normalizedStatus) {
      case "open":
        return "bg-green-100 text-green-700 rounded-md";
      case "in progress":
        return "bg-yellow-100 text-yellow-700 rounded-md";
      case "close":
        return "bg-red-100 text-red-700 rounded-md";
      default:
        return "bg-gray-100 text-gray-700 rounded-md";
    }
  };

  const handleEdit = (ticketId: string) => {
    router.push(`/pages/admin/ticket/edit_ticket/${ticketId}`);
  };

  const handleDelete = (ticketId: string) => {
    const ticketToDelete = filteredTickets.find((t) => t.id.toString() === ticketId);
    if (!ticketToDelete) {
      toast.error("Ticket not found.");
      return;
    }
    setSelectedTicket(ticketToDelete);
    setDeleteTicketId(ticketId);
  };

  const confirmDeleteTicket = async () => {
    if (!deleteTicketId) return;

    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found. Please log in.");
      router.push("/");
      return;
    }

    try {
      const ticketToDelete =
        selectedTicket || filteredTickets.find((t) => t.id.toString() === deleteTicketId);

      if (!ticketToDelete) throw new Error("Ticket data unavailable");

      const response = await fetch(`/api/data/delete_ticket/${ticketToDelete.ticket_id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error?.includes("Invalid token")) {
          router.push("/");
          return;
        }
        throw new Error(errorData.error || "Failed to delete ticket");
      }

      toast.success("✅ Ticket deleted successfully");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      closeDeleteModal();
    }
  };

  const closeDeleteModal = () => {
    setDeleteTicketId(null);
    setSelectedTicket(null);
  };

  const handleView = (ticket: Ticket & { users_name: string; creator_name: string; images?: TicketImage[] }) => {
    setSelectedTicket({ ...ticket, images: ticketImages[ticket.ticket_id] || [] });
    setIsViewModalOpen(true);
  };

  const openEnlargedImage = (imagePath: string) => {
    setEnlargedImage(imagePath);
  };

  const closeEnlargedImage = () => {
    setEnlargedImage(null);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedTicket(null);
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const tableElement = tableRef.current;
    if (isViewModalOpen && tableElement) {
      tableElement.style.filter = "blur(5px)";
      tableElement.style.opacity = "0.4";
      tableElement.style.transition = "filter 0.3s ease-in-out, opacity 0.3s ease-in-out";

      const modal = document.querySelector(".modal-content");
      if (modal) {
        (modal as HTMLElement).style.transform = "translateY(20px) scale(0.95)";
        (modal as HTMLElement).style.opacity = "0";
        timeout = setTimeout(() => {
          if (modal) {
            (modal as HTMLElement).style.transition = "transform 0.3s ease-in-out, opacity 0.3s ease-in-out";
            (modal as HTMLElement).style.transform = "translateY(0) scale(1)";
            (modal as HTMLElement).style.opacity = "1";
          }
        }, 10);
      }
    } else if (deleteTicketId && tableElement) {
      tableElement.style.filter = "blur(5px)";
      tableElement.style.opacity = "0.4";
      tableElement.style.transition = "filter 0.3s ease-in-out, opacity 0.3s ease-in-out";

      const modal = document.querySelector(".delete-modal-content");
      if (modal) {
        (modal as HTMLElement).style.transform = "translateY(20px) scale(0.95)";
        (modal as HTMLElement).style.opacity = "0";
        timeout = setTimeout(() => {
          if (modal) {
            (modal as HTMLElement).style.transition = "transform 0.3s ease-in-out, opacity 0.3s ease-in-out";
            (modal as HTMLElement).style.transform = "translateY(0) scale(1)";
            (modal as HTMLElement).style.opacity = "1";
          }
        }, 10);
      }
    } else if (tableElement) {
      tableElement.style.filter = "none";
      tableElement.style.opacity = "1";
      tableElement.style.transition = "filter 0.3s ease-in-out, opacity 0.3s ease-in-out";

      const modal = document.querySelector(".modal-content") || document.querySelector(".delete-modal-content");
      if (modal) {
        (modal as HTMLElement).style.transition = "transform 0.3s ease-in-out, opacity 0.3s ease-in-out";
        (modal as HTMLElement).style.transform = "translateY(20px) scale(0.95)";
        (modal as HTMLElement).style.opacity = "0";
        timeout = setTimeout(() => {
          setSelectedTicket(null);
        }, 300);
      }
    }
    return () => clearTimeout(timeout);
  }, [isViewModalOpen, deleteTicketId]);

  if (!permissions.list) {
    return (
      <Card className="mt-6 sm:mt-8 p-4 sm:p-6">
        <div className="w-full p-4 text-center text-gray-500 bg-white shadow-lg rounded-lg border border-gray-200">
          You do not have permission to view tickets.
        </div>
      </Card>
    );
  }

  return (
    <Card className="mt-6 sm:mt-1 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800"></h2>
        <div className="flex items-center space-x-2">
          <label htmlFor="rowsPerPage" className="text-gray-600 text-sm">
            Rows per page:
          </label>
          <select
            id="rowsPerPage"
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            aria-label="Select rows per page"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <div ref={tableRef} className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 hidden md:table">
            <thead className="bg-gray-100 rounded-xl">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ticket ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Station ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Station Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assign</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Issue</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Images</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedTickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-4 text-center text-gray-500">No tickets found.</td>
                </tr>
              ) : (
                paginatedTickets.map((ticket, index) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">{startIndex + index + 1}</td>
                    {permissions.list && (
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleView(ticket)}
                            className="p-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
                            aria-label={`View ticket ${ticket.ticket_id}`}
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          {permissions.edit && (
                            <button
                              onClick={() => handleEdit(ticket.id.toString())}
                              className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                              aria-label={`Edit ticket ${ticket.ticket_id}`}
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                          )}
                          {permissions.delete && (
                            <button
                              onClick={() => handleDelete(ticket.id.toString())}
                              className="p-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                              aria-label={`Delete ticket ${ticket.ticket_id}`}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                          {/* <button
                            onClick={() => handleView(ticket)}
                            className="p-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
                            aria-label={`View ticket ${ticket.ticket_id}`}
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button> */}
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm text-gray-800">{ticket.ticket_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{ticket.station_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{ticket.station_name || "N/A"}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{ticket.users_name || "Not Assigned"}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{ticket.issue_type || "N/A"}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 text-xs font-medium ${getStatusBadge(ticket.status.toString())}`}>
                        {ticket.status || "N/A"}
                      </span>
                    </td>
                    {/* <td className="px-4 py-3 text-sm text-gray-800">
                      {ticketImages[ticket.ticket_id]?.length > 0 ? (
                        <span>{ticketImages[ticket.ticket_id].length} image(s)</span>
                      ) : (
                        "No images"
                      )}
                    </td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile Responsive Cards */}
          <div className="md:hidden divide-y divide-gray-200">
            {paginatedTickets.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No tickets found.</div>
            ) : (
              paginatedTickets.map((ticket, index) => (
                <div key={ticket.id} className="p-4">
                  <div className="mb-2 text-sm text-gray-800 font-medium">No: {startIndex + index + 1}</div>
                  <div className="mb-2 text-sm text-gray-800 font-medium">Ticket ID: {ticket.ticket_id}</div>
                  <div className="mb-2 text-sm text-gray-800 font-medium">Station ID: {ticket.station_id}</div>
                  <div className="mb-2 text-sm text-gray-800 font-medium">Station Name: {ticket.station_name || "N/A"}</div>
                  <div className="mb-2 text-sm text-gray-800 font-medium">Assign: {ticket.users_name || "Not Assigned"}</div>
                  <div className="mb-2 text-sm text-gray-800 font-medium">Issue Type: {ticket.issue_type || "N/A"}</div>
                  <div className="mb-2 text-sm font-medium">
                    Status: <span className={`px-2 py-1 text-xs font-medium ${getStatusBadge(ticket.status.toString())}`}>{ticket.status || "N/A"}</span>
                  </div>
                  {/* <div className="mb-2 text-sm text-gray-800 font-medium">
                    Images: {ticketImages[ticket.ticket_id]?.length > 0 ? `${ticketImages[ticket.ticket_id].length} image(s)` : "No images"}
                  </div> */}
                  {permissions.list && (
                    <div className="flex justify-start gap-2 mt-3">
                      {permissions.edit && (
                        <button
                          onClick={() => handleEdit(ticket.id.toString())}
                          className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                          aria-label={`Edit ticket ${ticket.ticket_id}`}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      )}
                      {permissions.delete && (
                        <button
                          onClick={() => handleDelete(ticket.id.toString())}
                          className="p-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                          aria-label={`Delete ticket ${ticket.ticket_id}`}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleView(ticket)}
                        className="p-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
                        aria-label={`View ticket ${ticket.ticket_id}`}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        {paginatedTickets.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${
                currentPage === 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
              aria-label="Previous page"
            >
              Previous
            </button>
            <span className="text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded ${
                currentPage === totalPages
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* View Ticket Modal */}
      {isViewModalOpen && selectedTicket && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[2000] bg-black/50 supports-[backdrop-filter]:backdrop-blur-lg"
          style={{
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
            paddingLeft: "env(safe-area-inset-left)",
            paddingRight: "env(safe-area-inset-right)",
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-[calc(100vw-16px)] max-w-md sm:max-w-lg lg:max-w-4xl modal-content"
            style={{ transition: "transform 0.3s ease-in-out, opacity 0.3s ease-in-out" }}
          >
            <h2 id="modal-title" className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">
              Ticket Details: <span className="text-blue-600">{selectedTicket.ticket_id}</span>
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-4">
                <div><p className="text-gray-800 break-words truncate">Ticket ID: {selectedTicket.ticket_id}</p></div>
                <div><p className="text-gray-800 break-words truncate">Station ID: {selectedTicket.station_id}</p></div>
                <div><p className="text-gray-800 break-words truncate">Station Name: {selectedTicket.station_name || "N/A"}</p></div>
                <div><p className="text-gray-800 break-words truncate">Station Type: {selectedTicket.station_type || "N/A"}</p></div>
              </div>
              <div className="space-y-4">
                <div><p className="text-gray-800 break-words truncate">Province: {selectedTicket.province || "N/A"}</p></div>
                <div><p className="text-gray-800 break-words max-h-20 overflow-y-auto">Issue Description: {selectedTicket.issue_description || "N/A"}</p></div>
                <div><p className="text-gray-800 break-words truncate">Issue Type: {selectedTicket.issue_type || "N/A"}</p></div>
              </div>
              <div className="space-y-4">
                <div><p className="text-gray-800 break-words truncate">Status: {selectedTicket.status || "N/A"}</p></div>
                <div><p className="text-gray-800 break-words truncate">Assign: {selectedTicket.users_name || "Not Assigned"}</p></div>
                <div><p className="text-gray-800 break-words max-h-20 overflow-y-auto">Comment: {selectedTicket.comment || "N/A"}</p></div>
                <div><p className="text-gray-800 break-words truncate">Ticket Time: {selectedTicket.ticket_time ? new Date(selectedTicket.ticket_time).toLocaleString() : "N/A"}</p></div>
                <div><p className="text-gray-800 break-words truncate">Created By User ID: {selectedTicket.user_create_ticket || "N/A"}</p></div>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-800 mb-2">Ticket Images</h3>
              {selectedTicket.images && selectedTicket.images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {selectedTicket.images.map((image) => (
                    <div key={image.id} className="relative">
                      <img
                        src={image.image_path}
                        alt={`Ticket ${selectedTicket.ticket_id} image`}
                        className="w-full h-32 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openEnlargedImage(image.image_path)}
                        onError={(e) => (e.currentTarget.src = "/placeholder-image.jpg")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            openEnlargedImage(image.image_path);
                          }
                        }}
                        aria-label={`View larger image for ticket ${selectedTicket.ticket_id}`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Ticket has no images when created.</p>
              )}
            </div>
            <button
              onClick={closeViewModal}
              onKeyDown={(e) => {
                if (e.key === "Escape") closeViewModal();
              }}
              className="mt-4 sm:mt-6 w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:ring-4 focus:ring-blue-200"
              aria-label="Close modal"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Enlarged Image Modal */}
      {enlargedImage && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[3000] bg-black/70 supports-[backdrop-filter]:backdrop-blur-lg"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged image view"
          onClick={closeEnlargedImage}
        >
          <div className="relative max-w-[90vw] max-h-[90vh] p-4">
            <img
              src={enlargedImage}
              alt="Enlarged ticket image"
              className="max-w-full max-h-[80vh] object-contain rounded-md"
              onError={(e) => (e.currentTarget.src = "/placeholder-image.jpg")}
            />
            <button
              onClick={closeEnlargedImage}
              className="absolute top-2 right-2 p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close enlarged image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {permissions.delete && (
        <Transition appear show={deleteTicketId !== null} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={closeDeleteModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                }}
              />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all delete-modal-content">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Confirm Deletion
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete ticket with Ticket ID{" "}
                        {selectedTicket?.ticket_id || deleteTicketId}? This action cannot be undone.
                      </p>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={closeDeleteModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                        onClick={confirmDeleteTicket}
                      >
                        Delete
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}
    </Card>
  );
}