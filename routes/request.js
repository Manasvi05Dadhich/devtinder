const express = require('express');
const requestrouter = express.Router();
const authMiddleware = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionReq');

requestrouter.post('/request/send/:status/:userid', authMiddleware, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.userid;
        const status = req.params.status;

        const allowedstatus = ['pending', 'accepted', 'rejected'];
        if(!allowedstatus.includes(status)){
            return res.status(400).json({ error: 'Invalid status. Allowed: pending, accepted, rejected' });
        }

        const existingRequest = await ConnectionRequest.findOne({$or: [
            { fromUserId: fromUserId, toUserId: toUserId },
            { fromUserId: toUserId, toUserId: fromUserId }
        ]   });

        if (existingRequest) { return res.status(400).json({ error: 'Connection request already exists' }); }


        const connectionRequestData = new ConnectionRequest({
            fromUserId: fromUserId,
            toUserId: toUserId,
            status: status
        });
        await connectionRequestData.save();
        res.json({ message: 'Connection request sent successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
module.exports = requestrouter;