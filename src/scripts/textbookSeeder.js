import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import StudyMaterial from '../models/StudyMaterial.js';

const syllabus = [
  {
    className: '9th',
    subjects: [
      {
        name: 'Mathematics',
        chapters: ['Number Systems', 'Polynomials', 'Coordinate Geometry', 'Linear Equations in Two Variables', 'Introduction to Euclid\'s Geometry', 'Lines and Angles', 'Triangles', 'Quadrilaterals', 'Circles', 'Heron\'s Formula', 'Surface Areas and Volumes', 'Statistics']
      },
      {
        name: 'Science',
        chapters: ['Matter in Our Surroundings', 'Is Matter Around Us Pure', 'Atoms and Molecules', 'Structure of the Atom', 'The Fundamental Unit of Life', 'Tissues', 'Motion', 'Force and Laws of Motion', 'Gravitation', 'Work and Energy', 'Sound', 'Improvement in Food Resources']
      }
    ]
  },
  {
    className: '10th',
    subjects: [
      {
        name: 'Mathematics',
        chapters: ['Real Numbers', 'Polynomials', 'Pair of Linear Equations in Two Variables', 'Quadratic Equations', 'Arithmetic Progressions', 'Triangles', 'Coordinate Geometry', 'Introduction to Trigonometry', 'Some Applications of Trigonometry', 'Circles', 'Areas Related to Circles', 'Surface Areas and Volumes', 'Statistics', 'Probability']
      },
      {
        name: 'Science',
        chapters: ['Chemical Reactions and Equations', 'Acids, Bases and Salts', 'Metals and Non-metals', 'Carbon and its Compounds', 'Life Processes', 'Control and Coordination', 'How do Organisms Reproduce?', 'Heredity', 'Light - Reflection and Refraction', 'The Human Eye and the Colourful World', 'Electricity', 'Magnetic Effects of Electric Current', 'Our Environment']
      }
    ]
  },
  {
    className: '11th',
    subjects: [
      {
        name: 'Physics',
        chapters: ['Physical World', 'Units and Measurements', 'Motion in a Straight Line', 'Motion in a Plane', 'Laws of Motion', 'Work, Energy and Power', 'System of Particles and Rotational Motion', 'Gravitation', 'Mechanical Properties of Solids', 'Mechanical Properties of Fluids', 'Thermal Properties of Matter', 'Thermodynamics', 'Kinetic Theory', 'Oscillations', 'Waves']
      },
      {
        name: 'Mathematics',
        chapters: ['Sets', 'Relations and Functions', 'Trigonometric Functions', 'Principle of Mathematical Induction', 'Complex Numbers and Quadratic Equations', 'Linear Inequalities', 'Permutations and Combinations', 'Binomial Theorem', 'Sequence and Series', 'Straight Lines', 'Conic Sections', 'Introduction to Three Dimensional Geometry', 'Limits and Derivatives', 'Mathematical Reasoning', 'Statistics', 'Probability']
      }
    ]
  },
  {
    className: '12th',
    subjects: [
      {
        name: 'Physics',
        chapters: ['Electric Charges and Fields', 'Electrostatic Potential and Capacitance', 'Current Electricity', 'Moving Charges and Magnetism', 'Magnetism and Matter', 'Electromagnetic Induction', 'Alternating Current', 'Electromagnetic Waves', 'Ray Optics and Optical Instruments', 'Wave Optics', 'Dual Nature of Radiation and Matter', 'Atoms', 'Nuclei', 'Semiconductor Electronics']
      },
      {
        name: 'Mathematics',
        chapters: ['Relations and Functions', 'Inverse Trigonometric Functions', 'Matrices', 'Determinants', 'Continuity and Differentiability', 'Application of Derivatives', 'Integrals', 'Application of Integrals', 'Differential Equations', 'Vector Algebra', 'Three Dimensional Geometry', 'Linear Programming', 'Probability']
      }
    ]
  }
];

const seedTextbooks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const materials = [];

    syllabus.forEach(cls => {
      cls.subjects.forEach(subject => {
        subject.chapters.forEach((chapter, index) => {
          // Free NCERT Textbook PDF
          materials.push({
            title: `NCERT Textbook - ${chapter}`,
            className: cls.className,
            subject: subject.name,
            lesson: `Chapter ${index + 1}: ${chapter}`,
            board: 'CBSE',
            category: 'textbook',
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Mock PDF
            originalFilename: `${chapter}_Textbook.pdf`,
            isPremium: false,
          });

          // Premium Levora Notes
          materials.push({
            title: `Levora Premium Notes - ${chapter}`,
            className: cls.className,
            subject: subject.name,
            lesson: `Chapter ${index + 1}: ${chapter}`,
            board: 'CBSE',
            category: 'notes',
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Mock PDF
            originalFilename: `${chapter}_Premium_Notes.pdf`,
            isPremium: true,
          });
        });
      });
    });

    console.log(`Clearing old textbooks & notes...`);
    await StudyMaterial.deleteMany({ category: { $in: ['textbook', 'notes'] } });

    console.log(`Inserting ${materials.length} records...`);
    await StudyMaterial.insertMany(materials);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeder Error:', error);
    process.exit(1);
  }
};

seedTextbooks();
