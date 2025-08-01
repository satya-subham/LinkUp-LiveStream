import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import jwt from 'jsonwebtoken'
import { createStreamUser } from "../lib/stream.js";

export async function signup (req, res) {
    const { email, password, fullName} = req.body;

    try {
        if(!email || !password || !fullName){
            return res.status(400).json({ message: "All fields are required"});
        }

        if(password.length < 6){
            return res.status(400).json({ message: "Password must be at least 6 characters" })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }


        const existingUser = await User.findOne({ email });

        if(existingUser){
            return res.status(400).json({ message: "Email already existed, please use a different one" })
        }

        const idx = Math.floor(Math.random() * 100) + 1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`

        const newUser = await User.create({
            email,
            fullName,
            password,
            profilePic: randomAvatar
        });


        // TODO: CREATE THE USER STREAM AS WELL
        try {
            await createStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullName,
                image: newUser.profilePic || ""
            });

            console.log(`Stream user created for ${newUser.fullName}`)
        } catch (error) {
            console.log("Error creating stream user", error);
        }

        const token = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET_KEY, {
            expiresIn: '7d'
        });

        res.cookie("token", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        });


        res.status(201).json({ success: true, user: newUser });

    } catch (error) {
        console.log("Error in signup controller");
        res.status(500).json({ message: "Internal server error" });
    }
};


export async function login (req, res) {
    try {
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isPasswordCorrect = await user.matchPassword(password);
        if(!isPasswordCorrect){
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET_KEY, {
            expiresIn: '7d'
        });

        res.cookie("token", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        });

        res.status(200).json({ success: true, user });

    } catch (error) {
        console.log("Error in login controller");
        res.status(500).json({ message: "Internal server error" });
    }
};

export function logout (req, res) {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logout successfully" });
};

export async function onboard(req, res) {
    try {
        const userId = req.user._id;
        const {fullName, bio, nativeLanguage, learningLanguage, location} = req.body;

        if(!fullName || !bio || !nativeLanguage || !learningLanguage || !location){
            return res.status(400).json({
                message: "All fields are required",
                missingFlieds: [
                    !fullName && "fullName",
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location"
                ].filter(Boolean)
            })
        }


        const updatedUser = await User.findByIdAndUpdate(userId, {
            ...req.body,
            isOnboarded: true
        },{new: true});

        if(!updatedUser){
            return res.status(404).json({message: "User not found"});
        }

        // TODO: UPDATE THE USER INFO ON STREAM
        try {
            await createStreamUser({
                id: updatedUser._id.toString(),
                name: updatedUser.fullName,
                image: updatedUser.profilePic || ""
            });

           console.log(`Stream user updated after onboarding for ${updatedUser.fullName}`)
        } catch (StreamError) {
            console.log("Error updating stream user during onboarding", StreamError.message);
        }

        res.status(200).json({success: true, updatedUser});
    } catch (error) {
        console.log("Error in onboarding controller");
        res.status(500).json({ message: "Internal server error" });
    }
}