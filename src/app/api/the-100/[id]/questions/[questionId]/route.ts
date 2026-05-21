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

export async function GET(request: NextRequest, context: { params: Promise<{ id: string; questionId: string }> }) {
  const params = await context.params;
  const roomId = parseInt(params.id);
  const order = parseInt(params.questionId);
  if (isNaN(order) || isNaN(roomId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  try {
    const question = await prisma.the100Question.findUnique({
      where: { the100RoomId_order: { the100RoomId: roomId, order } },
    });
    if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    return NextResponse.json(question, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string; questionId: string }> }) {
  const params = await context.params;
  const roomId = parseInt(params.id);
  const order = parseInt(params.questionId);
  if (isNaN(order) || isNaN(roomId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    const formData = await request.formData();
    const text = formData.get('text') as string;
    const image = formData.get('image') as File | null;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Question text is required' }, { status: 400 });
    }

    const existing = await prisma.the100Question.findUnique({
      where: { the100RoomId_order: { the100RoomId: roomId, order } },
    });
    if (!existing) return NextResponse.json({ error: 'Question not found' }, { status: 404 });

    let imageUrl: string | undefined;
    if (image) {
      imageUrl = await handleUpload(image);
    }

    const updateData: Record<string, unknown> = { text };
    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    const question = await prisma.the100Question.update({
      where: { the100RoomId_order: { the100RoomId: roomId, order } },
      data: updateData,
    });

    return NextResponse.json(question, { status: 200 });
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string; questionId: string }> }) {
  const params = await context.params;
  const roomId = parseInt(params.id);
  const order = parseInt(params.questionId);
  if (isNaN(order) || isNaN(roomId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  try {
    await prisma.the100Question.delete({ where: { the100RoomId_order: { the100RoomId: roomId, order } } });
    return NextResponse.json({ message: 'Question deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
