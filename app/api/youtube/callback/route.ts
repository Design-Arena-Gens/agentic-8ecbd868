import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/youtube-uploader';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json(
      { error: 'No authorization code provided' },
      { status: 400 }
    );
  }

  try {
    const tokens = await getTokensFromCode(code);

    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>YouTube OAuth Success</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 600px;
              margin: 100px auto;
              padding: 20px;
              text-align: center;
            }
            .success {
              background: #10b981;
              color: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            code {
              background: #f3f4f6;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 14px;
              display: block;
              margin: 10px 0;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="success">
            <h1>✓ Authorization Successful!</h1>
          </div>
          <p>Copy the refresh token below and add it to your .env file:</p>
          <code>YOUTUBE_REFRESH_TOKEN=${tokens.refresh_token}</code>
          <p style="margin-top: 30px; color: #6b7280;">
            You can close this window and restart your application.
          </p>
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
