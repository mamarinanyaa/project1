import express from 'express';

import { getPosts, createPost } from '../controllers/posts.js'

const router = express.Router();

//http://localhost:5000/posts

router.get('/', getPosts);
router.post('/', createPost);

// router.get('/', (req, res) => {
//     res.send('works')
// })

export default router;