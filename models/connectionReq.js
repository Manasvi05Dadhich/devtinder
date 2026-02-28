const mongoose = require('mongoose');

const connectionReqSchema = new mongoose.Schema({
    fromUserId : {type : mongoose.Schema.Types.ObjectId,
        required : true,
    },
    toUserId : {type : mongoose.Schema.Types.ObjectId,
        required : true,
    },
    status : {type: String,
        enum : {values : ['ignored','pending', 'accepted', 'rejected'],
            message : '{VALUE} must be either ignored, pending, accepted, or rejected'
        },
        
    },
},
{timestamps : true});

connectionReqSchema.pre('save', async function () {
    if (this.fromUserId.equals(this.toUserId)) {
        throw new Error('You cannot send a connection request to yourself.');
    }
});
const ConnectionReqModel = mongoose.model('ConnectionReq', connectionReqSchema);
module.exports = ConnectionReqModel;