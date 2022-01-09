import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import AllServices from "../AllServices";
import Onepageservice from "../AllServices";
import "./style.css";
import { storage } from "../../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "@firebase/storage";

const Services = () => {
  const [addService, setaddService] = useState(false);

  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState([]);
  const [post, setPost] = useState([]);
  const [commments, setcommments] = useState([]);

  const newPost = async (e) => {
    e.preventDefault();
    const result = await axios.post(
      `http://localhost:5000/create_post`,
      {
        description: e.target.description.value,
        title: e.target.title.value,
        image: images,
      },
      { headers: { Authorization: `Bearer ${state.signIn.token}` } }
    );
    console.log(result.data);
    getPosts();
    setaddService(false);
  };

  const state = useSelector((state) => {
    return state;
  });

  const uploadPictures = (e) => {
    let image = e.target.files[0];
    const dataType = image.name.match(/\.(jpe?g|png|gif)$/gi);
    if (image == null || dataType == null) return;
    const storageRef = ref(storage, `images/${image.name}`);
    const uploadImamge = uploadBytesResumable(storageRef, image);
    uploadImamge.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(progress);
      },
      (err) => console.log(err),
      () => {
        getDownloadURL(uploadImamge.snapshot.ref).then((url) => {
          setImages([...images, url]);
        });
      }
    );
  };

  useEffect(() => {
    setProgress(0);
  }, [images]);

  const getPosts = () => {
    try {
      axios.get(`http://localhost:5000/getall`).then((result) => {
        console.log(result.data);
        setPost(result.data.result);
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPosts();
    getComments();
  }, []);

  const getComments = async () => {
    try {
      const resp = await axios.get(`http://localhost:5000/getallcomment`);
      console.log(resp.data);
      setcommments(resp.data.result);
    } catch (err) {
      console.error(err);
    }
  };

  const sendComment = async (e, id) => {
    e.preventDefault();
    try {
      if (state.signIn.userId) {
        console.log("ff");
        const resp = await axios.post(
          `http://localhost:5000/createcomment`,
          {
            text: e.target.comment.value,
            createby: state.signIn.userId,
            onservicepost: id,
          },
          { headers: { Authorization: `Bearer ${state.signIn.token}` } }
        );
        console.log(resp.data);
        getComments();
      }
    } catch (err) {
      console.error(err);
    }
    e.target.comment.value = "";
  };

  return (
    <div className="c">
      <h1>Serivces component</h1>

      <button onClick={() => setaddService(true)}>Add service</button>

      {addService ? (
        <div className="post">
          <img
            className="postimgage"
            src="https://www.stancoe.org/sites/default/files/styles/banner/public/banners/Administration.jpg?itok=jXKB2uR2"
            height="170px"
            alt="no img"
          />
          <form onSubmit={newPost} className="writepost">
            <div className="postgroup">
              <input
                type="text"
                placeholder="title"
                className="textarea1"
                name="title"
                autoFocus={true}
              />
              <textarea
                placeholder="write here"
                type="text"
                name="description"
                className="textarea"
              ></textarea>

              <div className="upload">
                <input
                  type="file"
                  accept=".gif,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    uploadPictures(e);
                  }}
                  id="img"
                  style={{ display: "none" }}
                />
                <label htmlFor="img">تحميل صور</label>
                {!(progress == 0) ? (
                  <div className="progress">
                    <p>يتم الرفع {progress}%</p>
                  </div>
                ) : null}
              </div>
              <div className="imagesPost">
                {images?.map((image) => (
                  <img src={image} width="80px" height="80px" />
                ))}
              </div>

              <br></br>
              <button type="submit" className="button">
                send
              </button>
            </div>
          </form>

          <button onClick={() => setaddService(false)}>Cancel</button>
        </div>
      ) : (
        <>
          <h1>All services</h1>
          <div className="post">
            {post?.map((post, i) => (
              <>
                <h1>
                  Post {i + 1}: {post?.title}
                </h1>
                <h4>Author: {post?.createby?.username}</h4>
                <p>{post?.description}</p>
                {post?.image?.map((i) => (
                  <img src={i} alt="" width="200px" />
                ))}

                <form
                  className="comments_form"
                  onSubmit={(e) => sendComment(e, post._id)}
                >
                  <div className="commentHead">
                    <h3>New Comment</h3>
                    <button type="submit">Send Comment</button>
                  </div>
                  <div className="commentTail">
                    <textarea
                      name="comment"
                      placeholder="Your message"
                      required
                      cols="55"
                      rows="8"
                    ></textarea>
                  </div>
                  <div className="numComment">
                    <h3>
                      {
                        commments?.filter((i) => i.onservicepost == post._id)
                          .length
                      }{" "}
                      Comments
                    </h3>
                  </div>
                  {commments
                    ?.filter((i) => i.onservicepost == post._id)
                    .map((comment, index) => {
                      return (
                        <div className="realComment" key={index}>
                          <hr />
                          <div className="realcommentRow">
                            <div className="realcommentData">
                              <h3>{comment.createby.username}</h3>
                              <p>{comment.text}</p>
                              <p className="dateP">
                                {comment.createdAt.slice(0, 10)}
                                {comment.createdAt.slice(11, 16)}
                              </p>
                            </div>
                            {/* {comment.createby._id == state.signIn.userId ? (
                              <p
                                className="del"
                                // onClick={() => DeleteComment(comment._id)}
                              >
                                ❌
                              </p>
                            ) : (
                              <></>
                            )} */}
                          </div>
                        </div>
                      );
                    })
                    .reverse()}
                  <hr />
                </form>
              </>
            ))}
            <br />
          </div>
        </>
      )}
    </div>
  );
};

export default Services;
