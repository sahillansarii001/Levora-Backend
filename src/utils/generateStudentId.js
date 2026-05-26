import Student from '../models/Student.js';

const generateStudentId = async () => {
  const year = new Date().getFullYear();
  const lastStudent = await Student.findOne().sort({ createdAt: -1 });

  let sequence = 1;
  if (lastStudent && lastStudent.studentId) {
    const lastSeq = parseInt(lastStudent.studentId.split('-')[2]);
    sequence = lastSeq + 1;
  }

  return `LVR-${year}-${String(sequence).padStart(4, '0')}`;
};

export default generateStudentId;
