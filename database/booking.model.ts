import { Schema, model, models, Document, Types } from 'mongoose';

// TypeScript interface for Booking document
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => {
          // Standard email validation regex
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true, // Auto-generate createdAt and updatedAt
  }
);

// Create index on eventId for faster queries when filtering by event
BookingSchema.index({ eventId: 1 });

/**
 * Pre-save hook to validate that the referenced event exists in the database.
 * This ensures referential integrity before creating a booking.
 */
BookingSchema.pre('save', async function (next) {
  // Only validate eventId if it's new or has been modified
  if (this.isNew || this.isModified('eventId')) {
    // Dynamically import Event model to avoid circular dependency
    const Event = models.Event || (await import('./event.model')).default;
    
    const eventExists = await Event.findById(this.eventId);
    
    if (!eventExists) {
      throw new Error(
        `Event with ID ${this.eventId} does not exist. Cannot create booking.`
      );
    }
  }

  next();
});

// Use existing model if available (prevents OverwriteModelError in development)
const Booking = models.Booking || model<IBooking>('Booking', BookingSchema);

export default Booking;
