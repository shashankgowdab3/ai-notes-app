import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

function getUser(req) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Login required");
  }

  const token = authHeader.split(" ")[1];
  return jwt.verify(token, process.env.JWT_SECRET);
}

export async function GET(req) {
  try {
    const user = getUser(req);

    const notes = await prisma.note.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" }
    });

    return Response.json(notes);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(req) {
  try {
    const user = getUser(req);
    const { title, content } = await req.json();

    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId: user.userId
      }
    });

    return Response.json(note);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 401 });
  }
}

export async function PUT(req) {
  try {
    const user = getUser(req);
    const { id, title, content } = await req.json();

    const note = await prisma.note.findUnique({ where: { id } });

    if (!note || note.userId !== user.userId) {
      return Response.json({ error: "Not allowed" }, { status: 403 });
    }

    const updated = await prisma.note.update({
      where: { id },
      data: { title, content }
    });

    return Response.json(updated);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 401 });
  }
}



export async function DELETE(req) {
  try {
    const user = getUser(req); 
    const { id } = await req.json();

    const note = await prisma.note.findUnique({
      where: { id: Number(id) }
    });

    if (!note) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    if (note.userId !== user.userId) {
      return Response.json({ error: "Not allowed" }, { status: 403 });
    }

    await prisma.note.delete({
      where: { id: Number(id) }
    });

    return Response.json({ message: "Note deleted successfully" });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 401 });
  }
}






