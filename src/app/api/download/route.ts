import type { NextApiRequest, NextApiResponse } from 'next'
import ytdl from 'ytdl-core'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'
import { PassThrough } from 'stream'
import path from 'path'
import { NextResponse } from 'next/server'

// Configuração do FFmpeg e FFprobe
// ffmpeg.setFfmpegPath('/path/to/ffmpeg')
// ffmpeg.setFfprobePath('/path/to/ffprobe')
ffmpeg.setFfmpegPath(ffmpegStatic!)

export async function GET(req: NextApiRequest) {
  const requestUrl = new URL(req.url!, `http://${req.headers.host}`)
  const url = requestUrl.searchParams.get('url')
  const startTime = requestUrl.searchParams.get('startTime')
  const endTime = requestUrl.searchParams.get('endTime')

  console.table({ url, startTime, endTime })

  if (!url || !ytdl.validateURL(url as string)) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  try {
    const videoStream = ytdl(url as string, { filter: 'audioandvideo' })
    const passThrough  = new PassThrough()

    ffmpeg(videoStream)
      .setStartTime(startTime as string)
      .setDuration(calcDuration(startTime as string, endTime as string))
      .format('mp4')
      .on('error', (err:string) => {
        console.error(err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
      })
      .pipe(passThrough)

      const stream = new ReadableStream({
        start(controller) {
          passThrough.on('data', (chunk) => controller.enqueue(chunk))
          passThrough.on('end', () => controller.close())
          passThrough.on('error', (err) => controller.error(err))
        },
      })
  
      const headers = new Headers({
        'Content-Disposition': 'attachment; filename="video.mp4"',
        'Content-Type': 'video/mp4',
      })
  
      return new Response(stream, { headers })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    // res.status(500).json({ error: 'Internal Server Error' })
  }
}

const calcDuration = (start: string, end: string) => {
  const startParts = start.split(':').map(Number)
  const endParts = end.split(':').map(Number)

  const startSeconds = startParts[0] * 3600 + startParts[1] * 60 + startParts[2]
  const endSeconds = endParts[0] * 3600 + endParts[1] * 60 + endParts[2]

  return endSeconds - startSeconds
}
