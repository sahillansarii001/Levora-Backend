import mongoose from 'mongoose';

const schema = new mongoose.Schema({}, { strict: false, timestamps: true });

const Testimonial = mongoose.models.Testimonial || mongoose.model('Testimonial', schema);

export default Testimonial;
