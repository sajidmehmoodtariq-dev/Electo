import Election from '../models/Election.js';

// @desc    Create a new election
// @route   POST /api/elections
// @access  Private/Official
const createElection = async (req, res) => {
    try {
        const { title, type, date } = req.body;

        const electionDate = new Date(date);
        const year = electionDate.getFullYear();

        // Automatic Time: 8:00 AM to 5:00 PM
        const startTime = new Date(electionDate);
        startTime.setHours(8, 0, 0, 0);

        const endTime = new Date(electionDate);
        endTime.setHours(17, 0, 0, 0);

        const election = await Election.create({
            title,
            type,
            date: electionDate,
            year,
            startTime,
            endTime,
            candidates: []
        });

        res.status(201).json(election);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all elections
// @route   GET /api/elections
// @access  Private
const getElections = async (req, res) => {
    try {
        const elections = await Election.find({});
        res.json(elections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add candidate to election
// @route   POST /api/elections/:id/candidates
// @access  Private/Official
const addCandidate = async (req, res) => {
    try {
        const { name, party } = req.body;
        const election = await Election.findById(req.params.id);

        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        const photo = req.file ? req.file.path : null; // Multer will handle file upload

        if (!photo) {
            return res.status(400).json({ message: 'Candidate photo is required' });
        }

        const newCandidate = {
            name,
            party,
            photo,
        };

        election.candidates.push(newCandidate);
        await election.save();

        res.status(201).json(election);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export { createElection, getElections, addCandidate };
