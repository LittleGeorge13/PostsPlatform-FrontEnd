import React, { useEffect, useState } from 'react';

import Image from '../../../components/Image/Image';
import './SinglePost.css';

const SinglePost = props => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [date, setDate] = useState('');
  const [image, setImage] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      const postId = props.match.params.postId;

      try {
        const res = await fetch('http://localhost:8080/feed/posts/' + postId, {
          headers: {
            Authorization: 'Bearer ' + props.token,
          },
        });
        if (res.status !== 200) {
          throw new Error('Failed to fetch status');
        }
        const resData = await res.json();
        setTitle(resData.post.title);
        setAuthor(resData.post.creator.name);
        setDate(new Date(resData.post.createdAt).toLocaleDateString('en-US'));
        setContent(resData.post.content);
        setImage('http://localhost:8080/' + resData.post.imageUrl);
        console.log('http://localhost:8080/' + resData.post.imageUrl);
      } catch (err) {
        console.log(err);
      }
    };

    fetchPost();
  }, [props.match.params.postId, props.token]);

  return (
    <section className="single-post">
      <h1>{title}</h1>
      <h2>
        Created by {author} on {date}
      </h2>
      <div className="single-post__image">
        <Image contain imageUrl={image} />
      </div>
      <p>{content}</p>
    </section>
  );
};

export default SinglePost;
