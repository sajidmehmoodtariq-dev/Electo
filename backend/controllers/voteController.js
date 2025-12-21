import Election from '../models/Election.js';
import User from '../models/User.js';

// @desc    Cast a vote
// @route   PUT /api/elections/:id/vote
// @access  Private/Voter
const castVote = async (req, res) => {
    try {
        const { candidateId } = req.body;
        const electionId = req.params.id;
        const userId = req.user._id;

        const election = await Election.findById(electionId);
        const user = await User.findById(userId);

        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        // 1. Check Status
        // Re-calculate status just in case
        const now = new Date();
        const isActive = now >= election.startTime && now <= election.endTime;

        if (!isActive) {
            return res.status(400).json({ message: 'Election is not active' });
        }

        // 2. Check Eligibility
        if (election.type === 'City' || election.type === 'City Wide') {
            if (election.targetCity && election.targetCity !== user.city) {
                return res.status(403).json({ message: `You are not eligible. This election is for ${election.targetCity} residents only.` });
            }
        }

        // 3. Check if already voted
        const alreadyVoted = election.voters.includes(userId);
        if (alreadyVoted) {
            return res.status(400).json({ message: 'You have already voted in this election' });
        }

        // 4. Update Vote Count
        const candidate = election.candidates.id(candidateId);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        candidate.voteCount = (candidate.voteCount || 0) + 1;

        // 5. Add user to voters list
        election.voters.push(userId);

        // 6. Mark user as voted (globally? optional, but maybe for specific election)
        // We already track in election.voters.

        await election.save();

        res.json({ message: 'Vote allocated successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { castVote };
