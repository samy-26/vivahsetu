export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'vivahsetu-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'vivahsetu-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },
  aws: {
    region: process.env.AWS_REGION || 'ap-south-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: process.env.AWS_S3_BUCKET,
    sesFromEmail: process.env.AWS_SES_FROM_EMAIL,
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SENDGRID_FROM_EMAIL,
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  otp: {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 10,
  },
  plans: {
    basic: { price: 500, views: 10, durationDays: 30 },
    standard: { price: 1500, views: 50, durationDays: 180 },
    platinum: { price: 2000, views: 60, durationDays: 36500 },
  },
  kundli: {
    downloadPrice: 51,
    matchmakingPrice: 101,
  },
});
