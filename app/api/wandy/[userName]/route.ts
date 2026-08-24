import { NextRequest, NextResponse } from "next/server";

interface Params {
  userName: string
}

export async function POST(req: NextRequest, {params} : {params: Promise<Params>}) {
  const body = await req.json()
  const { userName } = await params

  console.log(body)
  console.log(userName)

  return NextResponse.json({
    body, userName
  }, {status: 200})
  
}