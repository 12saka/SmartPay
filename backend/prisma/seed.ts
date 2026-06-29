import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.notification.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.walletTransaction.deleteMany({});
  await prisma.wallet.deleteMany({});
  await prisma.performanceReview.deleteMany({});
  await prisma.attendanceRecord.deleteMany({});
  await prisma.leaveRecord.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.payrollRun.deleteMany({});
  await prisma.salaryAdvance.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.branch.deleteMany({});

  console.log('Seeding branches...');
  const branchA = await prisma.branch.create({
    data: { name: 'Nairobi CBD Branch', location: 'Nairobi CBD' }
  });
  const branchB = await prisma.branch.create({
    data: { name: 'Nakuru Branch', location: 'Nakuru Town' }
  });
  const branchC = await prisma.branch.create({
    data: { name: 'Eldoret Depot', location: 'Eldoret CBD' }
  });
  const branchD = await prisma.branch.create({
    data: { name: 'Kisumu Outlet', location: 'Kisumu Lakeside' }
  });

  console.log('Seeding users...');
  const hashedPassword = await argon2.hash('password123');

  // Owner (Full Access)
  const owner = await prisma.user.create({
    data: {
      email: 'owner@smartpay.com',
      password: hashedPassword,
      name: 'Jane Doe (CEO)',
      role: 'OWNER',
      status: 'ACTIVE',
      twoFactorEnabled: true,
      lastLoginIp: '192.168.1.15',
      lastLoginDevice: 'MacBook Pro'
    }
  });

  // Manager (Payroll + Reports)
  const manager = await prisma.user.create({
    data: {
      email: 'manager@smartpay.com',
      password: hashedPassword,
      name: 'John Miller (Manager)',
      role: 'MANAGER',
      status: 'ACTIVE',
      branchId: branchA.id,
      twoFactorEnabled: false,
      lastLoginIp: '192.168.10.42',
      lastLoginDevice: 'Windows Desktop'
    }
  });

  // Accountant (Payments)
  const accountant = await prisma.user.create({
    data: {
      email: 'accountant@smartpay.com',
      password: hashedPassword,
      name: 'Alice Wambui (Accountant)',
      role: 'ACCOUNTANT',
      status: 'ACTIVE',
      twoFactorEnabled: false,
      lastLoginIp: '192.168.5.110',
      lastLoginDevice: 'Dell Latitude Laptop'
    }
  });

  console.log('Seeding wallets...');
  const mpesaWallet = await prisma.wallet.create({
    data: {
      type: 'MPESA',
      balance: 1545000.0,
      floatBalance: 2500000.0,
      currency: 'KES'
    }
  });

  const bankWallet = await prisma.wallet.create({
    data: {
      type: 'BANK',
      balance: 3820000.0,
      floatBalance: 5000000.0,
      currency: 'KES'
    }
  });

  console.log('Seeding wallet transactions...');
  await prisma.walletTransaction.create({
    data: {
      walletId: mpesaWallet.id,
      amount: 1500000,
      type: 'DEPOSIT',
      reference: 'MPESA-DEP-9923812',
      status: 'COMPLETED',
      timestamp: new Date(Date.now() - 3600000 * 24 * 5)
    }
  });
  await prisma.walletTransaction.create({
    data: {
      walletId: bankWallet.id,
      amount: 4000000,
      type: 'DEPOSIT',
      reference: 'BANK-DEP-8849103',
      status: 'COMPLETED',
      timestamp: new Date(Date.now() - 3600000 * 24 * 7)
    }
  });

  console.log('Seeding employees with advanced records...');
  const employeesData = [
    { fullName: 'David Kimani', position: 'Cashier', salary: 35000, dept: 'Sales', payMethod: 'MPESA', acc: '0712345678', branchId: branchA.id, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { fullName: 'Mercy Achieng', position: 'Cashier', salary: 35000, dept: 'Sales', payMethod: 'MPESA', acc: '0723456789', branchId: branchA.id, photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    { fullName: 'Peter Ndwiga', position: 'Shelf Stocker', salary: 28000, dept: 'Operations', payMethod: 'MPESA', acc: '0734567890', branchId: branchA.id, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    { fullName: 'Sarah Mwangi', position: 'Customer Care', salary: 32000, dept: 'Sales', payMethod: 'BANK', acc: '0110987654321', branchId: branchA.id, photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    { fullName: 'James Omondi', position: 'Security Guard', salary: 25000, dept: 'Security', payMethod: 'MPESA', acc: '0745678901', branchId: branchA.id, photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
    
    { fullName: 'Mary Wanjiku', position: 'Supervisor', salary: 55000, dept: 'Operations', payMethod: 'BANK', acc: '0120123456789', branchId: branchA.id, photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
    { fullName: 'Joseph Kiprop', position: 'Driver', salary: 30000, dept: 'Logistics', payMethod: 'MPESA', acc: '0756789012', branchId: branchB.id, photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150' },
    { fullName: 'Grace Mutua', position: 'Store Clerk', salary: 28000, dept: 'Operations', payMethod: 'MPESA', acc: '0767890123', branchId: branchB.id, photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
    { fullName: 'Kevin Otieno', position: 'Forklift Operator', salary: 35000, dept: 'Operations', payMethod: 'BANK', acc: '0130987654321', branchId: branchB.id, photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150' },
    { fullName: 'Susan Kamau', position: 'Branch Manager', salary: 85000, dept: 'Finance', payMethod: 'BANK', acc: '0140123456789', branchId: branchB.id, photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' },
    
    { fullName: 'Charles Njoroge', position: 'Security Guard', salary: 25000, dept: 'Security', payMethod: 'MPESA', acc: '0778901234', branchId: branchB.id, photo: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150' },
    { fullName: 'Faith Chepngetich', position: 'Cashier', salary: 35000, dept: 'Sales', payMethod: 'MPESA', acc: '0789012345', branchId: branchC.id, photo: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150' },
    { fullName: 'Brian Mutiso', position: 'Shelf Stocker', salary: 28000, dept: 'Operations', payMethod: 'MPESA', acc: '0790123456', branchId: branchC.id, photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150' },
    { fullName: 'Lucy Wairimu', position: 'Sales Representative', salary: 40000, dept: 'Sales', payMethod: 'BANK', acc: '0150987654321', branchId: branchC.id, photo: 'https://images.unsplash.com/photo-1554784790-3349076127e4?w=150' },
    { fullName: 'Paul Kipkemboi', position: 'Supervisor', salary: 50000, dept: 'Operations', payMethod: 'MPESA', acc: '0701234567', branchId: branchC.id, photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
    
    { fullName: 'Anne Nafula', position: 'Cleaner', salary: 20000, dept: 'Operations', payMethod: 'MPESA', acc: '0711122334', branchId: branchD.id, photo: 'https://images.unsplash.com/photo-1561406636-b8029a7a81cf?w=150' },
    { fullName: 'George Maina', position: 'Receiving Clerk', salary: 32000, dept: 'Logistics', payMethod: 'MPESA', acc: '0722233445', branchId: branchD.id, photo: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150' },
    { fullName: 'Emily Kendi', position: 'Inventory Analyst', salary: 45000, dept: 'Logistics', payMethod: 'BANK', acc: '0160123456789', branchId: branchB.id, photo: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=150' },
    { fullName: 'Robert Wafula', position: 'Loader', salary: 22000, dept: 'Operations', payMethod: 'AIRTEL', acc: '0733344556', branchId: branchB.id, photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150' },
    { fullName: 'Irene Atieno', position: 'Accounts Clerk', salary: 48000, dept: 'Finance', payMethod: 'BANK', acc: '0170987654321', branchId: branchA.id, photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150' }
  ];

  for (let i = 0; i < employeesData.length; i++) {
    const emp = employeesData[i];
    const empNum = `EMP${(i + 1).toString().padStart(3, '0')}`;
    const natId = `ID-${20000000 + i}`;
    const email = `${emp.fullName.toLowerCase().replace(' ', '.')}@smartpay.com`;
    const phone = emp.payMethod === 'BANK' ? `07${Math.floor(10000000 + Math.random() * 90000000)}` : emp.acc;
    
    const createdEmployee = await prisma.employee.create({
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
        taxPin: `PIN-A00${1234567 + i}Z`,
        status: 'ACTIVE',
        branchId: emp.branchId,
        passportPhoto: emp.photo,
        nssfNumber: `NSSF-${2234000 + i}`,
        nhifNumber: `NHIF-${9988100 + i}`,
        housingLevy: true,
        employmentType: i % 4 === 0 ? 'CONTRACT' : 'FULL_TIME',
        bankAccount: emp.payMethod === 'BANK' ? emp.acc : `ACC-${5544320 + i}`,
        mpesaNumber: emp.payMethod === 'MPESA' ? emp.acc : `07${Math.floor(10000000 + Math.random() * 90000000)}`,
        emergencyContacts: 'Parent: Jane Mwangi - 0711111222'
      }
    });

    // Create corresponding User account so they can log in
    await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        name: emp.fullName,
        role: 'EMPLOYEE',
        status: 'ACTIVE',
        branchId: emp.branchId,
        twoFactorEnabled: false
      }
    });

    // Seed Documents
    await prisma.document.create({
      data: {
        name: 'Employment Contract',
        url: '/docs/contract_' + createdEmployee.id + '.pdf',
        category: 'CONTRACT',
        employeeId: createdEmployee.id
      }
    });
    await prisma.document.create({
      data: {
        name: 'National ID Copy',
        url: '/docs/national_id_' + createdEmployee.id + '.pdf',
        category: 'ID',
        employeeId: createdEmployee.id
      }
    });

    // Seed Attendance Records
    const dates = ['2026-06-05', '2026-06-06', '2026-06-07', '2026-06-08'];
    for (const date of dates) {
      const isLate = Math.random() > 0.8;
      await prisma.attendanceRecord.create({
        data: {
          date,
          checkIn: isLate ? '08:45' : '07:55',
          checkOut: '17:05',
          status: isLate ? 'LATE' : 'PRESENT',
          overtime: Math.random() > 0.5 ? 2.0 : 0.0,
          employeeId: createdEmployee.id
        }
      });
    }

    // Seed Leave Records
    if (i % 6 === 0) {
      await prisma.leaveRecord.create({
        data: {
          type: 'ANNUAL',
          startDate: '2026-06-12',
          endDate: '2026-06-19',
          status: 'APPROVED',
          employeeId: createdEmployee.id
        }
      });
    }

    // Seed Performance Reviews
    if (i % 3 === 0) {
      await prisma.performanceReview.create({
        data: {
          reviewDate: '2026-05-30',
          rating: 4 + (i % 2),
          notes: 'Excellent output, dependable team player.',
          employeeId: createdEmployee.id
        }
      });
    }
  }

  console.log('Seeding audit logs...');
  await prisma.auditLog.create({
    data: {
      userId: owner.id,
      userName: owner.name,
      action: 'LOGIN',
      details: 'CEO logged in from MacBook Pro',
      ipAddress: '192.168.1.15',
      deviceDetails: 'MacBook Pro Core i9'
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: manager.id,
      userName: manager.name,
      action: 'APPROVE_ADVANCE',
      details: 'Approved salary advance request of KES 15,000 for David Kimani',
      ipAddress: '192.168.10.42',
      deviceDetails: 'Windows Chrome Browser'
    }
  });

  console.log('Seeding notifications...');
  const categories = ['PAYROLL', 'EMPLOYEE', 'FINANCE', 'COMPLIANCE', 'SYSTEM'];
  for (let i = 0; i < 8; i++) {
    await prisma.notification.create({
      data: {
        userId: null,
        title: i % 2 === 0 ? 'Filing Deadline Approaching' : 'New Employee Registered',
        message: i % 2 === 0 
          ? 'NHIF statutory return filing for May is due in 3 days.' 
          : 'Employee EMP018 (Emily Kendi) was successfully onboarded.',
        category: categories[i % categories.length],
        status: i < 3 ? 'UNREAD' : 'READ',
        createdAt: new Date(Date.now() - 3600000 * i)
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
