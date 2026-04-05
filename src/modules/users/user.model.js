import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { ACCOUNT_STATUS, USER_TYPES } from "../../constants/status.js";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 20,
        match: /^[a-zA-Z0-9_]+$/
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please use a valid email"]
    },
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    isActive: {
        type: Boolean,
        default: false,
        index: true
    },
    status: {
        type: String,
        enum: Object.values(ACCOUNT_STATUS),
        default: ACCOUNT_STATUS.PENDING,
        index: true
    },
    userType: {
        type: String,
        enum: [USER_TYPES.USER, USER_TYPES.GUEST],
        default: USER_TYPES.USER,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    },
    userType: {
        type: String,
        enum: Object.values(USER_TYPES),
        default: USER_TYPES.USER,
        index: true
    }
}, { timestamps: true, versionKey: false })

// Compound index for filtering by status + isActive together
userSchema.index({ status: 1, isActive: 1 });

userSchema.pre("save", async function () {
    if (this.isModified("email")) {
        this.email = this.email.toLowerCase().trim();
    }

    if (this.isModified("userName")) {
        this.userName = this.userName.toLowerCase().trim();
    }

    if (this.isModified("isActive")) {
        this.status = this.isActive ? "active" : "inactive";
    }

    if (this.isModified("password")) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(this.password)) {
            throw new Error("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character");
        }
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const UserModels = mongoose.model("User", userSchema)

export {
    UserModels
}