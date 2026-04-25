import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { ACCOUNT_STATUS, USER_TYPES } from "../../constants/status.js";

/**
 * 👑 Admin Model
 */

export interface IAdmin extends Document {
  name: string;
  email: string;
  userName: string;
  password: string;
  userType: typeof USER_TYPES[keyof typeof USER_TYPES];
  status: typeof ACCOUNT_STATUS[keyof typeof ACCOUNT_STATUS];
  isActive: boolean;
  isEmailVerified: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const adminSchema: Schema<IAdmin> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    userName: {
      type: String,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
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
      default: true,
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

adminSchema.pre<IAdmin>("save", async function () {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

adminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const Admin = mongoose.model<IAdmin>("Admin", adminSchema);
