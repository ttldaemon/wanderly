import { verifyToken } from "@/utils/helpers";
import { v2 as cloudinary } from "cloudinary";
import { type NextRequest, NextResponse } from "next/server";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export async function GET(req: NextRequest) {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return NextResponse.json(
      { success: false, message: "Server configuration error" },
      { status: 500 },
    );
  }

  let authData = null;
  try {
    authData = await verifyToken();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "User is not logged in"
    console.log(message)
  }

  const resourceType =
    req.nextUrl.searchParams?.get("resourceType") || "image";

  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
  });

  const folder = authData === null ? "wanderly/profiles" : `wanderly/${authData.userName}` // if the user is not logged in means the image upload while registering is asking for the url then the folder will be profiles, after the user logs in then the image will be uploaded to the usernames folder, be it update profile image or tour image upload  

  const paramsToSign = {
    folder,
    timestamp: Math.floor(Date.now() / 1000),
    type: "upload",
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    API_SECRET,
  );

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`; // resource type is useful when you have to upload different types like som

  console.log(uploadUrl,
  signature,
  API_KEY,
  CLOUD_NAME,
  paramsToSign.timestamp,
  paramsToSign.folder,
  resourceType,)
  
  return NextResponse.json({
    success: true,
    data: {
      uploadUrl,
      signature,
      apiKey: API_KEY,
      cloudName: CLOUD_NAME,
      timestamp: paramsToSign.timestamp,
      folder: paramsToSign.folder,
      resourceType,
    },
  });
}