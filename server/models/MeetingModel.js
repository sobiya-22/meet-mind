import mongoose from 'mongoose';
const MeetingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    }, 
    host: {    // Meeting creator
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }, 
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },
    transcript: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transcript'
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    attendanceLog: [
      {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User'
            },
            joinTime: {
                type: Date
            },
            leaveTime: {
                type: Date
            }
      }
    ],
    // recordingLink: {
    //     type: String
    // }, 
    createdAt: { type: Date, default: Date.now },
});
  
export default mongoose.model('MeetingSchema', MeetingSchema);
  