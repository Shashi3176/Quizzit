import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';

type CloudinaryUploadResult = {
  secure_url: string;
};

async function handleUpload(image: File): Promise<string> {
  const buffer = await image.arrayBuffer();
  const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result as CloudinaryUploadResult);
        } else {
          reject(new Error("Cloudinary upload failed without an error"));
        }
      }
    );
    uploadStream.end(Buffer.from(buffer));
  });
  return result.secure_url;
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const roomId = parseInt(params.id);
  if (isNaN(roomId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  try {
    const questions = await prisma.guessItQuestion.findMany({
      where: { guessItRoomId: roomId }, orderBy: { order: 'asc' }, include: { acceptableAnswers: true },
    });
    return NextResponse.json(questions, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const roomId = parseInt(params.id);
  if (isNaN(roomId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  try {
    const formData = await request.formData();
    const text = formData.get('text') as string;
    const hints = JSON.parse(formData.get('hints') as string) as string[];
    const acceptableAnswers = JSON.parse(formData.get('acceptableAnswers') as string) as string[];
    const image = formData.get('image') as File | null;

    if (!hints || !Array.isArray(hints) || hints.length !== 5) {
      return NextResponse.json({ error: 'Exactly 5 hints are required' }, { status: 400 });
    }
    if (!acceptableAnswers || !Array.isArray(acceptableAnswers) || acceptableAnswers.length === 0) {
      return NextResponse.json({ error: 'At least one acceptable answer is required' }, { status: 400 });
    }
    const existing = await prisma.guessItQuestion.findMany({
      where: { guessItRoomId: roomId }, orderBy: { order: 'desc' }, take: 1,
    });
    const nextOrder = existing.length > 0 ? existing[0].order + 1 : 1;

    let imageUrl: string | null = null;
    if (image) {
      imageUrl = await handleUpload(image);
    }

    const question = await prisma.guessItQuestion.create({
      data: {
        guessItRoomId: roomId, order: nextOrder, text, imageUrl, hints,
        acceptableAnswers: { create: acceptableAnswers.map(a => ({ answer: a.trim().toLowerCase() })) },
      },
      include: { acceptableAnswers: true },
    });
    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
