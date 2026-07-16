import React, { Fragment, useCallback, useEffect, useState } from 'react';
 import { io } from 'socket.io-client';

import Post from '../../components/Feed/Post/Post';
import Button from '../../components/Button/Button';
import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit';
import Input from '../../components/Form/Input/Input';
import Paginator from '../../components/Paginator/Paginator';
import Loader from '../../components/Loader/Loader';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';
import './Feed.css';
import { getBaseUrl } from '../../api-config';
// import image from '../../components/Image/Image';

const baseUrl = getBaseUrl();

const Feed = ({
  userId,
  token,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [editPost, setEditPost] = useState(null);
  const [status, setStatus] = useState('');
  const [postPage, setPostPage] = useState(1);
  const [postsLoading, setPostsLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState(null);

  const catchError = useCallback(error => {
    setError(error);
  }, []);

  const loadPosts = useCallback(async direction => {
    if (direction) {
      setPostsLoading(true);
      setPosts([]);
    }

    let page = postPage;
    if (direction === 'next') {
      page += 1;
      setPostPage(page);
    }
    if (direction === 'previous') {
      page -= 1;
      setPostPage(page);
    }

    try {
      const res = await fetch(`${baseUrl}/feed/posts?page=` + page, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token,
        }
      });
      if (res.status !== 200) {
        throw new Error('Failed to fetch posts.');
      }
      const resData = await res.json();
      const formattedPosts = resData.posts.map(post => {
        return {
          ...post,
          imagePath: post.imageUrl,
        };
      });
      setPosts(formattedPosts);
      setTotalPosts(resData.totalItems);
      setPostsLoading(false);
    } catch (err) {
      catchError(err);
    }
  }, [catchError, postPage, token]);

  const addPost = useCallback(post => {
    setPosts(prevPosts => {
      const updatedPosts = [...prevPosts];
      if (postPage === 1) {
        if (prevPosts.length >= 2) {
          updatedPosts.pop();
        }
        updatedPosts.unshift(post);
      }
      return updatedPosts;
    });
    setTotalPosts(prevTotal => prevTotal + 1);
  }, [postPage]);

  const updatePost = useCallback(post => {
    setPosts(prevPosts => {
      const updatedPosts = [...prevPosts];
      const updatedPostIndex = updatedPosts.findIndex(p => p._id === post._id);
      if (updatedPostIndex !== -1) {
        updatedPosts[updatedPostIndex] = post;
      }
      return updatedPosts;
    });
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${baseUrl}/feed/status`, {
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + token,
          }
        });
        if (res.status !== 200) {
          throw new Error('Failed to fetch user status.');
        }
        const resData = await res.json();
        setStatus(resData.status);
      } catch (err) {
        catchError(err);
      }
    };

    fetchStatus();
    loadPosts();
    const socket = io(baseUrl);
    socket.on('posts', (data) => {
      switch (data.action) {
        case 'create':
          addPost(data.post);
          break;
        case 'update':
          updatePost(data.post);
          break;
        case 'delete':
          loadPosts();
          break;
        default:
          break;
      }
    });
  }, [catchError, loadPosts, token, addPost, updatePost]);

  const statusUpdateHandler = async event => {
    event.preventDefault();

    try {
      const res = await fetch(`${baseUrl}/feed/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          status,
        })
      });
      if (res.status !== 200 && res.status !== 201) {
        throw new Error("Can't update status!");
      }
      const resData = await res.json();
      console.log(resData);
    } catch (err) {
      catchError(err);
    }
  };

  const newPostHandler = () => {
    setIsEditing(true);
  };

  const startEditPostHandler = postId => {
    const loadedPost = { ...posts.find(p => p._id === postId) };
    setIsEditing(true);
    setEditPost(loadedPost);
  };

  const cancelEditHandler = () => {
    setIsEditing(false);
    setEditPost(null);
  };

  const finishEditHandler = async postData => {
    setEditLoading(true);

    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('content', postData.content);
    formData.append('image', postData.image);
    let url = `${baseUrl}/feed/posts`;
    let method='POST';
    if (editPost) {
      url = `${baseUrl}/feed/posts/` + editPost._id;
      method = 'PUT';
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: 'Bearer ' + token,
        },
        body: formData,
      });
      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Creating or editing a post failed!');
      }
      setIsEditing(false);
      setEditPost(null);
      setEditLoading(false);
    } catch (err) {
      console.log(err);
      setIsEditing(false);
      setEditPost(null);
      setEditLoading(false);
      setError(err);
    }
  };

  const statusInputChangeHandler = (input, value) => {
    setStatus(value);
  };

  const deletePostHandler = async postId => {
    setPostsLoading(true);

    try {
      const res = await fetch(`${baseUrl}/feed/posts/` + postId, {
        method:'DELETE',
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });
      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Deleting a post failed!');
      }
      const resData = await res.json();
      const updatedPosts = posts.filter(p => p._id !== postId);
      setPosts(updatedPosts);
      setPostsLoading(false);
    } catch (err) {
      console.log(err);
      setPostsLoading(false);
    }
  };

  const errorHandler = () => {
    setError(null);
  };

  return (
    <Fragment>
      <ErrorHandler error={error} onHandle={errorHandler} />
      <FeedEdit
        editing={isEditing}
        selectedPost={editPost}
        loading={editLoading}
        onCancelEdit={cancelEditHandler}
        onFinishEdit={finishEditHandler}
      />
      <section className="feed__status">
        <form onSubmit={statusUpdateHandler}>
          <Input
            type="text"
            placeholder="Your status"
            control="input"
            onChange={statusInputChangeHandler}
            value={status}
          />
          <Button mode="flat" type="submit">
            Update
          </Button>
        </form>
      </section>
      <section className="feed__control">
        <Button mode="raised" design="accent" onClick={newPostHandler}>
          New Post
        </Button>
      </section>
      <section className="feed">
        {postsLoading && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Loader />
          </div>
        )}
        {posts.length <= 0 && !postsLoading ? (
          <p style={{ textAlign: 'center' }}>No posts found.</p>
        ) : null}
        {!postsLoading && (
          <Paginator
            onPrevious={() => loadPosts('previous')}
            onNext={() => loadPosts('next')}
            lastPage={Math.ceil(totalPosts / 2)}
            currentPage={postPage}
          >
            {posts.map(post => (
              <Post
                key={post._id}
                id={post._id}
                author={post.creator.name}
                date={new Date(post.createdAt).toLocaleDateString('en-US')}
                title={post.title}
                image={post.imageUrl}
                content={post.content}
                onStartEdit={() => startEditPostHandler(post._id)}
                onDelete={() => deletePostHandler(post._id)}
              />
            ))}
          </Paginator>
        )}
      </section>
    </Fragment>
  );
};

export default Feed;
