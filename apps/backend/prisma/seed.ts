import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const brides = [
  { email: 'priya.sharma@gmail.com', phone: '9871234501', name: 'Priya Sharma', age: 24, city: 'Pune', state: 'Maharashtra', gotra: 'Bharadvaja', education: 'M.Sc Computer Science', occupation: 'Software Engineer', height: '5\'4"', maritalStatus: 'Single', bio: 'I am a calm, cultured and family-oriented person. I love classical music and reading Vedic scriptures. Looking for a kind-hearted and well-educated groom from a Brahmana family.' },
  { email: 'anusha.iyer@gmail.com', phone: '9871234502', name: 'Anusha Iyer', age: 26, city: 'Bangalore', state: 'Karnataka', gotra: 'Kaundinya', education: 'MBA Finance', occupation: 'Financial Analyst', height: '5\'3"', maritalStatus: 'Single', bio: 'Traditional yet modern, I balance my professional career with a deep respect for our Brahmana heritage. My family follows Smarta traditions. Seeking a like-minded partner.' },
  { email: 'meera.tiwari@gmail.com', phone: '9871234503', name: 'Meera Tiwari', age: 23, city: 'Lucknow', state: 'Uttar Pradesh', gotra: 'Kashyapa', education: 'MBBS', occupation: 'Medical Doctor', height: '5\'5"', maritalStatus: 'Single', bio: 'A doctor by profession and a devoted daughter by heart. I believe in the sacred institution of marriage and seek a partner who values both tradition and modernity.' },
  { email: 'divya.krishnan@gmail.com', phone: '9871234504', name: 'Divya Krishnan', age: 25, city: 'Chennai', state: 'Tamil Nadu', gotra: 'Vasishtha', education: 'B.Tech IT', occupation: 'IT Consultant', height: '5\'2"', maritalStatus: 'Single', bio: 'Deeply rooted in Tamil Brahmin traditions, I enjoy Carnatic music and cooking traditional South Indian cuisine. Looking for a simple, educated and family-loving groom.' },
  { email: 'kavya.bhat@gmail.com', phone: '9871234505', name: 'Kavya Bhat', age: 27, city: 'Mangalore', state: 'Karnataka', gotra: 'Atri', education: 'M.Com', occupation: 'Chartered Accountant', height: '5\'3"', maritalStatus: 'Single', bio: 'A Saraswat Brahmin from coastal Karnataka. I am professionally qualified as a CA and am close to my roots and family values. Seeking a well-settled groom.' },
  { email: 'sakshi.pande@gmail.com', phone: '9871234506', name: 'Sakshi Pandey', age: 24, city: 'Varanasi', state: 'Uttar Pradesh', gotra: 'Gautama', education: 'B.A Sanskrit', occupation: 'Sanskrit Teacher', height: '5\'4"', maritalStatus: 'Single', bio: 'Born in the holy city of Kashi, I have studied Sanskrit and Vedic literature. Teaching is my passion. I seek a pious, educated groom from a good Brahmin family.' },
];

const grooms = [
  { email: 'rahul.sharma@gmail.com', phone: '9871234507', name: 'Rahul Sharma', age: 28, city: 'Mumbai', state: 'Maharashtra', gotra: 'Vishwamitra', education: 'B.Tech Computer Science', occupation: 'Software Developer', height: '5\'10"', maritalStatus: 'Single', bio: 'Working in a leading tech company in Mumbai. I follow Vedic traditions and believe in the importance of family. Hobbies include yoga, reading and travel.' },
  { email: 'deepak.nair@gmail.com', phone: '9871234508', name: 'Deepak Menon', age: 30, city: 'Hyderabad', state: 'Telangana', gotra: 'Agastya', education: 'M.Tech', occupation: 'Senior Engineer', height: '5\'9"', maritalStatus: 'Single', bio: 'A Namboodiri Brahmin from Kerala settled in Hyderabad for work. I am a software architect with a passion for Vedic philosophy. Looking for an educated, family-oriented partner.' },
  { email: 'vikram.mishra@gmail.com', phone: '9871234509', name: 'Vikram Mishra', age: 29, city: 'Delhi', state: 'Delhi', gotra: 'Bharadvaja', education: 'MBBS, MD', occupation: 'Physician', height: '5\'11"', maritalStatus: 'Single', bio: 'A Kanyakubja Brahmin working as a physician in Delhi. I come from a learned family and deeply value our Vedic heritage. Seeking a cultured and well-educated life partner.' },
  { email: 'arun.iyer@gmail.com', phone: '9871234510', name: 'Arun Venkataraman', age: 27, city: 'Coimbatore', state: 'Tamil Nadu', gotra: 'Koundinya', education: 'CA, CMA', occupation: 'Chartered Accountant', height: '5\'8"', maritalStatus: 'Single', bio: 'An Iyengar Brahmin from a deeply traditional family in Coimbatore. I practice Vaishnavism and follow our family customs. Professionally qualified as a CA.' },
  { email: 'suresh.kulkarni@gmail.com', phone: '9871234511', name: 'Suresh Kulkarni', age: 31, city: 'Nagpur', state: 'Maharashtra', gotra: 'Shandilya', education: 'M.Sc Physics', occupation: 'Research Scientist', height: '5\'9"', maritalStatus: 'Single', bio: 'A Deshastha Brahmin researcher at a national laboratory. I follow Smartha traditions and am passionate about Vedic mathematics and astronomy.' },
  { email: 'krishna.bhat@gmail.com', phone: '9871234512', name: 'Krishna Prasad Bhat', age: 26, city: 'Udupi', state: 'Karnataka', gotra: 'Kashyapa', education: 'B.Tech Electronics', occupation: 'VLSI Engineer', height: '5\'10"', maritalStatus: 'Single', bio: 'A Havyaka Brahmin from the temple town of Udupi. I am an engineer by profession and a devotee at heart. I regularly participate in Vedic recitation at our local peetha.' },
];

async function main() {
  console.log('Seeding database...');

  const password = await bcrypt.hash('Password@123', 10);

  // Create admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vivahsetu.com' },
    update: {},
    create: {
      email: 'admin@vivahsetu.com',
      phone: '9800000001',
      passwordHash: password,
      role: 'ADMIN',
      isVerified: true,
      isApproved: true,
    },
  });
  console.log('Admin created:', admin.email);

  // Create bride users + profiles
  for (const b of brides) {
    const user = await prisma.user.upsert({
      where: { email: b.email },
      update: {},
      create: {
        email: b.email,
        phone: b.phone,
        passwordHash: password,
        role: 'BRIDE',
        isVerified: true,
        isApproved: true,
      },
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        name: b.name,
        age: b.age,
        city: b.city,
        state: b.state,
        country: 'India',
        gotra: b.gotra,
        education: b.education,
        occupation: b.occupation,
        height: b.height,
        maritalStatus: b.maritalStatus,
        bio: b.bio,
        religion: 'Hindu',
        caste: 'Brahmin',
        motherTongue: 'Hindi',
        annualIncome: '5-10 LPA',
      },
    });
    console.log('Bride created:', b.name);
  }

  // Create groom users + profiles
  for (const g of grooms) {
    const user = await prisma.user.upsert({
      where: { email: g.email },
      update: {},
      create: {
        email: g.email,
        phone: g.phone,
        passwordHash: password,
        role: 'GROOM',
        isVerified: true,
        isApproved: true,
      },
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        name: g.name,
        age: g.age,
        city: g.city,
        state: g.state,
        country: 'India',
        gotra: g.gotra,
        education: g.education,
        occupation: g.occupation,
        height: g.height,
        maritalStatus: g.maritalStatus,
        bio: g.bio,
        religion: 'Hindu',
        caste: 'Brahmin',
        motherTongue: 'Hindi',
        annualIncome: '10-20 LPA',
      },
    });
    console.log('Groom created:', g.name);
  }

  console.log('Seeding complete! 12 profiles created.');
  console.log('Login with any profile using password: Password@123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
