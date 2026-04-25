import mongoose, { Document, Schema } from "mongoose";

/**
 * 📄 Content Model (Static pages like Terms, Privacy, etc.)
 */

export interface IContent extends Document {
  key: string;
  title: string;
  content: string;
}

const contentSchema: Schema<IContent> = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export const Content = mongoose.model<IContent>("Content", contentSchema);
