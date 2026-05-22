-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizRoom" (
    "id" SERIAL NOT NULL,
    "hostId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "user_password" TEXT NOT NULL,
    "mod_password" TEXT NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "currentQuestion" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuizRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "quizRoomId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "imageUrl" TEXT,
    "options" JSONB,
    "correctAnswer" JSONB NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 100,
    "timeLimit" INTEGER NOT NULL DEFAULT 30,
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" SERIAL NOT NULL,
    "quizRoomId" INTEGER,
    "guessItRoomId" INTEGER,
    "the100RoomId" INTEGER,
    "typeItRoomId" INTEGER,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipantAnswer" (
    "id" SERIAL NOT NULL,
    "participantId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "answer" JSONB NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "responseTime" DOUBLE PRECISION NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParticipantAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAnalytics" (
    "id" SERIAL NOT NULL,
    "quizRoomId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "answerDistribution" JSONB NOT NULL,
    "averageResponseTime" DOUBLE PRECISION NOT NULL,
    "participantCount" INTEGER NOT NULL,
    "answeredCount" INTEGER NOT NULL,
    "pendingCount" INTEGER NOT NULL,

    CONSTRAINT "QuizAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreviousQuestionAnalytics" (
    "id" SERIAL NOT NULL,
    "quizRoomId" INTEGER,
    "questionId" INTEGER NOT NULL,
    "questionOrder" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "answerDistribution" JSONB,
    "averageResponseTime" DOUBLE PRECISION NOT NULL,
    "participantCount" INTEGER NOT NULL,
    "answeredCount" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "wrongCount" INTEGER NOT NULL,
    "pendingCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guessItRoomId" INTEGER,
    "typeItRoomId" INTEGER,

    CONSTRAINT "PreviousQuestionAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceCard" (
    "id" SERIAL NOT NULL,
    "participantId" INTEGER NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "finalRank" INTEGER NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "averageResponseTime" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PerformanceCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuessItRoom" (
    "id" SERIAL NOT NULL,
    "hostId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "user_password" TEXT NOT NULL,
    "mod_password" TEXT NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "currentQuestion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuessItRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuessItQuestion" (
    "id" SERIAL NOT NULL,
    "guessItRoomId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "imageUrl" TEXT,
    "hints" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuessItQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorrectAnswer" (
    "id" SERIAL NOT NULL,
    "guessItQuestionId" INTEGER NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "CorrectAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuessItAnswer" (
    "id" SERIAL NOT NULL,
    "participantId" INTEGER NOT NULL,
    "guessItQuestionId" INTEGER NOT NULL,
    "answer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "guessNumber" INTEGER NOT NULL,
    "hintsRevealed" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuessItAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "The100Room" (
    "id" SERIAL NOT NULL,
    "hostId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "user_password" TEXT NOT NULL,
    "mod_password" TEXT NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "currentQuestion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "The100Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "The100Question" (
    "id" SERIAL NOT NULL,
    "the100RoomId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "The100Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "The100Answer" (
    "id" SERIAL NOT NULL,
    "participantId" INTEGER NOT NULL,
    "the100QuestionId" INTEGER NOT NULL,
    "answer" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "score" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "The100Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeItRoom" (
    "id" SERIAL NOT NULL,
    "hostId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "user_password" TEXT NOT NULL,
    "mod_password" TEXT NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "currentQuestion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TypeItRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeItQuestion" (
    "id" SERIAL NOT NULL,
    "typeItRoomId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "imageUrl" TEXT,
    "correctAnswers" JSONB NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 100,
    "timeLimit" INTEGER NOT NULL DEFAULT 30,
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TypeItQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeItAnswer" (
    "id" SERIAL NOT NULL,
    "participantId" INTEGER NOT NULL,
    "typeItQuestionId" INTEGER NOT NULL,
    "answer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "responseTime" DOUBLE PRECISION NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TypeItAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ModeratorToRooms" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ModeratorToRooms_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ModeratorToGuessItRooms" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ModeratorToGuessItRooms_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ModeratorToThe100Rooms" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ModeratorToThe100Rooms_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ModeratorToTypeItRooms" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ModeratorToTypeItRooms_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Question_quizRoomId_order_key" ON "Question"("quizRoomId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_userId_quizRoomId_key" ON "Participant"("userId", "quizRoomId");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_userId_guessItRoomId_key" ON "Participant"("userId", "guessItRoomId");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_userId_the100RoomId_key" ON "Participant"("userId", "the100RoomId");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_userId_typeItRoomId_key" ON "Participant"("userId", "typeItRoomId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizAnalytics_questionId_key" ON "QuizAnalytics"("questionId");

-- CreateIndex
CREATE INDEX "PreviousQuestionAnalytics_quizRoomId_idx" ON "PreviousQuestionAnalytics"("quizRoomId");

-- CreateIndex
CREATE INDEX "PreviousQuestionAnalytics_guessItRoomId_idx" ON "PreviousQuestionAnalytics"("guessItRoomId");

-- CreateIndex
CREATE INDEX "PreviousQuestionAnalytics_typeItRoomId_idx" ON "PreviousQuestionAnalytics"("typeItRoomId");

-- CreateIndex
CREATE UNIQUE INDEX "PerformanceCard_participantId_key" ON "PerformanceCard"("participantId");

-- CreateIndex
CREATE UNIQUE INDEX "GuessItQuestion_guessItRoomId_order_key" ON "GuessItQuestion"("guessItRoomId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "CorrectAnswer_guessItQuestionId_answer_key" ON "CorrectAnswer"("guessItQuestionId", "answer");

-- CreateIndex
CREATE UNIQUE INDEX "The100Question_the100RoomId_order_key" ON "The100Question"("the100RoomId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "TypeItQuestion_typeItRoomId_order_key" ON "TypeItQuestion"("typeItRoomId", "order");

-- CreateIndex
CREATE INDEX "_ModeratorToRooms_B_index" ON "_ModeratorToRooms"("B");

-- CreateIndex
CREATE INDEX "_ModeratorToGuessItRooms_B_index" ON "_ModeratorToGuessItRooms"("B");

-- CreateIndex
CREATE INDEX "_ModeratorToThe100Rooms_B_index" ON "_ModeratorToThe100Rooms"("B");

-- CreateIndex
CREATE INDEX "_ModeratorToTypeItRooms_B_index" ON "_ModeratorToTypeItRooms"("B");

-- AddForeignKey
ALTER TABLE "QuizRoom" ADD CONSTRAINT "QuizRoom_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_quizRoomId_fkey" FOREIGN KEY ("quizRoomId") REFERENCES "QuizRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_quizRoomId_fkey" FOREIGN KEY ("quizRoomId") REFERENCES "QuizRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_guessItRoomId_fkey" FOREIGN KEY ("guessItRoomId") REFERENCES "GuessItRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_the100RoomId_fkey" FOREIGN KEY ("the100RoomId") REFERENCES "The100Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_typeItRoomId_fkey" FOREIGN KEY ("typeItRoomId") REFERENCES "TypeItRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantAnswer" ADD CONSTRAINT "ParticipantAnswer_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantAnswer" ADD CONSTRAINT "ParticipantAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAnalytics" ADD CONSTRAINT "QuizAnalytics_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAnalytics" ADD CONSTRAINT "QuizAnalytics_quizRoomId_fkey" FOREIGN KEY ("quizRoomId") REFERENCES "QuizRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceCard" ADD CONSTRAINT "PerformanceCard_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuessItRoom" ADD CONSTRAINT "GuessItRoom_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuessItQuestion" ADD CONSTRAINT "GuessItQuestion_guessItRoomId_fkey" FOREIGN KEY ("guessItRoomId") REFERENCES "GuessItRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectAnswer" ADD CONSTRAINT "CorrectAnswer_guessItQuestionId_fkey" FOREIGN KEY ("guessItQuestionId") REFERENCES "GuessItQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuessItAnswer" ADD CONSTRAINT "GuessItAnswer_guessItQuestionId_fkey" FOREIGN KEY ("guessItQuestionId") REFERENCES "GuessItQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuessItAnswer" ADD CONSTRAINT "GuessItAnswer_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "The100Room" ADD CONSTRAINT "The100Room_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "The100Question" ADD CONSTRAINT "The100Question_the100RoomId_fkey" FOREIGN KEY ("the100RoomId") REFERENCES "The100Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "The100Answer" ADD CONSTRAINT "The100Answer_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "The100Answer" ADD CONSTRAINT "The100Answer_the100QuestionId_fkey" FOREIGN KEY ("the100QuestionId") REFERENCES "The100Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypeItRoom" ADD CONSTRAINT "TypeItRoom_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypeItQuestion" ADD CONSTRAINT "TypeItQuestion_typeItRoomId_fkey" FOREIGN KEY ("typeItRoomId") REFERENCES "TypeItRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypeItAnswer" ADD CONSTRAINT "TypeItAnswer_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypeItAnswer" ADD CONSTRAINT "TypeItAnswer_typeItQuestionId_fkey" FOREIGN KEY ("typeItQuestionId") REFERENCES "TypeItQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModeratorToRooms" ADD CONSTRAINT "_ModeratorToRooms_A_fkey" FOREIGN KEY ("A") REFERENCES "QuizRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModeratorToRooms" ADD CONSTRAINT "_ModeratorToRooms_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModeratorToGuessItRooms" ADD CONSTRAINT "_ModeratorToGuessItRooms_A_fkey" FOREIGN KEY ("A") REFERENCES "GuessItRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModeratorToGuessItRooms" ADD CONSTRAINT "_ModeratorToGuessItRooms_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModeratorToThe100Rooms" ADD CONSTRAINT "_ModeratorToThe100Rooms_A_fkey" FOREIGN KEY ("A") REFERENCES "The100Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModeratorToThe100Rooms" ADD CONSTRAINT "_ModeratorToThe100Rooms_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModeratorToTypeItRooms" ADD CONSTRAINT "_ModeratorToTypeItRooms_A_fkey" FOREIGN KEY ("A") REFERENCES "TypeItRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModeratorToTypeItRooms" ADD CONSTRAINT "_ModeratorToTypeItRooms_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
