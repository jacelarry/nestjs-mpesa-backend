import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || '4000',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret',
  MPESA_CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY || '',
  MPESA_CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET || '',
  MPESA_SHORTCODE: process.env.MPESA_SHORTCODE || '',
  MPESA_TILL_NUMBER: process.env.MPESA_TILL_NUMBER || '',
  MPESA_PASSKEY: process.env.MPESA_PASSKEY || '',
  MPESA_BASE_URL: process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke',
  AFRICAS_TALKING_USERNAME: process.env.AT_USERNAME || '',
  AFRICAS_TALKING_API_KEY: process.env.AT_API_KEY || '',
  AFRICAS_TALKING_SENDER_ID: process.env.AT_SENDER_ID || '',
};
