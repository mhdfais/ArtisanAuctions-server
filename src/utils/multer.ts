import cloudinary from "./cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: "user_profiles",
    resource_type: "image",
  }),
});

const upload = multer({ storage });
export default upload