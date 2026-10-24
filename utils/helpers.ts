import { IUser } from '@/models/user';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';

type DecodedToken = jwt.JwtPayload & {
  _id: string;
  userName: string;
};
export function generateToken(user: IUser) {
  const payload = { _id: user._id, userName: user.userName }
  const secret = process.env.JWT_SECRET ;
  if(!secret)
  {
    console.log("jwt secret key not found ");
    throw new Error("jwt secret key not found ");
  }
  const signInOptions = { expiresIn: process.env.JWT_EXPIRY || '3d' } as jwt.SignOptions

  return jwt.sign(payload, secret, signInOptions)
}


export async function verifyToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) throw new Error("Unauthorized")
  const secret = process.env.JWT_SECRET  ;
  if(!secret)
  {
    console.log("jwt secret key not found ");
    throw new Error("jwt secret key not found ");
  }
  try {
    const decoded = jwt.verify(token, secret);

    if(!decoded) throw new Error("Invalid token")
    
    return decoded as DecodedToken
  } catch (error) {
    throw new Error("Invalid token")
  }
}