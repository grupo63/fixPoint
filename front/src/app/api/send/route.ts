import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev", // 👈 siempre sandbox
      to: body.to,
      subject: body.subject,
      html: `<p>${body.message}</p>`,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
