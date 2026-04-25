import bcrypt from "bcryptjs";
import mongoose, { Document, Model, Schema } from "mongoose";
import { ACCOUNT_STATUS, USER_TYPES } from "../../constants/status.js";

/**
 * 👤 User Model
 * Optimized with indexes and pre-save hooks.
 */

export interface IUser extends Document {
  name: string;
  email: string;
  userName: string;
  isActive: boolean;
  status: typeof ACCOUNT_STATUS[keyof typeof ACCOUNT_STATUS];
  userType: typeof USER_TYPES[keyof typeof USER_TYPES];
  password: string;
  lastLogin: Date | null;
  isEmailVerified: boolean;
  otp: string | null;
  otpExpires: Date | null;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Critical for performance
    },
    userName: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      sparse: true,
      index: true, // Frequently queried
    },
    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ACCOUNT_STATUS),
      default: ACCOUNT_STATUS.PENDING,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Don't return password by default
    },
    userType: {
      type: String,
      enum: Object.values(USER_TYPES),
      default: USER_TYPES.USER,
      index: true,
    },
    // ... other fields
    phone: String,
    avatar: String,
  },
  { timestamps: true, versionKey: false }
);

// Compound index for dashboard/analytics optimization
userSchema.index({ status: 1, createdAt: -1 });

userSchema.pre<IUser>("save", async function () {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);
