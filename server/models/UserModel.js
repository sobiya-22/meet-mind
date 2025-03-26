import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    clerkUserId: {     // Clerk's user ID 
        type: String,
        required: true,
        unique: true
    },  
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String
    },
    profilePicture: {
        type: String
    },

    role: {  // For admin-specific permissions
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    //meeting related
    meetingsJoined: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meeting'
    }],  
    totalMeetingsAttended: {    // History of meetings
        type: Number,
        default: 0
    },
    tasksAssigned: [{   // User's assigned tasks
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],      
    joinedAt: { type: Date, default: Date.now },

});

export default mongoose.model('User', UserSchema);
