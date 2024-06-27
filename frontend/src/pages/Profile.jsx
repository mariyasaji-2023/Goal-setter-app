import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { editUser, profileUpdate } from "../features/auth/authSlice";
import { toast } from 'react-toastify';

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const [image, setImage] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const uploadImage = (e) => {
    e.preventDefault();
  
    if (!image) {
      toast.error("Please upload a file");
      return;
    }
  
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", "elellcsz");
    data.append("cloud_name", "dzkpcjjr8");
  
    fetch("https://api.cloudinary.com/v1_1/dzkpcjjr8/image/upload", {
      method: "post",
      body: data,
    })
      .then((resp) => resp.json())
      .then((data) => {
        dispatch(profileUpdate(data.url));
      })
      .catch((err) => console.log(err));
  };

  const handleEdit = (userId, name, email) => {
    const newName = prompt("Enter new name:", name);
    const newEmail = prompt("Enter new Email:", email);
    if (newName === null || newEmail === null) {
      return;
    }
    if (newEmail && newName) {
      dispatch(editUser({ userId, name: newName, email: newEmail }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  return (
    <div>
      <div>
        <h3>User Dashboard</h3>
      </div>
      <div className="profile">
        <div className="profile-image">
          <img
            src={
              previewUrl || 
              (user?.profileUrl
                ? user.profileUrl
                : "https://static.vecteezy.com/system/resources/thumbnails/002/387/693/small/user-profile-icon-free-vector.jpg")
            }
            alt="profile"
          />
        </div>

        <div className="profile-card">
          <div className="profile-info">
            <p>Name : {user && user.name}</p>
            <p>Email : {user && user.email}</p>
          </div>

          <div className="profile-buttons">
            <button
              onClick={() => handleEdit(user._id, user.name, user.email)}
              className="btn-1"
            >
              edit profile
            </button>

            <div className="upload-button">
              <div className="custom-file-upload">
                <label htmlFor="profile" className="custom-button">
                  Choose File
                </label>
                <input
                  onChange={handleImageChange}
                  type="file"
                  name="profile"
                  id="profile"
                  className="hidden-input"
                />
              </div>

              <button className="btn" onClick={uploadImage}>
                Upload!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
