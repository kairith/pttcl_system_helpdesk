import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminRule = await prisma.userRule.create({
    data: {
      rules_name: "Admin",
      add_user_status: 1,
      edit_user_status: 1,
      delete_user_status: 1,
      list_user_status: 1,
      add_ticket_status: 1,
      edit_ticket_status: 1,
      delete_ticket_status: 1,
      list_ticket_status: 1,
      list_ticket_assign: 1,
      add_user_rules: 1,
      edit_user_rules: 1,
      delete_user_rules: 1,
      list_user_rules: 1,
      add_station: 1,
      edit_station: 1,
      delete_station: 1,
      list_station: 1,
      list_dashboard: 1,
      list_track: 1,
      list_report: 1,
    },
  });

  const agentRule = await prisma.userRule.create({
    data: {
      rules_name: "Agent",
      list_user_status: 1,
      list_ticket_status: 1,
      list_station: 1,
      list_dashboard: 1,
      list_track: 1,
      list_report: 1,
    },
  });

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.user.create({
    data: {
      users_name: "Admin User",
      email: "admin@pttcl.local",
      password: passwordHash,
      code: 0,
      status: 1,
      rules_id: adminRule.rules_id,
      company: "PTT Cambodia",
    },
  });

  const agent = await prisma.user.create({
    data: {
      users_name: "Agent User",
      email: "agent@pttcl.local",
      password: passwordHash,
      code: 0,
      status: 1,
      rules_id: agentRule.rules_id,
      company: "PTT Cambodia",
    },
  });

  const station = await prisma.station.create({
    data: {
      station_id: "STN001",
      station_name: "Phnom Penh Central",
      station_type: "COCO",
      province: "Phnom Penh",
    },
  });

  await prisma.issueType.createMany({
    data: [
      { issue_type: "Software", category: "PTT_Digital" },
      { issue_type: "Hardware", category: "PTT_Digital" },
      { issue_type: "ATG", category: "Third_Party" },
      { issue_type: "ABA", category: "Third_Party" },
      { issue_type: "Fleetcard", category: "Third_Party" },
      { issue_type: "Network", category: "Third_Party" },
      { issue_type: "Dispenser", category: "Third_Party" },
    ],
  });

  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const ticketId = `POS${yy}${mm}000001`;

  await prisma.ticket.create({
    data: {
      ticket_id: ticketId,
      user_create_ticket: admin.users_id,
      users_id: agent.users_id,
      station_id: station.station_id,
      station_name: station.station_name,
      station_type: station.station_type,
      province: station.province,
      issue_type: "Software",
      issue_description: "Sample seeded ticket for local development.",
      status: "Open",
    },
  });

  console.log("Seed complete:");
  console.log(`  Admin login:  admin@pttcl.local / Password123!`);
  console.log(`  Agent login:  agent@pttcl.local / Password123!`);
  console.log(`  Sample ticket: ${ticketId}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
