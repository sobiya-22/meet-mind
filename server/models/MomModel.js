const MoMSchema = new mongoose.Schema({
    meeting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meeting',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    summary: {   // Overall meeting summary
        type: String,
        required: true
    },        
    discussionPoints: [{ type: String }],     // Bullet points of discussions
    decisionsMade: [{ type: String }],           // List of decisions
    actionItems: [
      {
            description: {
                type: String, required: true
            },
            assignedTo: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            dueDate: {
                type: Date
            }
      }
    ],
    createdAt: { type: Date, default: Date.now }
});
  
export default mongoose.model(MOM, 'MoMSchema');
  