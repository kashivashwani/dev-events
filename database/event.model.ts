import { Schema, model, models, Document } from 'mongoose';

// TypeScript interface for Event document
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // Stored in ISO format
  time: string; // Stored in HH:MM format
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      enum: ['online', 'offline', 'hybrid'],
      lowercase: true,
      trim: true,
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'Agenda must contain at least one item',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'Tags are required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'Tags must contain at least one item',
      },
    },
  },
  {
    timestamps: true, // Auto-generate createdAt and updatedAt
  }
);

// Create unique index on slug for faster lookups and uniqueness enforcement
EventSchema.index({ slug: 1 }, { unique: true });

/**
 * Pre-save hook to:
 * 1. Generate URL-friendly slug from title (only if title is new or modified)
 * 2. Normalize date to ISO format (YYYY-MM-DD)
 * 3. Normalize time to consistent HH:MM format
 */
EventSchema.pre('save', async function (next) {
  // Only regenerate slug if title has changed
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Trim hyphens from start and end

    // Ensure slug uniqueness by appending timestamp if needed
    if (!this.isNew) {
      const existingEvent = await models.Event.findOne({
        slug: this.slug,
        _id: { $ne: this._id },
      });
      if (existingEvent) {
        this.slug = `${this.slug}-${Date.now()}`;
      }
    }
  }

  // Normalize date to ISO format (YYYY-MM-DD)
  if (this.isModified('date')) {
    const dateObj = new Date(this.date);
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date format. Please provide a valid date.');
    }
    this.date = dateObj.toISOString().split('T')[0];
  }

  // Normalize time to HH:MM format
  if (this.isModified('time')) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    const timeMatch = this.time.match(timeRegex);
    
    if (!timeMatch) {
      throw new Error('Invalid time format. Please use HH:MM format (e.g., 14:30).');
    }
    
    // Ensure consistent two-digit format (e.g., 9:30 becomes 09:30)
    const [hours, minutes] = timeMatch.slice(1);
    this.time = `${hours.padStart(2, '0')}:${minutes}`;
  }

  next();
});

// Use existing model if available (prevents OverwriteModelError in development)
const Event = models.Event || model<IEvent>('Event', EventSchema);

export default Event;
