const mongoose = require('mongoose');

const connectionReqSchema = new mongoose.Schema({
    formUserId : {type : mongoose.Schema.Types.ObjectId,
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
const ConnectionReqModel = mongoose.model('ConnectionReq', connectionReqSchema);
module.exports = ConnectionReqModel;