// imports
import express from 'express';

const router = express.Router();

router.route('/').get(
    async (req, res) => {
        try {
            res.status(200).json({
                status: 'success',
                code: 200,
                message: 'chatroom alive!',
            });
        }
        catch (err) {
            res.status(400).json(err);
        }
    });

router.route('/hello').get(
    async (req, res) => {
        try {
            res.status(200).json({
                status: 'success',
                code: 200,
                message: 'hello world!',
            });
        }
        catch (err) {
            res.status(400).json(err);
        }
    });

export default router;
