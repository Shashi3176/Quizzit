import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
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

  if (isNaN(roomId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const questions = await prisma.typeItQuestion.findMany({
      where: { typeItRoomId: roomId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(questions, { status: 200 });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const params = await context.params;
    const roomId = parseInt(params.id);

    if (isNaN(roomId)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    try {
        const formData = await request.formData();
        const image = formData.get('image') as File | null;

        interface CreateData {
            order: number;
            text: string;
            correctAnswers: string[];
            points: number;
            timeLimit: number;
            explanation: string;
            imageUrl?: string;
        }

        const existingQuestions = await prisma.typeItQuestion.findMany({
            where: { typeItRoomId: roomId },
            orderBy: { order: 'desc' },
            take: 1,
        });
        const nextOrder = existingQuestions.length > 0 ? existingQuestions[0].order + 1 : 1;

        const data: CreateData = {
            order: nextOrder,
            text: formData.get('text') as string,
            correctAnswers: JSON.parse(formData.get('correctAnswers') as string),
            points: parseInt(formData.get('points') as string),
            timeLimit: parseInt(formData.get('timeLimit') as string),
            explanation: formData.get('explanation') as string,
        };

        if (image) {
            data.imageUrl = await handleUpload(image);
        }

        const newQuestion = await prisma.typeItQuestion.create({
            data: {
                ...data,
                typeItRoomId: roomId,
            },
        });

        return NextResponse.json(newQuestion, { status: 201 });
    } catch (error) {
        console.error('Error creating question:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
