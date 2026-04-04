process.env.DATABASE_URL = 'mysql://root:root@localhost:3306/vivahsetu';
const { PrismaClient } = require('./node_modules/@prisma/client');
const p = new PrismaClient();
p.user.findUnique({ where: { id: 1 }, select: { id: true, email: true, isApproved: true, isVerified: true } })
  .then(r => { console.log(r); p.$disconnect(); });
