const TranscriptSchema = new mongoose.Schema({
    meeting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meeting'
    },
    language: {
        type: String,
        default: 'English'
    },
    transcriptionText: {
        type: String
    }, 
    translation: [
      {
            language: {
                type: String
            },
            translatedText: {
                type: String
            }
      }
    ],
    generatedAt: {
        type: Date,
        default: Date.now
    },
  });
  export default mongoose.model(Transcript, 'TranscriptSchema');