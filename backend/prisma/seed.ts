import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.payrollRun.deleteMany({});
  await prisma.salaryAdvance.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.branch.deleteMany({});

  console.log('Seeding branches...');
  const branchA = await prisma.branch.create({
    data: { name: 'Main Supermarket (Branch A)', location: 'Nairobi CBD' }
  });
  const branchB = await prisma.branch.create({
    data: { name: 'Wholesale Depot (Branch B)', location: 'Mombasa Road' }
  });
  const branchC = await prisma.branch.create({
    data: { name: 'Retail Shop (Branch C)', location: 'Westlands' }
  });

  console.log('Seeding users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Owner (Full Access)
  const owner = await prisma.user.create({
    data: {
      email: 'owner@smartpay.com',
      password: hashedPassword,
      name: 'Jane Doe (Owner)',
      role: 'OWNER'
    }
  });

  // Manager (Payroll + Reports)
  const manager = await prisma.user.create({
    data: {
      email: 'manager@smartpay.com',
      password: hashedPassword,
      name: 'John Miller (Manager)',
      role: 'MANAGER',
      branchId: branchA.id
    }
  });

  // Accountant (Payments)
  const accountant = await prisma.user.create({
    data: {
      email: 'accountant@smartpay.com',
      password: hashedPassword,
      name: 'Alice Wambui (Accountant)',
      role: 'ACCOUNTANT'
    }
  });

  console.log('Seeding employees...');
  const departments = ['Sales', 'Operations', 'Finance', 'Logistics', 'Security'];
  const paymentMethods = ['MPESA', 'BANK', 'AIRTEL'];
  
  const employeesData = [
    { fullName: 'David Kimani', position: 'Cashier', salary: 35000, dept: 'Sales', payMethod: 'MPESA', acc: '0712345678', branchId: branchA.id },
    { fullName: 'Mercy Achieng', position: 'Cashier', salary: 35000, dept: 'Sales', payMethod: 'MPESA', acc: '0723456789', branchId: branchA.id },
    { fullName: 'Peter Ndwiga', position: 'Shelf Stocker', salary: 28000, dept: 'Operations', payMethod: 'MPESA', acc: '0734567890', branchId: branchA.id },
    { fullName: 'Sarah Mwangi', position: 'Customer Care', salary: 32000, dept: 'Sales', payMethod: 'BANK', acc: '0110987654321', branchId: branchA.id },
    { fullName: 'James Omondi', position: 'Security Guard', salary: 25000, dept: 'Security', payMethod: 'MPESA', acc: '0745678901', branchId: branchA.id },
    
    { fullName: 'Mary Wanjiku', position: 'Supervisor', salary: 55000, dept: 'Operations', payMethod: 'BANK', acc: '0120123456789', branchId: branchA.id },
    { fullName: 'Joseph Kiprop', position: 'Driver', salary: 30000, dept: 'Logistics', payMethod: 'MPESA', acc: '0756789012', branchId: branchB.id },
    { fullName: 'Grace Mutua', position: 'Store Clerk', salary: 28000, dept: 'Operations', payMethod: 'MPESA', acc: '0767890123', branchId: branchB.id },
    { fullName: 'Kevin Otieno', position: 'Forklift Operator', salary: 35000, dept: 'Operations', payMethod: 'BANK', acc: '0130987654321', branchId: branchB.id },
    { fullName: 'Susan Kamau', position: 'Branch Manager', salary: 85000, dept: 'Finance', payMethod: 'BANK', acc: '0140123456789', branchId: branchB.id },
    
    { fullName: 'Charles Njoroge', position: 'Security Guard', salary: 25000, dept: 'Security', payMethod: 'MPESA', acc: '0778901234', branchId: branchB.id },
    { fullName: 'Faith Chepngetich', position: 'Cashier', salary: 35000, dept: 'Sales', payMethod: 'MPESA', acc: '0789012345', branchId: branchC.id },
    { fullName: 'Brian Mutiso', position: 'Shelf Stocker', salary: 28000, dept: 'Operations', payMethod: 'MPESA', acc: '0790123456', branchId: branchC.id },
    { fullName: 'Lucy Wairimu', position: 'Sales Representative', salary: 40000, dept: 'Sales', payMethod: 'BANK', acc: '0150987654321', branchId: branchC.id },
    { fullName: 'Paul Kipkemboi', position: 'Supervisor', salary: 50000, dept: 'Operations', payMethod: 'MPESA', acc: '0701234567', branchId: branchC.id },
    
    { fullName: 'Anne Nafula', position: 'Cleaner', salary: 20000, dept: 'Operations', payMethod: 'MPESA', acc: '0711122334', branchId: branchA.id },
    { fullName: 'George Maina', position: 'Receiving Clerk', salary: 32000, dept: 'Logistics', payMethod: 'MPESA', acc: '0722233445', branchId: branchA.id },
    { fullName: 'Emily Kendi', position: 'Inventory Analyst', salary: 45000, dept: 'Logistics', payMethod: 'BANK', acc: '0160123456789', branchId: branchB.id },
    { fullName: 'Robert Wafula', position: 'Loader', salary: 22000, dept: 'Operations', payMethod: 'AIRTEL', acc: '0733344556', branchId: branchB.id },
    { fullName: 'Irene Atieno', position: 'Accounts Clerk', salary: 48000, dept: 'Finance', payMethod: 'BANK', acc: '0170987654321', branchId: branchA.id }
  ];

  for (let i = 0; i < employeesData.length; i++) {
    const emp = employeesData[i];
    const empNum = `EMP${(i + 1).toString().padStart(3, '0')}`;
    const natId = `ID-${20000000 + i}`;
    const email = `${emp.fullName.toLowerCase().replace(' ', '.')}@smartpay-sme.com`;
    const phone = emp.payMethod === 'BANK' ? `07${Math.floor(10000000 + Math.random() * 90000000)}` : emp.acc;
    
    await prisma.employee.create({
      data: {
        employeeNumber: empNum,
        fullName: emp.fullName,
        nationalId: natId,
        phone: phone,
        email: email,
        department: emp.dept,
        position: emp.position,
        salary: emp.salary,
        employmentDate: '2025-01-15',
        paymentMethod: emp.payMethod,
        accountNumber: emp.acc,
        taxPin: `PIN-${1000000 + i}K`,
        status: 'ACTIVE',
        branchId: emp.branchId
      }
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
