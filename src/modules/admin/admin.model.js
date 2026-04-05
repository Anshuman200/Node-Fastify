import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ACCOUNT_STATUS, USER_TYPES } from "../../constants/status.js";

const adminSchema = new mongoose.Schema({
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
        match: /^\S+@\S+\.\S+$/
    },
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
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
        default: USER_TYPES.ADMIN,
        index: true
    },
    status: {
        type: String,
        enum: Object.values(ACCOUNT_STATUS),
        default: ACCOUNT_STATUS.ACTIVE,
        index: true
    },
    isActive: {
        type: Boolean,
        default: false,
        index: true
    }
}, { timestamps: true, versionKey: false })

// 🔥 1. Password Hashing
adminSchema.pre("save", async function () {
    if (this.isModified("password")) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

// 🔥 2. Compare Password Method
adminSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const AdminModels = mongoose.model("Admin", adminSchema)

export {
    AdminModels
}