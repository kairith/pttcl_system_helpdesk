// config your db connection here base on your cridentials and your port 

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pttcl_helpdesk_nextjs',
  port: 3307
};
