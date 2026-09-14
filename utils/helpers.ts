import { IUser } from '@/models/user';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';

type DecodedToken = {
  _id: string;
  userName: string;
};

export function generateToken(user: IUser) {
  const payload = { _id: user._id, userName: user.userName }
  const secret = process.env.JWT_SECRET as jwt.Secret
  const signInOptions = { expiresIn: process.env.JWT_EXPIRY || '3d' } as jwt.SignOptions

  return jwt.sign(payload, secret, signInOptions)
}


export async function verifyToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) throw new Error("Unauthorized")

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as jwt.Secret)

    if(!decoded) throw new Error("Invalid token")
    
    return decoded as DecodedToken
  } catch (error) {
    throw new Error("Invalid token")
  }
}