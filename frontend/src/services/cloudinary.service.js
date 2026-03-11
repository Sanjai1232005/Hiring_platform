import axios from "axios";

// Upload file to Cloudinary
const uploadToCloudinary = async (file, type = "image") => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "ml_default");
  data.append("cloud_name", "dznnyaj0z");
  data.append("folder", "Healthcare");

  const url =
    type === "image"
      ? "https://api.cloudinary.com/v1_1/dznnyaj0z/image/upload"
      : type === "video"
      ? "https://api.cloudinary.com/v1_1/dznnyaj0z/video/upload"
      : "https://api.cloudinary.com/v1_1/dznnyaj0z/raw/upload";

  const res = await axios.post(url, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.secure_url;
};

export default uploadToCloudinary;
