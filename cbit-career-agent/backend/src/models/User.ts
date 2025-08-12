import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User as UserType, CBIT_DEPARTMENTS, CBIT_YEARS } from '../../../shared/src/types';

export interface UserDocument extends UserType, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  toJSON(): any;
}

const userSchema = new Schema<UserDocument>({
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(value: string) {
        return /^1601\d{6}$/.test(value);
      },
      message: 'Roll number must start with 1601 and be exactly 10 digits'
    }
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(value: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: 'Please enter a valid email address'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    validate: {
      validator: function(value: string) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: {
      values: CBIT_DEPARTMENTS,
      message: 'Please select a valid department'
    }
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    enum: {
      values: CBIT_YEARS,
      message: 'Please select a valid year (1-4)'
    }
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(value: string) {
        if (!value) return true; // Optional field
        return /^[6-9]\d{9}$/.test(value);
      },
      message: 'Please enter a valid 10-digit phone number'
    }
  },
  telegramUsername: {
    type: String,
    trim: true,
    validate: {
      validator: function(value: string) {
        if (!value) return true; // Optional field
        return /^@?[a-zA-Z0-9_]{5,32}$/.test(value);
      },
      message: 'Please enter a valid Telegram username'
    }
  },
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    telegram: {
      type: Boolean,
      default: false
    },
    sms: {
      type: Boolean,
      default: false
    },
    whatsapp: {
      type: Boolean,
      default: false
    },
    jobAlerts: {
      type: Boolean,
      default: true
    },
    deadlineReminders: {
      type: Boolean,
      default: true
    },
    interviewReminders: {
      type: Boolean,
      default: true
    }
  },
  savedSearches: [{
    type: Schema.Types.ObjectId,
    ref: 'SavedSearch'
  }],
  savedJobs: [{
    type: Schema.Types.ObjectId,
    ref: 'Job'
  }],
  reminders: [{
    type: Schema.Types.ObjectId,
    ref: 'Reminder'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Remove password from JSON output
      delete ret.password;
      // Remove sensitive fields
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
userSchema.index({ rollNumber: 1 });
userSchema.index({ email: 1 });
userSchema.index({ department: 1, year: 1 });
userSchema.index({ isActive: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with salt rounds
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Pre-update middleware to hash password on updates
userSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate() as any;
  
  if (update.password) {
    try {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      update.password = await bcrypt.hash(update.password, saltRounds);
      next();
    } catch (error: any) {
      next(error);
    }
  } else {
    next();
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Static method to find user by roll number or email
userSchema.statics.findByRollNumberOrEmail = function(identifier: string) {
  return this.findOne({
    $or: [
      { rollNumber: identifier },
      { email: identifier.toLowerCase() }
    ]
  });
};

// Static method to check if roll number exists
userSchema.statics.rollNumberExists = function(rollNumber: string) {
  return this.exists({ rollNumber });
};

// Static method to check if email exists
userSchema.statics.emailExists = function(email: string) {
  return this.exists({ email: email.toLowerCase() });
};

// Virtual for user's full profile
userSchema.virtual('fullProfile').get(function() {
  return {
    id: this._id,
    rollNumber: this.rollNumber,
    name: this.name,
    email: this.email,
    department: this.department,
    year: this.year,
    phone: this.phone,
    telegramUsername: this.telegramUsername,
    notificationPreferences: this.notificationPreferences,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });

export const User = mongoose.model<UserDocument>('User', userSchema);

export default User;