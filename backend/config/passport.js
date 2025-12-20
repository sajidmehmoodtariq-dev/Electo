import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });
                if (user) return done(null, user);

                user = await User.findOne({ email: profile.emails[0].value });
                if (user) {
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        user.avatar = profile.photos[0].value;
                        await user.save();
                    }
                    return done(null, user);
                }

                const newUser = await User.create({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    avatar: profile.photos[0].value,
                    role: 'voter',
                    status: 'pending',
                });
                done(null, newUser);
            } catch (err) {
                console.error(err);
                done(err, null);
            }
        }
    )
);

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: '/api/auth/github/callback',
            scope: ['user:email'],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ githubId: profile.id });
                if (user) return done(null, user);

                const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

                if (email) {
                    user = await User.findOne({ email });
                    if (user) {
                        if (!user.githubId) {
                            user.githubId = profile.id;
                            if (!user.avatar) user.avatar = profile.photos[0].value;
                            await user.save();
                        }
                        return done(null, user);
                    }
                }

                const newUser = await User.create({
                    githubId: profile.id,
                    name: profile.displayName || profile.username,
                    email: email || `github_${profile.id}@noemail.com`,
                    avatar: profile.photos[0].value,
                    role: 'voter',
                    status: 'pending',
                });
                done(null, newUser);
            } catch (err) {
                done(err, null);
            }
        }
    )
);

// Serialize/Deserialize not strictly needed for JWT stateless auth, 
// but Passport might use it if we used sessions. 
// We will use JWT, so we might not need session support, but good to have stubs.
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

export default passport;
