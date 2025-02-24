import mongoose, { Document, Schema } from 'mongoose';

export interface IAgriculturalKnowledge extends Document {
  title: string;
  category: string;
  content: string;
  tags: string[];
  source?: string;
  author?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const agriculturalKnowledgeSchema = new Schema<IAgriculturalKnowledge>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'crop-management',
      'pest-control',
      'soil-science',
      'irrigation',
      'sustainable-farming',
      'livestock',
      'technology',
      'market-trends',
      'weather',
      'other'
    ]
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  tags: [{
    type: String,
    trim: true
  }],
  source: {
    type: String,
    trim: true
  },
  author: {
    type: String,
    trim: true
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
agriculturalKnowledgeSchema.index({ title: 'text', content: 'text' });
agriculturalKnowledgeSchema.index({ category: 1 });
agriculturalKnowledgeSchema.index({ tags: 1 });

export const AgriculturalKnowledge = mongoose.model<IAgriculturalKnowledge>(
  'AgriculturalKnowledge',
  agriculturalKnowledgeSchema
);
