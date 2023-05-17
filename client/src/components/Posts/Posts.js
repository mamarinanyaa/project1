import React from "react";
import { Grid, CircularProgress } from '@mui/material'
import { useSelector } from "react-redux";

import Post from './Post/Post.js'
import useStyles from './styles.js';

const Posts = () => {
    const classes = useStyles();
    
    const posts = useSelector((state) => {
        console.log(state);
         return state.posts
        
    })
    console.log(posts);
    return (
        !posts.length? <CircularProgress />: (
            <Grid className={classes.container} container alignItems="stretch" spacing={3}>
                {posts.map((post) => (
                    <Grid key={post._id} item xs={12} sm={6}>
                        <Post post={post} />
                    </Grid>
                ))}
            </Grid>
        )
    );
}

export default Posts;
