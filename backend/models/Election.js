import mongoose from 'mongoose';

const candidateSchema = mongoose.Schema({
    name: { type: String, required: true },
    party: { type: String, required: true },
    photo: { type: String, required: true }, // URL to stored image
    voteCount: { type: Number, default: 0 }
});

const electionSchema = mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, required: true }, // e.g., 'National', 'City Wide'
    date: { type: Date, required: true },
    year: { type: Number, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    candidates: [candidateSchema],
    targetCity: { type: String }, // Required if type is 'City' (or 'City Wide')
    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Track who voted
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field for 'status'
electionSchema.virtual('status').get(function () {
    const now = new Date();
    if (now < this.startTime) return 'Upcoming';
    if (now >= this.startTime && now <= this.endTime) return 'Active';
    return 'Completed';
});

const Election = mongoose.model('Election', electionSchema);

export default Election;
