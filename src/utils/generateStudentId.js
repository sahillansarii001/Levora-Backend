import prisma from '../config/prisma.js';

const generateStudentId = async () => {
  const year = new Date().getFullYear();
  const lastStudent = await prisma.student.findFirst({
    orderBy: { createdAt: 'desc' }
  });

  let sequence = 1;
  if (lastStudent && lastStudent.studentId && lastStudent.studentId.includes('-')) {
    const parts = lastStudent.studentId.split('-');
    if (parts.length >= 3) {
      const lastSeq = parseInt(parts[2]);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }
  }

  return `LVR-${year}-${String(sequence).padStart(4, '0')}`;
};

export default generateStudentId;
