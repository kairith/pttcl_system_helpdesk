import { NextApiRequest, NextApiResponse } from 'next';

// Mock function to simulate email validation and password reset logic
async function checkEmail(email: string): Promise<{ success: boolean; errors?: string[] }> {
  // Replace this with your actual backend logic (e.g., database query, email service)
  if (!email) {
    return { success: false, errors: ['Email is required.'] };
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return { success: false, errors: ['Invalid email format.'] };
  }

  // Simulate checking if email exists in database
  const emailExists = true; // Replace with actual database check
  if (!emailExists) {
    return { success: false, errors: ['Email not found.'] };
  }

  // Simulate sending reset email
  try {
    // Replace with your email service logic (e.g., SendGrid, Nodemailer)
    console.log(`Sending password reset email to ${email}`);
    return { success: true };
  } catch (error) {
    return { success: false, errors: ['Failed to send reset email.'] };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ errors: ['Method not allowed.'] });
  }

  const { email } = req.body;

  const result = await checkEmail(email);

  if (!result.success) {
    return res.status(400).json({ errors: result.errors });
  }

  return res.status(200).json({ message: 'Password reset email sent.' });
}