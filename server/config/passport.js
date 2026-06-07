import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from "../models/User.js"

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value;

        if (!email) return done(new Error('No email from Google'), null);

        const userByGoogleId = await User.findOne({ googleId: profile.id });
        if (userByGoogleId) return done(null, userByGoogleId);

        const userByEmail = await User.findOne({ email });
        if (userByEmail) {
            userByEmail.googleId = profile.id;
            await userByEmail.save();
            return done(null, userByEmail);
        }

        const newUser = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email,
            avatar
        });
        return done(null, newUser);
    } catch (error) {
        done(error, null);
    }
}));

export default passport;