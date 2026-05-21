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

export async function GET(request: NextRequest, context: { params: Promise<{ id: string, questionId: string }> }) {
  const params = await context.params;
  const roomId = parseInt(params.id);
  const order = parseInt(params.questionId);

  if (isNaN(order) || isNaN(roomId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const question = await prisma.typeItQuestion.findUnique({
      where: { typeItRoomId_order: { typeItRoomId: roomId, order } },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json(question, { status: 200 });
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string, questionId: string }> }) {
    const params = await context.params;
    const roomId = parseInt(params.id);
    const order = parseInt(params.questionId);

    if (isNaN(order) || isNaN(roomId)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    try {
        const formData = await request.formData();
        const image = formData.get('image') as File | null;

        interface UpdateData {
            order: number;
            text: string;
            correctAnswers: string[];
            points: number;
            timeLimit: number;
            explanation: string;
            imageUrl?: string;
        }

        const data: UpdateData = {
            order: parseInt(formData.get('order') as string),
            text: formData.get('text') as string,
            correctAnswers: JSON.parse(formData.get('correctAnswers') as string),
            points: parseInt(formData.get('points') as string),
            timeLimit: parseInt(formData.get('timeLimit') as string),
            explanation: formData.get('explanation') as string,
        };

        if (image) {
            data.imageUrl = await handleUpload(image);
        }

        const updatedQuestion = await prisma.typeItQuestion.update({
            where: { typeItRoomId_order: { typeItRoomId: roomId, order } },
            data,
        });

        return NextResponse.json(updatedQuestion, { status: 200 });
    } catch (error) {
        console.error('Error updating question:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string, questionId: string }> }) {
  const params = await context.params;
  const roomId = parseInt(params.id);
  const order = parseInt(params.questionId);

  if (isNaN(order) || isNaN(roomId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    await prisma.typeItQuestion.delete({
        where: { typeItRoomId_order: { typeItRoomId: roomId, order } },
    });

    return NextResponse.json({ message: 'Question deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
