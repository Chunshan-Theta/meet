import { handlers } from "@/auth";
import type { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  console.log('--- auth callback incoming ---');
  console.log('host header:', req.headers.get('host'));
  console.log('x-forwarded-host:', req.headers.get('x-forwarded-host'));
  console.log('x-forwarded-proto:', req.headers.get('x-forwarded-proto'));
  console.log('x-forwarded-for:', req.headers.get('x-forwarded-for'));
  return handlers.GET(req);
};

export const POST = async (req: NextRequest) => {
  console.log('--- auth callback incoming ---');
  console.log('host header:', req.headers.get('host'));
  console.log('x-forwarded-host:', req.headers.get('x-forwarded-host'));
  console.log('x-forwarded-proto:', req.headers.get('x-forwarded-proto'));
  console.log('x-forwarded-for:', req.headers.get('x-forwarded-for'));
  return handlers.POST(req);
};