const User = require("../model/user.model");
const Post = require("../model/post.model");
const { v4: uuidv4 } = require("uuid");

// Create a new post
const createPost = async (req, res) => {
  const { post, imgUrl, userId } = req.body;
  try {
    const getUser = await User.findOne({ id: userId });
    console.log(getUser, req.body)
    // if (getUser) {
    const newPost = new Post({
      id: uuidv4(),
      post,
      userName: getUser.firstName + ' ' + getUser.surName,
      userId,
      imgUrl,
    });
    await newPost.save();
    res.send({
      status: 201,
      message: "Post created successfully.",
      data: newPost,
    });
    // }
    // else {
    //   res.send({ status: 400, message: "Something went wrong" });
    // }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Get all posts
const getAllPost = async (req, res) => {
  try {
    const allPost = await Post.find({}).sort({ createOn: -1 });
    res.send({ status: 200, data: allPost });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Get A Single post
const getOnePost = async (req, res) => {
  const { postId } = req.params
  try {
    const post = await Post.findOne({ id: postId }, { post: 1, imgUrl: 1});
    res.send({ status: 200, data: post });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Update a post
const updatePost = async (req, res) => {
  const { postId, post, imgUrl, userId } = req.body;
  try {
    const getpost = await Post.findOne({ id: postId });
    if (getpost.userId == userId) {
      await Post.updateOne(
        { id: postId },
        {
          $set: {
            post: post,
            imgUrl: imgUrl,
          },
        }
      );
      res.send({ status: 200, message: 'Post updated successfully.' });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};


// Delete a post
const deletePost = async (req, res) => {
  const { postId, userId } = req.params;
  try {
    const post = await Post.findOne({ id: postId });
    if (post.userId == userId) {
      await Post.deleteOne({id: postId})
      res.send({ status: 201, message: 'Post deleted' });
    } else {
      res.send({ status: 401, message: "Unathorised access." });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};


{
  /*
   **
   ** HERE STARTS COMMENT API'S
   **
   */
}
// Create a new comment 
const createComment = async (req, res) => {
  const { postId, comment, userId } = req.body;
  try {
    const post = await Post.find({ id: postId });
    const comments = await Post.updateOne(
      { id: postId },
      {
        $set: {
          comments: [
            ...post[0].comments,
            {
              id: uuidv4(),
              postId,
              userId,
              comment,
              replies: []
            },
          ],
        },
      }
    );
    res.send({ status: 200, data: comments });
  } catch (error) {
    res.status(500).send(error.message);
  }
};


// Delete a comment 
const deleteComment = async (req, res) => {
  const { userId, commentId, postid } = req.params;
  try {
    const post = await Post.find({ id: postid })
    const comment = post[0]?.comments?.find(com => com.userId == userId);
    if (comment.userId == userId) {
      console.log("ok");
       const filteredComments = post[0]?.comments?.filter(
         (com) => com.id !== commentId
       );
      await Post.updateOne(
         { id: postid },
         {
           $set: {
             comments: filteredComments,
           },
         }
      );
       res.send({ status: 200, message: 'Comment deleted.' });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  createPost,
  getAllPost,
  updatePost,
  deletePost,
  getOnePost,
  createComment,
  deleteComment,
};
