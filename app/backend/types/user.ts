export interface User {
     users_id: string;
     users_name: string;
     email: string;
     password: string;
     code: number;
     status: number;
     rules_id: number;
     company: string;
     user_image?: string | null;
   }