import bcrypt from "bcryptjs";
import mongoose, { Document, Model, Schema } from "mongoose";
import { ACCOUNT_STATUS, USER_TYPES } from "../../constants/status.js";

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
      match: /^[a-zA-Z0-9_]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email"],
    },
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
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
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    userType: {
      type: String,
      enum: Object.values(USER_TYPES),
      default: USER_TYPES.USER,
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

// Compound index for filtering by status + isActive together
userSchema.index({ status: 1, isActive: 1 });

userSchema.pre<IUser>("save", async function (next: any) {
  if (this.isModified("email")) {
    this.email = this.email.toLowerCase().trim();
  }

  if (this.isModified("userName")) {
    this.userName = this.userName.toLowerCase().trim();
  }

  if (this.isModified("password")) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(this.password)) {
      return next(
        new Error(
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        )
      );
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const UserModels: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export { UserModels };