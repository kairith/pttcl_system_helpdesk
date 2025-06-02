// app/data/company_data.ts
import mysql from 'mysql2/promise';

const connection = mysql.createPool({
    host: 'localhost', // Your MySQL host
    user: 'root', // Your MySQL username
    password: '1122', // Your MySQL password
    database: 'pttcl_helpdesk_nextjs', // Your database name
});

export default connection;