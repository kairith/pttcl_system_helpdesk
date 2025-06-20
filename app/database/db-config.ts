
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1122',
  database: process.env.DB_NAME || 'pttcl_helpdesk_nextjs',
};
