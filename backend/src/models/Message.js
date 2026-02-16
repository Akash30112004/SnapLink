const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    type: {
      type: String,
      enum: ['regular', 'system'],
      default: 'regular',
    },
    text: {
      type: String,
      required: false,
      trim: true,
    },
    attachments: [
      {
        type: {
          type: String,
          enum: ['image', 'video'],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
        filename: {
          type: String,
          required: true,
        },
        size: {
          type: Number,
          required: true,
        },
        thumbnail: {
          type: String,
        },
      },
    ],
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    reactions: [
      {
        emoji: {
          type: String,
          required: true,
        },
        users: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        ],
      },
    ],
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

// Validation: Message must have either text or attachments
messageSchema.pre('validate', function(next) {
  if (!this.text && (!this.attachments || this.attachments.length === 0)) {
    next(new Error('Message must have either text or attachments'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Message', messageSchema);
