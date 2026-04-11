import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { ACCOUNT_STATUS, USER_TYPES } from "../../constants/status.js";

export interface IAdmin extends Document {
  name: string;
  email: string;
  userName: string;
  password: string;
  lastLogin: Date | null;
  isEmailVerified: boolean;
  otp: string | null;
  otpExpires: Date | null;
  userType: typeof USER_TYPES[keyof typeof USER_TYPES];
  status: typeof ACCOUNT_STATUS[keyof typeof ACCOUNT_STATUS];
  isActive: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const adminSchema: Schema<IAdmin> = new mongoose.Schema(
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
      match: /^\S+@\S+\.\S+$/,
    },
    userName: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      sparse: true,
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
      default: USER_TYPES.ADMIN,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ACCOUNT_STATUS),
      default: ACCOUNT_STATUS.ACTIVE,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

// 🔥 1. Password Hashing & Username Generation
adminSchema.pre<IAdmin>("save", async function () {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // 🔥 Auto-generate userName if missing
  if (!this.userName) {
    const emailPrefix = this.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const suffix = this._id.toString().slice(-6);
    this.userName = `${emailPrefix}_${suffix}`;
  }
});

// 🔥 2. Compare Password Method
adminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const AdminModels: Model<IAdmin> = mongoose.model<IAdmin>("Admin", adminSchema);

export { AdminModels };