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
    const question = await prisma.guessItQuestion.findUnique({
      where: { guessItRoomId_order: { guessItRoomId: roomId, order } },
      include: { acceptableAnswers: true },
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
    const hints = JSON.parse(formData.get('hints') as string) as string[];
    const acceptableAnswers = JSON.parse(formData.get('acceptableAnswers') as string) as string[];
    const image = formData.get('image') as File | null;

    if (!hints || !Array.isArray(hints) || hints.length !== 5) {
      return NextResponse.json({ error: 'Exactly 5 hints are required' }, { status: 400 });
    }
    if (!acceptableAnswers || !Array.isArray(acceptableAnswers) || acceptableAnswers.length === 0) {
      return NextResponse.json({ error: 'At least one acceptable answer is required' }, { status: 400 });
    }

    const existing = await prisma.guessItQuestion.findUnique({
      where: { guessItRoomId_order: { guessItRoomId: roomId, order } },
    });
    if (!existing) return NextResponse.json({ error: 'Question not found' }, { status: 404 });

    let imageUrl: string | undefined;
    if (image) {
      imageUrl = await handleUpload(image);
    }

    // Delete old acceptable answers and create new ones
    await prisma.correctAnswer.deleteMany({ where: { guessItQuestionId: existing.id } });

    const updateData: Record<string, unknown> = {
      text,
      hints,
      acceptableAnswers: { create: acceptableAnswers.map(a => ({ answer: a.trim().toLowerCase() })) },
    };
    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    const question = await prisma.guessItQuestion.update({
      where: { guessItRoomId_order: { guessItRoomId: roomId, order } },
      data: updateData,
      include: { acceptableAnswers: true },
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
    await prisma.guessItQuestion.delete({ where: { guessItRoomId_order: { guessItRoomId: roomId, order } } });
    return NextResponse.json({ message: 'Question deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
